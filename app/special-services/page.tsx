"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function SpecialServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] via-white to-[#ebf4ff] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5123d4] hover:text-[#401AA0] mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Special Service</h1>
          <p className="text-sm uppercase tracking-wide text-[#5123d4] font-semibold mb-6">
            Special Service Request
          </p>

          <div className="bg-[#f0ebff] border-l-4 border-[#5123d4] rounded-r-lg p-5 mb-6 max-w-3xl text-left">
            <p className="text-gray-800 leading-relaxed">
              This is a custom service request. Please chat with us on WhatsApp and let us know
              how you would like the service to be carried out, and how you would like the
              completed service or deliverables to be provided to you, your group, organization,
              team, or participants.
            </p>
          </div>

          <a
            href="https://wa.me/2348166027757?text=Hi%2C%20I%27d%20like%20to%20request%20a%20custom%20service."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
