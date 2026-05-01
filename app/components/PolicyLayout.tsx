import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Main Navbar */}
      <header className="w-full border-b border-gray-200 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-48 md:h-16 md:w-64">
              <Image
                src="/New Logo.jpeg"
                alt="computerservice.ng"
                fill
                className="object-contain object-left"
                priority
                quality={100}
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
            <Link href="/#services" className="hover:text-[#D1AFFF] transition-colors">Services</Link>
            <Link href="/terms" className="hover:text-[#D1AFFF] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-[#D1AFFF] transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-[#D1AFFF] transition-colors">Privacy Policy</Link>
          </nav>

          <Link
            href="/order/details"
            className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Sub-bar: back link + page title */}
      <div className="w-full border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          <div className="w-24" />
        </div>
      </div>

      <main className="flex-grow">
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
        <div className="bg-[#190934] text-white py-8">
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
