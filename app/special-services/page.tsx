"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";

const DELIVERY_OPTIONS = [
  { value: "Express Delivery",  title: "Express Delivery ⚡",       subtitle: "30 minutes – 2 hours",                price: "₦3,000" },
  { value: "Standard Delivery", title: "Standard Delivery 🚚",      subtitle: "2 hours – 12 hours",                  price: "₦2,000" },
  { value: "Economy Delivery",  title: "Economy Delivery 🚚",       subtitle: "Within 24 hours",                     price: "₦1,000" },
  { value: "Schedule Delivery", title: "Schedule Delivery",         subtitle: "Custom time / multi-stop",            price: "₦5,000/stop" },
  { value: "Email Delivery",    title: "Email Delivery 📧",         subtitle: "Sent directly to your inbox",         price: "Free" },
  { value: "Special Submission", title: "Special Submission",       subtitle: "Government & private organizations",  price: "Free" },
] as const;

export default function SpecialServicesPage() {
  const router = useRouter();
  const { setOrderData } = useOrderStore();

  const [code, setCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    if (!deliveryMethod) next.deliveryMethod = "Please select a delivery method";

    if (deliveryMethod === "Email Delivery") {
      const target = deliveryEmail.trim();
      if (!target) next.deliveryEmail = "Email address is required for email delivery";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) next.deliveryEmail = "Please enter a valid email";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setOrderData({
      service:        "Special Service",
      category:       code || "Special Service",
      deliveryMethod: deliveryMethod as never,
      deliveryDetails: deliveryMethod === "Email Delivery" ? deliveryEmail : "",
    });

    router.push("/order/review");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] via-white to-[#ebf4ff] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5123d4] hover:text-[#401AA0] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-black mb-2">Special Services</h1>
          <p className="text-gray-600 mb-8">Enter your service code and choose how you&apos;d like it delivered.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code (optional for now)"
                className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
              />
              <p className="text-xs text-gray-500 mt-1">Use the code you received for your special service.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DELIVERY_OPTIONS.map((opt) => {
                  const selected = deliveryMethod === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all h-full ${
                        selected ? "border-[#5123d4] bg-[#f0ebff]" : "border-gray-200 bg-gray-50 hover:border-[#5123d4]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={opt.value}
                        checked={selected}
                        onChange={() => setDeliveryMethod(opt.value)}
                        className="mt-0.5 w-4 h-4 text-[#5123d4] focus:ring-[#5123d4] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900">{opt.title}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                            selected ? "bg-[#5123d4] text-white border-[#5123d4]" : "bg-white text-[#5123d4] border-[#5123d4]/30"
                          }`}>
                            {opt.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{opt.subtitle}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.deliveryMethod && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryMethod}</p>
              )}
            </div>

            {deliveryMethod === "Email Delivery" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address for Delivery <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  placeholder="where should we send the completed work?"
                  className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.deliveryEmail ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"}`}
                />
                {errors.deliveryEmail && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deliveryEmail}</p>}
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue to Review <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
