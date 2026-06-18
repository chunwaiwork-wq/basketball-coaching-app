"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPin = async (enteredPin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("studentId", data.studentId.toString());
        localStorage.setItem("studentName", data.studentName);
        router.push("/dashboard/videos");
      } else {
        setError("Invalid PIN. Try again.");
        setPin("");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      setPin("");
    }
    setLoading(false);
  };

  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) {
        checkPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const pinDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <main className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25"
          >
            <span className="text-2xl">🏀</span>
          </motion.div>
          <h1 className="text-3xl font-black text-white">COACH PRO</h1>
          <p className="text-gray-400 text-sm mt-2">Enter your 4-digit PIN to access training</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 mb-6">
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: pin.length > i ? 1 : 0.8,
                  opacity: pin.length > i ? 1 : 0.3,
                }}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  pin.length > i
                    ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50"
                    : "border-white/20"
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {loading && (
            <div className="flex justify-center">
              <svg className="animate-spin h-6 w-6 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {pinDigits.map((digit, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (digit === "delete") handleDelete();
                else if (digit !== "") handlePinClick(digit);
              }}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                digit === ""
                  ? "bg-transparent cursor-default"
                  : digit === "delete"
                  ? "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  : "bg-white/[0.03] border border-white/[0.08] text-white hover:bg-white/[0.06]"
              }`}
              disabled={digit === "" || loading}
            >
              {digit === "delete" ? (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
                </svg>
              ) : (
                digit
              )}
            </motion.button>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to home
          </a>
        </div>
      </motion.div>
    </main>
  );
}