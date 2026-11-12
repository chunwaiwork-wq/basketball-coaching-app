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

// Venue details per location — confirmed by Coach Wai
type LocationDetail = {
  headline: string;
  venues: { name: string; note?: string }[];
  image: string;
  imageAlt: string;
};

// Court photos — real photos of each venue.
// Locations without a real photo yet fall back to a shared image.
const FALLBACK_COURT_IMAGE = "/locations/boon-keng.jpg";
const COACH_PORTRAIT = "/coach-wai-portrait.jpg";

const LOCATION_DETAILS: Record<string, LocationDetail> = {
  tampines: {
    headline: "Two courts in Tampines",
    venues: [
      { name: "Blk 840 Tampines Street 82", note: "Sheltered court" },
      { name: "Blk 719 Tampines Street 72" },
    ],
    image: "/locations/tampines.jpg",
    imageAlt: "Sheltered basketball court at Blk 840 Tampines Street 82, Singapore",
  },
  khatib: {
    headline: "Khatib Multi-purpose Court",
    venues: [{ name: "Khatib Multi-purpose Court", note: "Sheltered court" }],
    image: FALLBACK_COURT_IMAGE,
    imageAlt: "Our sheltered basketball court in Khatib, Singapore",
  },
  kembangan: {
    headline: "Telok Kurau Park",
    venues: [{ name: "Telok Kurau Park", note: "Half court" }],
    image: FALLBACK_COURT_IMAGE,
    imageAlt: "Our basketball court at Telok Kurau Park in Kembangan, Singapore",
  },
  "boon-keng": {
    headline: "McNair Sheltered Basketball Court",
    venues: [{ name: "McNair Sheltered Basketball Court", note: "Sheltered court" }],
    image: "/locations/boon-keng.jpg",
    imageAlt: "McNair Sheltered Basketball Court in Boon Keng, Singapore",
  },
};

const PROGRAMMES = [
  {
    icon: "🎯",
    title: "1-to-1 / Private",
    who: "For adults",
    price: "from $70 / session",
    desc: "One coach, one player. Every drill built around your game, your pace and your goals.",
    color: "from-[#C65A24]/20 to-[#C65A24]/5 border-[#C65A24]/20",
  },
  {
    icon: "🤝",
    title: "Small Group",
    who: "For youth and adults",
    price: "from $50 / session",
    desc: "Train with a small group — game-realistic reps, competition, and the same structured plan.",
    color: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/20",
  },
];

const STEPS = [
  { step: "1", title: "Free skills assessment", desc: "A free 60-minute session where we see exactly where you or your child are starting from." },
  { step: "2", title: "Matched plan and roadmap", desc: "You get a clear plan built around your goals — what to work on, in what order." },
  { step: "3", title: "Progress tracking", desc: "Every session is tracked, so you can see the improvement instead of guessing." },
];

