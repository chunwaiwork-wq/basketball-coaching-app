"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { 
    href: "/dashboard/videos", 
    label: "Training Videos", 
    icon: "🎥"
  },
  { 
    href: "/dashboard/tracker", 
    label: "Drill Tracker", 
    icon: "✅"
  },
  { 
    href: "/bookings", 
    label: "Book Coaching", 
    icon: "📅"
  },
  { 
    href: "/dashboard/leads", 
    label: "Leads CRM", 
    icon: "📋"
  },
  { 
    href: "/dashboard/coaching", 
    label: "Coaching Slots", 
    icon: "📅"
  },
  { 
    href: "/dashboard/calendar", 
    label: "Calendar", 
    icon: "🔗"
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("studentId");
    const sname = localStorage.getItem("studentName");
    const coach = localStorage.getItem("isCoach");
    setIsCoach(coach === "true");

    // Admin-only routes that students should not access
    const adminRoutes = ["/dashboard/coaching", "/dashboard/calendar", "/dashboard/leads"];
    const isAdminRoute = adminRoutes.includes(pathname);

    if (!sid || !sname) {
      router.replace("/auth");
      return;
    }

    if (isAdminRoute && coach !== "true") {
      router.replace("/auth");
      return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white/[0.02] border-r border-white/[0.05] p-5">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏀</span>
            </div>
            <span className="text-lg font-bold text-white">413 OPENCOURT</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="text-sm px-3 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 border border-red-500/30 rounded-lg font-semibold tracking-wide transition-all"
          >
            ✕ Log out
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.filter(item => isCoach || !["/dashboard/leads", "/dashboard/coaching", "/dashboard/calendar"].includes(item.href)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-xs px-2 transition-colors">
          ← Back to Home
        </Link>
      </aside>

      {/* Mobile Header + Nav */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏀</span>
            <span className="font-bold text-white text-sm">413 OPENCOURT</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="text-xs px-2.5 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 rounded-lg font-semibold transition-all"
            >
              ✕ Log out
            </button>
          </div>
        </div>
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
          {navItems.filter(item => isCoach || !["/dashboard/leads", "/dashboard/coaching", "/dashboard/calendar"].includes(item.href)).map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium whitespace-nowrap">
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-[88px]">
        {children}
      </main>
    </div>
  );
}