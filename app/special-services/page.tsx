"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";

const DELIVERY_OPTIONS = [
  { value: "Express Delivery",  title: "Express Delivery ⚡",       subtitle: "30 minutes – 2 hours",                price: "₦3,000", fee: 3000 },
  { value: "Standard Delivery", title: "Standard Delivery 🚚",      subtitle: "2 hours – 12 hours",                  price: "₦2,000", fee: 2000 },
] as const;

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const PROCESSING_FEE = 1500;
const SERVICE_FEE    = 1500;

export default function SpecialServicesPage() {
  const { setOrderData } = useOrderStore();

  const [code, setCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.value === deliveryMethod);
  const deliveryFee = selectedDelivery?.fee ?? 0;
  const total = PROCESSING_FEE + SERVICE_FEE + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    if (!deliveryMethod) next.deliveryMethod = "Please select a delivery method";

    if (deliveryMethod) {
      if (!phone.trim()) next.phone = "Phone number is required";
      if (!pickupState)  next.pickupState = "State is required";
      if (!pickupCity.trim())     next.pickupCity     = "City is required";
      if (!pickupLocation.trim()) next.pickupLocation = "Street address is required";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setOrderData({
      service:        "Special Service",
      category:       code || "Special Service",
      phoneNumber:    phone,
      pickupState,
      pickupCity,
      pickupLocation,
      deliveryMethod: deliveryMethod as never,
      deliveryDetails: "",
    });

    setSubmitting(true);
    setSubmitError("");
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:    "Special Service Customer",
          phone_number:     phone,
          email:            null,
          service:          "Special Service",
          category:         code || "Special Service",
          delivery_method:  deliveryMethod,
          pickup_state:     pickupState,
          pickup_city:      pickupCity,
          pickup_location:  pickupLocation,
          amount:           total,
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        setSubmitError(orderJson.error || "Failed to create order. Please try again.");
        setSubmitting(false);
        return;
      }

      const payRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderJson.id,
          email:   "customer@computerservice.ng",
          amount:  total,
        }),
      });
      const payJson = await payRes.json() as { authorization_url?: string; error?: string };
      if (!payRes.ok || !payJson.authorization_url) {
        setSubmitError(payJson.error || "Could not open payment. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.assign(payJson.authorization_url);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] via-white to-[#ebf4ff] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5123d4] hover:text-[#401AA0] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-black mb-1">Special Service</h1>
          <p className="text-sm uppercase tracking-wide text-[#5123d4] font-semibold mb-4">
            Invitation Printing & Delivery Service
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Enter the email address you used to register for the program, select your preferred
            delivery method, and we will print your invitation and have it delivered to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code"
                className="w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
              />
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

            {deliveryMethod && (
              <div className="border-t border-gray-100 pt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h2 className="text-lg font-bold text-black">Your Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
                    <select
                      title="State"
                      value={pickupState}
                      onChange={(e) => setPickupState(e.target.value)}
                      className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.pickupState ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"}`}
                    >
                      <option value="">Select state…</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.pickupState && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pickupState}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 567 1112"
                      className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.phone ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City / Area <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    placeholder="e.g. Wuse Zone 2"
                    className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.pickupCity ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"}`}
                  />
                  {errors.pickupCity && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pickupCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address / Landmark <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. No. 5 Ibrahim Tahir Road, beside GTB"
                    className={`w-full bg-[#F1F5F9] text-black px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.pickupLocation ? "ring-2 ring-red-400" : "focus:ring-[#5123d4]"}`}
                  />
                  {errors.pickupLocation && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pickupLocation}</p>}
                </div>

                <div className="bg-[#f8f7ff] border border-[#5123d4]/15 rounded-xl p-5 space-y-2 text-sm">
                  <h3 className="text-base font-bold text-black mb-2">Order Summary</h3>
                  <div className="flex justify-between text-gray-700">
                    <span>Processing fee</span>
                    <span>₦{PROCESSING_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee (Coloured Printing and Card Paper)</span>
                    <span>₦{SERVICE_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery ({deliveryMethod})</span>
                    <span>₦{deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 -mx-5 -mb-5 px-5 py-4 bg-[#5123d4] rounded-b-xl flex items-center justify-between text-white">
                    <span className="text-base font-bold uppercase tracking-wide">Total</span>
                    <span className="text-2xl font-extrabold">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <p className="text-red-600 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />{submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening payment…
                </>
              ) : (
                <>
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
