"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, Clock, Package, Truck, PartyPopper, Copy,
  ArrowRight, Phone, Mail, Search, Loader2, CreditCard,
} from "lucide-react";

// ── Status → stage mapping ───────────────────────────────────────────────────
const STATUS_STAGE: Record<string, number> = {
  "Pending Approval":     0,
  "Approved for Payment": 0,
  "Pending":              1,
  "In Progress":          2,
  "Ready for Delivery":   3,
  "In Transit":           4,
  "Completed":            5,
  "Delivered":            5,
  "Cancelled":            -1,
};

const STAGES = [
  { id: 1, icon: CheckCircle, label: "Payment Confirmed",   desc: "Your payment has been verified successfully." },
  { id: 2, icon: Clock,       label: "Processing",          desc: "Our team is reviewing and preparing your document." },
  { id: 3, icon: Package,     label: "Ready",               desc: "Your document is ready for delivery or pick-up." },
  { id: 4, icon: Truck,       label: "Out for Delivery",    desc: "Your order is on its way to you!" },
  { id: 5, icon: PartyPopper, label: "Delivered",           desc: "Your order has been completed. Thank you!" },
];

interface OrderRecord {
  id: string;
  orderId: string;
  customerName: string;
  service: string;
  status: string;
  amount: string | number;
  paystackRef?: string;
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId   = searchParams.get("orderId")   || "";
  const ref       = searchParams.get("ref")       || "";
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [inputId, setInputId] = useState(orderId || ref);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchOrder = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      if (res.status === 404) { setNotFound(true); setOrder(null); return; }
      if (!res.ok) { setNotFound(true); setOrder(null); return; }
      const data = await res.json();
      setOrder({
        id:           data.id,
        orderId:      data.orderId   ?? data.order_id,
        customerName: data.customerName ?? data.customer_name,
        service:      data.service,
        status:       data.status,
        amount:       data.amount,
        paystackRef:  data.paystackRef ?? data.paystack_ref,
      });
    } catch {
      setNotFound(true);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Paystack callback: verify payment then load the order
  useEffect(() => {
    if (!reference) return;
    setVerifying(true);
    fetch("/api/payment/verify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((data: { verified?: boolean; orderId?: string }) => {
        setVerifying(false);
        if (data.orderId) {
          setInputId(data.orderId);
          fetchOrder(data.orderId);
        }
      })
      .catch(() => setVerifying(false));
  }, [reference, fetchOrder]);

  // Auto-fetch if orderId is in the URL
  useEffect(() => {
    const idToFetch = orderId || ref;
    if (idToFetch) {
      setInputId(idToFetch);
      fetchOrder(idToFetch);
    }
  }, [orderId, ref, fetchOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputId);
  };

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Paystack payment (triggered when status = Approved for Payment) ──
  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      // Get server-side access_code (keeps secret key off the client)
      const payRes = await fetch("/api/payment/initialize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          email:   "customer@computerservice.ng",
          amount:  Number(order.amount),
        }),
      });
      const payJson = await payRes.json() as { authorization_url?: string; error?: string };
      if (!payRes.ok || !payJson.authorization_url) {
        alert(payJson.error || "Could not initialize payment. Please try again.");
        setPaying(false);
        return;
      }

      window.location.href = payJson.authorization_url;
    } catch {
      setPaying(false);
      alert("Network error. Please check your connection and try again.");
    }
  };

  const status = order?.status ?? "";
  const isPendingApproval  = status === "Pending Approval";
  const isApprovedForPayment = status === "Approved for Payment";
  const isCancelled        = status === "Cancelled";
  const currentStage       = STATUS_STAGE[status] ?? 1;
  const isComplete         = status === "Delivered" || status === "Completed";
  const hasBeenPaid        = order?.paystackRef != null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0ebff] via-white to-[#ebf4ff] font-sans text-black">
      <div className="container mx-auto px-4 max-w-2xl py-10 sm:py-16">

        {/* Payment verification spinner */}
        {verifying && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 mb-6 flex items-center justify-center gap-3 text-[#5123d4]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Verifying your payment…</span>
          </div>
        )}

        {/* Search bar */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="text-sm font-bold text-black mb-3">Track Your Order</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Enter your Order ID (e.g. CSN-20260508-1234)"
              className="flex-1 bg-[#F1F5F9] text-black px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
            />
            <button
              type="submit"
              disabled={loading || !inputId.trim()}
              className="bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
          {notFound && (
            <p className="text-red-600 text-xs mt-2">Order not found. Please check your Order ID and try again.</p>
          )}
        </div>

        {order && (
          <>
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
                isComplete          ? "bg-green-500 scale-110" :
                isApprovedForPayment ? "bg-amber-500" :
                isPendingApproval   ? "bg-gray-400" :
                isCancelled         ? "bg-red-500" :
                                      "bg-[#5123d4]"
              }`}>
                {isComplete
                  ? <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  : isApprovedForPayment
                  ? <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  : <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                }
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {isComplete          ? "Order Delivered! 🎉" :
                 isApprovedForPayment ? "Approved — Ready to Pay!" :
                 isPendingApproval   ? "Awaiting Review" :
                 isCancelled         ? "Order Cancelled" :
                                       "Order in Progress"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {isComplete          ? "Your order has been completed successfully." :
                 isApprovedForPayment ? "Your order has been approved. Complete payment to proceed." :
                 isPendingApproval   ? "We are reviewing your order. You will be able to pay once approved." :
                 isCancelled         ? "This order has been cancelled. Contact us if you have questions." :
                                       "We are processing your order."}
              </p>
            </div>

            {/* Order reference card */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Order ID</p>
                  <p className="text-[#5123d4] font-bold text-lg sm:text-xl">{order.orderId}</p>
                  <p className="text-xs text-gray-500 mt-1">{order.customerName} · {order.service}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      copied ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Order amount</p>
                    <p className="font-bold text-black">₦{Number(order.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved for Payment CTA */}
            {isApprovedForPayment && !hasBeenPaid && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-6 text-center">
                <p className="font-bold text-amber-800 text-base mb-1">Your order is approved!</p>
                <p className="text-amber-700 text-sm mb-4">Complete your payment of ₦{Number(order.amount).toLocaleString()} to get started.</p>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  className="bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-60 text-white px-10 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  {paying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment…</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay Now — ₦{Number(order.amount).toLocaleString()}</>
                  )}
                </button>
              </div>
            )}

            {/* Pending Approval notice */}
            {isPendingApproval && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 mb-6 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-blue-800 text-sm mb-1">Waiting for Approval</p>
                <p className="text-blue-700 text-xs">Our team is reviewing your order. We will notify you once it is approved and ready for payment. Check back here anytime with your Order ID.</p>
              </div>
            )}

            {/* Tracking timeline — only for paid orders */}
            {!isPendingApproval && !isApprovedForPayment && !isCancelled && (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
                <h2 className="text-base font-bold text-black mb-6">Order Progress</h2>
                <div className="space-y-0">
                  {STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const isDone    = currentStage > stage.id;
                    const isCurrent = currentStage === stage.id;
                    const isPending = currentStage < stage.id;
                    const isLast    = idx === STAGES.length - 1;

                    return (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-700 ${
                            isDone    ? "bg-green-500 text-white" :
                            isCurrent ? "bg-[#5123d4] text-white shadow-lg shadow-purple-200 scale-110" :
                                        "bg-gray-100 text-gray-400"
                          }`}>
                            {isDone
                              ? <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              : <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? "animate-pulse" : ""}`} />
                            }
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 grow my-1 transition-all duration-700 min-h-8 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className={`pb-8 ${isLast ? "pb-0" : ""} pt-1 min-w-0`}>
                          <p className={`font-semibold text-sm sm:text-base transition-all ${
                            isDone ? "text-green-700" : isCurrent ? "text-[#5123d4]" : "text-gray-400"
                          }`}>
                            {stage.label}
                            {isCurrent && <span className="ml-2 inline-block text-[10px] bg-[#5123d4] text-white rounded-full px-2 py-0.5 font-medium">In Progress</span>}
                            {isDone    && <span className="ml-2 inline-block text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Done</span>}
                          </p>
                          <p className={`text-xs sm:text-sm mt-0.5 ${isPending ? "text-gray-300" : "text-gray-600"}`}>
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact support */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
              <h3 className="text-sm font-bold mb-4 text-black">Need Help?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+2348035671112" className="flex-1 flex items-center gap-3 p-3 bg-[#f8f5ff] rounded-lg hover:bg-[#efe9ff] transition-colors">
                  <Phone className="w-5 h-5 text-[#5123d4]" />
                  <div>
                    <p className="text-xs text-gray-500">Call us</p>
                    <p className="text-sm font-medium text-black">+234 803 567 1112</p>
                  </div>
                </a>
                <a href="mailto:support@computerservice.ng" className="flex-1 flex items-center gap-3 p-3 bg-[#f8f5ff] rounded-lg hover:bg-[#efe9ff] transition-colors">
                  <Mail className="w-5 h-5 text-[#5123d4]" />
                  <div>
                    <p className="text-xs text-gray-500">Email us</p>
                    <p className="text-sm font-medium text-black truncate">support@computerservice.ng</p>
                  </div>
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 bg-[#5123d4] hover:bg-[#401AA0] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Place Another Order <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </>
        )}

        {/* No order yet — empty prompt */}
        {!order && !loading && !notFound && !orderId && !ref && (
          <div className="text-center text-gray-400 text-sm py-8">
            Enter your Order ID above to track your order.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5123d4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
