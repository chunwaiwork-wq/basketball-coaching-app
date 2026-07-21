"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TrialChat from "../components/TrialChat";
import Link from "next/link";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [submitted, setSubmitted] = useState(false);
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

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi Coach! I want to sign up for a free trial.%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0AWhatsApp: ${formData.whatsapp}`;
    window.open(`https://wa.me/6591885348?text=${message}`, '_blank');
    setSubmitted(true);
  };

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
    <main className="min-h-screen bg-[#030303] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <motion.div whileHover={{ scale: 1.02 }}>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              413OPENCOURT
            </span>
          </motion.div>

          <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/rates" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">RATES</Link>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">TESTIMONIALS</a>
            <a href="#guide" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FREE GUIDE</a>
            <a href="#signup" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FREE TRIAL</a>
            <a href="/auth/signup" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">SIGN UP</a>
          </div>

          <motion.a
            href="/auth/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
          >
              LOGIN
            </motion.a>
          </div>
        </motion.nav>

          {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-bg.webm" type="video/webm" />
            <source src="/hero-bg-compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
        
        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold tracking-wider mb-8">
              ELITE BASKETBALL TRAINING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-8"
          >
            TRAIN LIKE
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-red-400 bg-clip-text text-transparent">
              A PRO
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Elite basketball training platform with pro-level drills, 
            game breakdowns, and progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 justify-center"
          >
            <motion.a
              href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial%20%E2%9B%B9"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow cursor-pointer"
              >
                START FREE TRIAL
              </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="max-w-4xl mx-auto px-8 py-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 grid grid-cols-3 gap-8">
          {[
            { number: "200+", label: "Training Videos" },
            { number: "50+", label: "Active Coaches" },
            { number: "1K+", label: "Athletes Trained" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <section id="features" className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
              WHY{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              ATHLETES CHOOSE US
            </span>
          </motion.h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Three pillars that set our training apart
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏠",
                title: "CONVENIENCE",
                desc: "Train at your preferred location — home, park, or local court. No long drives, no rigid schedules. We design a program that fits your space and your life.",
                color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
                shadow: "shadow-blue-500/10 hover:shadow-blue-500/25",
              },
              {
                icon: "💪",
                title: "CONFIDENCE",
                desc: "Our structured drills and progress tracking build real confidence. Watch your handles tighten, your shot improve, and your belief in yourself soar with every session.",
                color: "from-red-500/20 to-red-600/5 border-red-500/20",
                shadow: "shadow-red-500/10 hover:shadow-red-500/25",
              },
              {
                icon: "🎯",
                title: "CLARITY",
                desc: "Stop searching. We give you a step-by-step training roadmap from where you are now to where you want to be. No guesswork, just a clear path to your goals.",
                color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
                shadow: "shadow-purple-500/10 hover:shadow-purple-500/25",
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
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-6">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
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
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              ATHLETES
            </span>{" "}
            SAY
          </motion.h2>
          <p className="text-gray-400 text-center mb-16">Real results from real players</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marcus J.",
                role: "College Point Guard",
                quote: "Coach Pro transformed my game. The drill tracker kept me accountable and I saw real improvement in just 4 weeks.",
                rating: 5,
                color: "from-blue-500/10 to-blue-600/5 border-blue-500/20"
              },
              {
                name: "David L.",
                role: "High School Forward",
                quote: "The video breakdowns are next level. I finally understand pick and roll reads thanks to the detailed analysis.",
                rating: 5,
                color: "from-red-500/10 to-red-600/5 border-red-500/20"
              },
              {
                name: "James K.",
                role: "Pro Aspiring Guard",
                quote: "NBA-style training that actually works. My shooting percentage went up 15% after following the drills consistently.",
                rating: 5,
                color: "from-purple-500/10 to-purple-600/5 border-purple-500/20"
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
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
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
          <div className="bg-gradient-to-b from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-10 md:p-14 text-center">
            <div className="text-6xl mb-6">🏀</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              GET YOUR{" "}
              <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                FREE SHOOTING GUIDE
              </span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
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
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={guideData.email}
                  onChange={(e) => setGuideData({ ...guideData, email: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {guideError && (
                  <p className="text-red-400 text-sm">{guideError}</p>
                )}
                <motion.button
                  type="submit"
                  disabled={guideLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow disabled:opacity-50"
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
                <h3 className="text-2xl font-bold text-green-400 mb-2">
                  GUIDE SENT!
                </h3>
                <p className="text-gray-400">
                  Check your inbox — we've sent the guide to your email! If you don't see it,{" "}
                  <a href="/free-shooting-guide.pdf" className="text-blue-400 hover:underline" download>
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
          className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">READY TO GO PRO?</h2>
          <p className="text-gray-400 mb-8">Join hundreds of athletes transforming their game. Start your free trial today.</p>
          <motion.a
            href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial%20%E2%9B%B9"
            target="_blank"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              START FREE TRIAL
            </motion.a>
        </motion.div>
              </section>

              {/* Contact Us */}
              <section className="px-8 py-10">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-white font-bold text-lg mb-6">CONTACT US</h3>
                  <div className="flex justify-center gap-6">
                    {/* Phone */}
                    <a
                      href="tel:+659****5348"
                      className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-green-500/25"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </a>
                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/6591885348?text=Hi%20Coach!"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-green-500/25"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                    {/* Facebook */}
                    <a
                      href="https://facebook.com/profile.php?id=61578547212978"
                      target="_blank"
                      className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-blue-500/25"
                    >
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </section>

              {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>© 2024 413OPENCOURT. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-gray-300 transition-colors">Reviews</a>
            <a href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial." className="hover:text-gray-300 transition-colors">Free Trial</a>
            <a href="#guide" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FREE GUIDE</a>
            <a href="/auth/login" className="hover:text-gray-300 transition-colors">Coach Login</a>
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
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-shadow"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.div>
      </motion.a>
    </main>
  );
}