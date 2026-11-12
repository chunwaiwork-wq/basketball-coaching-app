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
  { 
    href: "/dashboard/admin", 
    label: "Coach Admin", 
    icon: "👑"
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    const sid = localStorage.getItem("studentId");
    const sname = localStorage.getItem("studentName");
    const uname = localStorage.getItem("userName");
    const coach = localStorage.getItem("isCoach");
    setIsCoach(coach === "true");

    // Admin-only routes that students should not access
    const adminRoutes = ["/dashboard/coaching", "/dashboard/calendar", "/dashboard/leads", "/dashboard/admin"];
    const isAdminRoute = adminRoutes.includes(pathname);

    // Allow either a userId (email/Google login) or a studentId (PIN login)
    if ((!uid && !sid) || (!uname && !sname)) {
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
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#E07B3C]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#E9DFC9]/[0.02] border-r border-[#E9DFC9]/[0.05] p-5">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C65A24] to-[#A34717] rounded-xl flex items-center justify-center">
              <span className="text-lg">🏀</span>
            </div>
            <span className="text-lg font-bold text-[#E9DFC9]">413 OPENCOURT</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="text-sm px-3 py-1.5 bg-[#C65A24] text-[#E9DFC9] hover:bg-[#A34717] border border-[#C65A24] rounded-lg font-semibold tracking-wide transition-all"
          >
            ✕ Log out
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.filter(item => isCoach || !["/dashboard/leads", "/dashboard/coaching", "/dashboard/calendar", "/dashboard/admin"].includes(item.href)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? "bg-[#C65A24]/10 text-[#E07B3C] border border-[#C65A24]/20" 
                    : "text-[#E9DFC9]/70 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.05]"
                }`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="flex items-center gap-2 text-[#E9DFC9]/55 hover:text-[#E9DFC9]/85 text-xs px-2 transition-colors">
          ← Back to Home
        </Link>
      </aside>

      {/* Mobile Header + Nav */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-[#171717]/90 backdrop-blur-xl border-b border-[#E9DFC9]/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏀</span>
            <span className="font-bold text-[#E9DFC9] text-sm">413 OPENCOURT</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="text-xs px-2.5 py-1.5 bg-[#C65A24]/20 text-[#E07B3C] hover:bg-[#C65A24]/30 border border-[#C65A24]/40 rounded-lg font-semibold transition-all"
            >
              ✕ Log out
            </button>
          </div>
        </div>
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
          {navItems.filter(item => isCoach || !["/dashboard/leads", "/dashboard/coaching", "/dashboard/calendar", "/dashboard/admin"].includes(item.href)).map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#E9DFC9]/70 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.08] transition-all text-xs font-medium whitespace-nowrap">
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