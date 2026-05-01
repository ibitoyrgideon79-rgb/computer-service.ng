"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Printer, Copy, Keyboard, Book, Scan, FileEdit,
  Palette, CreditCard, Monitor, Wrench, ArrowRight, ArrowLeft, Menu, X,
} from "lucide-react";

const SERVICES = [
  {
    name: "Printing",
    icon: Printer,
    iconBg: "bg-purple-50",
    iconColor: "text-[#5123d4]",
    desc: "Professional printing on A4, A3, A5, legal & custom sizes. Black & white or full colour.",
    categories: ["A4 Paper", "A3 Paper", "A5 Paper", "Photo Print", "Poster / Banner", "Business Materials", "Cards & Labels", "Event Prints"],
    cta: "/order/details?service=Printing",
  },
  {
    name: "Photocopy",
    icon: Copy,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    desc: "Fast single or bulk photocopying in all standard sizes. Same-day service available.",
    categories: ["A4 Photocopy", "A3 Photocopy", "A5 Photocopy", "Legal Size", "Bulk Photocopy"],
    cta: "/order/details?service=Photocopy",
  },
  {
    name: "Typing",
    icon: Keyboard,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    desc: "Professional typing for CVs, cover letters, assignments, business letters, and more.",
    categories: ["CV / Resume", "Cover Letter", "Application Letter", "School Assignment", "Report Writing", "Proposal / Project"],
    cta: "/order/details?service=Typing",
  },
  {
    name: "Binding",
    icon: Book,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    desc: "Quality binding solutions for documents, theses, reports, and presentations.",
    categories: ["Spiral Binding", "Hardcover Binding", "Perfect Binding", "Comb Binding", "Thermal Binding"],
    cta: "/order/details?service=Binding",
  },
  {
    name: "Scanning",
    icon: Scan,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    desc: "High-resolution document, photo, ID and certificate scanning. Delivered digitally.",
    categories: ["Document Scanning", "Photo Scanning", "ID / Passport Scan", "Certificate Scan", "Bulk Scanning"],
    cta: "/order/details?service=Scanning",
  },
  {
    name: "Document Conversion",
    icon: FileEdit,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    desc: "Convert documents between formats: PDF, Word, Excel, PowerPoint, and more.",
    categories: ["Word to PDF", "PDF to Word", "Image to PDF", "Excel to PDF", "Handwritten to Typed"],
    cta: "/order/details?service=Document+Conversion",
  },
  {
    name: "Graphic / Logo Design",
    icon: Palette,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    desc: "Creative designs for logos, flyers, banners, brochures, social media graphics, and more.",
    categories: ["Logo Design", "Flyer Design", "Banner / Flex Design", "Brochure Design", "Poster Design", "Social Media Graphic"],
    cta: "/order/details?service=Graphic%2FLogo+Design",
  },
  {
    name: "Business Card / ID Card",
    icon: CreditCard,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    desc: "Custom business cards, staff and student ID cards, event badges, and name tags.",
    categories: ["Business Card", "Staff ID Card", "Student ID Card", "Event / Visitor Badge", "Name Tag"],
    cta: "/order/details?service=Business+Card+%2F+ID+Card",
  },
  {
    name: "Application Services",
    icon: Monitor,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    desc: "We handle JAMB, WAEC, NIN, BVN, CAC, school & government form applications for you.",
    categories: ["JAMB Registration", "WAEC / NECO Registration", "School Application", "NIN / BVN Registration", "CAC Registration"],
    cta: "/order/details?service=Application+Services",
  },
  {
    name: "Technical Support",
    icon: Wrench,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
    desc: "Laptop & phone repairs, software installation, virus removal, and network setup.",
    categories: ["Laptop Repair", "Phone Repair", "Software Installation", "Virus Removal", "Data Recovery", "OS Reinstallation"],
    cta: "/order/details?service=Technical+Support",
  },
];

export default function ServicesPage() {
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
            <Link href="/services" className="text-[#D1AFFF]">Services</Link>
            <Link href="#how-it-works" className="hover:text-[#D1AFFF] transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-[#D1AFFF] transition-colors">Pricing</Link>
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
            <p className="text-[#D1AFFF] text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Services</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Everything you need, printed, typed, designed, bound, or delivered, handled professionally and brought to your doorstep.
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((service) => (
                <div
                  key={service.name}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#5123d4]/30 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.iconBg}`}>
                      <service.icon className={`w-6 h-6 ${service.iconColor}`} />
                    </div>
                    <h2 className="font-bold text-lg text-black leading-tight">{service.name}</h2>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{service.desc}</p>

                  <div className="flex flex-wrap gap-1.5 mb-6 flex-grow">
                    {service.categories.map((cat) => (
                      <span key={cat} className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={service.cta}
                    className="mt-auto inline-flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Order Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0f0720] text-white text-center">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Not sure which service you need?</h2>
            <p className="text-white/60 mb-8">Just tell us what you want and we will figure out the rest for you.</p>
            <Link href="/order/details" className="inline-flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-3.5 rounded-lg font-medium text-base transition-colors shadow-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="bg-[#190934] text-white py-3 border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 text-xs font-medium text-center">
          <p className="text-[#D1AFFF]">©2026 computerservice.ng All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
