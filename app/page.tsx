"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TrialChat from "../components/TrialChat";
import Link from "next/link";

// Training locations — keep in sync with app/basketball-training-*/page.tsx
const LOCATIONS = [
  { name: "Tampines", slug: "tampines" },
  { name: "Khatib", slug: "khatib" },
  { name: "Kembangan", slug: "kembangan" },
  { name: "Boon Keng", slug: "boon-keng" },
];

const BOOK_TRIAL_HREF =
  "https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20my%20free%20trial%20and%20assessment%20%E2%9B%B9";

// FAQ content — kept in sync with app/faq/page.tsx
const HOME_FAQS: { icon: string; title: string; items: { q: string; a: string }[] }[] = [
  {
    icon: "👨‍🏫",
    title: "About Our Coaches",
    items: [
      {
        q: "Who are the coaches?",
        a: "Our coaches include veteran players like Chun Wai and other certified and experienced coaches with more than a decade of experience teaching kids and adults!",
      },
      {
        q: "Are your coaches certified?",
        a: "Yes — our coaching staff hold NCAP Singapore certifications. All coaches also undergo background checks and child safety training before working with players.",
      },
      {
        q: "Have your coaches played competitively?",
        a: "Yes — some of our coaches have played at national team level and they currently compete in the highest Division 1 league in Singapore. They bring that competitive experience directly into how drills and game-reading are taught.",
      },
    ],
  },
  {
    icon: "📋",
    title: "Programs & Training",
    items: [
      {
        q: "What age groups and skill levels do you coach?",
        a: "We coach kids from age 3–16 and working adults (17+). Each experience is tailor-made according to your level of experience — from complete beginners to competitive players.",
      },
      {
        q: "What is the training program?",
        a: "Depending on your level of experience, the program will be tailored to you.",
      },
      {
        q: "How is the training conducted?",
        a: "Training will be conducted in a fun and enriching manner. There will be lots of learnings and takeaways after each session.",
      },
      {
        q: "What's your coach-to-player ratio?",
        a: "For group classes, our maximum standard ratio is 1 coach to 8 players. This ensures individual attention and correction during every session.",
      },
      {
        q: "Why choose 413opencourt?",
        a: "We believe that every kid or adult can be empowered with good basketball skills and play with confidence. Our core principles are to ensure clarity, confidence and convenience to all coachees.",
      },
      {
        q: "What equipment does my child need to bring?",
        a: "They may bring along their ball, towel, and a water bottle. We'll take care of the rest!",
      },
    ],
  },
  {
    icon: "💰",
    title: "Pricing & Payments",
    items: [
      {
        q: "How much does a trial session cost?",
        a: "Completely free! Kids get a free group session and adults get a free private session — no commitment, no payment details needed.",
      },
      {
        q: "What payment methods do you accept?",
        a: "PayNow is our primary payment method. We'll send you the details after you confirm your booking.",
      },
      {
        q: "Do siblings get a discount?",
        a: "Yes — siblings get 10% off for a second child on monthly or term packs.",
      },
      {
        q: "What happens if we miss a session?",
        a: "Reschedules with 24 hours' notice are free. No-shows without notice will forfeit the session.",
      },
      {
        q: "Are packages refundable?",
        a: "Packages are strictly non-refundable. However, sessions are valid for 6 weeks from purchase date, and we're happy to reschedule with 24 hours' notice.",
      },
    ],
  },
  {
    icon: "⏰",
    title: "Scheduling",
    items: [
      {
        q: "How long is each session?",
        a: "Both group and private classes are 1 hour each.",
      },
      {
        q: "Can we reschedule a session?",
        a: "Definitely! Just give us 24 hours' notice and we'll move your session to another slot at no charge.",
      },
    ],
  },
  {
    icon: "📍",
    title: "Venue & Location",
    items: [
      {
        q: "Where is the coaching venue?",
        a: "It will be located at your convenience. However, group classes are usually held at Block 840 sheltered basketball court.",
      },
    ],
  },
  {
    icon: "🛡️",
    title: "Safety & Wellbeing",
    items: [
      {
        q: "What safety measures are in place during sessions?",
        a: "We have clear injury protocols, hydration and heat management designed for Singapore conditions, and all our coaches are first-aid trained. Every session begins with a venue safety check before play.",
      },
    ],
  },
  {
    icon: "🎁",
    title: "Trials & Getting Started",
    items: [
      {
        q: "Is there a trial session before committing?",
        a: "Yes — we offer a free trial session so you can observe the coaching style and see if it's a good fit before signing up. Kids get a free group class, and adults get a free private session.",
      },
      {
        q: "How do I book or ask more questions?",
        a: "WhatsApp us at +65 9188 5348 or email 413opencourt@gmail.com — we'll get back to you as soon as possible!",
      },
    ],
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("0-0");
  const [guideData, setGuideData] = useState({ name: "", email: "" });
  const [guideSubmitted, setGuideSubmitted] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [showTrialChat, setShowTrialChat] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuideLoading(true);
    setGuideError("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });

      const data = await res.json();

      if (!res.ok) {
        setGuideError(data.error || "Something went wrong");
        setGuideLoading(false);
        return;
      }

      setGuideSubmitted(true);
      setGuideLoading(false);

      // Trigger download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = "How_to_Shoot_Better_and_Improve_Your_Basketball_Shooting.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setGuideError("Network error. Please try again.");
      setGuideLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#171717] text-[#E9DFC9] overflow-hidden">
      {/* Fixed background — basketball net + subtle glow, stays on scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 400 400" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" className="w-[520px] md:w-[640px] h-auto opacity-[0.07]">
            <rect x="130" y="30" width="140" height="85" rx="6" />
            <ellipse cx="200" cy="112" rx="64" ry="14" />
            <line x1="200" y1="112" x2="200" y2="30" />
            <line x1="259.5" y1="117.2" x2="230" y2="300" />
            <line x1="259.5" y1="117.2" x2="230" y2="300" />
            <line x1="249.9" y1="120.8" x2="230" y2="300" />
            <line x1="249.9" y1="120.8" x2="214" y2="307" />
            <line x1="236.0" y1="123.6" x2="230" y2="300" />
            <line x1="236.0" y1="123.6" x2="230" y2="300" />
            <line x1="218.8" y1="125.4" x2="214" y2="307" />
            <line x1="218.8" y1="125.4" x2="200" y2="310" />
            <line x1="200.0" y1="126.0" x2="200" y2="310" />
            <line x1="200.0" y1="126.0" x2="214" y2="307" />
            <line x1="181.2" y1="125.4" x2="186" y2="307" />
            <line x1="181.2" y1="125.4" x2="170" y2="300" />
            <line x1="164.0" y1="123.6" x2="170" y2="300" />
            <line x1="164.0" y1="123.6" x2="186" y2="307" />
            <line x1="150.1" y1="120.8" x2="170" y2="300" />
            <line x1="150.1" y1="120.8" x2="170" y2="300" />
            <line x1="140.5" y1="117.2" x2="170" y2="300" />
            <line x1="140.5" y1="117.2" x2="186" y2="307" />
            <line x1="148" y1="170" x2="252" y2="170" />
            <line x1="156" y1="215" x2="244" y2="215" />
            <line x1="164" y1="260" x2="236" y2="260" />
          </svg>
        </div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C65A24]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#A34717]/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Page content — above fixed background */}
      <div className="relative z-10">

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-[#171717]/80 backdrop-blur-xl border-b border-[#E9DFC9]/5" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 md:px-8 py-4 md:py-5">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Mobile menu — big high-contrast pill, easy to tap */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="md:hidden flex items-center gap-1.5 h-11 px-3 bg-[#E9DFC9] text-[#171717] rounded-full font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#171717]/40 select-none shrink-0"
            >
              <span className="relative w-3.5 h-3 flex flex-col justify-center gap-[3.5px]">
                <span className={`block w-3.5 h-[3px] bg-[#171717] rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
                <span className={`block w-3.5 h-[3px] bg-[#171717] rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-3.5 h-[3px] bg-[#171717] rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
              </span>
              {mobileOpen ? "CLOSE" : "MENU"}
            </button>
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <img
                src="/413opencourt_logo_white.png"
                alt="413 OpenCourt logo"
                className="h-6 md:h-9 w-auto object-contain shrink-0"
              />
              <span className="text-[13px] md:text-xl font-bold tracking-wider bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/85 bg-clip-text text-transparent whitespace-nowrap">
                413OPENCOURT
              </span>
            </motion.div>
          </div>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/rates" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors">RATES</Link>
            <a href="#faqs" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors">FAQs</a>
            <a href="#testimonials" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors">TESTIMONIALS</a>
            <a href="#guide" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors">FREE GUIDE</a>
            <a href={BOOK_TRIAL_HREF} target="_blank" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors">FREE TRIAL</a>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <motion.a
              href="/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-[#E9DFC9]/10 backdrop-blur-sm border border-[#E9DFC9]/20 rounded-full text-xs md:text-sm font-semibold hover:bg-[#E9DFC9]/20 transition-all whitespace-nowrap"
            >
              LOGIN
            </motion.a>
          </div>
        </div>

        {/* Mobile menu dropdown — big tap targets */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#171717]/95 backdrop-blur-xl border-b border-[#E9DFC9]/10 px-4 py-4 flex flex-col"
          >
            <Link href="/rates" onClick={() => setMobileOpen(false)} className="py-4 px-4 rounded-xl text-base text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.06] transition-colors">💰 RATES</Link>
            <a href="#faqs" onClick={() => setMobileOpen(false)} className="py-4 px-4 rounded-xl text-base text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.06] transition-colors">❓ FAQs</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)} className="py-4 px-4 rounded-xl text-base text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.06] transition-colors">⭐ TESTIMONIALS</a>
            <a href="#guide" onClick={() => setMobileOpen(false)} className="py-4 px-4 rounded-xl text-base text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.06] transition-colors">📖 FREE GUIDE</a>
            <a href={BOOK_TRIAL_HREF} target="_blank" onClick={() => setMobileOpen(false)} className="py-4 px-4 rounded-xl text-base text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.06] transition-colors">🎁 FREE TRIAL</a>
          </motion.div>
        )}
      </motion.nav>

          {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#171717] via-transparent to-[#171717]" />
        
        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#C65A24]/10 border border-[#C65A24]/20 rounded-full text-[#E07B3C] text-xs font-semibold tracking-wider mb-8">
              ELITE BASKETBALL TRAINING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] mb-4"
          >
            FREE Basketball
            <br />
            <span className="bg-gradient-to-r from-[#E9DFC9] via-[#E07B3C] to-[#C65A24] bg-clip-text text-transparent">
              Trial Lesson*
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xs md:text-sm text-[#E9DFC9]/55 tracking-wider mb-8"
          >
            For Selected Locations in Singapore
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-[#E9DFC9]/70 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            <span className="text-[#E9DFC9] font-semibold">FREE 60-minute basketball skills assessment</span>,
            for kids and adults starting from zero. Train at Tampines, Khatib, Kembangan or Boon Keng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.a
              href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20my%20free%20trial%20and%20assessment%20%E2%9B%B9"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-semibold text-lg shadow-xl shadow-[#C65A24]/25 hover:shadow-[#C65A24]/40 transition-shadow cursor-pointer"
              >
                Book My Free Trial and Assessment
              </motion.a>
            <p className="text-[#E9DFC9]/55 text-sm">No payment details needed.</p>
          </motion.div>
        </div>
      </section>

      {/* Proof line — approved version: 4.9/5 rating + Head Coach Wai only */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="max-w-4xl mx-auto px-8 py-10"
      >
        <div className="bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl px-8 py-6 flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative shrink-0">
            <span
              className="absolute inset-0 -m-1 rounded-full bg-[#C65A24]/25 blur-md"
              aria-hidden="true"
            />
            <img
              src="/coach-wai.jpg"
              alt="Coach Wai — Head Coach at 413OPENCOURT"
              width={96}
              height={96}
              decoding="async"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-[#C65A24]/60 shadow-lg shadow-black/40"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1">
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/60 bg-clip-text text-transparent whitespace-nowrap">
              4.9/5 Google rating
            </span>
            <span className="hidden sm:block text-[#E9DFC9]/40">·</span>
            <span className="text-[#E9DFC9]/70 text-sm md:text-base">
              Head Coach Wai, former Division 2 player, 20 years&apos; experience.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Programmes */}
      <section id="programmes" className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            PROGRAMMES
          </motion.h2>
          <p className="text-[#E9DFC9]/70 text-center mb-12 max-w-xl mx-auto">
            Two ways to train — pick what fits your level and your schedule.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "🎯",
                title: "1-to-1 / Private",
                who: "For adults",
                price: "from $70 / session",
                desc: "One coach, one player. Every drill built around your game, your pace and your goals.",
                color: "from-[#C65A24]/20 to-[#C65A24]/5 border-[#C65A24]/20",
                shadow: "hover:shadow-[#C65A24]/25",
              },
              {
                icon: "🤝",
                title: "Small Group",
                who: "For youth and adults",
                price: "from $50 / session",
                desc: "Train with a small group — game-realistic reps, competition, and the same structured plan.",
                color: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/20",
                shadow: "hover:shadow-[#C65A24]/25",
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-b ${p.color} backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl ${p.shadow}`}
              >
                <div className="w-14 h-14 bg-[#E9DFC9]/5 rounded-2xl flex items-center justify-center text-2xl mb-6">{p.icon}</div>
                <h3 className="font-bold text-xl mb-1">{p.title}</h3>
                <p className="text-[#E9DFC9]/55 text-sm mb-4">{p.who}</p>
                <p className="text-2xl font-extrabold bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/70 bg-clip-text text-transparent mb-4">{p.price}</p>
                <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Where we train — links to the four location pages */}
          <div className="mt-12 text-center">
            <p className="text-[#E9DFC9]/55 text-xs uppercase tracking-[0.2em] mb-4">Where we train</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/basketball-training-${loc.slug}`}
                  className="px-4 py-2 bg-[#E9DFC9]/[0.04] border border-[#E9DFC9]/[0.08] rounded-full text-sm text-[#E9DFC9]/85 hover:text-[#E9DFC9] hover:bg-[#E9DFC9]/[0.08] transition-colors"
                >
                  📍 {loc.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            HOW IT{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              WORKS
            </span>
          </motion.h2>
          <p className="text-[#E9DFC9]/70 text-center mb-12 max-w-xl mx-auto">
            Three steps, no guesswork.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Free skills assessment", desc: "A free 60-minute session where we see exactly where you or your child are starting from." },
              { step: "2", title: "Matched plan and roadmap", desc: "You get a clear plan built around your goals — what to work on, in what order." },
              { step: "3", title: "Progress tracking", desc: "Every session is tracked, so you can see the improvement instead of guessing." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl p-8"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C65A24] to-[#A34717] flex items-center justify-center font-extrabold text-lg mb-5">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
              WHY{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              ATHLETES CHOOSE US
            </span>
          </motion.h2>
          <p className="text-[#E9DFC9]/70 text-center mb-16 max-w-xl mx-auto">
            Three pillars that set our training apart
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏠",
                title: "CONVENIENCE",
                desc: "Train at your preferred location — home, park, or local court. No long drives, no rigid schedules. We design a program that fits your space and your life.",
                color: "from-[#C65A24]/20 to-[#C65A24]/5 border-[#C65A24]/20",
                shadow: "shadow-[#C65A24]/10 hover:shadow-[#C65A24]/25",
              },
              {
                icon: "💪",
                title: "CONFIDENCE",
                desc: "Our structured drills and progress tracking build real confidence. Watch your handles tighten, your shot improve, and your belief in yourself soar with every session.",
                color: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/20",
                shadow: "shadow-[#C65A24]/10 hover:shadow-[#C65A24]/25",
              },
              {
                icon: "🎯",
                title: "CLARITY",
                desc: "Stop searching. We give you a step-by-step training roadmap from where you are now to where you want to be. No guesswork, just a clear path to your goals.",
                color: "from-[#E9DFC9]/20 to-[#C65A24]/5 border-[#E9DFC9]/20",
                shadow: "shadow-[#E9DFC9]/10 hover:shadow-[#E9DFC9]/25",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-b ${feature.color} backdrop-blur-xl border rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl ${feature.shadow}`}
              >
                <div className="w-14 h-14 bg-[#E9DFC9]/5 rounded-2xl flex items-center justify-center text-2xl mb-6">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            WHAT OUR{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              ATHLETES
            </span>{" "}
            SAY
          </motion.h2>
          <p className="text-[#E9DFC9]/70 text-center mb-16">Real results from real players</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Hong Ye Wee",
                role: "Power Forward",
                quote: "Awesome training and Hard drills! Bring your game to the next level with Coach Wai",
                rating: 5,
                image: "/testimonials/hongyewee.jpg",
                color: "from-[#C65A24]/10 to-[#C65A24]/5 border-[#C65A24]/20"
              },
              {
                name: "Yao Zu",
                role: "Former Pro AM NBL Player",
                quote: "Solid drill",
                rating: 5,
                image: "/testimonials/yaozu.jpg",
                color: "from-[#C65A24]/10 to-[#A34717]/5 border-[#C65A24]/20"
              },
              {
                name: "Jo",
                role: "Shooting Guard",
                quote: "Been training for a few months with Coach Wai, he is very passionate and knowledgeable coach that can provide helpful tips to improve your skills and game play 👍 strongly recommended 👍",
                rating: 5,
                image: "/testimonials/jo.jpg",
                color: "from-[#E9DFC9]/10 to-[#C65A24]/5 border-[#E9DFC9]/20"
              },
              {
                name: "Nathan",
                role: "Parent",
                quote: "Coach Wai is patient and encouraging, and my child has become more confident on the court.",
                rating: 5,
                color: "from-[#C65A24]/10 to-[#A34717]/5 border-[#C65A24]/20"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-b ${testimonial.color} backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j}>⭐</span>
                  ))}
                </div>
                <p className="text-[#E9DFC9]/85 text-sm leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E9DFC9]/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C65A24]/40 to-[#E9DFC9]/40 border border-[#E9DFC9]/20 flex items-center justify-center text-[#E9DFC9] font-bold text-sm">
                      {testimonial.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <p className="text-[#E9DFC9] font-semibold">{testimonial.name}</p>
                    <p className="text-[#E9DFC9]/55 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            FREQUENTLY ASKED{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              QUESTIONS
            </span>
          </motion.h2>
          <p className="text-[#E9DFC9]/70 text-center mb-16">
            Everything parents and players ask us before their first session
          </p>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: HOME_FAQS.flatMap((cat) =>
                  cat.items.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  }))
                ),
              }),
            }}
          />

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {HOME_FAQS.map((cat, ci) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: ci * 0.05 }}
                className="rounded-2xl border border-[#E9DFC9]/10 bg-[#E9DFC9]/[0.03] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E9DFC9]/10 bg-[#C65A24]/[0.07]">
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <h3 className="text-[#E9DFC9] font-bold text-sm tracking-wide uppercase">
                    {cat.title}
                  </h3>
                </div>
                <div>
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={key} className="border-b border-[#E9DFC9]/[0.06] last:border-0">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-[#E9DFC9]/[0.03] transition-colors"
                        >
                          <span className="text-[#E9DFC9]/90 text-sm font-bold leading-snug">
                            {item.q}
                          </span>
                          <span
                            className={`shrink-0 text-[#C65A24] text-lg leading-none transition-transform duration-200 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="px-6 pb-5 text-[#E9DFC9]/65 text-sm leading-relaxed"
                          >
                            {item.a}
                          </motion.p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <a
              href={BOOK_TRIAL_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-xl bg-[#C65A24] text-[#E9DFC9] font-bold hover:bg-[#E07B3C] transition-colors"
            >
              Still have questions? Book a free trial →
            </a>
            <Link
              href="/faq"
              className="px-7 py-3.5 rounded-xl border border-[#E9DFC9]/20 text-[#E9DFC9]/85 font-bold hover:bg-[#E9DFC9]/10 transition-colors"
            >
              See the full FAQ page
            </Link>
          </div>
        </div>
      </section>

      {/* Free Shooting Guide — Email Capture */}
      <section id="guide" className="px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-b from-[#C65A24]/10 to-[#C65A24]/5 backdrop-blur-xl border border-[#C65A24]/20 rounded-3xl p-10 md:p-14 text-center">
            <div className="text-6xl mb-6">🏀</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              GET YOUR{" "}
              <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
                FREE SHOOTING GUIDE
              </span>
            </h2>
            <p className="text-[#E9DFC9]/70 mb-8 max-w-lg mx-auto">
              Learn pro shooting techniques, form corrections, and drills used by NBA players. Enter your email and get the PDF instantly.
            </p>

            {!guideSubmitted ? (
              <form onSubmit={handleGuideSubmit} className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={guideData.name}
                  onChange={(e) => setGuideData({ ...guideData, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/55 focus:outline-none focus:border-[#C65A24]/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={guideData.email}
                  onChange={(e) => setGuideData({ ...guideData, email: e.target.value })}
                  className="w-full px-5 py-3.5 bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/55 focus:outline-none focus:border-[#C65A24]/50 transition-colors"
                />
                {guideError && (
                  <p className="text-red-400 text-sm">{guideError}</p>
                )}
                <motion.button
                  type="submit"
                  disabled={guideLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-semibold text-lg shadow-xl shadow-[#C65A24]/25 hover:shadow-[#C65A24]/40 transition-shadow disabled:opacity-50"
                >
                  {guideLoading ? "SENDING..." : "SEND MY FREE GUIDE →"}
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8"
              >
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-[#E07B3C] mb-2">
                  GUIDE SENT!
                </h3>
                <p className="text-[#E9DFC9]/70">
                  Check your inbox — we've sent the guide to your email! If you don't see it,{" "}
                  <a href="/free-shooting-guide.pdf" className="text-[#E07B3C] hover:underline" download>
                    click here to download
                  </a>.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-[#C65A24]/20 to-[#C65A24]/20 backdrop-blur-xl border border-[#E9DFC9]/10 rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">READY TO SEE WHERE YOU&apos;RE AT?</h2>
          <p className="text-[#E9DFC9]/70 mb-8">
            Book your free 60-minute skills assessment at Tampines, Khatib, Kembangan or Boon Keng.
            No payment details needed.
          </p>
          <motion.a
            href={BOOK_TRIAL_HREF}
            target="_blank"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-10 py-4 bg-[#E9DFC9] text-[#171717] rounded-full font-bold text-lg hover:bg-[#E9DFC9]/90 transition-colors cursor-pointer"
            >
              Book My Free Trial and Assessment
            </motion.a>
        </motion.div>
              </section>

              {/* Contact Us */}
              <section className="px-8 py-10">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-[#E9DFC9] font-bold text-lg mb-6">CONTACT US</h3>
                  <div className="flex justify-center gap-6">
                    {/* Phone */}
                    <a
                      href="tel:+659****5348"
                      className="w-14 h-14 bg-gradient-to-br from-[#C65A24] to-[#E07B3C] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-[#C65A24]/25"
                    >
                      <svg className="w-7 h-7 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </a>
                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/6591885348?text=Hi%20Coach!"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-[#A34717] to-[#E07B3C] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-[#C65A24]/25"
                    >
                      <svg className="w-7 h-7 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                    {/* Facebook */}
                    <a
                      href="https://facebook.com/profile.php?id=61578547212978"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-[#C65A24] to-[#E07B3C] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-[#C65A24]/25"
                    >
                      <svg className="w-7 h-7 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/413opencourt"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-[#C65A24] via-[#C65A24] to-[#E07B3C] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-[#C65A24]/25"
                    >
                      <svg className="w-7 h-7 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    {/* TikTok */}
                    <a
                      href="https://www.tiktok.com/@413opencourt"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-[#C65A24]/30 to-[#171717] border border-[#E9DFC9]/10 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-[#E9DFC9]/25"
                    >
                      <svg className="w-7 h-7 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </section>

              {/* Footer */}
      <footer className="border-t border-[#E9DFC9]/5 px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#E9DFC9]/55">
          <span>© 2024 413OPENCOURT. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-[#E9DFC9]/85 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-[#E9DFC9]/85 transition-colors">Reviews</a>
            <a href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial." className="hover:text-[#E9DFC9]/85 transition-colors">Free Trial</a>
            <a href="#guide" className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors hidden md:block">FREE GUIDE</a>
            <a href="/auth/login" className="hover:text-[#E9DFC9]/85 transition-colors">Coach Login</a>
          </div>
        </div>
      </footer>
      {showTrialChat && <TrialChat onClose={() => setShowTrialChat(false)} />}

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20have%20a%20question%20about%20413OPENCOURT%20🏀"
        target="_blank"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[#C65A24] to-[#A34717] rounded-full flex items-center justify-center shadow-2xl shadow-[#C65A24]/40 hover:shadow-[#C65A24]/60 transition-shadow"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-[#E9DFC9]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.div>
      </motion.a>
      </div>
    </main>
  );
}