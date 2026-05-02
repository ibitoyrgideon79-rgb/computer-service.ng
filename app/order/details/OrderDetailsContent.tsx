"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStore, OrderData } from "@/store/useOrderStore";
import { UploadCloud, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

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
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio" name={name} value={opt} checked={value === opt}
              onChange={() => onChange(opt)} required={required}
              className="w-4 h-4 text-[#5123d4] focus:ring-[#5123d4]"
            />
            <span className="text-sm text-gray-800">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Helper: text input row ─────────────────────────────────────────────────
function TextInput({
  label, name, type = "text", placeholder, value, onChange, required, error,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (val: string) => void;
  required?: boolean; error?: string;
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

// ── Main content component ──────────────────────────────────────────────────
export default function OrderDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderData, setOrderData } = useOrderStore();

  const serviceParam   = searchParams.get("service") || "";
  const categoryParam  = searchParams.get("category") || "";

  // Determine which field groups to show based on the service
  const isPrintService    = ["Printing", "Photocopy", "Scanning"].includes(serviceParam);
  const isBindingService  = serviceParam === "Binding";
  const showPrintOptions  = isPrintService || isBindingService || !serviceParam;

  const [formData, setFormData] = useState<Partial<OrderData>>({
    service:          serviceParam || orderData.service || "",
    category:         categoryParam || orderData.category || "",
    otherCategory:    orderData.otherCategory,
    name:             orderData.name,
    email:            orderData.email,
    phoneNumber:      orderData.phoneNumber,
    printColor:       orderData.printColor,
    paperType:        orderData.paperType,
    pages:            orderData.pages,
    finishingOption:  orderData.finishingOption,
    bindingType:      orderData.bindingType,
    deliveryMethod:   orderData.deliveryMethod,
    pickupState:      orderData.pickupState,
    pickupCity:       orderData.pickupCity,
    pickupLocation:   orderData.pickupLocation,
    deliveryDetails:  orderData.deliveryDetails,
    specificInstruction: orderData.specificInstruction,
    expressService:   orderData.expressService,
    document:         orderData.document,
    documentText:     orderData.documentText || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMode, setUploadMode] = useState<"file" | "text">(orderData.documentText ? "text" : "file");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropAccepted: (files) => {
      setFormData(prev => ({ ...prev, document: files[0] }));
      setErrors(prev => ({ ...prev, document: "" }));
    },
    onDropRejected: (rejected) => {
      const msg = rejected[0]?.errors[0]?.code === "file-too-large"
        ? "File size should be less than 50MB"
        : "File not accepted. Please try a different file.";
      setErrors(prev => ({ ...prev, document: msg }));
    },
  });

  const handleInputChange = (field: keyof OrderData, value: string | boolean | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const calculateTotal = (): number => {
    if (!isPrintService) return SERVICE_FEE + (formData.deliveryMethod === "Doorstep" ? DELIVERY_FEE : 0);

    const sizeKey = (formData.paperType || "A4") as keyof typeof RATE["Black & white"];
    const rate = RATE[formData.printColor || "Black & white"]?.[sizeKey] || 0;
    const finishingCost = FINISHING_COST[formData.finishingOption || "None"] || 0;
    const pagesCost = (formData.pages ?? 0) * rate;
    const totalBeforeDelivery = pagesCost + finishingCost + SERVICE_FEE;
    const express = formData.expressService ? totalBeforeDelivery * (EXPRESS_MULTIPLIER - 1) : 0;
    const delivery = formData.deliveryMethod === "Doorstep" ? DELIVERY_FEE : 0;
    return Math.max(totalBeforeDelivery + express + delivery, SERVICE_FEE);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.deliveryMethod) newErrors.deliveryMethod = "Delivery method is required";
    if (formData.deliveryMethod === "Doorstep" && !formData.deliveryDetails) newErrors.deliveryDetails = "Delivery address is required";
    if (formData.deliveryMethod === "Pick Up") {
      if (!formData.pickupState) newErrors.pickupState = "State is required";
      if (!formData.pickupCity) newErrors.pickupCity = "City is required";
      if (!formData.pickupLocation) newErrors.pickupLocation = "Street address or landmark is required";
    }
    if (!formData.document && !formData.documentText) newErrors.document = "Please upload a file or type/paste your document text";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setOrderData(formData as OrderData);
    router.push("/order/review");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl h-14 sm:h-16 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-[#5123d4]">Order Details</h1>
          <button type="button" onClick={() => router.back()} className="text-sm text-gray-600 hover:text-black">← Back</button>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <SectionCard title="Personal Information">
            <TextInput label="Name" name="name" required value={formData.name || ""} onChange={(v) => handleInputChange("name", v)} error={errors.name} />
            <TextInput label="Email (Optional)" name="email" type="email" value={formData.email || ""} onChange={(v) => handleInputChange("email", v)} />
            <TextInput label="Phone Number" name="phoneNumber" type="tel" required value={formData.phoneNumber || ""} onChange={(v) => handleInputChange("phoneNumber", v)} error={errors.phoneNumber} />
          </SectionCard>

          {/* Service Details */}
          <SectionCard title="Service Details">
            <RadioRow label="Service" name="service" required options={["Printing", "Photocopy", "Binding", "Scanning", "Document Conversion", "Graphic/Logo Design", "Other"]} value={formData.service || ""} onChange={(v) => handleInputChange("service", v)} error={errors.service} />

            {showPrintOptions && ["Printing", "Photocopy"].includes(formData.service || "") && (
              <>
                {/* Color — with per-page price badges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        { value: "Black & white", prices: { A4: 50, A3: 100, "Custom type": 80 } },
                        { value: "Coloured",       prices: { A4: 150, A3: 300, "Custom type": 200 } },
                      ] as { value: OrderData["printColor"]; prices: Record<string, number> }[]
                    ).map((opt) => {
                      const paper = (formData.paperType || "A4") as string;
                      const price = opt.prices[paper] ?? opt.prices["A4"];
                      const selected = formData.printColor === opt.value;
                      return (
                        <label
                          key={String(opt.value)}
                          className={`flex items-center justify-between gap-3 cursor-pointer border rounded-lg px-4 py-3 transition-all ${selected ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-200 bg-gray-50 hover:border-[#5123d4]/40"}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio" name="printColor" value={String(opt.value)}
                              checked={selected}
                              onChange={() => handleInputChange("printColor", opt.value!)}
                              className="w-4 h-4 text-[#5123d4] focus:ring-[#5123d4]"
                            />
                            <span className="text-sm font-medium text-gray-800">{opt.value}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${selected ? "bg-[#5123d4] text-white border-[#5123d4]" : "bg-white text-[#5123d4] border-[#5123d4]/30"}`}>
                            ₦{price}/pg
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.printColor && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.printColor}</p>}
                </div>

                <RadioRow label="Size" name="paperType" required options={["A4", "A3", "Custom type"]} value={formData.paperType || ""} onChange={(v) => handleInputChange("paperType", v as OrderData["paperType"])} />
                <TextInput label="Number of Pages" name="pages" type="number" required value={String(formData.pages ?? "")} onChange={(v) => handleInputChange("pages", v ? parseInt(v, 10) : undefined as unknown as number)} />
              </>
            )}

            {isBindingService && (
              <RadioRow label="Binding Type" name="bindingType" required options={["Spiral", "Comb", "Hard Cover"]} value={formData.bindingType || ""} onChange={(v) => handleInputChange("bindingType", v as OrderData["bindingType"])} />
            )}

            {showPrintOptions && (
              <RadioRow label="Finishing" name="finishingOption" options={["None", "Stapled", "Spiral Binding", "Hardcover Binding"]} value={formData.finishingOption || ""} onChange={(v) => handleInputChange("finishingOption", v as OrderData["finishingOption"])} />
            )}
          </SectionCard>

          {/* Document Upload */}
          <SectionCard title="Document">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => { setUploadMode("file"); handleInputChange("documentText", ""); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${uploadMode === "file" ? "bg-white text-[#5123d4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setUploadMode("text"); setFormData(prev => ({ ...prev, document: null })); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${uploadMode === "text" ? "bg-white text-[#5123d4] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Type / Paste Text
              </button>
            </div>

            {uploadMode === "file" ? (
              <>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-300 hover:border-[#5123d4]/60 hover:bg-gray-50"}`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragActive ? "text-[#5123d4]" : "text-gray-400"}`} />
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? "Drop your file here…" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word, images — Max 50MB</p>
                </div>
                {formData.document && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-700 font-medium">✓ {formData.document.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                      className="text-xs text-red-400 hover:text-red-600 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <textarea
                  value={formData.documentText || ""}
                  onChange={(e) => handleInputChange("documentText", e.target.value)}
                  placeholder="Paste or type your document content here…"
                  rows={10}
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm resize-y leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1">{(formData.documentText || "").length} characters</p>
              </div>
            )}

            {errors.document && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />{errors.document}
              </p>
            )}
          </SectionCard>

          {/* Delivery Information */}
          <SectionCard title="Delivery Information">
            <RadioRow label="Delivery Method" name="deliveryMethod" required options={["Doorstep", "Pick Up"]} value={formData.deliveryMethod || ""} onChange={(v) => handleInputChange("deliveryMethod", v as OrderData["deliveryMethod"])} error={errors.deliveryMethod} />
            {formData.deliveryMethod === "Doorstep" && (
              <TextInput label="Delivery Address" name="deliveryDetails" required value={formData.deliveryDetails || ""} onChange={(v) => handleInputChange("deliveryDetails", v)} error={errors.deliveryDetails} />
            )}
            {formData.deliveryMethod === "Pick Up" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Pickup Address <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <TextInput label="State" name="pickupState" required placeholder="e.g. Abuja FCT" value={formData.pickupState || ""} onChange={(v) => handleInputChange("pickupState", v)} error={errors.pickupState} />
                  <TextInput label="City / Area" name="pickupCity" required placeholder="e.g. Wuse Zone 2" value={formData.pickupCity || ""} onChange={(v) => handleInputChange("pickupCity", v)} error={errors.pickupCity} />
                </div>
                <TextInput label="Street Address / Landmark" name="pickupLocation" required placeholder="e.g. No. 5 Ibrahim Tahir Road, beside GTB" value={formData.pickupLocation || ""} onChange={(v) => handleInputChange("pickupLocation", v)} error={errors.pickupLocation} />
              </div>
            )}
            <TextInput label="Full Address (Optional)" name="specificInstruction" placeholder="Landmark, building number, nearest bus-stop…" value={formData.specificInstruction || ""} onChange={(v) => handleInputChange("specificInstruction", v)} />
          </SectionCard>

          {/* Order Summary */}
          <SectionCard title="Order Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Service Fee:</span><span>₦500</span></div>
              {isPrintService && formData.pages && (
                <div className="flex justify-between">
                  <span>Printing ({formData.pages} pages):</span>
                  <span>₦{formData.pages * (RATE[formData.printColor || "Black & white"]?.[formData.paperType as keyof typeof RATE["Black & white"] || "A4"] || 0)}</span>
                </div>
              )}
              {formData.finishingOption && formData.finishingOption !== "None" && (
                <div className="flex justify-between"><span>{formData.finishingOption}:</span><span>₦{FINISHING_COST[formData.finishingOption]}</span></div>
              )}
              {formData.expressService && (
                <div className="flex justify-between text-blue-600"><span>Express Service:</span><span>+50%</span></div>
              )}
              {formData.deliveryMethod === "Doorstep" && (
                <div className="flex justify-between"><span>Delivery:</span><span>₦1000</span></div>
              )}
              <div className="pt-2 border-t border-gray-200 font-bold flex justify-between"><span>Total:</span><span className="text-[#5123d4]">₦{calculateTotal()}</span></div>
            </div>
          </SectionCard>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white py-3 rounded-lg font-medium transition-colors">
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  );
}
