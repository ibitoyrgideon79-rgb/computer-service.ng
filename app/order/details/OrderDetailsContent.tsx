"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStore, OrderData, ScheduledStop } from "@/store/useOrderStore";
import { UploadCloud, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

const RATE: Record<string, Record<string, number>> = {
  "Black & white": { A4: 300, A3: 500, "Custom type": 300, Passport: 300 },
  Coloured:        { A4: 700, A3: 1200, "Custom type": 700, Passport: 750 },
};
const FINISHING_COST: Record<string, number> = {
  None: 0, Stapled: 200, "Spiral Binding": 500, "Hardcover Binding": 2000,
};
const SERVICE_FEE = 2000;
const LAMINATION_FEE = 700;
const EXPRESS_MULTIPLIER = 1.5;

const DELIVERY_OPTIONS = [
  {
    value: "Express Delivery",
    title: "Express Delivery ⚡",
    subtitle: "30 Minutes – 2 Hours",
    price: "₦3,000",
    fee: 3000,
    description: "Priority rapid-response delivery.",
  },
  {
    value: "Standard Delivery",
    title: "Standard Delivery 🚚",
    subtitle: "2 Hours – 12 Hours",
    price: "₦2,000",
    fee: 2000,
    description: "Affordable same-day delivery.",
  },
  {
    value: "Economy Delivery",
    title: "Economy Delivery 🚚",
    subtitle: "Within 24 Hours",
    price: "₦1,000",
    fee: 1000,
    description: "Available for selected services and locations within the 24-hour delivery window.",
  },
  {
    value: "Schedule Delivery",
    title: "Schedule Delivery",
    subtitle: "Custom time, multiple stops, or business needs",
    price: "₦5,000/stop",
    feePerStop: 5000,
    description: "Custom delivery based on your preferred time, multiple stops, or business needs.",
  },
  {
    value: "Special Submission",
    title: "Special Submission",
    subtitle: "Government & Private Organization",
    price: "Free",
    fee: 0,
    description: "Need your document submitted to a Government or Private organization? After receiving your order number, visit Submitar.com to complete your request.",
  },
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-black border-b border-gray-100 pb-3">{title}</h3>
      {children}
    </div>
  );
}

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

