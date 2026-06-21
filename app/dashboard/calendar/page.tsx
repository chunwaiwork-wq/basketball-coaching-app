"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CalendarSetupContent() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setConnected(data.email);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-lg mx-auto mt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            📅{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              CALENDAR
            </span>
          </h1>
          <p className="text-gray-400 mb-10">
            Connect your Google Calendar so confirmed sessions auto-sync
          </p>

          {/* Success / Error messages */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium">
              ✅ Google Calendar connected as {success.replace(/\+/g, " ")}!
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium">
              ❌ {error.replace(/\+/g, " ")}
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
            {checking ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : connected ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Google Calendar synced as <span className="text-blue-400">{connected}</span>
                </p>
                <p className="text-gray-500 text-xs">
                  Session confirmations will now create events on your calendar automatically.
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">📅</div>
                <h2 className="text-xl font-bold text-white mb-2">Connect Google Calendar</h2>
                <p className="text-gray-400 text-sm mb-6">
                  When you confirm a coaching session, it will be automatically added to your Google Calendar.
                </p>
                <a
                  href="/api/calendar/auth"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Sign in with Google
                </a>
                <p className="text-gray-600 text-xs mt-6 leading-relaxed">
                  You&apos;ll be taken to Google to authorize. Make sure to grant the <strong>calendar</strong> permission. You can reconnect anytime by signing out of Google and coming back here.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function CalendarSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <CalendarSetupContent />
    </Suspense>
  );
}
