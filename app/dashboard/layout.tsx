"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    href: "/dashboard/leads", 
    label: "Leads CRM", 
    icon: "📋"
  },
  { 
    href: "/dashboard/coaching", 
    label: "Coaching Slots", 
    icon: "📅"
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white/[0.02] border-r border-white/[0.05] p-5">
        <Link href="/" className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-lg">🏀</span>
          </div>
          <span className="text-lg font-bold text-white">COACH PRO</span>
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏀</span>
          <span className="font-bold text-white text-sm">COACH PRO</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed top-12 w-full z-40 bg-black/95 backdrop-blur-xl border-b border-white/5 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-white">
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-12">
        {children}
      </main>
    </div>
  );
}