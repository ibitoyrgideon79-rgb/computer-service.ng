"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStore, OrderData } from "@/store/useOrderStore";
import { UploadCloud, AlertCircle, MapPin, User, Phone, Info } from "lucide-react";
import { useDropzone } from "react-dropzone";

export const dynamic = "force-dynamic";

// ── Pricing constants ──────────────────────────────────────────────────────
const RATE: Record<string, Record<string, number>> = {
  "Black & white": { A4: 50, A3: 100, "Custom type": 80 },
  Coloured:        { A4: 150, A3: 300, "Custom type": 200 },
};
const FINISHING_COST: Record<string, number> = {
  None: 0, Stapled: 200, "Spiral Binding": 500, "Hardcover Binding": 2000,
};
const SERVICE_FEE = 500;
const DELIVERY_FEE = 1000;
const EXPRESS_MULTIPLIER = 1.5;

const PICKUP_LOCATIONS = [
  "Wuse Zone 2, Abuja",
  "Garki Area 11, Abuja",
  "Maitama, Abuja",
  "Gwarinpa, Abuja",
  "Kubwa, Abuja",
  "Karu, Abuja",
  "Nyanya, Abuja",
  "Lugbe, Abuja",
  "Asokoro, Abuja",
  "Jabi, Abuja",
];