export default function OrderDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderData, setOrderData } = useOrderStore();

  const serviceParam   = searchParams.get("service") || "";
  const categoryParam  = searchParams.get("category") || "";

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
    deliveryMethod:       orderData.deliveryMethod,
    pickupState:          orderData.pickupState,
    pickupCity:           orderData.pickupCity,
    pickupLocation:       orderData.pickupLocation,
    deliveryDetails:      orderData.deliveryDetails,
    specificInstruction:  orderData.specificInstruction,
    expressService:       orderData.expressService,
    document:             orderData.document,
    documentText:         orderData.documentText || "",
    hardcopyPickupDate:   orderData.hardcopyPickupDate || "",
    hardcopyPickupTime:   orderData.hardcopyPickupTime || "",
    hardcopyState:        orderData.hardcopyState || "",
    hardcopyCity:         orderData.hardcopyCity || "",
    hardcopyContactName:  orderData.hardcopyContactName || "",
    hardcopyContactPhone: orderData.hardcopyContactPhone || "",
    hardcopyDocCount:     orderData.hardcopyDocCount || "",
    hardcopyInstructions: orderData.hardcopyInstructions || "",
  });

  const [scheduledStops, setScheduledStops] = useState<ScheduledStop[]>(
    (orderData.scheduledStops && orderData.scheduledStops.length > 0)
      ? orderData.scheduledStops
      : [{ address: "", state: "", date: "", time: "" }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadMode, setUploadMode] = useState<"file" | "text" | "hardcopy">(
    orderData.deliveryMethod === "Hardcopy Pickup" ? "hardcopy" : orderData.documentText ? "text" : "file"
  );

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

  const updateStop = (idx: number, field: keyof ScheduledStop, value: string) => {
    setScheduledStops(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    setErrors(prev => ({ ...prev, scheduledStops: "" }));
  };

  const addStop = () => {
    setScheduledStops(prev => [...prev, { address: "", state: "", date: "", time: "" }]);
  };

  const removeStop = (idx: number) => {
    setScheduledStops(prev => prev.filter((_, i) => i !== idx));
  };

  const getDeliveryFee = (): number => {
    const method = formData.deliveryMethod || "";
    if (method === "Express Delivery")  return 3000;
    if (method === "Standard Delivery") return 2000;
    if (method === "Economy Delivery")  return 1000;
    if (method === "Schedule Delivery") return 5000 * Math.max(scheduledStops.length, 1);
    return 0;
  };

  const calculateTotal = (): number => {
    if (formData.service === "Lamination") return LAMINATION_FEE + getDeliveryFee();
    if (!isPrintService) return SERVICE_FEE + getDeliveryFee();

    const sizeKey = (formData.paperType || "A4") as keyof typeof RATE["Black & white"];
    const rate = RATE[formData.printColor || "Black & white"]?.[sizeKey] || 0;
    const finishingCost = FINISHING_COST[formData.finishingOption || "None"] || 0;
    const pagesCost = (formData.pages ?? 0) * rate;
    const totalBeforeDelivery = pagesCost + finishingCost + SERVICE_FEE;
    const express = formData.expressService ? totalBeforeDelivery * (EXPRESS_MULTIPLIER - 1) : 0;
    return Math.max(totalBeforeDelivery + express + getDeliveryFee(), SERVICE_FEE);
  };

  const needsAddress = ["Express Delivery", "Standard Delivery", "Economy Delivery"].includes(formData.deliveryMethod || "");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (uploadMode !== "hardcopy" && !formData.deliveryMethod) newErrors.deliveryMethod = "Delivery method is required";

    if (needsAddress) {
      if (!formData.pickupState)    newErrors.pickupState    = "State is required";
      if (!formData.pickupCity)     newErrors.pickupCity     = "City is required";
      if (!formData.pickupLocation) newErrors.pickupLocation = "Street address or landmark is required";
    }

    if (formData.deliveryMethod === "Schedule Delivery") {
      const valid = scheduledStops.every(s => s.address && s.state && s.date && s.time);
      if (scheduledStops.length === 0 || !valid) newErrors.scheduledStops = "Please fill in all stop details";
    }

    if (uploadMode === "hardcopy") {
      if (!formData.hardcopyState)        newErrors.hardcopyState       = "State is required";
      if (!formData.hardcopyCity)         newErrors.hardcopyCity        = "City is required";
      if (!formData.hardcopyPickupDate)   newErrors.hardcopyPickupDate  = "Pickup date is required";
      if (!formData.hardcopyPickupTime)   newErrors.hardcopyPickupTime  = "Pickup time is required";
      if (!formData.hardcopyContactName)  newErrors.hardcopyContactName = "Contact person name is required";
      if (!formData.hardcopyContactPhone) newErrors.hardcopyContactPhone = "Contact phone number is required";
    }

    if (uploadMode !== "hardcopy" && !formData.document && !formData.documentText) {
      newErrors.document = "Please upload a file or type/paste your document text";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setOrderData({ ...formData, scheduledStops } as OrderData);
    router.push("/order/review");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl h-14 sm:h-16 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-[#5123d4]">Order Details</h1>
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
            ← Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard title="Personal Information">
            <TextInput label="Name" name="name" required value={formData.name || ""} onChange={(v) => handleInputChange("name", v)} error={errors.name} />
            <TextInput label="Email (Optional)" name="email" type="email" value={formData.email || ""} onChange={(v) => handleInputChange("email", v)} />
            <TextInput label="Phone Number" name="phoneNumber" type="tel" required value={formData.phoneNumber || ""} onChange={(v) => handleInputChange("phoneNumber", v)} error={errors.phoneNumber} />
          </SectionCard>

          <SectionCard title="Service Details">
            <RadioRow
              label="Service"
              name="service"
              required
              options={[
                "Printing", "Photocopy", "Binding", "Scanning",
                "Typing", "Document Conversion", "Graphic/Logo Design",
                "Business Card / ID Card", "Application Services",
                "Technical Support", "Lamination", "Other",
              ]}
              value={formData.service || ""}
              onChange={(v) => handleInputChange("service", v)}
              error={errors.service}
            />

            {categoryParam && (
              <div className="flex items-center gap-2 bg-[#f0ebff] border border-[#5123d4]/20 rounded-lg px-4 py-2.5">
                <span className="text-xs text-[#5123d4] font-semibold uppercase tracking-wide">Selected type:</span>
                <span className="text-sm font-medium text-gray-800">{categoryParam}</span>
              </div>
            )}

            {showPrintOptions && ["Printing", "Photocopy"].includes(formData.service || "") && (
              <>
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

                <RadioRow label="Size" name="paperType" required options={["A4", "A3", "Custom type", "Passport"]} value={formData.paperType || ""} onChange={(v) => handleInputChange("paperType", v as OrderData["paperType"])} />
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

          <SectionCard title="Document">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setUploadMode("file");
                  handleInputChange("documentText", "");
                  if (formData.deliveryMethod === "Hardcopy Pickup") handleInputChange("deliveryMethod", "");
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  uploadMode === "file" ? "bg-white text-[#5123d4] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode("text");
                  setFormData(prev => ({ ...prev, document: null }));
                  if (formData.deliveryMethod === "Hardcopy Pickup") handleInputChange("deliveryMethod", "");
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  uploadMode === "text" ? "bg-white text-[#5123d4] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Type / Paste
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode("hardcopy");
                  setFormData(prev => ({ ...prev, document: null, documentText: "", deliveryMethod: "Hardcopy Pickup" }));
                }}
                className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  uploadMode === "hardcopy" ? "bg-white text-[#5123d4] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Hardcopy
              </button>
            </div>

            <div className="border-t border-gray-200" />

            {uploadMode === "hardcopy" ? (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-gray-500">
                  We will come to you to collect your hardcopy documents. Fill in the pickup details below.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      aria-label="Hardcopy pickup state"
                      value={formData.hardcopyState || ""}
                      onChange={(e) => handleInputChange("hardcopyState", e.target.value)}
                      className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${errors.hardcopyState ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"} text-sm`}
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.hardcopyState && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.hardcopyState}</p>}
                  </div>

                  <TextInput
                    label="City / Area"
                    name="hardcopyCity"
                    required
                    placeholder="e.g. Wuse Zone 2"
                    value={formData.hardcopyCity || ""}
                    onChange={(v) => handleInputChange("hardcopyCity", v)}
                    error={errors.hardcopyCity}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      title="Pickup date"
                      value={formData.hardcopyPickupDate || ""}
                      onChange={(e) => handleInputChange("hardcopyPickupDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${errors.hardcopyPickupDate ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"} text-sm`}
                    />
                    {errors.hardcopyPickupDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.hardcopyPickupDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      title="Pickup time"
                      value={formData.hardcopyPickupTime || ""}
                      onChange={(e) => handleInputChange("hardcopyPickupTime", e.target.value)}
                      className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${errors.hardcopyPickupTime ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"} text-sm`}
                    />
                    {errors.hardcopyPickupTime && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.hardcopyPickupTime}</p>}
                  </div>
                </div>

                <TextInput
                  label="Contact Person Name"
                  name="hardcopyContactName"
                  required
                  placeholder="Name of person we should meet"
                  value={formData.hardcopyContactName || ""}
                  onChange={(v) => handleInputChange("hardcopyContactName", v)}
                  error={errors.hardcopyContactName}
                />

                <TextInput
                  label="Contact Person Phone Number"
                  name="hardcopyContactPhone"
                  type="tel"
                  required
                  placeholder="e.g. 08012345678"
                  value={formData.hardcopyContactPhone || ""}
                  onChange={(v) => handleInputChange("hardcopyContactPhone", v)}
                  error={errors.hardcopyContactPhone}
                />

                <TextInput
                  label="Number of Documents"
                  name="hardcopyDocCount"
                  type="number"
                  placeholder="How many documents to collect"
                  value={formData.hardcopyDocCount || ""}
                  onChange={(v) => handleInputChange("hardcopyDocCount", v)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</label>
                  <textarea
                    rows={3}
                    value={formData.hardcopyInstructions || ""}
                    onChange={(e) => handleInputChange("hardcopyInstructions", e.target.value)}
                    placeholder="Any special instructions for our rider (e.g. gate code, landmark)…"
                    className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm resize-none"
                  />
                </div>
              </div>
            ) : uploadMode === "file" ? (
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
                {errors.document && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />{errors.document}
                  </p>
                )}
              </>
            ) : (
              <>
                <div>
                  <textarea
                    value={formData.documentText || ""}
                    onChange={(e) => handleInputChange("documentText", e.target.value)}
                    placeholder="Paste or type your document content here…"
                    rows={8}
                    className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm resize-y leading-relaxed"
                  />
                  <p className="text-xs text-gray-400 mt-1">{(formData.documentText || "").length} characters</p>
                </div>
                {formData.documentText && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 px-3 pt-2 pb-1 border-b border-gray-100 bg-gray-50">Preview</p>
                    <div className="bg-white px-4 py-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {formData.documentText}
                    </div>
                  </div>
                )}
                {errors.document && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />{errors.document}
                  </p>
                )}
              </>
            )}
          </SectionCard>

          {uploadMode !== "hardcopy" && (
            <SectionCard title="Delivery">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Delivery Method <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2.5">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const selected = formData.deliveryMethod === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selected ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-200 bg-gray-50 hover:border-[#5123d4]/40"}`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={opt.value}
                          checked={selected}
                          onChange={() => handleInputChange("deliveryMethod", opt.value as OrderData["deliveryMethod"])}
                          className="mt-0.5 w-4 h-4 text-[#5123d4] focus:ring-[#5123d4] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">{opt.title}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${selected ? "bg-[#5123d4] text-white border-[#5123d4]" : "bg-white text-[#5123d4] border-[#5123d4]/30"}`}>
                              {opt.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.subtitle}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{opt.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.deliveryMethod && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryMethod}</p>
                )}
              </div>

              {needsAddress && (
                <div className="space-y-3 pt-1">
                  <p className="text-sm font-medium text-gray-700">Delivery Address <span className="text-red-500">*</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="pickupState"
                        aria-label="State"
                        value={formData.pickupState || ""}
                        onChange={(e) => handleInputChange("pickupState", e.target.value)}
                        className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${errors.pickupState ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"} text-sm`}
                      >
                        <option value="">Select state…</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.pickupState && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pickupState}</p>}
                    </div>
                    <TextInput label="City / Area" name="pickupCity" required placeholder="e.g. Wuse Zone 2" value={formData.pickupCity || ""} onChange={(v) => handleInputChange("pickupCity", v)} error={errors.pickupCity} />
                  </div>
                  <TextInput label="Street Address / Landmark" name="pickupLocation" required placeholder="e.g. No. 5 Ibrahim Tahir Road, beside GTB" value={formData.pickupLocation || ""} onChange={(v) => handleInputChange("pickupLocation", v)} error={errors.pickupLocation} />
                </div>
              )}

              {formData.deliveryMethod === "Schedule Delivery" && (
                <div className="space-y-3 pt-1">
                  <p className="text-sm font-medium text-gray-700">Delivery Stops</p>
                  {scheduledStops.map((stop, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Stop {idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#5123d4]">₦5,000</span>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => removeStop(idx)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              aria-label="Remove stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <TextInput
                        label="Address"
                        name={`stop_address_${idx}`}
                        required
                        placeholder="Full delivery address"
                        value={stop.address}
                        onChange={(v) => updateStop(idx, "address", v)}
                      />
                      <TextInput
                        label="State"
                        name={`stop_state_${idx}`}
                        required
                        placeholder="e.g. Abuja, Lagos"
                        value={stop.state}
                        onChange={(v) => updateStop(idx, "state", v)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            title={`Stop ${idx + 1} date`}
                            value={stop.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => updateStop(idx, "date", e.target.value)}
                            className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            title={`Stop ${idx + 1} time`}
                            value={stop.time}
                            onChange={(e) => updateStop(idx, "time", e.target.value)}
                            className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.scheduledStops && (
                    <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.scheduledStops}</p>
                  )}
                  <button
                    type="button"
                    onClick={addStop}
                    className="flex items-center gap-2 text-sm font-semibold text-[#5123d4] border border-[#5123d4]/30 rounded-xl px-4 py-2.5 hover:bg-[#f0ebff] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Stop
                  </button>
                </div>
              )}

              {formData.deliveryMethod === "Special Submission" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-blue-800">Government & Private Organization Submission</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Follow-up, representation, retrieval, and acknowledgement collection are also available.
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    After receiving your order number, visit <strong>Submitar.com</strong> and enter the order number there to complete your request.
                  </p>
                  <p className="text-xs text-blue-400">Powered by Submitar</p>
                </div>
              )}

              <TextInput
                label="Additional Notes (Optional)"
                name="specificInstruction"
                placeholder="Landmark, building number, nearest bus-stop…"
                value={formData.specificInstruction || ""}
                onChange={(v) => handleInputChange("specificInstruction", v)}
              />
            </SectionCard>
          )}

          <SectionCard title="Order Summary">
            <div className="space-y-2 text-sm">
              {formData.service === "Lamination" ? (
                <>
                  <div className="flex justify-between"><span>Lamination:</span><span>₦700</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>Service Fee:</span><span>₦2,000</span></div>
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
                </>
              )}
              {formData.deliveryMethod && formData.deliveryMethod !== "Special Submission" && formData.deliveryMethod !== "Hardcopy Pickup" && (
                <div className="flex justify-between">
                  <span>Delivery ({formData.deliveryMethod}):</span>
                  <span>
                    {formData.deliveryMethod === "Schedule Delivery"
                      ? `₦${(5000 * scheduledStops.length).toLocaleString()} (${scheduledStops.length} stop${scheduledStops.length !== 1 ? "s" : ""})`
                      : `₦${getDeliveryFee().toLocaleString()}`
                    }
                  </span>
                </div>
              )}
              {formData.deliveryMethod === "Special Submission" && (
                <div className="flex justify-between text-green-700"><span>Special Submission:</span><span>Free</span></div>
              )}
              <div className="pt-2 border-t border-gray-200 font-bold flex justify-between">
                <span>Total:</span>
                <span className="text-[#5123d4]">₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </SectionCard>

          <button type="submit" className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white py-3 rounded-lg font-medium transition-colors">
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  );
}
