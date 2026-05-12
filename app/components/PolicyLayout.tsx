"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="w-full border-b border-gray-900 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-end gap-2 sm:gap-3">
            <div className="relative h-12 w-44 sm:h-16 sm:w-56 md:h-20 md:w-72 shrink-0">
              <Image
                src="/Computer service PNG 111.png"
                alt="computerservice.ng"
                fill
                className="object-contain object-left"
                priority
                quality={100}
              />
            </div>
            <span className="mb-1 text-white text-[10px] sm:text-xs font-bold tracking-widest border border-white/25 rounded px-2 py-0.5 whitespace-nowrap">
              RC: 9511799
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-[#D1AFFF] transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/order/tracking"
              className="hidden md:block bg-[#0047FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
            >
              Track Order
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1.5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 px-4 py-6 flex flex-col gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white text-base font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/order/tracking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm text-left"
            >
              Track Order
            </Link>
          </div>
        )}
      </header>

      <main className="grow">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">{title}</h1>
            <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12">
        <div className="bg-[#190934] text-white py-3">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs">
            <p className="text-[#D1AFFF]">©2026 computerservice.ng All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/refund-policy" className="text-white/70 hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
