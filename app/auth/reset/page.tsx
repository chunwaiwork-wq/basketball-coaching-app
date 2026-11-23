"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Read the token from the URL without needing useSearchParams
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/55 focus:outline-none focus:border-[#C65A24] focus:ring-1 focus:ring-[#C65A24]/50 transition-all";

  return (
    <main className="min-h-screen bg-[#171717] text-[#E9DFC9] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C65A24]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#A34717]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <img
            src="/413opencourt_logo_white.png"
            alt="413 OpenCourt logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-[#E9DFC9] to-[#C65A24]/85 bg-clip-text text-transparent">
            413OPENCOURT
          </span>
        </Link>

        <div className="bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-3xl p-7 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            SET A NEW PASSWORD
          </h1>

          {done ? (
            <div className="space-y-4 mt-4">
              <div className="bg-[#C65A24]/10 border border-[#C65A24]/25 rounded-xl px-4 py-3">
                <p className="text-sm text-[#E9DFC9] font-semibold mb-1">All set ✅</p>
                <p className="text-[#E9DFC9]/70 text-sm">
                  Your password has been updated. Sign in with your new password.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block text-center px-6 py-3 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold hover:shadow-lg hover:shadow-[#C65A24]/25 transition-all"
              >
                Go to Login
              </Link>
            </div>
          ) : token === null ? (
            <p className="text-[#E9DFC9]/60 text-sm mt-4">Checking your reset link…</p>
          ) : !token ? (
            <div className="space-y-4 mt-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm">
                  This link is missing its reset code. Request a fresh link and try again.
                </p>
              </div>
              <Link
                href="/auth/forgot"
                className="block text-center px-6 py-3 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold transition-all"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[#E9DFC9]/70 text-sm mb-6 leading-relaxed">
                Pick a new password for your account. At least 6 characters.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
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
                  <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">
                    Confirm new password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold hover:shadow-lg hover:shadow-[#C65A24]/25 transition-all disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save New Password"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-[#E9DFC9]/55 hover:text-[#E9DFC9]/85 transition-colors"
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
