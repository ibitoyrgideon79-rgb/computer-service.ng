"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/useOrderStore";
import SaveProjectModal from "@/app/components/SaveProjectModal";
import {
  Check, Download, ShieldCheck, FileText,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  RotateCcw, Edit, Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-white/50 text-sm">
      Loading PDF...
    </div>
  ),
});

export default function OrderReviewPage() {
  const router = useRouter();
  const { orderData } = useOrderStore();

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderData.document) {
      const url = URL.createObjectURL(orderData.document);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [orderData.document]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Pricing
  const basePrice = 5000;
  const serviceFee = 1000;
  const deliveryFee = orderData.deliveryMethod === "Doorstep" ? 1000 : 0;
  const total = basePrice + serviceFee + deliveryFee;

  // Preview logic 
  const hasCustomHtml = !!(orderData.customDocumentHtml?.trim());
  const hasUploadedFile = !!fileUrl;
  const isPdf = orderData.document?.type === "application/pdf";
  const isImage = orderData.document?.type?.startsWith("image/");

  const docLabel = hasCustomHtml
    ? "Typed Document"
    : (orderData.document?.name || "No document uploaded");

  // ── Download ──
  const handleDownload = async () => {
    if (hasCustomHtml) {
      // For typed HTML: open a printable window
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`
        <!DOCTYPE html><html><head>
        <title>${docLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #000; max-width: 800px; margin: auto; }
          h1,h2,h3 { color: #5123d4; }
          @media print { body { padding: 0; } }
        </style>
        </head><body>${orderData.customDocumentHtml}</body></html>
      `);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } else if (fileUrl && orderData.document) {
      // For uploaded file: trigger direct download
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = orderData.document.name;
      a.click();
    }
  };

  // ── Paystack Submit ──
  const handleSubmit = () => {
    setPaying(true);

    // Dynamically load Paystack inline script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as any).PaystackPop;
      const handler = PaystackPop.setup({
        key: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // ← replace with your public key
        email: orderData.email || "customer@computerservice.ng",
        amount: total * 100, // Paystack uses kobo
        currency: "NGN",
        ref: `CSN-${Date.now()}`,
        metadata: {
          name: orderData.name,
          phone: orderData.phoneNumber,
          service: "Printing / Document Service",
          deliveryMethod: orderData.deliveryMethod,
        },
        onClose: () => {
          setPaying(false);
        },
        callback: (response: { reference: string }) => {
          setPaying(false);
          // Navigate to tracking page with reference
          router.push(`/order/tracking?ref=${response.reference}&total=${total}`);
        },
      });
      handler.openIframe();
    };
    script.onerror = () => {
      setPaying(false);
      alert("Could not load payment gateway. Please check your internet connection.");
    };
    document.body.appendChild(script);
  };

  const handleSaveProject = () => {
    // TODO: Save project to database linked to phone number
    console.log("Saving project for:", orderData.phoneNumber);
    setShowSaveModal(false);
    handleSubmit();
  };

  const handleDeleteProject = () => {
    // TODO: Mark project for deletion after completion
    console.log("Project will be deleted after completion");
    setShowSaveModal(false);
    handleSubmit();
  };

  const steps = [
    { label: "Request", completed: true },
    { label: "Prepare & Price", completed: true },
    { label: "Review & Approve", current: true },
    { label: "Confirm & Pay", completed: false },
    { label: "Delivery", completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black font-sans pb-20">
      <div className="container mx-auto px-3 sm:px-6 max-w-7xl pt-4 sm:pt-8">

        {/* ── Stepper ── */}
        <div className="w-full mb-6 sm:mb-12 overflow-x-auto pb-2">
          <div className="flex items-center gap-1 sm:gap-4 min-w-max mx-auto w-max">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                    step.completed || step.current ? "bg-[#5123d4] text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {step.completed ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                    step.current || step.completed ? "text-[#5123d4]" : "text-gray-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 sm:w-14 h-[2px] shrink-0 ${step.completed ? "bg-[#5123d4]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Order Summary Card */}
            <div className="bg-white rounded-xl border border-purple-100 p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-center mb-5">Order summary</h2>

              <div className="space-y-4">
                {/* Order ID */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Order ID</p>
                  <p className="text-[#5123d4] font-bold text-base sm:text-lg flex items-center gap-2">
                    CSN-240525-5378
                    <button
                      onClick={() => navigator.clipboard.writeText("CSN-240525-5378")}
                      className="hover:text-[#401AA0]"
                      aria-label="Copy order ID"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </p>
                </div>

                {/* Status */}
                {approved && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium inline-block">
                    Approved
                  </span>
                )}

                {/* Document card */}
                <div className="flex items-center gap-3 py-4 border-b border-gray-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f2fb] rounded flex items-center justify-center shrink-0 border border-gray-100">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#5123d4]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-black text-sm truncate">
                      {hasCustomHtml ? "Typed Document" : (orderData.document?.name || "No Document")}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">{orderData.copies || 1} {(orderData.copies || 1) === 1 ? "Copy" : "Copies"}</p>
                    <p className="text-xs text-gray-600">{orderData.printColor || "Black & white"}</p>
                  </div>
                </div>

                {/* Order details */}
                <div className="space-y-2.5 py-3 border-b border-gray-100 text-sm">
                  {[
                    { label: "Print Layout", value: orderData.printLayout || "—" },
                    { label: "Delivery", value: orderData.deliveryMethod || "—" },
                    { label: "Orientation", value: orderData.orientation || "—" },
                    { label: "Finishing", value: orderData.finishingOption || "None" },
                    { label: "Deadline", value: orderData.deadline || "Standard" },
                    { label: "Est. Delivery", value: "May 26, 2026, 2:30 pm" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <p className="font-semibold text-black shrink-0">{label}</p>
                      <p className="text-gray-700 text-right">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2.5 py-3 text-sm">
                  <div className="flex justify-between"><p className="font-semibold">Subtotal</p><p className="text-gray-700">₦{basePrice.toLocaleString()}</p></div>
                  <div className="flex justify-between"><p className="font-semibold">Service fee</p><p className="text-gray-700">₦{serviceFee.toLocaleString()}</p></div>
                  <div className="flex justify-between"><p className="font-semibold">Delivery Fee</p><p className="text-gray-700">₦{deliveryFee.toLocaleString()}</p></div>
                  <div className="flex justify-between pt-2 mt-1 border-t border-gray-100">
                    <p className="text-base font-bold text-[#5123d4]">Total</p>
                    <p className="text-base font-bold text-[#5123d4]">₦{total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure payment badge */}
            <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#5123d4] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-black">Your payment is secure</p>
                <p className="text-xs text-gray-500 mt-0.5">All payments are encrypted and 100% secure via Paystack</p>
              </div>
            </div>

            {/* Edit actions */}
            <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm space-y-3">
              <p className="text-[11px] font-bold text-[#5123d4] uppercase">Need Changes?</p>
              <p className="text-xs text-gray-600">Open the editor to type or make changes to your document.</p>
              <button
                onClick={() => router.push("/order/editor")}
                className="w-full bg-[#5123d4] text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-[#401AA0] transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit / Type Document
              </button>
              <button
                onClick={() => router.push("/order/details")}
                className="w-full bg-white border border-gray-200 text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit Order Details
              </button>
            </div>
          </div>

          {/* ── Right Side: Preview ── */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px]">

            {/* Preview toolbar */}
            <div className="bg-[#1e1e1e] rounded-t-xl p-2 sm:p-3 flex items-center justify-between text-white border-b border-gray-800 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">{docLabel}</span>
                {hasCustomHtml && (
                  <span className="bg-[#5123d4] text-white text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">Typed</span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Page nav — only for PDF */}
                {isPdf && hasUploadedFile && !hasCustomHtml && (
                  <>
                    <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    <span className="text-[10px] sm:text-xs whitespace-nowrap">{pageNumber}/{numPages || "?"}</span>
                    <button onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                  </>
                )}
                <span className="text-[10px] sm:text-xs">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(s + 0.15, 3))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                <button onClick={() => setScale(s => Math.max(0.4, s - 0.15))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-3.5 h-3.5" /></button>
                <button onClick={() => setScale(1.0)} className="p-1 hover:bg-white/10 rounded"><RotateCcw className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Preview content */}
            <div ref={previewRef} className="bg-[#2d2d2d] flex-grow rounded-b-xl overflow-auto flex justify-center p-4 sm:p-8 min-h-[400px]">
              {hasCustomHtml ? (
                <div
                  className="w-full max-w-[800px] bg-white shadow-xl rounded text-black self-start"
                  style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                >
                  <div className="bg-[#f0ebff] px-6 py-3 flex items-center justify-between border-b border-[#e2d9f3] rounded-t">
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="w-4 h-4 text-[#5123d4]" />
                      <span className="font-bold text-sm text-[#5123d4]">computerservice.ng</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div
                    className="px-6 sm:px-10 py-8 prose prose-sm max-w-none"
                    style={{ minHeight: "600px" }}
                    dangerouslySetInnerHTML={{ __html: orderData.customDocumentHtml! }}
                  />
                </div>
              ) : hasUploadedFile && isPdf ? (
                <PdfPreview
                  fileUrl={fileUrl!}
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={onDocumentLoadSuccess}
                />
              ) : hasUploadedFile && isImage ? (
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileUrl!} alt="Uploaded document" className="max-w-full h-auto shadow-xl bg-white rounded" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center max-w-xs mx-auto py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">No document yet</p>
                    <p className="text-white/60 text-sm mt-2">Go back to upload a file, or use the editor to type your document.</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <button onClick={() => router.push("/order/editor")} className="bg-[#5123d4] text-white px-5 py-2.5 rounded-md font-medium hover:bg-[#401AA0] transition-colors flex items-center justify-center gap-2 text-sm">
                      <Edit className="w-4 h-4" /> Open Editor
                    </button>
                    <button onClick={() => router.push("/order/details")} className="bg-white/10 text-white px-5 py-2.5 rounded-md font-medium hover:bg-white/20 transition-colors text-sm">
                      Upload File
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Approve / Download bar */}
            <div className="bg-white mt-3 sm:mt-4 rounded-xl border border-purple-100 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#5123d4] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-black">Please review your document carefully.</p>
                  <p className="text-xs text-gray-500">Once approved, we will proceed to payment.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none border border-[#5123d4] text-[#5123d4] px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-purple-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={() => setApproved(true)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    approved
                      ? "bg-green-600 text-white"
                      : "bg-[#5123d4] text-white hover:bg-[#401AA0]"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {approved ? "Approved!" : "Approve Document"}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                {approved ? "✅ Document approved. Click Submit to proceed to payment." : "Approve your document above before submitting."}
              </p>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={paying || !approved}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 sm:px-10 py-3 rounded-md font-semibold transition-colors min-w-[180px] ${
                  paying
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#5123d4] hover:bg-[#401AA0] text-white shadow-md"
                }`}
              >
                {paying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <>Submit &amp; Pay ₦{total.toLocaleString()}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Delete Project Modal */}
      <SaveProjectModal
        isOpen={showSaveModal}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}
