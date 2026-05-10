"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, Clock, Package, Truck, PartyPopper, Copy,
  ArrowRight, Phone, Mail, Search, Loader2, CreditCard,
  RefreshCw, RotateCcw, X,
} from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";

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
  { id: 1, icon: CheckCircle, label: "Payment Confirmed",  desc: "Your payment has been verified successfully." },
  { id: 2, icon: Clock,       label: "Processing",         desc: "Our team is reviewing and preparing your document." },
  { id: 3, icon: Package,     label: "Ready",              desc: "Your document is ready for delivery or pick-up." },
  { id: 4, icon: Truck,       label: "Out for Delivery",   desc: "Your order is on its way to you!" },
  { id: 5, icon: PartyPopper, label: "Delivered",          desc: "Your order has been completed. Thank you!" },
];

const TERMINAL     = new Set(["Delivered", "Completed", "Cancelled"]);
const POLL_INTERVAL = 10_000;

interface FullOrder {
  id:                  string;
  orderId:             string;
  customerName:        string;
  phoneNumber:         string;
  email?:              string | null;
  service:             string;
  category?:           string | null;
  status:              string;
  amount:              string | number;
  paystackRef?:        string | null;
  deliveryMethod?:     string | null;
  deliveryDetails?:    string | null;
  pickupState?:        string | null;
  pickupCity?:         string | null;
  pickupLocation?:     string | null;
  deadline?:           string | null;
  printColor?:         string | null;
  paperType?:          string | null;
  pages?:              number | null;
  copies?:             number | null;
  printLayout?:        string | null;
  finishingOption?:    string | null;
  expressService?:     boolean | null;
  specificInstruction?: string | null;
  documentText?:       string | null;
  fileUrl?:            string | null;
  createdAt?:          string;
}

function CheckMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface RecallModalProps {
  order:    FullOrder;
  onClose:  () => void;
  onSuccess: () => void;
}

