"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AVAILABLE_SERVICES = [
  "Document Printing",
  "Photocopying",
  "Lamination",
  "Binding",
  "Scanning",
  "Design Services",
  "Photo Printing",
  "Business Cards",
  "Flyers & Brochures",
  "Reports & Proposals",
  "Tech Support",
  "Logistics",
  "Agent/Coordinator",
];

interface FormData {
  fullName: string;
  firstName: string;
  lastName: string;
  employmentType: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
  businessDetails: string;
  selectedServices: string[];
  officePhotos: File[];
  personalPhoto: File | null;
  idCardPhoto: File | null;
  idType: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToNda: boolean;
}

export default function PartnerOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<"form" | "upload" | "agreements" | "review">("form");
  const [entityType, setEntityType] = useState<"company" | "individual">("company");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    firstName: "",
    lastName: "",
    employmentType: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    address: "",
    position: "",
    businessDetails: "",
    selectedServices: [],
    officePhotos: [],
    personalPhoto: null,
    idCardPhoto: null,
    idType: "",
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToNda: false,
  });
  const [otherServiceText, setOtherServiceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ndaRead, setNdaRead] = useState(false);

  const officeInputRef = useRef<HTMLInputElement>(null);
  const personalInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const ndaScrollRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof Omit<FormData, "officePhotos" | "personalPhoto" | "idCardPhoto" | "selectedServices" | "agreedToTerms" | "agreedToPrivacy" | "agreedToNda">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleNdaScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      setNdaRead(true);
    }
  };

  const resolvedFullName = entityType === "individual"
    ? `${formData.firstName} ${formData.lastName}`.trim()
    : formData.fullName;

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  };

  const handleFileUpload = (type: "office" | "personal" | "idCard", files: FileList | null) => {
    if (!files) return;

    if (type === "office") {
      const newFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        officePhotos: [...prev.officePhotos, ...newFiles].slice(0, 10),
      }));
    } else if (type === "personal") {
      setFormData((prev) => ({ ...prev, personalPhoto: files[0] }));
    } else if (type === "idCard") {
      setFormData((prev) => ({ ...prev, idCardPhoto: files[0] }));
    }
  };

  const removeOfficePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      officePhotos: prev.officePhotos.filter((_, i) => i !== index),
    }));
  };

  const validateFormStep = (): boolean => {
    if (entityType === "individual") {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError("Please enter your first and last name");
        return false;
      }
      if (!formData.employmentType.trim()) {
        setError("Please select your employment type");
        return false;
      }
    } else {
      if (!formData.fullName.trim()) {
        setError("Please fill in all required fields");
        return false;
      }
    }
    if (!formData.companyName.trim() || !formData.email.trim() ||
        !formData.phoneNumber.trim() || !formData.address.trim() || !formData.position.trim() ||
        !formData.businessDetails.trim()) {
      setError("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }

    if (formData.selectedServices.length === 0) {
      setError("Please select at least one service");
      return false;
    }

    return true;
  };

  const validateUploadStep = (): boolean => {
    if (entityType === "company") {
      if (formData.officePhotos.length < 4) {
        setError(`Please upload at least 4 office photos (${formData.officePhotos.length}/4)`);
        return false;
      }
    }
    if (!formData.personalPhoto) {
      setError("Please upload your personal photo");
      return false;
    }
    if (!formData.idCardPhoto) {
      setError("Please upload your means of identification");
      return false;
    }
    if (entityType === "individual" && !formData.idType) {
      setError("Please select your ID type");
      return false;
    }
    return true;
  };

  const validateAgreementsStep = (): boolean => {
    if (!formData.agreedToTerms) {
      setError("You must agree to the Terms & Conditions");
      return false;
    }
    if (!formData.agreedToPrivacy) {
      setError("You must agree to the Privacy Policy");
      return false;
    }
    if (!formData.agreedToNda) {
      setError("You must agree to the NDA");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");

    if (currentStep === "form" && validateFormStep()) {
      setCurrentStep("upload");
    } else if (currentStep === "upload" && validateUploadStep()) {
      setCurrentStep("agreements");
    } else if (currentStep === "agreements" && validateAgreementsStep()) {
      setCurrentStep("review");
    }
  };

  const compressAndEncode = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = reject;
        img.onload = () => {
          const MAX = 1200;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width  = Math.round(img.width  * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(reader.result as string); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const allServices = formData.selectedServices.includes("Other") && otherServiceText.trim()
        ? [...formData.selectedServices.filter(s => s !== "Other"), otherServiceText.trim()]
        : formData.selectedServices;

      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: resolvedFullName,
          companyName: formData.companyName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          position: formData.position,
          businessDetails: formData.businessDetails,
          services: allServices,
          photoCount: formData.officePhotos.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit application");
        return;
      }

      const appId = data.id as string;

      // Upload photos one at a time to avoid large payloads
      const idLabel = entityType === "individual" ? (formData.idType || "ID Document") : "ID Card";
      const photosToUpload: { file: File; label: string }[] = [
        ...(entityType === "company" ? formData.officePhotos.map((f, i) => ({ file: f, label: `Office Photo ${i + 1}` })) : []),
        ...(formData.personalPhoto ? [{ file: formData.personalPhoto, label: "Personal Photo" }] : []),
        ...(formData.idCardPhoto    ? [{ file: formData.idCardPhoto,   label: idLabel }]          : []),
      ];

      for (const { file, label } of photosToUpload) {
        const dataUrl = await compressAndEncode(file);
        await fetch(`/api/partners/${appId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, dataUrl }),
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in becoming a partner. We will review your application and contact you within 48 hours.
          </p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#5123d4] hover:text-[#401AA0] mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-black mb-2">Become a Partner</h1>
          <p className="text-gray-600 mb-8">Complete the partnership form and agree to our terms</p>

          {(() => {
            const STEPS = [
              { key: "form",       label: "Info"   },
              { key: "upload",     label: "Photos" },
              { key: "agreements", label: "Agree"  },
              { key: "review",     label: "Review" },
            ];
            const activeIdx = STEPS.findIndex(s => s.key === currentStep);
            return (
              <div className="flex items-center justify-between mb-8">
                {STEPS.map(({ key, label }, idx) => (
                  <div key={key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-colors ${
                          activeIdx >= idx ? "bg-[#5123d4] text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-medium ${activeIdx >= idx ? "text-[#5123d4]" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-1.5 sm:mx-2 mb-4 transition-colors ${
                          activeIdx > idx ? "bg-[#5123d4]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {currentStep === "form" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black mb-6">
                {entityType === "individual" ? "Personal Information" : "Business Information"}
              </h2>

              {entityType === "company" ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position / Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="e.g., Manager, Director"
                      className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="First name"
                        className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Last name"
                        className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Status <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Self-Employed", "Freelancer", "Student", "Employee", "Unemployed"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleInputChange("employmentType", type)}
                          className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                            formData.employmentType === type
                              ? "bg-[#5123d4] text-white border-[#5123d4]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#5123d4]/50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation / Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="e.g., Graphic Designer, IT Technician"
                      className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you a Company or an Individual? <span className="text-red-500">*</span>
                </label>
                {/* Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-3 w-fit">
                  <button
                    type="button"
                    onClick={() => setEntityType("company")}
                    className={`px-5 py-2 text-sm font-medium transition-colors ${
                      entityType === "company"
                        ? "bg-[#5123d4] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Company
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntityType("individual");
                      if (!formData.companyName) handleInputChange("companyName", formData.fullName);
                    }}
                    className={`px-5 py-2 text-sm font-medium transition-colors ${
                      entityType === "individual"
                        ? "bg-[#5123d4] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Individual
                  </button>
                </div>
                {entityType === "company" ? (
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter your company name"
                    className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="+234 803 567 1112"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address, city, state"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.businessDetails}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessDetails: e.target.value }))}
                  placeholder="Tell us about your business, experience, and why you want to partner with us..."
                  rows={4}
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services Offered <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SERVICES.map((service) => (
                    <label key={service} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        className="w-4 h-4 text-[#5123d4] rounded focus:ring-[#5123d4]"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={formData.selectedServices.includes("Other")}
                      onChange={() => toggleService("Other")}
                      className="w-4 h-4 text-[#5123d4] rounded focus:ring-[#5123d4]"
                    />
                    <span className="text-sm text-gray-700">Other / Custom</span>
                  </label>
                </div>
                {formData.selectedServices.includes("Other") && (
                  <input
                    type="text"
                    placeholder="Describe your other services…"
                    value={otherServiceText}
                    onChange={(e) => setOtherServiceText(e.target.value)}
                    className="mt-3 w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">Select all services you currently offer</p>
              </div>
            </div>
          )}

          {currentStep === "upload" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6">Upload Documents</h2>

              {/* Office photos — companies only */}
              {entityType === "company" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Office/Shop Photos <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-1">({formData.officePhotos.length}/4 minimum)</span>
                  </label>
                  {formData.officePhotos.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {formData.officePhotos.map((photo, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-green-700 font-medium">📎 {photo.name}</span>
                          <button type="button" onClick={() => removeOfficePhoto(idx)} className="text-xs text-red-400 hover:text-red-600 ml-2">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => officeInputRef.current?.click()}
                    className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Click to upload office photos (4+ required)
                  </button>
                  <input ref={officeInputRef} type="file" multiple accept="image/*" title="Upload office photos" onChange={(e) => handleFileUpload("office", e.target.files)} className="hidden" />
                </div>
              )}

              {/* Personal photo — both */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Personal Photo <span className="text-red-500">*</span>
                </label>
                {formData.personalPhoto && (
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                    <span className="text-sm text-green-700 font-medium">📎 {formData.personalPhoto.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => personalInputRef.current?.click()}
                  className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {formData.personalPhoto ? "Change personal photo" : "Upload personal photo"}
                </button>
                <input ref={personalInputRef} type="file" accept="image/*" title="Upload personal photo" onChange={(e) => handleFileUpload("personal", e.target.files)} className="hidden" />
              </div>

              {/* ID section — different label/options per entity type */}
              <div>
                {entityType === "individual" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Means of Identification <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {["NIN", "International Passport", "Driver's License"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, idType: type }))}
                          className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                            formData.idType === type
                              ? "bg-[#5123d4] text-white border-[#5123d4]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#5123d4]"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {formData.idType && (
                      <p className="text-xs text-gray-500 mb-3">Upload a clear photo of your <strong>{formData.idType}</strong></p>
                    )}
                  </>
                ) : (
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Office ID Card <span className="text-red-500">*</span>
                  </label>
                )}
                {formData.idCardPhoto && (
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                    <span className="text-sm text-green-700 font-medium">📎 {formData.idCardPhoto.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => idCardInputRef.current?.click()}
                  disabled={entityType === "individual" && !formData.idType}
                  className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {formData.idCardPhoto
                    ? `Change ${entityType === "individual" ? formData.idType || "ID" : "ID card"}`
                    : entityType === "individual"
                      ? formData.idType ? `Upload ${formData.idType}` : "Select an ID type above first"
                      : "Upload ID card"}
                </button>
                <input ref={idCardInputRef} type="file" accept="image/*" title="Upload identification document" onChange={(e) => handleFileUpload("idCard", e.target.files)} className="hidden" />
              </div>
            </div>
          )}

          {currentStep === "agreements" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black mb-6">Review & Agree to Terms</h2>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))
                    }
                    className="w-5 h-5 text-[#5123d4] rounded mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <span className="font-semibold">Terms & Conditions</span>
                  </span>
                </label>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToPrivacy}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, agreedToPrivacy: e.target.checked }))
                    }
                    className="w-5 h-5 text-[#5123d4] rounded mt-1 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <span className="font-semibold">Privacy Policy</span>
                  </span>
                </label>
              </div>

              <div className="border-2 border-[#5123d4] rounded-xl overflow-hidden">
                {/* NDA header */}
                <div className="bg-[#5123d4] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">📋 Non-Disclosure Agreement (NDA)</span>
                  </div>
                  {ndaRead
                    ? <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">✓ Read</span>
                    : <span className="text-xs bg-white/20 text-white/80 px-2.5 py-1 rounded-full animate-pulse">Scroll to read ↓</span>
                  }
                </div>

                {/* Scrollable NDA body — must scroll to bottom to unlock */}
                <div
                  ref={ndaScrollRef}
                  onScroll={handleNdaScroll}
                  className="bg-white px-4 py-4 max-h-52 overflow-y-auto text-xs text-gray-700 space-y-3 border-b border-gray-200"
                >
                  <p className="font-bold text-gray-900">🔐 CONFIDENTIALITY REQUIREMENTS</p>
                  <p>
                    All partners must agree to maintain strict confidentiality regarding customer files, projects, documents, credentials, and personal information processed through computerservice.ng.
                  </p>

                  <p className="font-semibold text-gray-800">PROHIBITED ACTIONS:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Unauthorized disclosure of customer information</li>
                    <li>Duplication of customer projects or documents</li>
                    <li>Misuse of customer credentials or sensitive data</li>
                    <li>Sharing of customer information with third parties</li>
                    <li>Use of customer documents for personal gain</li>
                  </ul>

                  <p className="font-semibold text-gray-800">PENALTIES FOR VIOLATION:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Immediate suspension or termination of partnership</li>
                    <li>Permanent removal from the platform</li>
                    <li>Financial liability for damages caused</li>
                    <li>Possible legal action where necessary</li>
                  </ul>

                  <p className="font-semibold text-gray-800">PARTNER OBLIGATIONS:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Protect all customer information with industry-standard security measures</li>
                    <li>Only access customer data necessary to perform services</li>
                    <li>Immediately report any data breaches or unauthorized access</li>
                    <li>Comply with all applicable data protection laws and Nigerian regulations</li>
                    <li>Maintain confidentiality even after partnership termination</li>
                  </ul>

                  <p className="font-semibold text-gray-800">DURATION:</p>
                  <p className="text-gray-600">This agreement remains in effect during the partnership and for 3 years following termination.</p>

                  {/* Invisible anchor at bottom */}
                  <div className="h-1" />
                </div>

                {/* Agreement checkbox — locked until NDA is read */}
                <div className={`px-4 py-4 transition-colors ${ndaRead ? "bg-[#f0ebff]" : "bg-gray-50"}`}>
                  {!ndaRead && (
                    <p className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1.5">
                      <span>⚠️</span> Please scroll through and read the full NDA above before agreeing.
                    </p>
                  )}
                  <label className={`flex items-start gap-3 ${ndaRead ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                    <input
                      type="checkbox"
                      checked={formData.agreedToNda}
                      disabled={!ndaRead}
                      onChange={(e) => setFormData((prev) => ({ ...prev, agreedToNda: e.target.checked }))}
                      className="w-5 h-5 text-[#5123d4] rounded mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">I have read and agree to the Non-Disclosure Agreement</p>
                      <p className="text-xs text-gray-500 mt-0.5">I understand the confidentiality requirements and penalties for violation</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6">Review Your Application</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {entityType === "individual" ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">First Name</p>
                        <p className="text-gray-900 font-semibold">{formData.firstName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Last Name</p>
                        <p className="text-gray-900 font-semibold">{formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Employment Status</p>
                        <p className="text-gray-900 font-semibold">{formData.employmentType}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Full Name</p>
                      <p className="text-gray-900 font-semibold">{formData.fullName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">{entityType === "company" ? "Position" : "Occupation"}</p>
                    <p className="text-gray-900 font-semibold">{formData.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">{entityType === "company" ? "Company" : "Individual"}</p>
                    <p className="text-gray-900 font-semibold">{formData.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                    <p className="text-gray-900 font-semibold">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                    <p className="text-gray-900 font-semibold">{formData.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
                    <p className="text-gray-900 font-semibold">{formData.address}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">Services Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedServices.map((service) => (
                      <span key={service} className="bg-[#5123d4] text-white text-xs font-medium px-3 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">Documents Uploaded</p>
                  <ul className="space-y-1 text-sm text-gray-800">
                    {entityType === "company" && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Office Photos ({formData.officePhotos.length})
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Personal Photo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {entityType === "individual" ? (formData.idType || "ID Document") : "ID Card"}
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">Agreements</p>
                  <ul className="space-y-1 text-sm text-gray-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Terms & Conditions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Privacy Policy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      NDA
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {currentStep !== "form" && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (currentStep === "upload") setCurrentStep("form");
                  else if (currentStep === "agreements") setCurrentStep("upload");
                  else if (currentStep === "review") setCurrentStep("agreements");
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}

            {currentStep !== "review" && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-[#5123d4] hover:bg-[#401AA0] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Next
              </button>
            )}

            {currentStep === "review" && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
