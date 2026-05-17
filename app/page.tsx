"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOrderStore } from "@/store/useOrderStore";
import RecallModal from "@/app/components/RecallModal";
import {
  ArrowRight,
  ChevronDown,
  Printer,
  Copy,
  Keyboard,
  Book,
  Scan,
  FileEdit,
  Palette,
  CreditCard,
  Monitor,
  Wrench,
  Layers,
  Check,
  Phone,
  Mail,
  ArrowUp,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { resetOrder } = useOrderStore();
  const [selectedService, setSelectedService] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recallModalOpen, setRecallModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState("+234 8166027757");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.phoneNumber) setContactPhone(d.phoneNumber); })
      .catch(() => {});
  }, []);

  // Clear any saved order so every homepage visit starts fresh
  useEffect(() => {
    resetOrder();
  }, [resetOrder]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const serviceCategoryMap: Record<string, string[]> = {
    "Printing": [
      "A4 Paper", "A3 Paper", "A5 Paper", "Legal Size", "Letter Size",
      "Photo Print", "Poster Print", "Banner Print", "Document", "Photos & Passport",
      "Business Materials", "Cards & Labels", "Event Prints"
    ],
    "Photocopy": [
      "A4 Photocopy", "A3 Photocopy", "A5 Photocopy",
      "Legal Size Photocopy", "Bulk Photocopy",
    ],
    "Hardcopy / Computer Pickup": [
      "Document Pickup", "Computer / Laptop Pickup", "Phone Pickup", "Other Device Pickup",
    ],
    "Typing": [
      "CV / Resume", "Cover Letter", "Application Letter",
      "School Assignment", "Report Writing", "Business Letter",
      "Proposal / Project", "Minutes of Meeting",
    ],
    "Binding": [
      "Spiral Binding", "Hardcover Binding", "Perfect Binding",
      "Comb Binding", "Thermal Binding", "Tape Binding",
    ],
    "Lamination": [
      "A4 Lamination", "A3 Lamination", "A5 Lamination",
      "ID Card Lamination", "Certificate Lamination",
      "Photo Lamination", "Bulk Lamination",
    ],
    "Scanning": [
      "Document Scanning", "Photo Scanning", "ID / Passport Scan",
      "Certificate Scan", "Bulk Document Scanning",
    ],
    "Document Conversion": [
      "Word to PDF", "PDF to Word", "Image to PDF",
      "PowerPoint to PDF", "Excel to PDF", "PDF to Excel",
      "Handwritten to Typed",
    ],
    "Graphic/Logo Design": [
      "Logo Design", "Flyer Design", "Banner / Flex Design",
      "Brochure Design", "Poster Design", "Social Media Graphic",
      "Certificate Design", "Letterhead Design",
    ],
    "Business Card / ID Card": [
      "Business Card", "Staff ID Card", "Student ID Card",
      "Event / Visitor Badge", "Name Tag",
    ],
    "Application Services": [
      "JAMB Registration", "WAEC / NECO Registration",
      "School / University Application", "Job Application",
      "Government Form Filling", "Scholarship Application",
      "NIN / BVN Registration", "CAC Registration",
    ],
    "Technical Support": [
      "Laptop Repair", "Phone Repair", "Software Installation",
      "Virus / Malware Removal", "Data Recovery",
      "Network & WiFi Setup", "Printer Setup & Repair",
      "OS Reinstallation",
    ],
  };

  const categoryPlaceholder: Record<string, string> = {
    "Printing": "Select paper size / type",
    "Photocopy": "Select paper size / type",
    "Typing": "Select document type",
    "Binding": "Select binding type",
    "Scanning": "Select scan type",
    "Document Conversion": "Select conversion type",
    "Graphic/Logo Design": "Select design type",
    "Business Card / ID Card": "Select card type",
    "Application Services": "Select application type",
    "Technical Support": "Select support type",
    "Lamination": "Select lamination type",
    "Hardcopy / Computer Pickup": "Select pickup type",
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
    setSelectedCategory("");
  };

  const getAvailableCategories = () => {
    if (!selectedService) return [];
    return serviceCategoryMap[selectedService] || [];
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const service      = formData.get("service")?.toString()      || "";
    const printType    = formData.get("printType")?.toString()    || "";
    const copies       = formData.get("copies")?.toString()       || "";
    const category     = formData.get("category")?.toString()     || "";
    const otherCategory = formData.get("otherCategory")?.toString() || "";

    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (printType && service === "Printing") params.set("printType", printType);
    if (copies && service === "Photocopy")   params.set("copies", copies);
    if (category === "Other" && otherCategory) {
      params.set("category", otherCategory);
    } else if (category) {
      params.set("category", category);
    }

    router.push(`/order/details?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <header className="w-full border-b border-gray-900 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start justify-center">
            <div className="relative h-12 w-44 sm:h-16 sm:w-56 md:h-20 md:w-72 shrink-0">
              <Image src="/Computer service PNG 111.png" alt="computerservice.ng" fill className="object-contain object-left" priority quality={100} />
            </div>
            <span className="self-end -mt-1 text-white text-[10px] sm:text-xs font-bold tracking-widest border border-white/25 rounded px-2 py-0.5 whitespace-nowrap">RC: 9511799</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white">
            <Link href="/" className="hover:text-[#D1AFFF] transition-colors">Home</Link>
            <Link href="#how-it-works" className="hover:text-[#D1AFFF] transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-[#D1AFFF] transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-[#D1AFFF] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-[#D1AFFF] transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-[#D1AFFF] transition-colors">Privacy Policy</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setRecallModalOpen(true)}
              className="hidden md:block bg-[#0047FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
            >
              Recall/Track
            </button>
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
            {[
              { label: "Home", href: "/" },
              { label: "How it Works", href: "#how-it-works" },
              { label: "Pricing", href: "/pricing" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Refund Policy", href: "/refund-policy" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white text-base font-medium transition-colors">
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); setRecallModalOpen(true); }}
              className="w-full bg-[#0047FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm text-left"
            >
              Recall/Track
            </button>
          </div>
        )}
      </header>

      <main className="grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 lg:px-8 py-10 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-5 sm:gap-6">
            <h1 className="text-3xl sm:text-4xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.1] lg:leading-[1.05] text-black">
              We Bring Computer Services to your doorstep.
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Request any document or computer services online and we will deliver quality result to you.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 sm:mt-4">
              <Link href="/order/details" className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-3 rounded-md font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#learn-more" className="bg-white border border-gray-300 text-black px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors text-center">
                Learn more
              </Link>
            </div>
          </div>
          <div className="relative w-full aspect-4/3 lg:aspect-auto lg:h-137.5">
            <Image src="/New Rider.jpeg" alt="Delivery Rider" fill className="object-contain lg:object-right" priority />
          </div>
        </section>

        {/* Services Section */}
        <section className="py-14 sm:py-20 bg-gray-50 border-y border-gray-100" id="services">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-3">Our Services</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Everything you need handled quickly, professionally, and delivered to you.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name: "Printing", icon: Printer, desc: "A4, A3, colour & B&W printing", iconBg: "bg-purple-50", iconColor: "text-[#5123d4]" },
                { name: "Photocopy", icon: Copy, desc: "Fast bulk or single photocopying", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { name: "Typing", icon: Keyboard, desc: "CVs, letters, assignments & more", iconBg: "bg-green-50", iconColor: "text-green-600" },
                { name: "Binding", icon: Book, desc: "Spiral, hardcover & comb binding", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
                { name: "Scanning", icon: Scan, desc: "Document & ID scanning services", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
                { name: "Document Conversion", icon: FileEdit, desc: "PDF, Word, Excel & more", iconBg: "bg-pink-50", iconColor: "text-pink-600" },
                { name: "Graphic/Logo Design", icon: Palette, desc: "Logos, flyers & banners", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
                { name: "Business Card / ID Card", icon: CreditCard, desc: "Business & staff ID cards", iconBg: "bg-teal-50", iconColor: "text-teal-600" },
                { name: "Application Services", icon: Monitor, desc: "JAMB, WAEC, NIN & more", iconBg: "bg-red-50", iconColor: "text-red-500" },
                { name: "Technical Support", icon: Wrench, desc: "Laptop repair, software & setup", iconBg: "bg-cyan-50", iconColor: "text-cyan-600" },
                { name: "Lamination", icon: Layers, desc: "A4, A3, ID card & photo lamination", iconBg: "bg-violet-50", iconColor: "text-violet-600" },
              ].map((service, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:border-[#5123d4]/30 hover:shadow-md transition-all cursor-pointer flex flex-col">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${service.iconBg}`}>
                    <service.icon className={`w-6 h-6 ${service.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-black mb-1.5 leading-tight">{service.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 bg-white" id="how-it-works">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16">How It works</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
              {[
                {
                  num: "1",
                  title: "Request Your Service",
                  desc: "Select or type your request, choose a template or upload your document."
                },
                {
                  num: "2",
                  title: "We prepare & Price it",
                  desc: "Our system reviews your request and generates a structured version with a clear price."
                },
                {
                  num: "3",
                  title: "You Review & Approve",
                  desc: "You preview your document and approve or change request or edit document.",
                  actions: true
                },
                {
                  num: "4",
                  title: "Confirm and pay",
                  desc: "You confirm your document and make payment"
                },
                {
                  num: "5",
                  title: "We Deliver or Submit",
                  desc: "We deliver the project to your email or doorstep"
                },

              ].map((step, idx) => (
                <div key={idx} className="bg-[#f8f5ff] p-6 rounded-xl flex flex-col h-full border border-purple-50">
                  <div className="w-8 h-8 bg-[#5123d4] text-white rounded-full flex items-center justify-center font-bold text-sm mb-6 shrink-0">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-black mb-3 text-sm lg:text-base">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed grow">
                    {step.desc}
                  </p>
                  {step.actions && (
                    <div className="mt-6 pt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1 text-sm text-black">
                        Approve <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-sm text-black">
                        Request Change
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Get Started Form Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-176 flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-[2rem] font-bold mb-3 text-black">Get started</h2>
            <p className="text-gray-500 mb-12">Tell us what you need and we will take care of the rest</p>
            
            <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-5">
              <div className="relative">
                <select
                  name="service"
                  required
                  title="Select a service"
                  value={selectedService}
                  onChange={handleServiceChange}
                  onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("Please select a service.")}
                  onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                  className="w-full appearance-none bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] cursor-pointer"
                >
                  <option value="" disabled>What do you want</option>
                  <option value="Printing">Printing</option>
                  <option value="Photocopy">Photocopy</option>
                  <option value="Typing">Typing</option>
                  <option value="Binding">Binding</option>
                  <option value="Scanning">Scanning</option>
                  <option value="Document Conversion">Document Conversion</option>
                  <option value="Graphic/Logo Design">Graphic/Logo Design</option>
                  <option value="Business Card / ID Card">Business Card / ID Card</option>
                  <option value="Application Services">Application Services</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Hardcopy / Computer Pickup">Hardcopy / Computer Pickup</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>

              {/* Color option — shown when Printing is selected */}
              {selectedService === "Printing" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <select
                    name="printType"
                    required
                    title="Select print colour"
                    defaultValue="Black and White"
                    onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("Please select a color option.")}
                    onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                    className="w-full appearance-none bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] cursor-pointer border border-[#5123d4]/30"
                  >
                    <option value="" disabled>Select color option</option>
                    <option value="Black and White">Black and White</option>
                    <option value="Colored">Colored</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              )}

              {/* Copies — shown when Photocopy is selected */}
              {selectedService === "Photocopy" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="number"
                    name="copies"
                    required
                    min={1}
                    placeholder="How many copies?"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Please enter the number of copies.")}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                    className="w-full bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] placeholder:text-gray-500 border border-[#5123d4]/30"
                  />
                </div>
              )}
              
              <div className="relative">
                <select
                  name="category"
                  required
                  title="Select a service category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity("Please select a service category.")}
                  onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity("")}
                  disabled={!selectedService}
                  className="w-full appearance-none bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>{selectedService ? categoryPlaceholder[selectedService] : "Select a service category"}</option>
                  {getAvailableCategories().map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>

              {selectedCategory === "Other" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text"
                    name="otherCategory"
                    required
                    placeholder="Please specify your service category..."
                    className="w-full bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] placeholder:text-gray-500 border border-[#5123d4]/30"
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Please describe your service category.")}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                    autoFocus
                  />
                </div>
              )}

              <div className="pt-6">
                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-10 py-3.5 rounded font-medium text-base transition-colors">
                  Proceed <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 text-center">

            {/* Partner logos — above heading */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            >
              {[
                { src: "/deallock-logo.jpg",          alt: "Deallock"       },
                { src: "/idcode-logo.jpg",             alt: "Idcode"         },
                { src: "/vasset-logo.jpg",             alt: "Vasset"         },
                { src: "/adetek-logo.jpg",             alt: "Adetek"         },
                { src: "/waju-dynamics-logo.jpg",      alt: "Waju Dynamics"  },
                { src: "/submitar-logo.png",           alt: "Submitar"       },
                { src: "/Scancodes logo.JPG.jpeg",     alt: "Scancodes"      },
              ].map(({ src, alt }) => (
                <motion.div
                  key={alt}
                  className="relative h-16 w-32 sm:h-20 sm:w-40 lg:h-24 lg:w-48"
                  variants={{
                    hidden:  { opacity: 0, y: 24, scale: 0.9 },
                    visible: { opacity: 1, y: 0,  scale: 1,
                      transition: { type: "spring", stiffness: 200, damping: 18 } },
                  }}
                  whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 300, damping: 15 } }}
                >
                  <Image src={src} alt={alt} fill className="object-contain" />
                </motion.div>
              ))}
            </motion.div>

            <h2 className="text-2xl sm:text-[2rem] font-bold mb-4 sm:mb-6 text-black">Our Partners</h2>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg">
              Join our network of trusted partners and help us deliver exceptional computer services across the country.
            </p>

            <Link
              href="/partners/onboarding"
              className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 sm:px-10 py-3.5 rounded font-medium inline-flex items-center gap-2 transition-colors text-base shadow-sm"
            >
              Become a Partner <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Scroll To Top Button (Left Side) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 p-3 bg-[#5123d4] text-white rounded-full shadow-lg hover:bg-[#401AA0] transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="w-full">
        {/* Main Footer Content */}
        <div className="bg-black border-t border-gray-900 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Logo + Social Icons Row */}
            <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="relative h-16 w-48 sm:h-20 sm:w-64 lg:h-24 lg:w-80">
                <Image src="/Computer service PNG 111.png" alt="computerservice.ng" fill className="object-contain object-left" quality={100} />
              </div>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a href="https://x.com/computersvc_ng" target="_blank" rel="noopener noreferrer" title="Follow us on X (Twitter)" className="w-7 h-7 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://instagram.com/computerservice.ng" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram" className="w-7 h-7 rounded-full bg-linear-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/share/18vPYjyrLJ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook" className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/${contactPhone.replace(/[\s+]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat with us on WhatsApp"
                  className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-10">
              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Secure and Reliable</h4>
                <p className="text-xs text-white/70 leading-relaxed max-w-50">
                  Fast, reliable computer services delivered to your doorstep.
                  From printing to tech support—we handle everything for you.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Quick Links</h4>
                <ul className="flex flex-col gap-2 text-xs text-white/70">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Our Services</h4>
                <ul className="flex flex-col gap-2 text-xs text-white/70">
                  <li>Printing &amp; Photocopy</li>
                  <li>Binding &amp; Laminating</li>
                  <li>Application Filling</li>
                  <li>Document Design</li>
                  <li>Business &amp; ID Cards</li>
                  <li>Tech Support</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Why Choose Us</h4>
                <ul className="flex flex-col gap-2 text-xs text-white/70">
                  <li>&#10004; Fast turnaround</li>
                  <li>&#10004; Doorstep delivery</li>
                  <li>&#10004; Reliable &amp; secure handling</li>
                  <li>&#10004; No stress, no movement</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Legal</h4>
                <ul className="flex flex-col gap-2 text-xs text-white/70">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Contact</h4>
                <ul className="flex flex-col gap-3 text-xs text-white/70">
                  <li>
                    <a href="mailto:support@computerservice.ng" className="flex items-center gap-2 hover:text-white transition-colors underline underline-offset-2 decoration-white/40 hover:decoration-white">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      support@computerservice.ng
                    </a>
                  </li>
                  <li>
                    <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {contactPhone}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom Bar */}
        <div className="bg-[#190934] text-white py-3 border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 text-xs font-medium text-center">
            <p className="text-[#D1AFFF]">©2026 computerservice.ng All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Recall Modal */}
      <RecallModal
        isOpen={recallModalOpen}
        onClose={() => setRecallModalOpen(false)}
        onVerified={() => {
          router.push("/order/details");
        }}
      />

      {/* Partner Modal */}
    </div>
  );
}
