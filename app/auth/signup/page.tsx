"use client";
import { useEffect } from "react";

const GOOGLE_FORM_URL = "https://bit.ly/4bINSOP";

export default function SignupPage() {
  useEffect(() => {
    window.location.replace(GOOGLE_FORM_URL);
  }, []);

  return (
    <main className="min-h-screen bg-[#030303] flex items-center justify-center p-8 overflow-hidden relative">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
          <span className="text-2xl">🏀</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Opening our registration form…</h1>
        <p className="text-gray-400 mb-8">
          You'll be redirected to fill up your particulars.
          <br />
          If nothing happens, tap the button below.
        </p>
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
        >
          📋 Open Registration Form
        </a>
        <p className="text-gray-600 text-sm mt-8">© 2026 413OPENCOURT. All rights reserved.</p>
      </div>
    </main>
  );
}
