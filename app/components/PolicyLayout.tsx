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
      {/* Navbar */}
      <header className="w-full border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-lg font-bold text-black">{title}</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 max-w-4xl">
          <div className="mb-8">
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
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
            <p>©2026 computerservice.ng All right reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">About Us</Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/refund-policy" className="text-white/70 hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
