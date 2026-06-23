"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"student" | "coach">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle Google callback errors
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_denied") setError("Google sign-in was cancelled");
    else if (err === "config") setError("Google login is not configured");
    else if (err === "no_email") setError("Could not get your email from Google");
    else if (err === "server_error" || err === "callback_failed") setError("Something went wrong. Try again.");
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("userId", data.id.toString());
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);

      if (data.role === "coach") {
        localStorage.setItem("isCoach", "true");
        router.push("/dashboard/videos");
      } else {
        router.push("/dashboard/videos");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#030303] flex overflow-hidden">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
            <span className="text-2xl">🏀</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">413 OPENCOURT</h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            Elite basketball training platform. Access your personalized
            training videos, book coaching sessions, and track your progress.
          </p>
        </div>

        <div className="space-y-6">
          {[
            { icon: "📹", title: "Training Videos", desc: "Hundreds of curated drills and game breakdowns" },
            { icon: "📅", title: "Session Booking", desc: "Book one-on-one coaching sessions with ease" },
            { icon: "📊", title: "Progress Tracking", desc: "Track your improvement over time" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-gray-600 text-sm">© 2026 413OPENCOURT. All rights reserved.</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <span className="text-2xl">🏀</span>
            </div>
            <h1 className="text-2xl font-black text-white">413 OPENCOURT</h1>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to access your training dashboard</p>

          {/* Tab Toggle */}
          <div className="flex bg-white/[0.03] rounded-xl p-1 mb-8 border border-white/[0.06]">
            {(["student", "coach"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "student" ? "🏀 Student" : "👑 Coach"}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-base hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Google Sign In */}
          <motion.a
            href="/api/auth/google"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-medium text-sm hover:bg-white/[0.06] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.a>

          <p className="text-center mt-8 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </a>
          </p>

          {tab === "student" && (
            <p className="text-center mt-3 text-xs text-gray-600">
              Still have a PIN?{" "}
              <a href="/auth" className="text-gray-400 hover:text-gray-300 transition-colors">
                Login with PIN
              </a>
            </p>
          )}

          <div className="text-center mt-8">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
              ← Back to home
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