function RecallOtpModal({ order, onClose, onSuccess }: RecallModalProps) {
  const [step,    setStep]    = useState<"sending" | "otp" | "verifying">("sending");
  const [otp,     setOtp]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-send OTP to the order's phone when modal opens
  useEffect(() => {
    void sendOtp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOtp = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: order.phoneNumber }),
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) { setError(json.message || "Failed to send code. Please try again."); setStep("otp"); return; }
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { setError("Please enter the full verification code"); return; }
    setLoading(true); setError(""); setStep("verifying");
    try {
      const res  = await fetch("/api/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: order.phoneNumber, otp }),
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) { setError(json.message || "Invalid code. Please try again."); setStep("otp"); }
      else onSuccess();
    } catch {
      setError("Network error. Please try again.");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = order.phoneNumber.replace(/(\+?\d{3})\d{4}(\d{4})/, "$1****$2");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-black">Recall Your Order</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "sending" && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-[#5123d4] mx-auto mb-3" />
            <p className="text-sm text-gray-600">Sending a code to {maskedPhone}…</p>
          </div>
        )}

        {(step === "otp" || step === "verifying") && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <span className="font-semibold text-black">{maskedPhone}</span> to access and edit this order.
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-center tracking-[0.4em] text-2xl font-bold"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify & Edit Order"}
            </button>
            <button
              type="button"
              onClick={() => { setOtp(""); setError(""); void sendOtp(); }}
              disabled={loading}
              className="w-full text-[#5123d4] text-sm font-medium py-2 hover:underline"
            >
              Resend code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { setOrderData, resetOrder } = useOrderStore();

  const orderId   = searchParams.get("orderId")   || "";
  const ref       = searchParams.get("ref")       || "";
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [inputId,   setInputId]   = useState(orderId || ref);
  const [order,     setOrder]     = useState<FullOrder | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [notFound,  setNotFound]  = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [paying,    setPaying]    = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Recall modal
  const [showRecall, setShowRecall] = useState(false);

  // Real-time polling
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [secondsAgo,    setSecondsAgo]    = useState(0);
  const [statusChanged, setStatusChanged] = useState(false);
  const [isPolling,     setIsPolling]     = useState(false);

  const pollingRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef("");

  const startTicker = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setSecondsAgo(0);
    tickRef.current = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (tickRef.current)    { clearInterval(tickRef.current);    tickRef.current    = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const fetchOrder = useCallback(async (id: string, silent = false) => {
    if (!id.trim()) return;
    if (!silent) { setLoading(true); setNotFound(false); }
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      if (res.status === 404) { setNotFound(true); setOrder(null); return; }
      if (!res.ok)            { if (!silent) { setNotFound(true); setOrder(null); } return; }
      const data = await res.json() as FullOrder;
      const rec: FullOrder = {
        id:                  data.id,
        orderId:             (data as unknown as Record<string,string>).orderId      ?? (data as unknown as Record<string,string>).order_id,
        customerName:        (data as unknown as Record<string,string>).customerName ?? (data as unknown as Record<string,string>).customer_name,
        phoneNumber:         (data as unknown as Record<string,string>).phoneNumber  ?? (data as unknown as Record<string,string>).phone_number,
        email:               (data as unknown as Record<string,string>).email,
        service:             data.service,
        category:            (data as unknown as Record<string,string>).category,
        status:              data.status,
        amount:              data.amount,
        paystackRef:         (data as unknown as Record<string,string>).paystackRef  ?? (data as unknown as Record<string,string>).paystack_ref,
        deliveryMethod:      (data as unknown as Record<string,string>).deliveryMethod ?? (data as unknown as Record<string,string>).delivery_method,
        deliveryDetails:     (data as unknown as Record<string,string>).deliveryDetails ?? (data as unknown as Record<string,string>).delivery_details,
        pickupState:         (data as unknown as Record<string,string>).pickupState  ?? (data as unknown as Record<string,string>).pickup_state,
        pickupCity:          (data as unknown as Record<string,string>).pickupCity   ?? (data as unknown as Record<string,string>).pickup_city,
        pickupLocation:      (data as unknown as Record<string,string>).pickupLocation ?? (data as unknown as Record<string,string>).pickup_location,
        deadline:            data.deadline,
        printColor:          (data as unknown as Record<string,string>).printColor   ?? (data as unknown as Record<string,string>).print_color,
        paperType:           (data as unknown as Record<string,string>).paperType    ?? (data as unknown as Record<string,string>).paper_type,
        pages:               (data as unknown as Record<string,number>).pages,
        copies:              (data as unknown as Record<string,number>).copies,
        printLayout:         (data as unknown as Record<string,string>).printLayout  ?? (data as unknown as Record<string,string>).print_layout,
        finishingOption:     (data as unknown as Record<string,string>).finishingOption ?? (data as unknown as Record<string,string>).finishing_option,
        expressService:      (data as unknown as Record<string,boolean>).expressService ?? (data as unknown as Record<string,boolean>).express_service,
        specificInstruction: (data as unknown as Record<string,string>).specificInstruction ?? (data as unknown as Record<string,string>).specific_instruction,
        documentText:        (data as unknown as Record<string,string>).documentText ?? (data as unknown as Record<string,string>).document_text,
        fileUrl:             (data as unknown as Record<string,string>).fileUrl      ?? (data as unknown as Record<string,string>).file_url,
        createdAt:           (data as unknown as Record<string,string>).createdAt    ?? (data as unknown as Record<string,string>).created_at,
      };

      if (prevStatusRef.current && prevStatusRef.current !== rec.status) {
        setStatusChanged(true);
        setTimeout(() => setStatusChanged(false), 3000);
      }
      prevStatusRef.current = rec.status;
      setOrder(rec);
      setLastUpdated(new Date());
      startTicker();
      if (TERMINAL.has(rec.status)) stopPolling();
    } catch {
      if (!silent) { setNotFound(true); setOrder(null); }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [startTicker, stopPolling]);

  const startPolling = useCallback((id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setIsPolling(true);
    pollingRef.current = setInterval(() => { void fetchOrder(id, true); }, POLL_INTERVAL);
  }, [fetchOrder]);

  // Payment verification callback — clear store then show order
  useEffect(() => {
    if (!reference) return;
    setVerifying(true);
    fetch("/api/payment/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((data: { verified?: boolean; orderId?: string }) => {
        setVerifying(false);
        if (data.orderId) {
          setInputId(data.orderId);
          resetOrder();
          localStorage.removeItem("computerservice_order_data");
          void fetchOrder(data.orderId).then(() => startPolling(data.orderId!));
        }
      })
      .catch(() => setVerifying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  // Auto-load when orderId is in the URL
  useEffect(() => {
    const id = orderId || ref;
    if (id) {
      setInputId(id);
      void fetchOrder(id).then(() => startPolling(id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, ref]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    stopPolling();
    prevStatusRef.current = "";
    await fetchOrder(inputId);
    if (!notFound) startPolling(inputId.trim());
  };

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const payRes = await fetch("/api/payment/initialize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, email: order.email || "customer@computerservice.ng", amount: Number(order.amount) }),
      });
      const payJson = await payRes.json() as { authorization_url?: string; error?: string };
      if (!payRes.ok || !payJson.authorization_url) {
        alert(payJson.error || "Could not initialize payment. Please try again.");
        setPaying(false); return;
      }
      window.location.href = payJson.authorization_url;
    } catch { setPaying(false); alert("Network error. Please try again."); }
  };

  // Recall success — load order into store and redirect to editor
  const handleRecallSuccess = () => {
    if (!order) return;
    setOrderData({
      service:             order.service            || "",
      category:            order.category           || "",
      name:                order.customerName        || "",
      phoneNumber:         order.phoneNumber         || "",
      email:               order.email              || "",
      documentText:        order.documentText        || "",
      customDocumentHtml:  undefined,
      printColor:          (order.printColor as "Black & white" | "Coloured" | "")    || "Black & white",
      paperType:           (order.paperType  as "A4" | "A3" | "Custom type" | "")     || "A4",
      pages:               order.pages              ?? 1,
      copies:              order.copies             ?? 1,
      printLayout:         (order.printLayout as "Single Sided" | "Double Sided" | "") || "",
      finishingOption:     (order.finishingOption as "None" | "Spiral Binding" | "Stapled" | "Hardcover Binding" | "") || "None",
      expressService:      order.expressService     ?? false,
      deadline:            (order.deadline as "Standard (3hrs - 5hrs)" | "Express (1hr - 2hrs)" | "Custom (Date Picker)" | "") || "",
      deliveryMethod:      (order.deliveryMethod as "Pick Up" | "Doorstep" | "Hardcopy Pickup" | "") || "Pick Up",
      deliveryDetails:     order.deliveryDetails    || "",
      pickupState:         order.pickupState        || "",
      pickupCity:          order.pickupCity         || "",
      pickupLocation:      order.pickupLocation     || "",
      specificInstruction: order.specificInstruction || "",
    });
    router.push("/order/editor");
  };

  // Computed display values
  const status               = order?.status ?? "";
  const isPendingApproval    = status === "Pending Approval";
  const isApprovedForPayment = status === "Approved for Payment";
  const isCancelled          = status === "Cancelled";
  const isComplete           = status === "Delivered" || status === "Completed";
  const currentStage         = STATUS_STAGE[status] ?? 1;
  const hasBeenPaid          = !!(order?.paystackRef);
  const isTerminal           = TERMINAL.has(status);

  const updatedLabel = lastUpdated
    ? secondsAgo < 5 ? "Just updated" : `Updated ${secondsAgo}s ago`
    : null;

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

                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-black">Track Your Order</h2>
            {isPolling && !isTerminal && (
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={inputId}
              onChange={(e) => { setInputId(e.target.value); setNotFound(false); }}
              placeholder="e.g. CSN-20260508-1234"
              className="flex-1 bg-[#F1F5F9] text-gray-900 px-4 py-2.5 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
            />
            <button
              type="submit"
              disabled={loading || !inputId.trim()}
              className="bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>

          {notFound && (
            <p className="text-red-600 text-xs mt-2">Order not found. Please check your Order ID and try again.</p>
          )}
          {updatedLabel && (
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {updatedLabel}{!isTerminal && " · refreshing every 10s"}
            </p>
          )}
        </div>

        {order && (
          <>
                        <div className="text-center mb-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
                isComplete ? "bg-green-500 scale-110" :
                isApprovedForPayment ? "bg-amber-500" :
                isPendingApproval ? "bg-gray-400" :
                isCancelled ? "bg-red-500" : "bg-[#5123d4]"
              }`}>
                {isComplete ? <PartyPopper className="w-8 h-8 text-white" />
                 : isApprovedForPayment ? <CreditCard className="w-8 h-8 text-white" />
                 : <CheckCircle className="w-8 h-8 text-white" />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {isComplete ? "Order Delivered! 🎉"
                 : isApprovedForPayment ? "Approved — Ready to Pay!"
                 : isPendingApproval ? "Awaiting Review"
                 : isCancelled ? "Order Cancelled"
                 : "Order in Progress"}
              </h1>
              <p className="text-gray-600 text-sm">
                {isComplete ? "Your order has been completed successfully."
                 : isApprovedForPayment ? "Your order has been approved. Complete payment to proceed."
                 : isPendingApproval ? "We are reviewing your order. You will be able to pay once approved."
                 : isCancelled ? "This order has been cancelled. Contact us if you have questions."
                 : "We are actively working on your order."}
              </p>
            </div>

                        <div className={`bg-white rounded-2xl border shadow-sm p-5 sm:p-6 mb-6 transition-all duration-500 ${
              statusChanged ? "border-[#5123d4] ring-2 ring-[#5123d4]/20" : "border-purple-100"
            }`}>
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
                    <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy"}
                  </button>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="font-bold text-black">₦{Number(order.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {statusChanged && (
                <div className="mt-4 bg-[#f0ebff] border border-[#5123d4]/30 rounded-xl px-4 py-2.5 text-sm text-[#5123d4] font-semibold animate-pulse">
                  Status updated → {order.status}
                </div>
              )}
            </div>

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
                  {paying
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment…</>
                    : <><CreditCard className="w-4 h-4" /> Pay Now — ₦{Number(order.amount).toLocaleString()}</>}
                </button>
              </div>
            )}

                        {isPendingApproval && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 mb-6 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-blue-800 text-sm mb-1">Waiting for Approval</p>
                <p className="text-blue-700 text-xs">Our team is reviewing your order. Once approved, you can pay here. This page refreshes automatically every 10 seconds.</p>
              </div>
            )}

                        {!isPendingApproval && !isApprovedForPayment && !isCancelled && (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-black">Order Progress</h2>
                  {isPolling && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Live
                    </span>
                  )}
                </div>
                <div className="space-y-0">
                  {STAGES.map((stage, idx) => {
                    const Icon      = stage.icon;
                    const isDone    = currentStage > stage.id;
                    const isCurrent = currentStage === stage.id;
                    const isPending = currentStage < stage.id;
                    const isLast    = idx === STAGES.length - 1;
                    return (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-700 ${
                            isDone ? "bg-green-500 text-white" :
                            isCurrent ? "bg-[#5123d4] text-white shadow-lg shadow-purple-200 scale-110" :
                            "bg-gray-100 text-gray-400"
                          }`}>
                            {isDone
                              ? <CheckMark className="w-4 h-4 sm:w-5 sm:h-5" />
                              : <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? "animate-pulse" : ""}`} />}
                          </div>
                          {!isLast && <div className={`w-0.5 grow my-1 transition-all duration-700 min-h-8 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />}
                        </div>
                        <div className={`pb-8 ${isLast ? "pb-0" : ""} pt-1 min-w-0`}>
                          <p className={`font-semibold text-sm sm:text-base transition-all ${
                            isDone ? "text-green-700" : isCurrent ? "text-[#5123d4]" : "text-gray-400"
                          }`}>
                            {stage.label}
                            {isCurrent && <span className="ml-2 inline-block text-[10px] bg-[#5123d4] text-white rounded-full px-2 py-0.5 font-medium">In Progress</span>}
                            {isDone    && <span className="ml-2 inline-block text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Done</span>}
                          </p>
                          <p className={`text-xs sm:text-sm mt-0.5 ${isPending ? "text-gray-300" : "text-gray-600"}`}>{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
              <h3 className="text-sm font-bold mb-4 text-black">Need Help?</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+2348035671112" className="flex-1 flex items-center gap-3 p-3 bg-[#f8f5ff] rounded-xl hover:bg-[#efe9ff] transition-colors">
                  <Phone className="w-5 h-5 text-[#5123d4]" />
                  <div>
                    <p className="text-xs text-gray-500">Call us</p>
                    <p className="text-sm font-medium text-black">+234 803 567 1112</p>
                  </div>
                </a>
                <a href="mailto:support@computerservice.ng" className="flex-1 flex items-center gap-3 p-3 bg-[#f8f5ff] rounded-xl hover:bg-[#efe9ff] transition-colors">
                  <Mail className="w-5 h-5 text-[#5123d4]" />
                  <div>
                    <p className="text-xs text-gray-500">Email us</p>
                    <p className="text-sm font-medium text-black truncate">support@computerservice.ng</p>
                  </div>
                </a>
              </div>
            </div>

                        <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 bg-[#5123d4] hover:bg-[#401AA0] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Place Another Order <ArrowRight className="w-4 h-4" />
              </button>

              {/* Recall button — shown for all non-terminal or even terminal orders */}
              <button
                type="button"
                onClick={() => setShowRecall(true)}
                className="flex-1 border-2 border-[#5123d4] text-[#5123d4] hover:bg-[#f0ebff] px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Recall Order
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

        {!order && !loading && !notFound && !orderId && !ref && (
          <div className="text-center text-gray-400 text-sm py-8">
            Enter your Order ID above to track your order.
          </div>
        )}
      </div>

            {showRecall && order && (
        <RecallOtpModal
          order={order}
          onClose={() => setShowRecall(false)}
          onSuccess={handleRecallSuccess}
        />
      )}
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
