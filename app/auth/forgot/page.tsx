"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            FORGOT PASSWORD
          </h1>
          <p className="text-[#E9DFC9]/70 text-sm mb-6 leading-relaxed">
            Enter the email on your account and we&apos;ll send you a link to set a new password.
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="bg-[#C65A24]/10 border border-[#C65A24]/25 rounded-xl px-4 py-3">
                <p className="text-sm text-[#E9DFC9] font-semibold mb-1">Check your inbox 📬</p>
                <p className="text-[#E9DFC9]/70 text-sm leading-relaxed">
                  If <span className="text-[#E9DFC9]">{email}</span> is registered, a reset link is
                  on its way. It expires in 30 minutes — remember to check spam.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block text-center px-6 py-3 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] rounded-full font-bold hover:shadow-lg hover:shadow-[#C65A24]/25 transition-all"
              >
                Back to Login
              </Link>
              <button
                onClick={() => setSent(false)}
                className="w-full text-center text-sm text-[#E9DFC9]/55 hover:text-[#E9DFC9]/85 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E9DFC9]/85 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/55 focus:outline-none focus:border-[#C65A24] focus:ring-1 focus:ring-[#C65A24]/50 transition-all"
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
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#E9DFC9]/[0.08]">
            <p className="text-[#E9DFC9]/45 text-xs leading-relaxed">
              <span className="font-semibold text-[#E9DFC9]/70">Log in with a 4-digit PIN?</span>{" "}
              Password resets only apply to email accounts. For a PIN, message Coach Wai on
              WhatsApp and he&apos;ll reset it for you.
            </p>
          </div>
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
