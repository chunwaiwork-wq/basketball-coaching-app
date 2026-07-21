"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

// --- KIDS PRICING (Ages 6–16) ---
const KIDS_GROUP = [
  { name: "Drop-in Session", detail: "1 session, single class", price: "S$40", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$140", per: "/ mth (S$35 / session)", highlight: false },
  { name: "Term Pack (12 sessions)", detail: "1x per week, ~3 months, best value", price: "S$390", per: "/ term (S$32.50 / session)", highlight: true },
];

const KIDS_SEMI = [
  { name: "Drop-in Session", detail: "1 session, 3–5 players", price: "S$65", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$240", per: "/ mth (S$60 / session)" },
];

const KIDS_PRIVATE = [
  { name: "Single Session", detail: "1 hour, 1-to-1", price: "S$95", per: "/ hr" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$340", per: "/ mth (S$85 / session)" },
  { name: "Term Pack (12 sessions)", detail: "1x per week, ~3 months, best value", price: "S$960", per: "/ term (S$80 / session)", highlight: true },
];

// --- ADULT PRICING (Ages 17+) ---
const ADULT_PRIVATE = [
  { name: "Drop-in Session", detail: "1 hour, 1-to-1", price: "S$60", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly", price: "S$220", per: "/ mth (S$55 / session)" },
  { name: "Term Pack (8 sessions)", detail: "1x per week, ~2 months, best value", price: "S$450", per: "/ term (S$56.25 / session)", highlight: true },
];

const ADULT_SEMI = [
  { name: "Drop-in Session", detail: "1 session, 2–3 players, per person", price: "S$40", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly, per person", price: "S$140", per: "/ mth (S$35 / session)" },
];

const ADULT_GROUP = [
  { name: "Drop-in Session", detail: "1 session, 4–6 players, per person", price: "S$30", per: "/ session" },
  { name: "Monthly (4 sessions)", detail: "1x per week, billed monthly, per person", price: "S$100", per: "/ mth (S$25 / session)" },
];

const GOOD_TO_KNOW_KIDS = [
  "Packages are billed upfront; sessions expire 6 weeks after purchase date.",
  "Reschedules with 24hrs notice are free; no-shows forfeit the session.",
  "Rained-out outdoor sessions are rescheduled at no charge.",
  "Sibling discount: 10% off a second child on any monthly or term pack.",
];

const GOOD_TO_KNOW_ADULT = [
  "Packages are billed upfront; sessions expire 6 weeks after purchase date.",
  "Reschedules with 24hrs notice are free; no-shows forfeit the session.",
  "Rained-out outdoor sessions are rescheduled at no charge.",
  "Partner/sibling discount: 10% off a second adult on any monthly or term pack.",
];

interface PlanItem {
  name: string;
  detail: string;
  price: string;
  per: string;
  highlight?: boolean;
}

function PricingTable({ title, emoji, items, accentColor }: { title: string; emoji: string; items: PlanItem[]; accentColor: string }) {
  const isGreen = accentColor === "green";
  const isBlue = accentColor === "blue";
  const isPurple = accentColor === "purple";
  const isOrange = accentColor === "orange";

  const borderColor = isGreen ? "border-green-500/30" : isBlue ? "border-blue-500/30" : isPurple ? "border-purple-500/30" : "border-orange-500/30";
  const headerBg = isGreen ? "from-green-900/40 to-green-800/20" : isBlue ? "from-blue-900/40 to-blue-800/20" : isPurple ? "from-purple-900/40 to-purple-800/20" : "from-orange-900/40 to-orange-800/20";

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

function KidsPricing() {
  return (
    <>
      <PricingTable title="GROUP CLASSES (up to 8 players)" emoji="🏀" accentColor="green" items={KIDS_GROUP} />
      <PricingTable title="SEMI-PRIVATE (3–5 players)" emoji="👥" accentColor="blue" items={KIDS_SEMI} />
      <PricingTable title="PRIVATE 1-TO-1 COACHING" emoji="🎯" accentColor="purple" items={KIDS_PRIVATE} />
    </>
  );
}

function AdultPricing() {
  return (
    <>
      <PricingTable title="PRIVATE 1-TO-1 COACHING" emoji="🎯" accentColor="purple" items={ADULT_PRIVATE} />
      <PricingTable title="SEMI-PRIVATE (2–3 players) — per person" emoji="👥" accentColor="blue" items={ADULT_SEMI} />
      <PricingTable title="SMALL GROUP (4–6 players) — per person" emoji="🏃" accentColor="orange" items={ADULT_GROUP} />
    </>
  );
}

export default function RatesPage() {
  const [tab, setTab] = useState<"kids" | "adult">("kids");

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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Basketball Coaching • Singapore</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            2026 Pricing
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Structured basketball coaching for kids (ages 6–16) and adults (17+). Every player gets a Player Card that tracks drills, homework and progress.
          </p>
        </motion.div>
      </header>

      {/* Tab Toggle */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl w-fit">
          <button
            onClick={() => setTab("kids")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "kids"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            🧒 Kids (6–16)
          </button>
          <button
            onClick={() => setTab("adult")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "adult"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            🧑 Adults (17+)
          </button>
        </div>
      </div>

      {/* Pricing Tables */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        {tab === "kids" ? (
          <motion.div
            key="kids"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <KidsPricing />
          </motion.div>
        ) : (
          <motion.div
            key="adult"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <AdultPricing />
          </motion.div>
        )}

        {/* Free Trial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl p-6 text-center"
        >
          <p className="text-2xl mb-1">🎁</p>
          <h2 className="text-xl font-bold text-green-400">NEW PLAYER TRIAL — FREE</h2>
          <p className="text-gray-300 mt-1">
            {tab === "kids"
              ? "Kids: one free group session. Adults: one free private session."
              : "Adults: one free private session. Kids: one free group session."}
            {" "}No commitment, no payment details needed.
          </p>
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
            {(tab === "kids" ? GOOD_TO_KNOW_KIDS : GOOD_TO_KNOW_ADULT).map((tip, i) => (
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
