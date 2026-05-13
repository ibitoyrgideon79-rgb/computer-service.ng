"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Printer, Book, Truck, ArrowRight, Menu, X,
  FileText, Palette, CreditCard, Wrench,
  GraduationCap, Fingerprint, Wifi, Building2, Clock,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Printer,
    iconBg: "bg-purple-50",
    iconColor: "text-[#5123d4]",
    title: "Printing Services",
    subtitle: "Per page rate",
    items: [
      { label: "Black & White Print (A4)", price: "₦300/page" },
      { label: "Color Print (A4 Text)", price: "₦700/page" },
      { label: "Color Image Print (A4)", price: "From ₦2,000" },
      { label: "Photocopy", price: "₦150/page" },
      { label: "Passport Photo (4 copies)", price: "₦3,000" },
      { label: "Passport Photo (8 copies)", price: "₦6,000" },
      { label: "A3 Black & White", price: "Coming Soon" },
      { label: "A3 Color", price: "Coming Soon" },
    ],
  },
  {
    icon: FileText,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Typing & Document Preparation",
    subtitle: "Professional document services",
    items: [
      { label: "Simple Typing", price: "₦800/page" },
      { label: "Complex Typing", price: "From ₦2,000/page" },
      { label: "Document Formatting", price: "From ₦2,500" },
      { label: "Document Conversion (PDF/Word/etc.)", price: "From ₦1,500" },
      { label: "Scanning Documents", price: "₦500/page" },
    ],
  },
  {
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "CV & Professional Documents",
    subtitle: "Career-ready documents",
    items: [
      { label: "Normal CV", price: "₦1,500" },
      { label: "Professional CV", price: "₦4,000" },
      { label: "Cover Letter", price: "₦2,000" },
      { label: "LinkedIn Profile Setup", price: "From ₦5,000" },
    ],
  },
  {
    icon: Book,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Binding Services",
    subtitle: "Per document",
    items: [
      { label: "Normal A4 Binding", price: "₦1,000" },
      { label: "Spiral Binding", price: "From ₦2,000" },
      { label: "A3 Binding", price: "Coming Soon" },
    ],
  },
  {
    icon: Palette,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    title: "Design & Branding Services",
    subtitle: "Creative & professional design",
    items: [
      { label: "Graphic Design", price: "From ₦5,000" },
      { label: "Logo Design", price: "From ₦15,000" },
      { label: "Flyer Design", price: "From ₦5,000" },
      { label: "Banner Design", price: "From ₦8,000" },
      { label: "Social Media Design", price: "From ₦3,500" },
    ],
  },
  {
    icon: CreditCard,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    title: "Business Card & ID Card",
    subtitle: "Custom prints & cards",
    items: [
      { label: "Normal Business Card (50pcs)", price: "₦12,500" },
      { label: "Premium Business Card", price: "From ₦20,000" },
      { label: "Laminated ID Card", price: "₦5,000" },
      { label: "Plastic ID Card", price: "₦8,500" },
    ],
  },
  {
    icon: GraduationCap,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Examination & Educational Services",
    subtitle: "Academic & certification services",
    items: [
      { label: "Original WAEC Result Processing", price: "₦22,000" },
      { label: "WAEC Result Check (with Token)", price: "₦6,000" },
      { label: "NECO Result Check (with Token)", price: "₦4,000" },
      { label: "NABTEB Result Check (with Token)", price: "₦4,000" },
      { label: "JAMB Services", price: "From ₦5,000" },
      { label: "School Admission Processing", price: "Negotiable" },
    ],
  },
  {
    icon: Fingerprint,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    title: "NIN & Identity Services",
    subtitle: "NIN modifications & reprints",
    items: [
      { label: "NIN Date of Birth Modification", price: "₦65,000" },
      { label: "NIN Name Correction", price: "₦12,000" },
      { label: "NIN Phone Number Change", price: "₦12,000" },
      { label: "NIN Address Change", price: "₦12,000" },
      { label: "NIN Reprint Slip", price: "₦2,000" },
      { label: "BVN Reprint Slip", price: "₦2,000" },
    ],
  },
  {
    icon: Wifi,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    title: "Digital & Utility Services",
    subtitle: "Bills, airtime & subscriptions",
    items: [
      { label: "Internet Data Bundles", price: "Depends on Network" },
      { label: "Airtime Purchase", price: "Depends on Amount" },
      { label: "Utility Bill Payment", price: "₦500 Service Charge" },
      { label: "TV Subscription", price: "₦500 – ₦1,000 Service" },
      { label: "Recharge Card Printing", price: "From ₦3,000" },
    ],
  },
  {
    icon: Building2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "CAC Registration Services",
    subtitle: "15 – 30 working days processing",
    items: [
      { label: "CAC Business Name Registration", price: "₦50,000" },
      { label: "Private Limited Company (Ltd)", price: "₦85,000" },
      { label: "Public Company Registration", price: "₦180,000" },
      { label: "Incorporated Trustee / NGO", price: "₦120,000" },
      { label: "Annual Returns – Business Name (BN)", price: "₦15,500" },
      { label: "Annual Returns – Private Limited", price: "₦20,000" },
    ],
  },
  {
    icon: Wrench,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    title: "Computer Repair & Software",
    subtitle: "Hardware & software support",
    items: [
      { label: "Computer Formatting", price: "From ₦8,000" },
      { label: "Software Installation", price: "From ₦5,000" },
      { label: "Windows Installation", price: "From ₦10,000" },
      { label: "System Cleanup & Optimization", price: "From ₦5,000" },
      { label: "Virus Removal", price: "From ₦5,000" },
      { label: "Driver Installation", price: "From ₦3,500" },
    ],
  },
  {
    icon: Truck,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    title: "Convenience Charges",
    subtitle: "Optional add-on services",
    items: [
      { label: "Economy Delivery (24hr)", price: "₦1,000" },
      { label: "Standard Delivery (2–12hr)", price: "₦2,000" },
      { label: "Express Delivery (30min–2hr)", price: "₦3,000" },
      { label: "Schedule Delivery (per stop)", price: "₦5,000" },
      { label: "Special Submission", price: "Free" },
      { label: "Urgent Processing", price: "Extra 20%" },
    ],
  },
];

