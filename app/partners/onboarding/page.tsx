"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
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
];

interface FormData {
  fullName: string;
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
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToNda: boolean;
}

export default function PartnerOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<"form" | "upload" | "agreements" | "review">("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
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
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToNda: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showNdaFull, setShowNdaFull] = useState(false);

  const fileInputRefs = {
    office: useRef<HTMLInputElement>(null),
    personal: useRef<HTMLInputElement>(null),
    idCard: useRef<HTMLInputElement>(null),
  };

  const handleInputChange = (field: keyof Omit<FormData, "officePhotos" | "personalPhoto" | "idCardPhoto" | "selectedServices" | "agreedToTerms" | "agreedToPrivacy" | "agreedToNda">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

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
    if (!formData.fullName.trim() || !formData.companyName.trim() || !formData.email.trim() || 
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
    if (formData.officePhotos.length < 4) {
      setError(`Please upload at least 4 office photos (${formData.officePhotos.length}/4)`);
      return false;
    }
    if (!formData.personalPhoto) {
      setError("Please upload your personal photo");
      return false;
    }
    if (!formData.idCardPhoto) {
      setError("Please upload your ID card photo");
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
      };

      const officePhotosBase64 = await Promise.all(
        formData.officePhotos.map(convertFileToBase64)
      );
      const personalPhotoBase64 = await convertFileToBase64(formData.personalPhoto!);
      const idCardPhotoBase64 = await convertFileToBase64(formData.idCardPhoto!);

      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          companyName: formData.companyName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          position: formData.position,
          businessDetails: formData.businessDetails,
          services: formData.selectedServices,
          officePhotos: officePhotosBase64,
          personalPhoto: personalPhotoBase64,
          idCardPhoto: idCardPhotoBase64,
          agreedToTerms: formData.agreedToTerms,
          agreedToPrivacy: formData.agreedToPrivacy,
          agreedToNda: formData.agreedToNda,
          ndaAgreedDate: new Date(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit application");
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
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

          <div className="flex items-center justify-between mb-8">
            {["form", "upload", "agreements", "review"].map((step, idx, arr) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    arr.indexOf(currentStep) >= idx
                      ? "bg-[#5123d4] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      arr.indexOf(currentStep) > idx ? "bg-[#5123d4]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {currentStep === "form" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black mb-6">Business Information</h2>

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
                    Position <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Your company name"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
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
                </div>
                <p className="text-xs text-gray-500 mt-2">Select all services you currently offer</p>
              </div>
            </div>
          )}

          {currentStep === "upload" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6">Upload Documents</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Office/Shop Photos <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({formData.officePhotos.length}/4 minimum)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {formData.officePhotos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Office photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeOfficePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRefs.office.current?.click()}
                  className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Click to upload more office photos (4+ required)
                </button>
                <input
                  ref={fileInputRefs.office}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload("office", e.target.files)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Personal Photo (Live Capture) <span className="text-red-500">*</span>
                </label>
                {formData.personalPhoto && (
                  <div className="relative mb-3">
                    <img
                      src={URL.createObjectURL(formData.personalPhoto)}
                      alt="Personal photo"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRefs.personal.current?.click()}
                  className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {formData.personalPhoto ? "Change personal photo" : "Upload personal photo"}
                </button>
                <input
                  ref={fileInputRefs.personal}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("personal", e.target.files)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Office ID Card <span className="text-red-500">*</span>
                </label>
                {formData.idCardPhoto && (
                  <div className="relative mb-3">
                    <img
                      src={URL.createObjectURL(formData.idCardPhoto)}
                      alt="ID card"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRefs.idCard.current?.click()}
                  className="w-full bg-[#F1F5F9] hover:bg-gray-100 border-2 border-dashed border-[#5123d4] text-[#5123d4] px-4 py-6 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {formData.idCardPhoto ? "Change ID card" : "Upload ID card"}
                </button>
                <input
                  ref={fileInputRefs.idCard}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("idCard", e.target.files)}
                  className="hidden"
                />
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

              <div className="border-2 border-[#5123d4] rounded-lg p-4 bg-blue-50">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowNdaFull(!showNdaFull)}
                    className="flex items-center gap-2 text-[#5123d4] font-semibold text-sm mb-3 hover:text-[#401AA0]"
                  >
                    {showNdaFull ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showNdaFull ? "Hide" : "Show"} Full NDA
                  </button>

                  {showNdaFull && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto text-xs text-gray-700 space-y-3">
                      <h3 className="font-bold text-sm">Non-Disclosure Agreement (NDA)</h3>
                      <p className="font-semibold">🔐 CONFIDENTIALITY REQUIREMENTS</p>
                      <p>
                        All partners must agree to maintain strict confidentiality regarding customer files, projects, documents, credentials, and personal information processed through computerservice.ng.
                      </p>

                      <p className="font-semibold">PROHIBITED ACTIONS:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Unauthorized disclosure of customer information</li>
                        <li>Duplication of customer projects or documents</li>
                        <li>Misuse of customer credentials or sensitive data</li>
                        <li>Sharing of customer information with third parties</li>
                        <li>Use of customer documents for personal gain</li>
                      </ul>

                      <p className="font-semibold">PENALTIES FOR VIOLATION:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>⛔ Immediate suspension or termination of partnership</li>
                        <li>⛔ Permanent removal from the platform</li>
                        <li>⛔ Financial liability for damages caused</li>
                        <li>⛔ Possible legal action where necessary</li>
                      </ul>

                      <p className="font-semibold">PARTNER OBLIGATIONS:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Protect all customer information with industry-standard security measures</li>
                        <li>Only access customer data necessary to perform services</li>
                        <li>Immediately report any data breaches or unauthorized access</li>
                        <li>Comply with all applicable data protection laws (GDPR, CCPA, etc.)</li>
                        <li>Maintain confidentiality even after partnership termination</li>
                      </ul>

                      <p className="font-semibold">DURATION:</p>
                      <p>This agreement remains in effect during the partnership and for 3 years following termination.</p>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToNda}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, agreedToNda: e.target.checked }))
                    }
                    className="w-5 h-5 text-[#5123d4] rounded mt-1 flex-shrink-0"
                  />
                  <div className="text-sm">
                    <p className="text-gray-700">
                      I have read and agree to the <span className="font-semibold">Non-Disclosure Agreement (NDA)</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      I understand the confidentiality requirements and penalties for violation
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-black mb-6">Review Your Application</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Full Name</p>
                    <p className="text-gray-900 font-semibold">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Position</p>
                    <p className="text-gray-900 font-semibold">{formData.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Company</p>
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
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Office Photos ({formData.officePhotos.length})
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Personal Photo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      ID Card
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">Agreements</p>
                  <ul className="space-y-1 text-sm">
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
