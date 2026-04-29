"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useOrderStore } from "@/store/useOrderStore";
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
  Check,
  Phone,
  Mail,
  MapPin,
  ArrowUp
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { loadFromLocalStorage } = useOrderStore();
  const [selectedService, setSelectedService] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load saved order data on page load
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

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
    "Printing": ["Printing", "Photocopy", "Scanning"],
    "Photocopy": ["Photocopy", "Printing"],
    "Typing": ["Typing", "Document Conversion"],
    "Binding": ["Binding", "Hardcover Binding"],
    "Scanning": ["Scanning", "Document Conversion"],
    "Document Conversion": ["Document Conversion", "Typing"],
    "Graphic/Logo Design": ["Graphic/Logo Design", "Business Card / ID Card"],
    "Business Card / ID Card": ["Business Card / ID Card", "Graphic/Logo Design"],
    "Application Services": ["Application Services", "Typing", "Document Conversion"],
    "Technical Support": ["Technical Support"],
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
    setSelectedCategory(""); // Reset category when service changes
  };

  const getAvailableCategories = () => {
    if (!selectedService) return [];
    return serviceCategoryMap[selectedService] || [];
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const service = formData.get("service")?.toString() || "";
    const printType = formData.get("printType")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const otherCategory = formData.get("otherCategory")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (printType && service === "Printing") params.set("printType", printType);
    // If 'Other' is selected, pass the custom written category instead
    if (category === "Other" && otherCategory) {
      params.set("category", otherCategory);
    } else if (category) {
      params.set("category", category);
    }
    if (location) params.set("location", location);
    
    router.push(`/order/details?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <header className="w-full border-b border-gray-900 sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 lg:px-8 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-60 md:h-20 md:w-80">
              <Image src="/New Logo.jpeg" alt="computerservice.ng" fill className="object-contain object-left" priority quality={100} />
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
            <Link href="#services" className="hover:text-[#D1AFFF]">Services</Link>
            <Link href="#how-it-works" className="hover:text-[#D1AFFF]">How it Works</Link>
            <Link href="#pricing" className="hover:text-[#D1AFFF]">Pricing</Link>
            <Link href="/terms" className="hover:text-[#D1AFFF]">Terms & Conditions</Link>
            <Link href="/refund-policy" className="hover:text-[#D1AFFF]">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-[#D1AFFF]">Privacy Policy</Link>
          </nav>
          
          <div>
            <Link href="/order/details" className="bg-[#0047FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm">
              Recall
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <h1 className="text-5xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-black">
              We Bring Computer Services to your doorstep.
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Request any document or computer services online and we will deliver quality result to you.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link href="/order/details" className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-8 py-3 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#learn-more" className="bg-white border border-gray-300 text-black px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
                Learn more
              </Link>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[550px]">
            <Image src="/rider.png" alt="Delivery Rider" fill className="object-contain lg:object-right" priority />
          </div>
        </section>

        {/* Services Icons Row */}
        <section className="border-y border-gray-100 bg-white py-12" id="services">
          <div className="container mx-auto px-4 lg:px-8 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
            <div className="flex items-center justify-between min-w-max gap-8 lg:gap-4">
              {[
                { name: "Printing", icon: Printer },
                { name: "Photocopy", icon: Copy },
                { name: "Typing", icon: Keyboard },
                { name: "Binding", icon: Book },
                { name: "Scanning", icon: Scan },
                { name: "Document\nConversion", icon: FileEdit },
                { name: "Graphic/\nLogo Design", icon: Palette },
                { name: "Business Card /\nID Card", icon: CreditCard },
                { name: "Application\nServices", icon: Monitor },
                { name: "Technical\nSupport", icon: Wrench },
              ].map((service, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4 w-[100px]">
                  <service.icon className="w-9 h-9 text-black stroke-[1.5]" />
                  <span className="text-xs text-center font-medium text-black whitespace-pre-line leading-relaxed">
                    {service.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white" id="how-it-works">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">How It works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  num: "1",
                  title: "Request Your Service",
                  desc: "Type your request, choose a template or upload your document."
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
                  desc: "We deliver or submit your job and handle submission through submittal."
                }
              ].map((step, idx) => (
                <div key={idx} className="bg-[#f8f5ff] p-6 rounded-xl flex flex-col h-full border border-purple-50">
                  <div className="w-8 h-8 bg-[#5123d4] text-white rounded-full flex items-center justify-center font-bold text-sm mb-6 shrink-0">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-black mb-3 text-sm lg:text-base">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">
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
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-[44rem] flex flex-col items-center text-center">
            <h2 className="text-[2rem] font-bold mb-3 text-black">Get started</h2>
            <p className="text-gray-500 mb-12">Tell us what you need and we will take care of the rest</p>
            
            <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-5">
              <div className="relative">
                <select 
                  name="service" 
                  required 
                  value={selectedService}
                  onChange={handleServiceChange}
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
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>

              {selectedService === "Printing" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <select 
                    name="printType" 
                    required 
                    defaultValue="Black and White"
                    className="w-full appearance-none bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] cursor-pointer border border-[#5123d4]/30"
                  >
                    <option value="" disabled>Select color option</option>
                    <option value="Black and White">Black and White</option>
                    <option value="Colored">Colored</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              )}
              
              <div className="relative">
                <select 
                  name="category" 
                  required 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!selectedService}
                  className="w-full appearance-none bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Select a service category</option>
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
                    autoFocus
                  />
                </div>
              )}

              <input 
                type="text" 
                name="location"
                required
                placeholder="Where should we deliver?" 
                className="w-full bg-[#E2E8F0] text-gray-800 text-base font-medium px-6 py-5 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4] placeholder:text-gray-800"
              />

              <div className="pt-6">
                <button type="submit" className="inline-flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white px-10 py-3.5 rounded font-medium text-base transition-colors">
                  Proceed <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-[2rem] font-bold mb-6 text-black">Our Partners</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto text-lg">
              Join our network of trusted partners and help us deliver exceptional computer services across the country.
            </p>
            
            <div className="mt-8">
              <Link href="/become-partner" className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-10 py-3.5 rounded font-medium inline-flex items-center gap-2 transition-colors text-base shadow-sm">
                Become a Partner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll To Top Button (Left Side) */}
      {showScrollTop && (
        <button 
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
            {/* Logo Section */}
            <div className="mb-12 flex justify-start">
              <div className="relative h-20 w-80">
                <Image src="/New Logo.jpeg" alt="computerservice.ng" fill className="object-contain object-left" quality={100} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Secure and Reliable</h4>
                <p className="text-xs text-white/70 leading-relaxed mb-8 max-w-[200px]">
                  Your data and files are safe with us.
                </p>
                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  <a href="#" className="w-7 h-7 rounded-full bg-transparent border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  {/* Tiktok Icon custom SVG */}
                  <a href="#" className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors">
                     <svg className="w-3 h-3 text-white" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                       <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"/>
                     </svg>
                  </a>
                  <a href="#" className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Fast Turnaround</h4>
                <p className="text-xs text-white/70 leading-relaxed max-w-[200px]">
                  Your data and files are safe with us.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Quality Guaranteed</h4>
                <p className="text-xs text-white/70 leading-relaxed max-w-[200px]">
                  Your data and files are safe with us.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-4 text-white">Contact</h4>
                <div className="flex flex-col gap-4 text-xs text-white/70">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-white/60" />
                    <span>+234 8035671112</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span>support@computerservice.ng</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-white/60" />
                    <span>Abuja, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom Bar */}
        <div className="bg-black text-white py-6">
          <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs font-medium">
            <p>©2026 computerservice.ng All right reserved.</p>
            <div className="flex items-center gap-8 mt-4 md:mt-0">
              <Link href="/about" className="hover:text-[#D1AFFF] transition-colors">About Us</Link>
              <Link href="/terms" className="hover:text-[#D1AFFF] transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-[#D1AFFF] transition-colors">Privacy policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
