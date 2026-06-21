"use client";
import Link from "next/link";

const navItems = [
  { 
    href: "/videos", 
    label: "Training Videos", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    href: "/tracker", 
    label: "Drill Tracker", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  { 
    href: "/bookings", 
    label: "Book Coaching", 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/[0.02] border-r border-white/[0.05] p-6">
        {/* Logo + Logout */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏀</span>
            </div>
            <span className="text-lg font-bold text-white">413 OPENCOURT</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("studentId");
              localStorage.removeItem("studentName");
              localStorage.removeItem("isCoach");
              window.location.href = "/";
            }}
            className="text-sm px-3 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 border border-red-500/30 rounded-lg font-semibold tracking-wide transition-all"
          >
            ✕ Log out
          </button>
        </div>

        {/* Nav Items */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer group">
                <span className="group-hover:text-blue-400 transition-colors">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-6 border-t border-white/[0.05]">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile Header + Nav */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏀</span>
            <span className="font-bold text-white">413 OPENCOURT</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("studentId");
              localStorage.removeItem("studentName");
              localStorage.removeItem("isCoach");
              window.location.href = "/";
            }}
            className="text-xs px-2.5 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 rounded-lg font-semibold transition-all"
          >
            ✕ Log out
          </button>
        </div>
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium whitespace-nowrap">
                <span className="shrink-0">{item.icon}</span>
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