"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [submitted, setSubmitted] = useState(false);
  const [guideData, setGuideData] = useState({ name: "", email: "" });
  const [guideSubmitted, setGuideSubmitted] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");

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
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-xl">🏀</span>
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              413OPENCOURT
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FEATURES</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">REVIEWS</a>
            <a href="#guide" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FREE GUIDE</a>
            <a href="#signup" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">FREE TRIAL</a>
            <motion.a
              href="/auth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
            >
              LOGIN
            </motion.a>
          </div>
        </div>
      </motion.nav>

          {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        {/* GIF Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZXpobzdpOG5yejVrcTN6dmIwMXBlejY4Z2ppc3lhNHI5bWswdmpueSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/hS36nlCKcm2vGDzdjY/giphy.gif" 
            alt="Basketball"
            className="w-full h-full object-cover"
          />
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
            <a href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial.">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              >
                START FREE TRIAL
              </motion.button>
            </a>
            <a href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
              >
                LEARN MORE
              </motion.button>
            </a>
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
            EVERYTHING YOU NEED TO{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              DOMINATE
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🎥", title: "PRO TRAINING VIDEOS", desc: "HD videos covering dribbling, shooting, plays, and skillsets - organized by category.", color: "from-blue-500/20 to-blue-600/5 border-blue-500/20" },
              { icon: "📊", title: "PROGRESS TRACKING", desc: "Log every drill, track completion rates, and watch your game improve daily.", color: "from-red-500/20 to-red-600/5 border-red-500/20" },
              { icon: "🏀", title: "NBA-STYLE TRAINING", desc: "Professional curriculum designed by coaches who know what it takes to go pro.", color: "from-purple-500/20 to-purple-600/5 border-purple-500/20" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-b ${feature.color} backdrop-blur-xl border rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl`}
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
          <a href="https://wa.me/6591885348?text=Hi%20Coach!%20I%20want%20to%20sign%20up%20for%20a%20free%20trial.">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              START FREE TRIAL
            </motion.button>
          </a>
        </motion.div>
      </section>
            {/* Social Media */}
      <section className="px-8 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-white font-bold text-lg mb-6">FOLLOW US</h3>
          <div className="flex justify-center gap-6">
            {/* Instagram */}
            <a
              href="https://instagram.com/413opencourt"
              target="_blank"
              className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
            {/* TikTok */}
            <a
              href="https://tiktok.com/@413opencourt"
              target="_blank"
              className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg border border-white/10"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/6591885348?text=Hi%20Coach!"
              target="_blank"
              className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-green-500/25"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
            <a href="/auth" className="hover:text-gray-300 transition-colors">Coach Login</a>
          </div>
        </div>
      </footer>
    </main>
  );
}