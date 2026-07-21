"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const GROUP_CLASSES = [
  { name: "Drop-in Session", detail: "1 session, single class", price: "S$40", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$140", per: "/ mth (S$35 / session)", highlight: false },
  { name: "Term Pack (12 sessions)", detail: "1x per week, ~3 months, best value", price: "S$390", per: "/ term (S$32.50 / session)", highlight: true },
];

const SEMI_PRIVATE = [
  { name: "Drop-in Session", detail: "1 session, 3–5 players", price: "S$65", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$240", per: "/ mth (S$60 / session)", highlight: false },
];

const PRIVATE_1TO1 = [
  { name: "Single Session", detail: "1 hour, 1-to-1", price: "S$95", per: "/ hr" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$340", per: "/ mth (S$85 / session)", highlight: false },
  { name: "Term Pack (12 sessions)", detail: "1x per week, ~3 months, best value", price: "S$960", per: "/ term (S$80 / session)", highlight: true },
];

const GOOD_TO_KNOW = [
  "Packages are billed upfront; sessions expire 6 weeks after purchase date.",
  "Reschedules with 24hrs notice are free; no-shows forfeit the session.",
  "Rained-out outdoor sessions are rescheduled at no charge.",
  "Sibling discount: 10% off a second child on any monthly or term pack.",
];

function PricingTable({ title, emoji, items, accentColor }: { title: string; emoji: string; items: typeof GROUP_CLASSES; accentColor: string }) {
  const isGreen = accentColor === "green";
  const isBlue = accentColor === "blue";
  const isPurple = accentColor === "purple";

  const borderColor = isGreen ? "border-green-500/30" : isBlue ? "border-blue-500/30" : "border-purple-500/30";
  const headerBg = isGreen ? "from-green-900/40 to-green-800/20" : isBlue ? "from-blue-900/40 to-blue-800/20" : "from-purple-900/40 to-purple-800/20";

  return (
    <div className={`rounded-2xl border ${borderColor} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${headerBg} px-6 py-4`}>
        <h2 className="text-lg font-bold text-white">{emoji} {title}</h2>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {items.map((item, i) => (
          <div key={i} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${item.highlight ? "bg-white/[0.03]" : ""}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">{item.name}</span>
                {item.highlight && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">BEST VALUE</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{item.detail}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-2xl font-black text-white">{item.price}</span>
              <span className="text-sm text-gray-400 ml-1">{item.per}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RatesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Simple Nav */}
      <nav className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            ← Back to Home
          </Link>
          <span className="text-sm font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            413 OPEN COURT
          </span>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kids Basketball Coaching • Singapore</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            2026 Kids Basketball Coaching
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Structured, values-driven basketball coaching for kids aged 6–16. Every player gets a Player Card that tracks drills, homework and progress.
          </p>
        </motion.div>
      </header>

      {/* Pricing Tables */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        {/* Group Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PricingTable
            title="GROUP CLASSES (up to 8 players)"
            emoji="🏀"
            accentColor="green"
            items={GROUP_CLASSES}
          />
        </motion.div>

        {/* Semi-Private */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PricingTable
            title="SEMI-PRIVATE (3–5 players)"
            emoji="👥"
            accentColor="blue"
            items={SEMI_PRIVATE}
          />
        </motion.div>

        {/* Private 1-to-1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PricingTable
            title="PRIVATE 1-TO-1 COACHING"
            emoji="🎯"
            accentColor="purple"
            items={PRIVATE_1TO1}
          />
        </motion.div>

        {/* Free Trial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl p-6 text-center"
        >
          <p className="text-2xl mb-1">🎁</p>
          <h2 className="text-xl font-bold text-green-400">NEW PLAYER TRIAL — FREE</h2>
          <p className="text-gray-300 mt-1">One group session, completely free. No commitment, no payment details needed.</p>
          <a
            href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20a%20free%20trial%20session%20🔥"
            target="_blank"
            className="inline-block mt-4 px-6 py-3 bg-green-500/20 border border-green-500/40 rounded-full text-sm font-semibold text-green-400 hover:bg-green-500/30 transition-all"
          >
            Book Free Trial →
          </a>
        </motion.div>

        {/* Good to Know */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border border-white/[0.08] rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">📌 Good to Know</h2>
          <ul className="space-y-2">
            {GOOD_TO_KNOW.map((tip, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-gray-500 mb-4">Ready to get started?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20a%20free%20trial%20🔥"
              target="_blank"
              className="px-8 py-3 bg-white/10 border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
            >
              📱 Book via WhatsApp
            </a>
            <a
              href="https://www.instagram.com/413opencourt/"
              target="_blank"
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10 transition-all"
            >
              📸 DM on Instagram
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-gray-600">
        <p>© 2026 413 OpenCourt Pte. Ltd. &nbsp;|&nbsp; UEN 202607219E</p>
      </footer>
    </div>
  );
}
