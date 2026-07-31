"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type FaqCategory = {
  icon: string;
  title: string;
  items: { q: string; a: string }[];
};

const FAQ_CATEGORIES: FaqCategory[] = [
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
        a: "We coach kids from age 6–16 and working adults (17+). Each experience is tailor-made according to your level of experience — from complete beginners to competitive players.",
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

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="border-b border-white/[0.06] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-base font-semibold text-white pr-4">{question}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function FaqPage() {
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
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Got questions? We've got answers.</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            ❓ Frequently Asked Questions
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Everything you need to know about 413 OpenCourt basketball coaching in Singapore.
          </p>
        </motion.div>
      </header>

      {/* FAQ Categories */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-10">
        {FAQ_CATEGORIES.map((cat, ci) => (
          <motion.section
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: ci * 0.08 }}
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-3 px-1">
              <span>{cat.icon}</span>
              {cat.title}
            </h2>
            <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
              {cat.items.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
              ))}
            </div>
          </motion.section>
        ))}

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 border border-white/[0.08] rounded-2xl p-6 text-center"
        >
          <p className="text-2xl mb-2">💬</p>
          <h2 className="text-lg font-bold text-white">Still have questions?</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            Feel free to reach out to us directly and we'll get back to you as soon as possible!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">
            <a
              href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20have%20a%20question%20about%20413OPENCOURT%20🏀"
              target="_blank"
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
            >
              📱 Chat on WhatsApp
            </a>
            <a
              href="/rates"
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-semibold hover:bg-white/10 transition-all"
            >
              💰 View Pricing
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
