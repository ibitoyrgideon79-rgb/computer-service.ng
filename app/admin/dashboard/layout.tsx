"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, ExternalLink, Settings, Package, Users } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      window.location.href = "/admin/login";
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("admin_token");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const navLinks = [
    { href: "/admin/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/dashboard/orders",   icon: Package,         label: "Orders"    },
    { href: "/admin/dashboard/partners", icon: Users,           label: "Partners"  },
    { href: "/admin/dashboard/settings", icon: Settings,        label: "Settings"  },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <aside className="group w-16 lg:w-56 shrink-0 bg-[#0f0720] flex flex-col fixed inset-y-0 left-0 z-30 transition-[width] duration-200">
        {/* Logo */}
        <div className="px-3 lg:px-4 py-5 border-b border-white/10 flex items-center justify-center lg:justify-start">
          <div className="relative h-8 w-8 lg:h-10 lg:w-40">
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
        <nav className="grow px-2 lg:px-3 py-4 space-y-1">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors justify-center lg:justify-start ${
                  active
                    ? "bg-[#5123d4] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-2 lg:px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            title="Visit Site"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors justify-center lg:justify-start"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Visit Site</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors justify-center lg:justify-start"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="grow ml-16 lg:ml-56 min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}
