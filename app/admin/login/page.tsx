"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Zap, BarChart3 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  const features = [
    { icon: Zap,        text: "Live order updates as they arrive" },
    { icon: BarChart3,  text: "Revenue analytics & performance stats" },
    { icon: Shield,     text: "Secure, role-protected access" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#0f0720] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(81,35,212,0.35) 0%, transparent 55%), " +
              "radial-gradient(ellipse at 80% 10%, rgba(139,92,246,0.25) 0%, transparent 45%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="relative h-14 w-56">
            <Image
              src="/Computer service PNG 111.png"
              alt="computerservice.ng"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Manage every order<br />in real time.
            </h1>
            <p className="text-white/55 text-base leading-relaxed">
              Track orders, update statuses, and keep customers happy — all from one secure dashboard.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#5123d4]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#D1AFFF]" />
                </span>
                <span className="text-white/70 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/25 text-xs">©2026 computerservice.ng</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="relative h-12 w-48">
              <Image src="/Computer service PNG 111.png" alt="computerservice.ng" fill className="object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-1">Admin Sign In</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@computerservice.ng"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] focus:border-transparent pr-11 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Secure Admin Access — authorised personnel only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
