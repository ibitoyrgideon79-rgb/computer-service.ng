"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface RecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneNumber: string) => void;
}

export default function RecallModal({ isOpen, onClose, onVerified }: RecallModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Call API to send OTP via SMS
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setSuccessMessage(`OTP sent to ${phoneNumber}`);
      } else {
        const errorMsg = typeof data.message === "string" 
          ? data.message 
          : "Failed to send OTP. Please try again.";
        setError(errorMsg);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Call API to verify OTP
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("OTP verified successfully!");
        setTimeout(() => {
          onVerified(phoneNumber);
          onClose();
        }, 1000);
      } else {
        const errorMsg = typeof data.message === "string" 
          ? data.message 
          : "Invalid OTP. Please try again.";
        setError(errorMsg);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Recall Your Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter your phone number to retrieve your saved projects
            </p>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+234 803 567 1112"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{typeof error === "string" ? error : "An error occurred. Please try again."}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to {phoneNumber}
            </p>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                One-Time Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5123d4] text-center tracking-widest"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{typeof error === "string" ? error : "An error occurred. Please try again."}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={() => setStep("phone")}
              className="w-full text-[#5123d4] font-medium py-2 hover:underline"
            >
              Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
