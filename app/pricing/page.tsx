"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Printer, Book, Truck, ArrowRight, ArrowLeft, Check, Menu, X,
} from "lucide-react";

const PRINT_RATES = [
  { label: "A4 — Black & White", price: "₦50/page" },
  { label: "A4 — Colour", price: "₦150/page" },
  { label: "A3 — Black & White", price: "₦100/page" },
  { label: "A3 — Colour", price: "₦300/page" },
];

const BINDING_RATES = [
  { label: "Stapled", price: "₦200" },
  { label: "Spiral Binding", price: "₦500" },
  { label: "Hardcover Binding", price: "₦2,000" },
];

const DELIVERY_RATES = [
  { label: "Pick Up (self-collect)", price: "Free", highlight: "green" },
  { label: "Doorstep Delivery", price: "₦1,000", highlight: "" },
  { label: "Service Fee (flat)", price: "₦500", highlight: "" },
  { label: "Express (1–2 hrs)", price: "+50% surcharge", highlight: "orange" },
];

const CUSTOM_SERVICES = [
  "Typing & Document Preparation",
  "Graphic / Logo Design",
  "Business & ID Card Printing",
  "Application Services (JAMB, WAEC, NIN, etc.)",
  "Technical Support & Repair",
  "Scanning & Document Conversion",
];

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="w-full border-b border-gray-900 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-48 md:h-16 md:w-64">
              <Image src="/Computer service PNG 111.png" alt="computerservice.ng" fill className="object-contain object-left" priority quality={100} />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
            <Link href="/services" className="hover:text-[#D1AFFF] transition-colors">Services</Link>
            <Link href="/#how-it-works" className="hover:text-[#D1AFFF] transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-[#D1AFFF]">Pricing</Link>
            <Link href="/terms" className="hover:text-[#D1AFFF] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-[#D1AFFF] transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-[#D1AFFF] transition-colors">Privacy Policy</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/order/details" className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors">
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-1.5"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 px-4 py-6 flex flex-col gap-4">
            {[
              { label: "Services", href: "/services" },
              { label: "How it Works", href: "/#how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Refund Policy", href: "/refund-policy" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white text-base font-medium transition-colors">
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Back bar */}
      <div className="w-full border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 lg:px-8 h-12 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-[#0f0720] text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-[#D1AFFF] text-sm font-semibold uppercase tracking-widest mb-3">No hidden charges</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Transparent Pricing</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Clear, upfront rates for every service. What you see is what you pay.
            </p>
          </div>
        </section>

        {/* Main pricing cards */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Printing */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#5123d4]/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Printer className="w-5 h-5 text-[#5123d4]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-black">Printing &amp; Photocopy</h2>
                    <p className="text-xs text-gray-400">Per page rate</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {PRINT_RATES.map(({ label, price }) => (
                    <li key={label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-black">{price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Binding */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#5123d4]/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Book className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-black">Binding &amp; Finishing</h2>
                    <p className="text-xs text-gray-400">Per document</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {BINDING_RATES.map(({ label, price }) => (
                    <li key={label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-black">{price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#5123d4]/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-black">Delivery &amp; Fees</h2>
                    <p className="text-xs text-gray-400">Additional charges</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {DELIVERY_RATES.map(({ label, price, highlight }) => (
                    <li key={label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-gray-600">{label}</span>
                      <span className={`font-semibold ${highlight === "green" ? "text-green-600" : highlight === "orange" ? "text-orange-500" : "text-black"}`}>{price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-10 max-w-2xl mx-auto">
              * Prices above apply to standard printing &amp; photocopying. Scanning, document conversion, and express delivery fees are applied on top of the base rate.
            </p>
          </div>
        </section>

        {/* Custom-quoted services */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Custom-Quoted Services</h2>
            <p className="text-gray-500 mb-10">
              These services are priced based on your specific request. Submit your order and we will send you a clear quote before you pay.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
              {CUSTOM_SERVICES.map((s) => (
                <div key={s} className="flex items-center gap-3 bg-[#f8f5ff] border border-purple-100 rounded-xl px-4 py-3">
                  <div className="w-5 h-5 rounded-full bg-[#5123d4] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0f0720] text-white text-center">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to place your order?</h2>
            <p className="text-white/60 mb-8">Get started in minutes. No account needed — just tell us what you need.</p>
            <Link href="/order/details" className="inline-flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-3.5 rounded-lg font-medium text-base transition-colors shadow-sm">
              Start Your Order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <div className="bg-[#190934] text-white py-3 border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 text-xs font-medium text-center">
          <p className="text-[#D1AFFF]">©2026 computerservice.ng All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
