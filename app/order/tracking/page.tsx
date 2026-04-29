"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, Clock, Package, Truck, PartyPopper, Copy,
  ArrowRight, Phone, Mail,
} from "lucide-react";

// ── Tracking stages ──
const STAGES = [
  { id: 1, icon: CheckCircle, label: "Payment Confirmed", desc: "Your payment has been verified successfully." },
  { id: 2, icon: Clock,       label: "Processing",        desc: "Our team is reviewing and preparing your document." },
  { id: 3, icon: Package,     label: "Ready",             desc: "Your document is ready for delivery or pick-up." },
  { id: 4, icon: Truck,       label: "Out for Delivery",  desc: "Your order is on its way to you!" },
  { id: 5, icon: PartyPopper, label: "Delivered",         desc: "Your order has been completed. Thank you!" },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref") || "CSN-DEMO";
  const total = searchParams.get("total") || "6000";

  const [currentStage, setCurrentStage] = useState(1);
  const [copied, setCopied] = useState(false);

  // Simulate real-time progression every 6 seconds (demo)
  useEffect(() => {
    if (currentStage >= STAGES.length) return;
    const timer = setInterval(() => {
      setCurrentStage((s) => Math.min(s + 1, STAGES.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [currentStage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isComplete = currentStage === STAGES.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] via-white to-[#ebf4ff] font-sans text-black">
      <div className="container mx-auto px-4 max-w-2xl py-10 sm:py-16">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-700 ${
            isComplete ? "bg-green-500 scale-110" : "bg-[#5123d4]"
          }`}>
            {isComplete
              ? <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              : <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            }
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            {isComplete ? "Order Delivered! 🎉" : "Order Confirmed!"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isComplete
              ? "Your order has been completed successfully."
              : "We received your payment and are processing your order."}
          </p>
        </div>

        {/* Order reference card */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Order Reference</p>
              <p className="text-[#5123d4] font-bold text-lg sm:text-xl">{ref}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  copied ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Ref"}
              </button>
              <div className="text-right">
                <p className="text-xs text-gray-400">Amount paid</p>
                <p className="font-bold text-black">₦{Number(total).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking timeline */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="text-base font-bold text-black mb-6">Real-time Order Tracking</h2>

          <div className="space-y-0">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isDone = currentStage > stage.id;
              const isCurrent = currentStage === stage.id;
              const isPending = currentStage < stage.id;
              const isLast = idx === STAGES.length - 1;

              return (
                <div key={stage.id} className="flex gap-4">
                  {/* Icon + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-700 ${
                      isDone    ? "bg-green-500 text-white" :
                      isCurrent ? "bg-[#5123d4] text-white shadow-lg shadow-purple-200 scale-110" :
                                  "bg-gray-100 text-gray-400"
                    }`}>
                      {isDone
                        ? <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        : <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? "animate-pulse" : ""}`} />
                      }
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-grow my-1 transition-all duration-700 min-h-[32px] ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${isLast ? "pb-0" : ""} pt-1 min-w-0`}>
                    <p className={`font-semibold text-sm sm:text-base transition-all ${
                      isDone ? "text-green-700" : isCurrent ? "text-[#5123d4]" : "text-gray-400"
                    }`}>
                      {stage.label}
                      {isCurrent && <span className="ml-2 inline-block text-[10px] bg-[#5123d4] text-white rounded-full px-2 py-0.5 font-medium">In Progress</span>}
                      {isDone && <span className="ml-2 inline-block text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Done</span>}
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
            onClick={() => router.push("/")}
            className="flex-1 bg-[#5123d4] hover:bg-[#401AA0] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Place Another Order <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Check icon used in timeline
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
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
