"use client";

import { useState } from "react";
import { X, Phone, Mail } from "lucide-react";

interface RecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (identifier: string) => void;
}

export default function RecallModal({ isOpen, onClose, onVerified }: RecallModalProps) {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const identifier = method === "phone" ? phoneNumber : email;

  const handleSendOtp = async () => {
    if (method === "phone") {
      if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
    } else {
      if (!email || !email.includes("@") || !email.includes(".")) {
        setError("Please enter a valid email address");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const endpoint = method === "phone" ? "/api/send-otp" : "/api/send-email-otp";
      const body = method === "phone" ? { phoneNumber } : { email };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setSuccessMessage(`Code sent to ${identifier}`);
      } else {
        setError(typeof data.message === "string" ? data.message : "Failed to send code. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid verification code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const body = method === "phone" ? { phoneNumber, otp } : { email, otp };

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Verified successfully!");
        setTimeout(() => {
          onVerified(identifier);
          onClose();
        }, 1000);
      } else {
        setError(typeof data.message === "string" ? data.message : "Invalid code. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("input");
    setOtp("");
    setError("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Recall Your Project</h2>
          <button type="button" onClick={handleClose} aria-label="Close" className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "input" ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Retrieve your saved project using your phone number or email address.
            </p>

            {/* Method selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setMethod("phone"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  method === "phone"
                    ? "border-[#5123d4] bg-[#f0ebff] text-[#5123d4]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Phone className="w-4 h-4" /> Phone
              </button>
              <button
                type="button"
                onClick={() => { setMethod("email"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  method === "email"
                    ? "border-[#5123d4] bg-[#f0ebff] text-[#5123d4]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            {method === "phone" ? (
              <div>
                <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+234 803 567 1112"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setError(""); }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-sm"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter the 6-digit code sent to <span className="font-medium text-black">{identifier}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-center tracking-[0.4em] text-xl font-bold"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("input"); setOtp(""); setError(""); setSuccessMessage(""); }}
              className="w-full text-[#5123d4] font-medium py-2 hover:underline text-sm"
            >
              {method === "phone" ? "Change Phone Number" : "Change Email Address"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
