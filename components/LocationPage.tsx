"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Training locations — keep in sync with app/page.tsx and app/basketball-training-*/page.tsx
export const LOCATIONS = [
  { name: "Tampines", slug: "tampines" },
  { name: "Khatib", slug: "khatib" },
  { name: "Kembangan", slug: "kembangan" },
  { name: "Boon Keng", slug: "boon-keng" },
];

function bookHref(location: string) {
  const text = `Hi Coach! I want to book my free trial and assessment in ${location} 🏀`;
  return `https://wa.me/6591885348?text=${encodeURIComponent(text)}`;
}

const PROGRAMMES = [
  {
    icon: "🎯",
    title: "1-to-1 / Private",
    who: "For adults",
    price: "from $70 / session",
    desc: "One coach, one player. Every drill built around your game, your pace and your goals.",
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  },
  {
    icon: "🤝",
    title: "Small Group",
    who: "For youth and adults",
    price: "from $50 / session",
    desc: "Train with a small group — game-realistic reps, competition, and the same structured plan.",
    color: "from-red-500/20 to-red-600/5 border-red-500/20",
  },
];

const STEPS = [
  { step: "1", title: "Free skills assessment", desc: "A free 60-minute session where we see exactly where you or your child are starting from." },
  { step: "2", title: "Matched plan and roadmap", desc: "You get a clear plan built around your goals — what to work on, in what order." },
  { step: "3", title: "Progress tracking", desc: "Every session is tracked, so you can see the improvement instead of guessing." },
];

export default function LocationPage({ location, slug }: { location: string; slug: string }) {
  const href = bookHref(location);

  return (
    <main className="min-h-screen bg-[#030303] text-white overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Nav — same look as the homepage header */}
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <img
                src="/413opencourt_logo_white.png"
                alt="413 OpenCourt logo"
                className="h-7 md:h-9 w-auto object-contain shrink-0"
              />
              <span className="text-sm md:text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
                413OPENCOURT
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
                ← Home
              </Link>
              <Link
                href="/auth/login"
                className="px-4 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs md:text-sm font-semibold hover:bg-white/20 transition-all whitespace-nowrap"
              >
                LOGIN
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero — location specific */}
        <section className="relative pt-40 pb-16 px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold tracking-wider mb-8"
            >
              FREE 60-MINUTE ASSESSMENT · {location.toUpperCase()}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8"
            >
              BASKETBALL TRAINING
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-red-400 bg-clip-text text-transparent">
                IN {location.toUpperCase()}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              <span className="text-white font-semibold">FREE 60-minute basketball skills assessment</span> in{" "}
              {location}, for kids and adults starting from zero.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col items-center gap-3"
            >
              <a
                href={href}
                target="_blank"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              >
                Book My Free Trial and Assessment in {location}
              </a>
              <p className="text-gray-500 text-sm">No payment details needed.</p>
            </motion.div>
          </div>
        </section>

        {/* Proof line — links back to the 4.9/5 Google rating */}
        <section className="px-8 pb-16">
          <div className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-center">
            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent whitespace-nowrap">
              4.9/5 Google rating
            </span>
            <span className="hidden sm:block text-gray-600">·</span>
            <span className="text-gray-400 text-sm md:text-base">
              Head Coach Wai, former Division 2 player, 20 years&apos; experience.
            </span>
          </div>
        </section>

        {/* Venue details — deliberately blank until confirmed */}
        <section className="px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{location} details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[`[Exact venue in ${location}: to confirm]`, `[Hours/days in ${location}: to confirm]`].map((blank) => (
                <div
                  key={blank}
                  className="bg-white/[0.02] border border-dashed border-white/15 rounded-xl px-5 py-4 text-gray-500 text-sm"
                >
                  {blank}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programmes */}
        <section className="px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">PROGRAMMES</h2>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
              Two ways to train — pick what fits your level and your schedule.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {PROGRAMMES.map((p) => (
                <div
                  key={p.title}
                  className={`bg-gradient-to-b ${p.color} backdrop-blur-xl border rounded-2xl p-8`}
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-6">{p.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{p.who}</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">{p.price}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              HOW IT{" "}
              <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">WORKS</span>
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Three steps, no guesswork.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s) => (
                <div key={s.step} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-lg mb-5">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Head coach */}
        <section className="px-8 py-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10 md:p-12">
            <p className="text-blue-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Head Coach</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Coach Wai</h2>
            <p className="text-gray-300 leading-relaxed max-w-2xl">
              Former Division 2 player with 20 years of experience coaching players of every level — from
              complete beginners to competitive athletes. Training in {location} and across Singapore.
            </p>
          </div>
        </section>

        {/* Other locations */}
        <section className="px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-4">We also train in</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LOCATIONS.filter((l) => l.slug !== slug).map((l) => (
                <Link
                  key={l.slug}
                  href={`/basketball-training-${l.slug}`}
                  className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  📍 {l.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">READY TO SEE WHERE YOU&apos;RE AT?</h2>
            <p className="text-gray-400 mb-8">
              Book your free 60-minute skills assessment in {location}. No payment details needed.
            </p>
            <a
              href={href}
              target="_blank"
              className="inline-block px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              Book My Free Trial and Assessment in {location}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <span>© 2024 413OPENCOURT. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
              <Link href="/rates" className="hover:text-gray-300 transition-colors">Rates</Link>
              <Link href="/faq" className="hover:text-gray-300 transition-colors">FAQs</Link>
              <Link href="/auth/login" className="hover:text-gray-300 transition-colors">Coach Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