const PACKAGES = [
  {
    name: "Student Package",
    color: "from-purple-500 to-indigo-600",
    items: ["CV Writing", "Printing", "Scanning", "Result Checking"],
  },
  {
    name: "Business Package",
    color: "from-emerald-500 to-teal-600",
    items: ["CAC Registration", "Branding & Design", "Business Cards", "ID Cards"],
  },
  {
    name: "Corporate Package",
    color: "from-orange-500 to-amber-600",
    items: ["Bulk Printing", "Staff ID Cards", "Pickup & Delivery", "Dedicated Support"],
  },
];

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="w-full border-b border-gray-900 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col self-end pb-2">
            <div className="relative h-12 w-44 md:h-16 md:w-60 shrink-0">
              <Image src="/Computer service PNG 111.png" alt="computerservice.ng" fill className="object-contain object-left" priority quality={100} />
            </div>
            <span className="self-end -mt-1 text-white text-[10px] sm:text-xs font-bold tracking-widest border border-white/25 rounded px-2 py-0.5 whitespace-nowrap">RC: 9511799</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
            <Link href="/" className="hover:text-[#D1AFFF] transition-colors">Home</Link>
            <Link href="/services" className="hover:text-[#D1AFFF] transition-colors">Services</Link>
            <Link href="/pricing" className="text-[#D1AFFF]">Pricing</Link>
            <Link href="/terms" className="hover:text-[#D1AFFF] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-[#D1AFFF] transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-[#D1AFFF] transition-colors">Privacy Policy</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/order/details" className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors">
              Get Started
            </Link>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1.5" aria-label="Toggle menu">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 px-4 py-6 flex flex-col gap-4">
            {[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
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

      <main className="grow">
        {/* Hero */}
        <section className="bg-[#0f0720] text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-[#D1AFFF] text-sm font-semibold uppercase tracking-widest mb-3">No hidden charges</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Transparent Pricing</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Clear, upfront rates for every service. You are not just paying for the work — you are paying for convenience, speed, and peace of mind.
            </p>
          </div>
        </section>

        {/* All pricing sections */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {SECTIONS.map((section) => (
                <div key={section.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#5123d4]/30 hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${section.iconBg}`}>
                      <section.icon className={`w-5 h-5 ${section.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-black leading-tight">{section.title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{section.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-2.5 grow">
                    {section.items.map(({ label, price }) => (
                      <li key={label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2.5 last:border-0 last:pb-0 gap-2">
                        <span className="text-gray-600 text-xs sm:text-sm">{label}</span>
                        <span className={`font-semibold shrink-0 text-xs sm:text-sm ${price === "Coming Soon" ? "text-gray-400 italic" : price === "Negotiable" ? "text-amber-600" : "text-black"}`}>
                          {price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-10 max-w-2xl mx-auto">
              * Prices shown are starting rates. Final price depends on volume, complexity, and delivery option selected. All prices include our convenience service charge.
            </p>
          </div>
        </section>

        {/* Why prices are higher */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
            <p className="text-[#5123d4] text-sm font-semibold uppercase tracking-widest mb-3">Smart Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">You are not just paying for the service</h2>
            <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
              computerservice.ng offers more than a regular computer center. Every order includes convenience, coordination, and guaranteed quality.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {["Convenience", "Pickup & Delivery", "Online Ordering", "Time-saving", "Wider Accessibility", "Customer Support", "Agent Coordination", "Guaranteed Quality"].map((v) => (
                <div key={v} className="bg-[#f8f5ff] border border-purple-100 rounded-xl px-3 py-3 text-sm font-medium text-[#5123d4] text-center">
                  {v}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="text-center mb-10">
              <p className="text-[#5123d4] text-sm font-semibold uppercase tracking-widest mb-3">Bundles</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Recommended Packages</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <div key={pkg.name} className="rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-all">
                  <div className={`bg-linear-to-r ${pkg.color} px-6 py-5`}>
                    <h3 className="font-bold text-white text-lg">{pkg.name}</h3>
                  </div>
                  <ul className="px-6 py-5 space-y-2.5">
                    {pkg.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5123d4] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="px-6 pb-5">
                    <Link href="/order/details" className="w-full inline-flex items-center justify-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery timing note */}
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
              <Clock className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">CAC Registration Processing Time</p>
                <p className="text-gray-600 text-sm mt-0.5">All CAC registrations take 15 – 30 working days to process. You will receive regular updates throughout.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0f0720] text-white text-center">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to place your order?</h2>
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