export default function LocationPage({ location, slug }: { location: string; slug: string }) {
  const href = bookHref(location);
  const details = LOCATION_DETAILS[slug];

  return (
    <main className="min-h-screen bg-[#171717] text-[#E9DFC9] overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C65A24]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#A34717]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Nav — same look as the homepage header */}
        <nav className="fixed top-0 w-full z-50 bg-[#171717]/80 backdrop-blur-xl border-b border-[#E9DFC9]/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <img
                src="/413opencourt_logo_white.png"
                alt="413 OpenCourt logo"
                className="h-7 md:h-9 w-auto object-contain shrink-0"
              />
              <span className="text-sm md:text-xl font-bold tracking-wider bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/85 bg-clip-text text-transparent whitespace-nowrap">
                413OPENCOURT
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors hidden sm:block">
                ← Home
              </Link>
              <Link
                href="/auth/login"
                className="px-4 md:px-6 py-2 md:py-2.5 bg-[#E9DFC9]/10 backdrop-blur-sm border border-[#E9DFC9]/20 rounded-full text-xs md:text-sm font-bold hover:bg-[#E9DFC9]/20 transition-all whitespace-nowrap"
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
              className="inline-block px-4 py-1.5 bg-[#C65A24]/10 border border-[#C65A24]/20 rounded-full text-[#E07B3C] text-xs font-semibold tracking-wider mb-8"
            >
              FREE 60-MINUTE ASSESSMENT · {location.toUpperCase()}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-8"
            >
              BASKETBALL TRAINING
              <br />
              <span className="bg-gradient-to-r from-[#E9DFC9] via-[#E07B3C] to-[#C65A24] bg-clip-text text-transparent">
                IN {location.toUpperCase()}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-[#E9DFC9]/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              <span className="text-[#E9DFC9] font-semibold">FREE 60-minute basketball skills assessment</span> in{" "}
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
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold text-lg shadow-xl shadow-[#C65A24]/25 hover:shadow-[#C65A24]/40 transition-shadow"
              >
                Book My Free Trial and Assessment in {location}
              </a>
              <p className="text-[#E9DFC9]/55 text-sm">No payment details needed.</p>
            </motion.div>
          </div>
        </section>

        {/* Court photo */}
        {details && (
          <section className="px-8 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-[#E9DFC9]/10 shadow-2xl shadow-black/50"
            >
              <img
                src={details.image}
                alt={details.imageAlt}
                width={1280}
                height={720}
                className="w-full h-56 sm:h-72 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[#E07B3C] text-xs font-bold tracking-[0.2em] uppercase mb-2">
                  {location}
                </p>
                <p className="text-xl md:text-3xl font-extrabold leading-tight">
                  {details.headline}
                </p>
              </div>
            </motion.div>
          </section>
        )}

        {/* Proof line — links back to the 4.9/5 Google rating */}
        <section className="px-8 pb-16">
          <div className="max-w-4xl mx-auto bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-center">
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/60 bg-clip-text text-transparent whitespace-nowrap">
              4.9/5 Google rating
            </span>
            <span className="hidden sm:block text-[#E9DFC9]/40">·</span>
            <span className="text-[#E9DFC9]/70 text-sm md:text-base">
              Head Coach Wai, former Division 2 player, 20 years&apos; experience.
            </span>
          </div>
        </section>

        {/* Venue details */}
        <section className="px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Where we train in {location}</h2>
            <p className="text-[#E9DFC9]/55 text-sm mb-6">
              Free trial sessions run at these courts.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {details?.venues.map((venue) => (
                <div
                  key={venue.name}
                  className="flex items-start gap-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/10 rounded-xl px-5 py-4"
                >
                  <span className="text-[#C65A24] leading-none mt-0.5" aria-hidden="true">
                    📍
                  </span>
                  <div>
                    <p className="font-bold text-sm text-[#E9DFC9]">{venue.name}</p>
                    {venue.note && (
                      <p className="text-[#E9DFC9]/55 text-xs mt-1">{venue.note}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 bg-[#E9DFC9]/[0.02] border border-dashed border-[#E9DFC9]/15 rounded-xl px-5 py-4">
                <span className="leading-none mt-0.5" aria-hidden="true">
                  🕒
                </span>
                <div>
                  <p className="font-bold text-sm text-[#E9DFC9]/70">Training days &amp; times</p>
                  <p className="text-[#E9DFC9]/45 text-xs mt-1">
                    [To confirm — ask us on WhatsApp]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programmes */}
        <section className="px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">PROGRAMMES</h2>
            <p className="text-[#E9DFC9]/70 text-center mb-12 max-w-xl mx-auto">
              Two ways to train — pick what fits your level and your schedule.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {PROGRAMMES.map((p) => (
                <div
                  key={p.title}
                  className={`bg-gradient-to-b ${p.color} backdrop-blur-xl border rounded-2xl p-8`}
                >
                  <div className="w-14 h-14 bg-[#E9DFC9]/5 rounded-2xl flex items-center justify-center text-2xl mb-6">{p.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{p.title}</h3>
                  <p className="text-[#E9DFC9]/55 text-sm mb-4">{p.who}</p>
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/70 bg-clip-text text-transparent mb-4">{p.price}</p>
                  <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">{p.desc}</p>
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
              <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">WORKS</span>
            </h2>
            <p className="text-[#E9DFC9]/70 text-center mb-12 max-w-xl mx-auto">Three steps, no guesswork.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s) => (
                <div key={s.step} className="bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C65A24] to-[#A34717] flex items-center justify-center font-extrabold text-lg mb-5">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Head coach */}
        <section className="px-8 py-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#E9DFC9]/[0.06] to-[#E9DFC9]/[0.02] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative shrink-0">
              <span
                className="absolute inset-0 -m-2 rounded-3xl bg-[#C65A24]/20 blur-xl"
                aria-hidden="true"
              />
              <img
                src={COACH_PORTRAIT}
                alt="Coach Wai — Head Coach at 413OPENCOURT"
                width={800}
                height={961}
                className="relative w-60 sm:w-72 md:w-80 lg:w-96 h-auto rounded-2xl border border-[#C65A24]/30 shadow-2xl shadow-black/60"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[#E07B3C] text-xs font-bold tracking-[0.2em] uppercase mb-2">
                Head Coach
              </p>
              <p className="text-2xl md:text-3xl font-extrabold mb-3">Coach Wai</p>
              <p className="text-[#E9DFC9]/85 leading-relaxed">
                Former Division 2 player with 20 years of experience coaching players of every level
                — from complete beginners to competitive athletes. Training in {location} and across
                Singapore.
              </p>
            </div>
          </div>
        </section>

        {/* Other locations */}
        <section className="px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#E9DFC9]/55 text-xs uppercase tracking-[0.2em] mb-4">We also train in</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LOCATIONS.filter((l) => l.slug !== slug).map((l) => (
                <Link
                  key={l.slug}
                  href={`/basketball-training-${l.slug}`}
                  className="px-4 py-2 bg-[#E9DFC9]/[0.04] border border-[#E9DFC9]/[0.08] rounded-full text-sm text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.08] transition-colors"
                >
                  📍 {l.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#C65A24]/20 to-[#C65A24]/20 backdrop-blur-xl border border-[#E9DFC9]/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">READY TO SEE WHERE YOU&apos;RE AT?</h2>
            <p className="text-[#E9DFC9]/70 mb-8">
              Book your free 60-minute skills assessment in {location}. No payment details needed.
            </p>
            <a
              href={href}
              target="_blank"
              className="inline-block px-10 py-4 bg-[#E9DFC9] text-[#171717] rounded-full font-bold text-lg hover:bg-[#E9DFC9]/90 transition-colors"
            >
              Book My Free Trial and Assessment in {location}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E9DFC9]/5 px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#E9DFC9]/55">
            <span>© 2024 413OPENCOURT. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-[#E9DFC9]/85 transition-colors">Home</Link>
              <Link href="/rates" className="hover:text-[#E9DFC9]/85 transition-colors">Rates</Link>
              <Link href="/faq" className="hover:text-[#E9DFC9]/85 transition-colors">FAQs</Link>
              <Link href="/auth/login" className="hover:text-[#E9DFC9]/85 transition-colors">Coach Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
