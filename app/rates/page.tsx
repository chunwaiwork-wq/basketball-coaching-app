"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// --- SIMPLE PRICING (headline "from" rates only) ---
const PLANS = [
  {
    emoji: "🧒",
    title: "Kids",
    ages: "Ages 3–16",
    price: "from $50",
    per: "per session",
    accent: "from-[#C65A24]/30 to-[#A34717]/10 border-[#C65A24]/30",
  },
  {
    emoji: "🧑",
    title: "Adults",
    ages: "Ages 17+",
    price: "from $70",
    per: "per session",
    accent: "from-[#E9DFC9]/15 to-[#E9DFC9]/5 border-[#E9DFC9]/20",
  },
];

const GOOD_TO_KNOW = [
  "Every new player starts with a FREE 60-minute skills assessment.",
  "Reschedules with 24 hours' notice are free; no-shows forfeit the session.",
  "Rained-out outdoor sessions are rescheduled at no charge.",
  "Sibling discount: 10% off a second child.",
];

export default function RatesPage() {
  return (
    <div className="min-h-screen bg-[#171717] text-[#E9DFC9]">
      {/* Simple Nav */}
      <nav className="border-b border-[#E9DFC9]/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors flex items-center gap-1">
            ← Back to Home
          </Link>
          <span className="text-sm font-bold tracking-wider bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/85 bg-clip-text text-transparent">
            413 OPEN COURT
          </span>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold text-[#E9DFC9]/55 uppercase tracking-widest mb-2">
            Basketball Coaching • Singapore
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#E9DFC9]">2026 Pricing</h1>
          <p className="text-[#E9DFC9]/70 mt-2 max-w-xl">
            Structured basketball coaching for kids (ages 3–16) and adults (17+). Every player gets a
            Player Card that tracks drills, homework and progress.
          </p>
        </motion.div>
      </header>

      {/* Pricing cards */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        <div className="grid sm:grid-cols-2 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-gradient-to-b ${plan.accent} backdrop-blur-xl border rounded-2xl p-8 text-center`}
            >
              <p className="text-3xl mb-3">{plan.emoji}</p>
              <h2 className="text-xl font-extrabold mb-1">{plan.title}</h2>
              <p className="text-sm text-[#E9DFC9]/55 mb-6">{plan.ages}</p>
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent leading-none">
                {plan.price}
              </p>
              <p className="text-sm text-[#E9DFC9]/70 mt-3">{plan.per}</p>
            </motion.div>
          ))}
        </div>

        {/* Free Trial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-gradient-to-r from-[#C65A24]/30 to-[#A34717]/20 border border-[#C65A24]/20 rounded-2xl p-6 text-center"
        >
          <p className="text-2xl mb-1">🎁</p>
          <h2 className="text-xl font-bold text-[#E07B3C]">NEW PLAYER TRIAL — FREE</h2>
          <p className="text-[#E9DFC9]/85 mt-1">
            Kids get one free group session. Adults get one free private session. No commitment, no
            payment details needed.
          </p>
          <a
            href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20a%20free%20trial%20session%20🔥"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-3 bg-[#C65A24]/20 border border-[#C65A24]/40 rounded-full text-sm font-bold text-[#E07B3C] hover:bg-[#C65A24]/30 transition-all"
          >
            Book Free Trial →
          </a>
        </motion.div>

        {/* Good to Know */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border border-[#E9DFC9]/[0.08] rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold text-[#E9DFC9]/60 uppercase tracking-wider mb-4">
            📌 Good to Know
          </h2>
          <ul className="space-y-2">
            {GOOD_TO_KNOW.map((tip, i) => (
              <li key={i} className="text-sm text-[#E9DFC9]/70 flex items-start gap-2">
                <span className="text-[#E9DFC9]/40 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-[#E9DFC9]/55 mb-4">Ready to get started?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20a%20free%20trial%20🔥"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#E9DFC9]/10 border border-[#E9DFC9]/20 rounded-full text-sm font-bold hover:bg-[#E9DFC9]/20 transition-all"
            >
              📱 Book via WhatsApp
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E9DFC9]/[0.06] py-6 text-center text-xs text-[#E9DFC9]/40">
        <p>© 2026 413 OpenCourt Pte. Ltd. &nbsp;|&nbsp; UEN 202607219E</p>
      </footer>
    </div>
  );
}
