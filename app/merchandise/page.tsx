import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Merchandise — Coming Soon | 413OPENCOURT",
  description:
    "413OPENCOURT merchandise is coming soon — training gear and apparel built for players who train like they mean it. Get notified when the store opens.",
};

const NOTIFY_HREF = `https://wa.me/6591885348?text=${encodeURIComponent(
  "Hi Coach! Please notify me when the 413OPENCOURT merchandise store opens 🏀"
)}`;

const TEASERS = [
  { icon: "👕", label: "Tees & Jerseys" },
  { icon: "🧥", label: "Hoodies" },
  { icon: "🧢", label: "Caps" },
  { icon: "🎒", label: "Bags & Accessories" },
];

export default function MerchandisePage() {
  return (
    <main className="min-h-screen bg-[#171717] text-[#E9DFC9] overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C65A24]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#A34717]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
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
              <Link
                href="/"
                className="text-sm text-[#E9DFC9]/70 hover:text-[#E9DFC9] transition-colors hidden sm:block"
              >
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

        {/* Hero — coming soon */}
        <section className="relative pt-40 pb-16 px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C65A24]/10 border border-[#C65A24]/20 rounded-full text-[#E07B3C] text-xs font-bold tracking-[0.18em] uppercase mb-8">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#E07B3C] opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#E07B3C]" />
              </span>
              Store in progress
            </span>

            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.92] mb-6">
              <span className="bg-gradient-to-r from-[#E9DFC9] via-[#E07B3C] to-[#C65A24] bg-clip-text text-transparent">
                COMING
              </span>
              <br />
              SOON
            </h1>

            <p className="text-lg md:text-xl text-[#E9DFC9]/70 max-w-2xl mx-auto leading-relaxed mb-10">
              The{" "}
              <span className="text-[#E9DFC9] font-semibold">
                413OPENCOURT merchandise store
              </span>{" "}
              is being built right now — training gear and apparel for players who put the work
              in. Nothing on sale yet, but it won&apos;t be long.
            </p>

            <a
              href={NOTIFY_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold text-lg shadow-xl shadow-[#C65A24]/25 hover:shadow-[#C65A24]/40 transition-shadow"
            >
              Notify Me When It Drops
            </a>
            <p className="text-[#E9DFC9]/45 text-sm mt-3">
              One message on WhatsApp when the store opens. No spam.
            </p>
          </div>
        </section>

        {/* What's coming */}
        <section className="px-6 md:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#E9DFC9]/55 text-xs uppercase tracking-[0.2em] text-center mb-6">
              What we&apos;re working on
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEASERS.map((t) => (
                <div
                  key={t.label}
                  className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl px-4 py-8 text-center"
                >
                  <div className="text-3xl mb-3 opacity-60" aria-hidden="true">
                    {t.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#E9DFC9]/70">{t.label}</p>
                  <p className="text-[10px] font-bold tracking-widest text-[#C65A24] uppercase mt-2">
                    Soon
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[#E9DFC9]/35 text-xs text-center mt-6">
              Teaser only — nothing here is for sale yet and no prices are set.
            </p>
          </div>
        </section>

        {/* Meanwhile CTA */}
        <section className="px-6 md:px-8 pb-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#C65A24]/15 to-[#C65A24]/10 backdrop-blur-xl border border-[#E9DFC9]/10 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              TRAIN WITH US IN THE MEANTIME
            </h2>
            <p className="text-[#E9DFC9]/70 mb-7 max-w-xl mx-auto">
              Free 60-minute basketball skills assessment for kids and adults — no payment
              details needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20book%20my%20free%20trial%20and%20assessment%20%F0%9F%8F%80"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 bg-[#E9DFC9] text-[#171717] rounded-full font-bold hover:bg-[#E9DFC9]/90 transition-colors"
              >
                Book Free Trial
              </a>
              <Link
                href="/rates"
                className="inline-block px-8 py-3.5 bg-[#E9DFC9]/10 border border-[#E9DFC9]/20 rounded-full font-bold hover:bg-[#E9DFC9]/20 transition-colors"
              >
                See Rates
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E9DFC9]/5 px-8 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#E9DFC9]/55">
            <span>© 2024 413OPENCOURT. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-[#E9DFC9]/85 transition-colors">
                Home
              </Link>
              <Link href="/rates" className="hover:text-[#E9DFC9]/85 transition-colors">
                Rates
              </Link>
              <Link href="/faq" className="hover:text-[#E9DFC9]/85 transition-colors">
                FAQs
              </Link>
              <Link href="/auth/login" className="hover:text-[#E9DFC9]/85 transition-colors">
                Coach Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
