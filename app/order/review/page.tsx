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
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [submittedOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderData.document) {
      const url = URL.createObjectURL(orderData.document);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [orderData.document]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const RATE: Record<string, Record<string, number>> = {
    "Black & white": { A4: 300, A3: 500, "Custom type": 300, Passport: 300 },
    Coloured:        { A4: 700, A3: 1200, "Custom type": 700, Passport: 750 },
  };
  const FINISHING_COST: Record<string, number> = {
    None: 0, Stapled: 200, "Spiral Binding": 500, "Hardcover Binding": 2000,
  };
  const SERVICE_FEE = 2000;

  const color       = orderData.printColor || "Black & white";
  const paper       = orderData.paperType  || "A4";
  const pages       = orderData.pages      || 1;
  const copies      = orderData.copies     || 1;
  const perPage     = RATE[color]?.[paper] ?? 50;
  const baseDoc     = perPage * pages * copies;
  const finishing   = FINISHING_COST[orderData.finishingOption ?? "None"] ?? 0;
  const isExpress   = orderData.expressService === true || orderData.deadline === "Express (1hr - 2hrs)";
  const expressExtra = isExpress ? Math.round(baseDoc * 0.5) : 0;
  const isLamination = orderData.service === "Lamination";
  const LAMINATION_FEE = 700;

  const getDeliveryFee = () => {
    const method = orderData.deliveryMethod || "";
    if (method === "Express Delivery")  return 3000;
    if (method === "Standard Delivery") return 2000;
    if (method === "Economy Delivery")  return 1000;
    if (method === "Schedule Delivery") return 5000 * Math.max((orderData.scheduledStops?.length) || 0, 1);
    return 0;
  };

  const deliveryFee = getDeliveryFee();
  const serviceFee  = SERVICE_FEE;
  const total       = isLamination
    ? LAMINATION_FEE + deliveryFee
    : baseDoc + finishing + expressExtra + deliveryFee + serviceFee;

  // Preview logic
  const hasCustomHtml = !!(orderData.customDocumentHtml?.trim());
  const hasDocumentText = !!(orderData.documentText?.trim());
  const hasUploadedFile = !!fileUrl;
  const isPdf = orderData.document?.type === "application/pdf";
  const isImage = orderData.document?.type?.startsWith("image/");
  const allFiles = orderData.documents?.length ? orderData.documents : orderData.document ? [orderData.document] : [];
  const hasMultipleFiles = allFiles.length > 1;

  const docLabel = hasCustomHtml
    ? "Typed Document"
    : hasDocumentText
    ? "Pasted Text"
    : allFiles.length > 0
    ? (allFiles.length > 1 ? `${allFiles.length} Files Uploaded` : allFiles[0].name)
    : "No document uploaded";

  const handleDownload = async () => {
    if (hasCustomHtml) {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>${docLabel}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#000;max-width:800px;margin:auto}h1,h2,h3{color:#5123d4}@media print{body{padding:0}}</style></head><body>${orderData.customDocumentHtml}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } else if (hasDocumentText) {
      const blob = new Blob([orderData.documentText!], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else if (fileUrl && orderData.document) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = orderData.document.name;
      a.click();
    }
  };

  const handleSubmitAndPay = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // 1. Save order to DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:        orderData.name,
          phone_number:         orderData.phoneNumber,
          email:                orderData.email              || null,
          service:              orderData.service            || "Unspecified",
          category:             orderData.category           || null,
          delivery_method:      orderData.deliveryMethod     || null,
          pickup_state:         orderData.pickupState        || null,
          pickup_city:          orderData.pickupCity         || null,
          pickup_location:      orderData.pickupLocation     || null,
          delivery_details:     orderData.deliveryMethod === "Schedule Delivery" && orderData.scheduledStops
            ? JSON.stringify(orderData.scheduledStops)
            : orderData.deliveryDetails || null,
          deadline:             orderData.deadline           || null,
          express_service:      orderData.expressService     ?? false,
          print_color:          orderData.printColor         || null,
          paper_type:           orderData.paperType          || null,
          pages:                orderData.pages              || 1,
          copies:               orderData.copies             || 1,
          print_layout:         orderData.printLayout        || null,
          finishing_option:     orderData.finishingOption    || null,
          specific_instruction: orderData.specificInstruction || null,
          amount:               total,
          document_text:        orderData.documentText       || null,
          hardcopy_pickup_date:  orderData.hardcopyPickupDate  || null,
          hardcopy_pickup_time:  orderData.hardcopyPickupTime  || null,
          hardcopy_state:        orderData.hardcopyState        || null,
          hardcopy_city:         orderData.hardcopyCity         || null,
          hardcopy_contact_name: orderData.hardcopyContactName || null,
          hardcopy_contact_phone: orderData.hardcopyContactPhone || null,
          hardcopy_doc_count:   orderData.hardcopyDocCount   || null,
          hardcopy_instructions: orderData.hardcopyInstructions || null,
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        setSubmitError(orderJson.error || "Failed to submit order. Please try again.");
        return;
      }

      const savedOrderId = orderJson.id; // UUID for Prisma, used for PATCH

      // 2. Initialize Paystack server-side to get access_code
      const payRes = await fetch("/api/payment/initialize", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: savedOrderId,
          email:   orderData.email || "customer@computerservice.ng",
          amount:  total,
        }),
      });
      const payJson = await payRes.json() as { authorization_url?: string; access_code?: string; reference?: string; error?: string };
      if (!payRes.ok || !payJson.authorization_url) {
        setSubmitError(payJson.error || "Could not open payment. Please try again.");
        setSubmitting(false);
        return;
      }

      // 3. Redirect to Paystack's hosted payment page
      window.location.href = payJson.authorization_url;
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const handleSaveProject = () => {
    setShowSaveModal(false);
    handleSubmitAndPay();
  };

  const handleDeleteProject = () => {
    setShowSaveModal(false);
    handleSubmitAndPay();
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
                  <div className={`w-6 sm:w-14 h-0.5 shrink-0 ${step.completed ? "bg-[#5123d4]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

                    <div className="lg:col-span-4 space-y-4">

            {/* Order Summary Card */}
            <div className="bg-white rounded-xl border border-purple-100 p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-center mb-5">Order summary</h2>

              <div className="space-y-4">
                {/* Order ID */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Order ID</p>
                    <p className="text-sm text-gray-400 italic">Assigned after payment</p>
                  </div>
                  {approved && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium">
                      Approved
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                {(orderData.name || orderData.phoneNumber || orderData.email) && (
                  <div className="space-y-1.5 py-3 border-t border-gray-100 text-sm">
                    <p className="text-[11px] font-bold text-[#5123d4] uppercase tracking-wide mb-2">Customer</p>
                    {orderData.name && (
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-black shrink-0">Name</p>
                        <p className="text-gray-700 text-right">{orderData.name}</p>
                      </div>
                    )}
                    {orderData.phoneNumber && (
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-black shrink-0">Phone</p>
                        <p className="text-gray-700 text-right">{orderData.phoneNumber}</p>
                      </div>
                    )}
                    {orderData.email && (
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-black shrink-0">Email</p>
                        <p className="text-gray-700 text-right truncate max-w-40">{orderData.email}</p>
                      </div>
                    )}
                    {orderData.service && (
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-black shrink-0">Service</p>
                        <p className="text-gray-700 text-right">{orderData.service}</p>
                      </div>
                    )}
                    {orderData.category && (
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-black shrink-0">Category</p>
                        <p className="text-gray-700 text-right">{orderData.category}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Document card */}
                <div className="flex items-center gap-3 py-4 border-t border-b border-gray-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f2fb] rounded flex items-center justify-center shrink-0 border border-gray-100">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#5123d4]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-black text-sm truncate">
                      {hasCustomHtml ? "Typed Document" : hasDocumentText ? "Pasted Text" : (orderData.document?.name || "No Document")}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">{pages} {pages === 1 ? "Page" : "Pages"} · {copies} {copies === 1 ? "Copy" : "Copies"}</p>
                    <p className="text-xs text-gray-600">{orderData.printColor || "Black & white"}</p>
                  </div>
                </div>

                {/* Print options */}
                <div className="space-y-2.5 py-3 border-b border-gray-100 text-sm">
                  <p className="text-[11px] font-bold text-[#5123d4] uppercase tracking-wide mb-2">Print Options</p>
                  {[
                    { label: "Paper Size",    value: orderData.paperType   || "A4" },
                    { label: "Print Layout",  value: orderData.printLayout || "—" },
                    { label: "Orientation",   value: orderData.orientation || "—" },
                    { label: "Finishing",     value: orderData.finishingOption || "None" },
                    { label: "Express",       value: isExpress ? "Yes (+50%)" : "No" },
                    { label: "Deadline",      value: orderData.deadline    || "Standard (3hrs - 5hrs)" },
                  ].filter(({ value }) => value && value !== "—").map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <p className="font-semibold text-black shrink-0">{label}</p>
                      <p className="text-gray-700 text-right">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery details */}
                <div className="space-y-2.5 py-3 border-b border-gray-100 text-sm">
                  <p className="text-[11px] font-bold text-[#5123d4] uppercase tracking-wide mb-2">Delivery</p>
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-black shrink-0">Method</p>
                    <p className="text-gray-700 text-right">{orderData.deliveryMethod || "—"}</p>
                  </div>
                  {/* Address-based methods */}
                  {["Express Delivery", "Standard Delivery", "Economy Delivery"].includes(orderData.deliveryMethod || "") && (
                    <>
                      {orderData.pickupState    && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">State</p><p className="text-gray-700 text-right">{orderData.pickupState}</p></div>}
                      {orderData.pickupCity     && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">City / Area</p><p className="text-gray-700 text-right">{orderData.pickupCity}</p></div>}
                      {orderData.pickupLocation && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Address</p><p className="text-gray-700 text-right max-w-40">{orderData.pickupLocation}</p></div>}
                    </>
                  )}
                  {/* Scheduled stops */}
                  {orderData.deliveryMethod === "Schedule Delivery" && orderData.scheduledStops && orderData.scheduledStops.map((stop, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-2.5 space-y-1">
                      <p className="text-xs font-bold text-[#5123d4]">Stop {idx + 1}</p>
                      <p className="text-xs text-gray-600">{stop.address}</p>
                      <p className="text-xs text-gray-500">{stop.date} at {stop.time}</p>
                    </div>
                  ))}
                  {/* Special Submission info */}
                  {orderData.deliveryMethod === "Special Submission" && (
                    <div className="bg-blue-50 rounded-lg p-2.5 text-xs text-blue-700">
                      After payment, visit <strong>Submitar.com</strong> and enter your order number to complete submission.
                    </div>
                  )}
                  {/* Hardcopy Pickup */}
                  {orderData.deliveryMethod === "Hardcopy Pickup" && (
                    <>
                      {orderData.hardcopyPickupDate  && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Pickup Date</p><p className="text-gray-700 text-right">{orderData.hardcopyPickupDate}</p></div>}
                      {orderData.hardcopyPickupTime  && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Pickup Time</p><p className="text-gray-700 text-right">{orderData.hardcopyPickupTime}</p></div>}
                      {orderData.hardcopyState       && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">State</p><p className="text-gray-700 text-right">{orderData.hardcopyState}</p></div>}
                      {orderData.hardcopyCity        && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">City</p><p className="text-gray-700 text-right">{orderData.hardcopyCity}</p></div>}
                      {orderData.hardcopyContactName && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Contact</p><p className="text-gray-700 text-right">{orderData.hardcopyContactName}</p></div>}
                      {orderData.hardcopyContactPhone && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Contact Phone</p><p className="text-gray-700 text-right">{orderData.hardcopyContactPhone}</p></div>}
                      {orderData.hardcopyDocCount    && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Doc Count</p><p className="text-gray-700 text-right">{orderData.hardcopyDocCount}</p></div>}
                      {orderData.hardcopyInstructions && <div className="flex justify-between gap-2"><p className="font-semibold text-black shrink-0">Instructions</p><p className="text-gray-700 text-right max-w-40">{orderData.hardcopyInstructions}</p></div>}
                    </>
                  )}
                  {orderData.specificInstruction && (
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-black shrink-0">Note</p>
                      <p className="text-gray-700 text-right max-w-40">{orderData.specificInstruction}</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-2.5 py-3 text-sm">
                  {isLamination ? (
                    <div className="flex justify-between">
                      <p className="font-semibold text-black">Lamination</p>
                      <p className="text-gray-700">₦{LAMINATION_FEE.toLocaleString()}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <p className="font-semibold text-black">{pages}pg × {copies} {copies === 1 ? "copy" : "copies"} ({color}, {paper})</p>
                        <p className="text-gray-700">₦{baseDoc.toLocaleString()}</p>
                      </div>
                      {finishing > 0 && (
                        <div className="flex justify-between">
                          <p className="font-semibold text-black">Finishing — {orderData.finishingOption}</p>
                          <p className="text-gray-700">₦{finishing.toLocaleString()}</p>
                        </div>
                      )}
                      {expressExtra > 0 && (
                        <div className="flex justify-between">
                          <p className="font-semibold text-amber-700">Express surcharge (+50%)</p>
                          <p className="text-amber-700">₦{expressExtra.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <p className="font-semibold text-black">Service fee</p>
                        <p className="text-gray-700">₦{serviceFee.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <p className="font-semibold text-black">Delivery</p>
                    <p className="text-gray-700">{deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : "Free"}</p>
                  </div>
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
                type="button"
                onClick={() => router.push("/order/editor")}
                className="w-full bg-[#5123d4] text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-[#401AA0] transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit / Type Document
              </button>
              <button
                type="button"
                onClick={() => router.push("/order/details")}
                className="w-full bg-white border border-gray-200 text-black px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit Order Details
              </button>
            </div>
          </div>

                    <div className="lg:col-span-8 flex flex-col min-h-125">

            {/* Preview toolbar */}
            <div className="bg-[#1e1e1e] rounded-t-xl p-2 sm:p-3 flex items-center justify-between text-white border-b border-gray-800 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate max-w-30 sm:max-w-50">{docLabel}</span>
                {(hasCustomHtml || hasDocumentText) && (
                  <span className="bg-[#5123d4] text-white text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">{hasCustomHtml ? "Typed" : "Pasted"}</span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Page nav — only for PDF */}
                {isPdf && hasUploadedFile && !hasCustomHtml && (
                  <>
                    <button type="button" title="Previous page" onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    <span className="text-[10px] sm:text-xs whitespace-nowrap">{pageNumber}/{numPages || "?"}</span>
                    <button type="button" title="Next page" onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))} className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-4 bg-gray-600 mx-1" />
                  </>
                )}
                <span className="text-[10px] sm:text-xs">{Math.round(scale * 100)}%</span>
                <button type="button" title="Zoom in" onClick={() => setScale(s => Math.min(s + 0.15, 3))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                <button type="button" title="Zoom out" onClick={() => setScale(s => Math.max(0.4, s - 0.15))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-3.5 h-3.5" /></button>
                <button type="button" title="Reset zoom" onClick={() => setScale(1.0)} className="p-1 hover:bg-white/10 rounded"><RotateCcw className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Preview content */}
            <div ref={previewRef} className="bg-[#2d2d2d] grow rounded-b-xl overflow-auto flex justify-center p-4 sm:p-8 min-h-100">
              {hasCustomHtml ? (
                <div
                  className="w-full max-w-200 bg-white shadow-xl rounded text-black self-start"
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
              ) : hasDocumentText ? (
                <div
                  className="w-full max-w-200 bg-white shadow-xl rounded text-black self-start"
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
                    className="px-6 sm:px-10 py-8"
                    style={{ minHeight: "600px", fontFamily: "Arial, sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.8", fontSize: "14px" }}
                  >
                    {orderData.documentText}
                  </div>
                </div>
              ) : hasMultipleFiles ? (
                /* Multiple files — show list + preview first previewable file */
                <div className="w-full space-y-4 self-start">
                  <div className="bg-white/10 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-3">
                      {allFiles.length} Files Uploaded · {pages} Pages Total
                    </p>
                    {allFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2.5">
                        <FileText className="w-4 h-4 text-[#D1AFFF] shrink-0" />
                        <span className="text-sm text-white truncate">{f.name}</span>
                        <span className="ml-auto text-xs text-white/50 shrink-0">
                          {f.type === "application/pdf" ? "PDF" : f.type.startsWith("image/") ? "Image" : "Doc"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Preview first PDF or image */}
                  {allFiles[0]?.type === "application/pdf" && fileUrl ? (
                    <PdfPreview fileUrl={fileUrl} pageNumber={pageNumber} scale={scale} onLoadSuccess={onDocumentLoadSuccess} />
                  ) : allFiles[0]?.type?.startsWith("image/") && fileUrl ? (
                    <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fileUrl} alt="First uploaded file" className="max-w-full h-auto shadow-xl bg-white rounded" />
                    </div>
                  ) : null}
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
              ) : hasUploadedFile ? (
                /* Non-previewable file (e.g. Word, Excel) — show file info card */
                <div className="flex flex-col items-center justify-center gap-4 text-center max-w-xs mx-auto py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#D1AFFF]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{orderData.document?.name}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {((orderData.document?.size ?? 0) / 1024).toFixed(0)} KB · {pages} page{pages !== 1 ? "s" : ""}
                    </p>
                    <p className="text-white/40 text-xs mt-2">Preview not available for this file type</p>
                  </div>
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
                    <button type="button" onClick={() => router.push("/order/editor")} className="bg-[#5123d4] text-white px-5 py-2.5 rounded-md font-medium hover:bg-[#401AA0] transition-colors flex items-center justify-center gap-2 text-sm">
                      <Edit className="w-4 h-4" /> Open Editor
                    </button>
                    <button type="button" onClick={() => router.push("/order/details")} className="bg-white/10 text-white px-5 py-2.5 rounded-md font-medium hover:bg-white/20 transition-colors text-sm">
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
                  <p className="text-xs text-gray-500">Approve to proceed to payment</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none border border-[#5123d4] text-[#5123d4] px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-purple-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  type="button"
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

            {/* Submit / Submitted state */}
            {submittedOrderId ? (
              <div className="mt-4 sm:mt-6 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-black text-base mb-1">Payment Cancelled</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your order was saved but payment was not completed. You can pay at any time using your Order ID.
                </p>
                <div className="bg-white border border-green-200 rounded-lg px-4 py-3 inline-block mb-4">
                  <p className="text-xs text-gray-500 mb-0.5">Your Order ID</p>
                  <p className="text-lg font-bold text-[#5123d4]">{submittedOrderId}</p>
                </div>
                <p className="text-xs text-gray-500 mb-4">Use this ID to track your order and complete payment later.</p>
                <button
                  type="button"
                  onClick={() => router.push(`/order/tracking?orderId=${submittedOrderId}`)}
                  className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  Track My Order
                </button>
              </div>
            ) : (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-500 text-center sm:text-left">
                    {approved
                      ? "✅ Document approved. Click to pay and place your order."
                      : "Approve your document above before paying."}
                  </p>
                  {submitError && (
                    <p className="text-xs text-red-600">{submitError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  disabled={submitting || !approved}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 sm:px-10 py-3 rounded-md font-semibold transition-colors min-w-45 ${
                    !approved
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : submitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#5123d4] hover:bg-[#401AA0] text-white shadow-md"
                  }`}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <>Submit &amp; Pay — ₦{total.toLocaleString()}</>
                  )}
                </button>
              </div>
            )}
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

function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}
