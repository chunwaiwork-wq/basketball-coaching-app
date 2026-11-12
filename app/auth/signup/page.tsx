"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          whatsapp: whatsapp.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Could not create your account. Please try again.");
        setLoading(false);
        return;
      }

      // Sign the new account straight in
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const user = await loginRes.json().catch(() => ({}));

      if (loginRes.ok && user.id) {
        localStorage.clear();
        localStorage.setItem("userId", user.id.toString());
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userRole", user.role ?? "student");
        router.push("/dashboard/videos");
        return;
      }

      // Account created but auto-login failed — send them to the login page
      router.push("/auth/login?created=1");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/55 focus:outline-none focus:border-[#C65A24] focus:ring-1 focus:ring-[#C65A24]/50 transition-all";

  return (
    <main className="min-h-screen bg-[#171717] flex overflow-hidden relative">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#C65A24]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#C65A24]/10 rounded-full blur-[100px]" />
      </div>

      {/* Left — value props */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 py-16 border-r border-[#E9DFC9]/[0.06]">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <img src="/413opencourt_logo_white.png" alt="413 OpenCourt logo" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/85 bg-clip-text text-transparent">
            413OPENCOURT
          </span>
        </Link>

        <h1 className="text-4xl font-extrabold text-[#E9DFC9] mb-4">Create your account</h1>
        <p className="text-[#E9DFC9]/70 text-lg max-w-md leading-relaxed mb-10">
          Fill in your details once — then access your training videos, sessions and progress in one place.
        </p>

        <div className="space-y-6">
          {[
            { icon: "📹", title: "Training Videos", desc: "Your own drills and game breakdowns" },
            { icon: "📅", title: "Session Booking", desc: "One-to-one coaching with Coach Wai" },
            { icon: "📊", title: "Progress Tracking", desc: "See your improvement over time" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-start gap-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-[#E9DFC9] font-semibold">{item.title}</p>
                <p className="text-[#E9DFC9]/55 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-[#E9DFC9]/40 text-sm mt-12">© 2026 413OPENCOURT. All rights reserved.</p>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C65A24] to-[#A34717] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C65A24]/25">
              <span className="text-2xl">🏀</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#E9DFC9]">413 OPENCOURT</h1>
          </div>

          <h2 className="text-3xl font-bold text-[#E9DFC9] mb-2">Create an account</h2>
          <p className="text-[#E9DFC9]/70 mb-8">Enter your details to get started</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gerald Ang"
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">
                WhatsApp number <span className="text-[#E9DFC9]/40">(optional)</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9123 4567"
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E9DFC9]/55 hover:text-[#E9DFC9]/85 text-xs font-semibold"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] text-[#E9DFC9] rounded-xl font-bold text-base hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#C65A24]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Create account"
              )}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-sm text-[#E9DFC9]/55">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#E07B3C] hover:text-[#E07B3C] font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-[#E9DFC9]/40 hover:text-[#E9DFC9]/70 transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