// ── Helper: section card wrapper ───────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-black border-b border-gray-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Helper: radio group row ────────────────────────────────────────────────
function RadioRow({
  label, name, options, value, onChange, required, error,
}: {
  label: string; name: string; options: string[];
  value: string; onChange: (val: string) => void;
  required?: boolean; error?: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio" name={name} value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="w-4 h-4 accent-[#5123d4]"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Helper: text/email/tel input ──────────────────────────────────────────
function FieldInput({
  label, name, type = "text", value, onChange, required, error, placeholder,
}: {
  label: string; name: string; type?: string;
  value: string; onChange: (val: string) => void;
  required?: boolean; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type} name={name} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${error ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"} text-sm`}
      />
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function OrderDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderData, setOrderData } = useOrderStore();

  const serviceParam   = searchParams.get("service") || "";
  const categoryParam  = searchParams.get("category") || "";

  // Determine which field groups to show based on the service
  const isPrintService    = ["Printing", "Photocopy", "Scanning"].includes(serviceParam);
  const isBindingService  = serviceParam === "Binding";
  const showPrintOptions  = isPrintService || isBindingService || !serviceParam;

  const [formData, setFormData] = useState({
    name:               orderData.name || "",
    phoneNumber:        orderData.phoneNumber || "",
    email:              orderData.email || "",
    documentText:       orderData.documentText || "",
    checkFormatting:    orderData.checkFormatting ?? false,
    printColor:         orderData.printColor || "Black & white",
    paperType:          orderData.paperType || "A4",
    customPaperType:    orderData.customPaperType || "",
    copies:             orderData.copies || 1,
    printLayout:        orderData.printLayout || "Single Sided",
    pageSelection:      orderData.pageSelection || "Print all pages",
    specificPages:      orderData.specificPages || "",
    orientation:        orderData.orientation || "Portrait",
    finishingOption:    orderData.finishingOption || "None",
    bindingType:        orderData.bindingType || "",
    frontCover:         orderData.frontCover || "",
    backCover:          orderData.backCover || "",
    deliveryMethod:     orderData.deliveryMethod || "",
    specificInstruction: orderData.specificInstruction || "",
    deadline:           orderData.deadline || "",
    customDeadlineDate: orderData.customDeadlineDate || "",
    deliveryDetails:    orderData.deliveryDetails || "",
    pickupLocation:     orderData.pickupLocation || "",
    pickupContactName:  orderData.pickupContactName || "",
    pickupContactPhone: orderData.pickupContactPhone || "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(orderData.document || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setUploadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
  });

  const set = (field: string, value: string | boolean | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ── Live price estimate ──────────────────────────────────────────────────
  const perPageRate = RATE[formData.printColor]?.[formData.paperType] ?? 50;
  const baseDoc     = perPageRate * (formData.copies || 1);
  const finishing   = FINISHING_COST[formData.finishingOption] ?? 0;
  const isExpress   = formData.deadline === "Express (1hr - 2hrs)";
  const expressExtra = isExpress ? Math.round(baseDoc * (EXPRESS_MULTIPLIER - 1)) : 0;
  const delivery    = formData.deliveryMethod === "Doorstep" ? DELIVERY_FEE : 0;
  const estimatedTotal = baseDoc + finishing + expressExtra + delivery + SERVICE_FEE;

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim())        e.name        = "Name is required";
    if (!formData.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    if (!formData.email.trim())       e.email       = "Email address is required";
    if (!formData.deliveryMethod)     e.deliveryMethod = "Please select a delivery method";
    if (!formData.deadline)           e.deadline    = "Please select a deadline";
    if (formData.deliveryMethod === "Pick Up" && !formData.pickupLocation)
      e.pickupLocation = "Please select a pickup location";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTimeout(() => firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setErrors({});
    setOrderData({ ...formData, document: uploadedFile, service: serviceParam, category: categoryParam } as Partial<OrderData>);
    router.push("/order/review");
  };

  // Scroll to first error ref whenever errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      firstErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errors]);

  const firstErrorField = Object.keys(errors)[0];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black font-sans pb-24">
      <div className="container mx-auto px-3 sm:px-6 max-w-5xl pt-8 sm:pt-12">

        {/* Page title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">Enter Your Details</h1>
          {serviceParam && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-[#5123d4]/10 text-[#5123d4] rounded-full text-sm font-medium">
              {serviceParam}{categoryParam ? ` — ${categoryParam}` : ""}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* ── Personal Info ── */}
          <div ref={firstErrorField && ["name","phoneNumber","email"].includes(firstErrorField) ? firstErrorRef : undefined}>
            <SectionCard title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldInput label="Full Name" name="name" value={formData.name}
                  onChange={(v) => { set("name", v); setErrors(p => ({ ...p, name: "" })); }}
                  required error={errors.name} placeholder="Enter your full name" />
                <FieldInput label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber}
                  onChange={(v) => { set("phoneNumber", v); setErrors(p => ({ ...p, phoneNumber: "" })); }}
                  required error={errors.phoneNumber} placeholder="08012345678" />
              </div>
              <FieldInput label="Email Address" name="email" type="email" value={formData.email}
                onChange={(v) => { set("email", v); setErrors(p => ({ ...p, email: "" })); }}
                required error={errors.email} placeholder="you@example.com" />
            </SectionCard>
          </div>

          {/* ── Document Upload ── */}
          <SectionCard title="Upload Document">
            <div
              {...getRootProps()}
              className={`w-full bg-[#F1F5F9] border-2 border-dashed ${isDragActive ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-300"} p-6 rounded-lg cursor-pointer transition-colors hover:border-[#5123d4] hover:bg-[#f9f7ff] flex items-center justify-between gap-4`}
            >
              <input {...getInputProps()} />
              <div className="text-gray-500 text-sm">
                {uploadedFile ? (
                  <span className="text-[#5123d4] font-medium">✓ {uploadedFile.name}</span>
                ) : (
                  <span>Drag & drop or <span className="text-[#5123d4] font-medium">browse</span> — PDF, Word, or Image</span>
                )}
              </div>
              <UploadCloud className="text-gray-400 w-6 h-6 shrink-0" />
            </div>
          </SectionCard>

          {/* ── Print Options (only for print/photocopy/scanning/binding) ── */}
          {showPrintOptions && (
            <SectionCard title="Print Options">
              <RadioRow label="Printing Colour" name="printColor"
                options={["Black & white", "Coloured"]}
                value={formData.printColor} onChange={(v) => set("printColor", v)} />

              {/* Paper Type */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Paper Type</p>
                <div className="flex flex-wrap gap-3">
                  {["A4", "A3"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="paperType" value={opt}
                        checked={formData.paperType === opt}
                        onChange={() => set("paperType", opt)}
                        className="w-4 h-4 accent-[#5123d4]" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paperType" value="Custom type"
                      checked={formData.paperType === "Custom type"}
                      onChange={() => set("paperType", "Custom type")}
                      className="w-4 h-4 accent-[#5123d4]" />
                    <span className="text-sm text-gray-700">Custom:</span>
                    <input type="text" name="customPaperType"
                      value={formData.customPaperType}
                      onChange={(e) => set("customPaperType", e.target.value)}
                      disabled={formData.paperType !== "Custom type"}
                      className="border-b border-gray-400 bg-transparent text-black focus:outline-none focus:border-[#5123d4] w-28 text-sm disabled:opacity-40" />
                  </label>
                </div>
              </div>

              {/* Copies */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Number of Copies</span>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => set("copies", Math.max(1, (formData.copies as number) - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:border-[#5123d4] transition-colors">−</button>
                  <span className="w-10 text-center font-semibold">{formData.copies}</span>
                  <button type="button"
                    onClick={() => set("copies", (formData.copies as number) + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:border-[#5123d4] transition-colors">+</button>
                </div>
              </div>

              {!isBindingService && (
                <>
                  <RadioRow label="Print Layout" name="printLayout"
                    options={["Single Sided", "Double Sided"]}
                    value={formData.printLayout} onChange={(v) => set("printLayout", v)} />

                  {/* Page Selection */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Page Selection</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="pageSelection" value="Print all pages"
                          checked={formData.pageSelection === "Print all pages"}
                          onChange={() => set("pageSelection", "Print all pages")}
                          className="w-4 h-4 accent-[#5123d4]" />
                        <span className="text-sm text-gray-700">Print all pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="pageSelection" value="Specify Pages"
                          checked={formData.pageSelection === "Specify Pages"}
                          onChange={() => set("pageSelection", "Specify Pages")}
                          className="w-4 h-4 accent-[#5123d4]" />
                        <span className="text-sm text-gray-700">Specify Pages:</span>
                        <input type="text" name="specificPages"
                          value={formData.specificPages}
                          onChange={(e) => set("specificPages", e.target.value)}
                          disabled={formData.pageSelection !== "Specify Pages"}
                          placeholder="e.g. 1-5, 8"
                          className="border-b border-gray-400 bg-transparent text-black focus:outline-none focus:border-[#5123d4] w-32 text-sm disabled:opacity-40" />
                      </label>
                    </div>
                  </div>

                  <RadioRow label="Orientation" name="orientation"
                    options={["Portrait", "Landscape", "Auto"]}
                    value={formData.orientation} onChange={(v) => set("orientation", v)} />
                </>
              )}

              {/* Finishing */}
              <RadioRow label="Finishing Options" name="finishingOption"
                options={["None", "Stapled", "Spiral Binding", "Hardcover Binding"]}
                value={formData.finishingOption} onChange={(v) => set("finishingOption", v)} />

              {/* Binding Details — shown when a binding option is chosen */}
              {formData.finishingOption !== "None" && formData.finishingOption !== "Stapled" && (
                <div className="bg-[#f8f5ff] rounded-lg p-4 space-y-3 border border-purple-100">
                  <p className="text-sm font-semibold text-[#5123d4]">Binding Details</p>
                  <RadioRow label="Binding Type" name="bindingType"
                    options={["Spiral", "Comb", "Hard Cover"]}
                    value={formData.bindingType} onChange={(v) => set("bindingType", v)} />
                  <RadioRow label="Front Cover" name="frontCover"
                    options={["Transparent", "Designed Cover", "Use first page"]}
                    value={formData.frontCover} onChange={(v) => set("frontCover", v)} />
                  <RadioRow label="Back Cover" name="backCover"
                    options={["Plain", "Cardboard"]}
                    value={formData.backCover} onChange={(v) => set("backCover", v)} />
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Delivery ── */}
          <div ref={firstErrorField === "deliveryMethod" ? firstErrorRef : undefined}>
            <SectionCard title="Delivery Method">
              <RadioRow label="How would you like to receive your order?" name="deliveryMethod"
                options={["Pick Up", "Doorstep"]}
                value={formData.deliveryMethod}
                onChange={(v) => { set("deliveryMethod", v); setErrors(p => ({ ...p, deliveryMethod: "" })); }}
                required error={errors.deliveryMethod} />

              {/* Pick Up specifics */}
              {formData.deliveryMethod === "Pick Up" && (
                <div className="bg-[#f8f5ff] rounded-lg p-4 space-y-4 border border-purple-100">
                  {/* Nearest Location */}
                  <div ref={firstErrorField === "pickupLocation" ? firstErrorRef : undefined}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5123d4]" />
                      Nearest Pickup Location<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      title="Nearest Pickup Location"
                      value={formData.pickupLocation}
                      onChange={(e) => { set("pickupLocation", e.target.value); setErrors(p => ({ ...p, pickupLocation: "" })); }}
                      className={`w-full bg-white border ${errors.pickupLocation ? "border-red-400" : "border-gray-300"} text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]`}
                    >
                      <option value="" disabled>Select the closest location to you</option>
                      {PICKUP_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.pickupLocation}
                      </p>
                    )}
                  </div>

                  {/* Who is collecting? */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#5123d4]" />
                      Who is collecting? <span className="font-normal text-gray-500 ml-1">(if different from you)</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Collector&apos;s Name</label>
                        <input type="text"
                          value={formData.pickupContactName}
                          onChange={(e) => set("pickupContactName", e.target.value)}
                          placeholder="Full name of the person collecting"
                          className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Collector&apos;s Phone
                        </label>
                        <input type="tel"
                          value={formData.pickupContactPhone}
                          onChange={(e) => set("pickupContactPhone", e.target.value)}
                          placeholder="08012345678"
                          className="w-full bg-white border border-gray-300 text-black px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doorstep: delivery address */}
              {formData.deliveryMethod === "Doorstep" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    name="deliveryDetails"
                    value={formData.deliveryDetails}
                    onChange={(e) => set("deliveryDetails", e.target.value)}
                    placeholder="Enter your full delivery address..."
                    rows={2}
                    className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] resize-none"
                  />
                </div>
              )}

              {/* Specific Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="specificInstruction"
                  value={formData.specificInstruction}
                  onChange={(e) => set("specificInstruction", e.target.value)}
                  placeholder="Any special instructions for this order..."
                  rows={2}
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] resize-none"
                />
              </div>
            </SectionCard>
          </div>

          {/* ── Deadline ── */}
          <div ref={firstErrorField === "deadline" ? firstErrorRef : undefined}>
            <SectionCard title="Deadline">
              {/* Disclaimer */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Note:</strong> Business cards &amp; some high value jobs will take time</span>
              </div>

              <RadioRow label="When do you need this?" name="deadline"
                options={["Standard (3hrs - 5hrs)", "Express (1hr - 2hrs)"]}
                value={formData.deadline}
                onChange={(v) => { set("deadline", v); setErrors(p => ({ ...p, deadline: "" })); }}
                required error={errors.deadline} />

              {/* Express surcharge notice */}
              {formData.deadline === "Express (1hr - 2hrs)" && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  ⚡ Express orders carry a 50% surcharge on the base document cost.
                </p>
              )}

              {/* Custom date option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="deadline" value="Custom (Date Picker)"
                  checked={formData.deadline === "Custom (Date Picker)"}
                  onChange={() => { set("deadline", "Custom (Date Picker)"); setErrors(p => ({ ...p, deadline: "" })); }}
                  className="w-4 h-4 accent-[#5123d4]" />
                <span className="text-sm text-gray-700">Custom date</span>
                {formData.deadline === "Custom (Date Picker)" && (
                  <input type="date" name="customDeadlineDate"
                    value={formData.customDeadlineDate}
                    onChange={(e) => set("customDeadlineDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="ml-2 border border-gray-300 text-black rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]" />
                )}
              </label>
            </SectionCard>
          </div>

          {/* ── Estimated Cost ── */}
          {showPrintOptions && (
            <SectionCard title="Estimated Cost">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Per page ({formData.printColor}, {formData.paperType}) × {formData.copies} {formData.copies === 1 ? "copy" : "copies"}</span>
                  <span className="font-medium text-black">₦{baseDoc.toLocaleString()}</span>
                </div>
                {finishing > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Finishing — {formData.finishingOption}</span>
                    <span className="font-medium text-black">₦{finishing.toLocaleString()}</span>
                  </div>
                )}
                {expressExtra > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Express surcharge (+50%)</span>
                    <span className="font-medium">₦{expressExtra.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-medium text-black">{delivery > 0 ? `₦${delivery.toLocaleString()}` : "Free (Pick Up)"}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee</span>
                  <span className="font-medium text-black">₦{SERVICE_FEE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-[#5123d4] text-base">
                  <span>Estimated Total</span>
                  <span>₦{estimatedTotal.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" /> Final price is confirmed on the review page
              </p>
            </SectionCard>
          )}

          {/* ── Submit ── */}
          <div className="flex items-center justify-between pt-4">
            {Object.keys(errors).length > 0 && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Please fix the errors above before continuing
              </p>
            )}
            <button
              type="submit"
              className="ml-auto bg-[#5123d4] hover:bg-[#401AA0] text-white px-10 py-3.5 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Preview Order →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
