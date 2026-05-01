"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-[#0f0720] flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="relative h-10 w-40">
            <Image
              src="/Computer service PNG 111.png"
              alt="computerservice.ng"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow px-3 py-4 space-y-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#5123d4] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-grow ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
