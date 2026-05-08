"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

interface PartnerModalProps {
  onClose: () => void;
}

export default function PartnerModal({ onClose }: PartnerModalProps) {
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    email: "",
    address: "",
    services: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:    form.full_name,
          companyName: form.company_name,
          email:       form.email,
          address:     form.address,
          services:    form.services,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Application Received!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Thank you for your interest in partnering with us. We will review your application and get back to you shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black mb-1">Become a Partner</h2>
              <p className="text-gray-500 text-sm">Fill in the form below and we will be in touch with you.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Company or Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={300}
                  value={form.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="Company or organization name"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={3}
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Your business or home address"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Services You Offer
                </label>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={form.services}
                  onChange={(e) => handleChange("services", e.target.value)}
                  placeholder="Describe the services your business provides (e.g. printing, scanning, document management, logistics…)"
                  className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Help us understand how we can work together.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
