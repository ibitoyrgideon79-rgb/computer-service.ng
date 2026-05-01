"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStore, OrderData } from "@/store/useOrderStore";
import { UploadCloud, AlertCircle, MapPin, User, Phone, Info } from "lucide-react";
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
    service:         serviceParam || orderData.service || "",
    category:        categoryParam || orderData.category || "",
    otherCategory:   orderData.otherCategory,
    ...Object.fromEntries(["name", "email", "phone_number", "printType", "pages", "color", "size", "finishing", "binding_type", "delivery_method", "pickup_location", "delivery_details", "additional_notes", "express_service", "document"].map(k => [k, orderData[k as keyof OrderData]]))
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => { if (files.length > 0) handleFileSelect(files[0]); },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, document: "File size should be less than 50MB" }));
      return;
    }
    setFormData(prev => ({ ...prev, document: file }));
    setErrors(prev => ({ ...prev, document: "" }));
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const calculateTotal = (): number => {
    if (!isPrintService) return SERVICE_FEE + (formData.delivery_method === "Doorstep" ? DELIVERY_FEE : 0);

    const sizeKey = (formData.size || "A4") as keyof typeof RATE["Black & white"];
    const rate = RATE[formData.color || "Black & white"]?.[sizeKey] || 0;
    const finishingCost = FINISHING_COST[formData.finishing || "None"] || 0;
    const pagesCost = (formData.pages ? parseInt(formData.pages as any, 10) : 0) * rate;
    const totalBeforeDelivery = pagesCost + finishingCost + SERVICE_FEE;
    const express = formData.express_service ? totalBeforeDelivery * (EXPRESS_MULTIPLIER - 1) : 0;
    const delivery = formData.delivery_method === "Doorstep" ? DELIVERY_FEE : 0;
    return Math.max(totalBeforeDelivery + express + delivery, SERVICE_FEE);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.delivery_method) newErrors.delivery_method = "Delivery method is required";
    if (formData.delivery_method === "Doorstep" && !formData.delivery_details) newErrors.delivery_details = "Delivery address is required";
    if (formData.delivery_method === "Pick Up" && !formData.pickup_location) newErrors.pickup_location = "Pickup location is required";
    if (!formData.document) newErrors.document = "Document is required";
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
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-black">← Back</button>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <SectionCard title="Personal Information">
            <TextInput label="Name" name="name" required value={formData.name || ""} onChange={(v) => handleInputChange("name", v)} error={errors.name} />
            <TextInput label="Email (Optional)" name="email" type="email" value={formData.email || ""} onChange={(v) => handleInputChange("email", v)} />
            <TextInput label="Phone Number" name="phone_number" type="tel" required value={formData.phone_number || ""} onChange={(v) => handleInputChange("phone_number", v)} error={errors.phone_number} />
          </SectionCard>

          {/* Service Details */}
          <SectionCard title="Service Details">
            <RadioRow label="Service" name="service" required options={["Printing", "Photocopy", "Binding", "Scanning", "Document Conversion", "Graphic/Logo Design", "Other"]} value={formData.service || ""} onChange={(v) => handleInputChange("service", v)} error={errors.service} />

            {showPrintOptions && ["Printing", "Photocopy"].includes(formData.service || "") && (
              <>
                <RadioRow label="Color" name="color" required options={["Black & white", "Coloured"]} value={formData.color || ""} onChange={(v) => handleInputChange("color", v)} />
                <RadioRow label="Size" name="size" required options={["A4", "A3", "Custom type"]} value={formData.size || ""} onChange={(v) => handleInputChange("size", v)} />
                <TextInput label="Number of Pages" name="pages" type="number" required value={formData.pages || ""} onChange={(v) => handleInputChange("pages", v)} />
              </>
            )}

            {isBindingService && (
              <RadioRow label="Binding Type" name="binding_type" required options={["None", "Stapled", "Spiral Binding", "Hardcover Binding"]} value={formData.binding_type || ""} onChange={(v) => handleInputChange("binding_type", v)} />
            )}

            {showPrintOptions && (
              <RadioRow label="Finishing" name="finishing" options={["None", "Stapled", "Spiral Binding", "Hardcover Binding"]} value={formData.finishing || ""} onChange={(v) => handleInputChange("finishing", v)} />
            )}
          </SectionCard>

          {/* Document Upload */}
          <SectionCard title="Upload Document">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-300"}`} onDragOver={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)}>
              <input {...getInputProps()} ref={fileInputRef} />
              <UploadCloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">Drag your document here or click to browse (Max 50MB)</p>
            </div>
            {formData.document && <p className="text-sm text-green-600 mt-2">✓ {(formData.document as any).name}</p>}
            {errors.document && <p className="text-red-500 text-xs mt-2"><AlertCircle className="w-3 h-3 inline mr-1" />{errors.document}</p>}
          </SectionCard>

          {/* Delivery Information */}
          <SectionCard title="Delivery Information">
            <RadioRow label="Delivery Method" name="delivery_method" required options={["Doorstep", "Pick Up"]} value={formData.delivery_method || ""} onChange={(v) => handleInputChange("delivery_method", v)} error={errors.delivery_method} />
            {formData.delivery_method === "Doorstep" && (
              <TextInput label="Delivery Address" name="delivery_details" required value={formData.delivery_details || ""} onChange={(v) => handleInputChange("delivery_details", v)} error={errors.delivery_details} />
            )}
            {formData.delivery_method === "Pick Up" && (
              <RadioRow label="Pickup Location" name="pickup_location" required options={PICKUP_LOCATIONS} value={formData.pickup_location || ""} onChange={(v) => handleInputChange("pickup_location", v)} error={errors.pickup_location} />
            )}
            <TextInput label="Additional Notes (Optional)" name="additional_notes" value={formData.additional_notes || ""} onChange={(v) => handleInputChange("additional_notes", v)} />
          </SectionCard>

          {/* Order Summary */}
          <SectionCard title="Order Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Service Fee:</span><span>₦500</span></div>
              {isPrintService && formData.pages && (
                <div className="flex justify-between"><span>Printing ({formData.pages} pages):</span><span>₦{parseInt(formData.pages as any, 10) * (RATE[formData.color || "Black & white"]?.[formData.size as keyof typeof RATE["Black & white"] || "A4"] || 0)}</span></div>
              )}
              {formData.finishing && formData.finishing !== "None" && (
                <div className="flex justify-between"><span>{formData.finishing}:</span><span>₦{FINISHING_COST[formData.finishing]}</span></div>
              )}
              {formData.express_service && (
                <div className="flex justify-between text-blue-600"><span>Express Service:</span><span>+50%</span></div>
              )}
              {formData.delivery_method === "Doorstep" && (
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
