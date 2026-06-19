"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  { key: "name", label: "What's your name?" },
  { key: "age", label: "How old are you?" },
  { key: "gender", label: "What's your gender?" },
  { key: "experience", label: "How many years of basketball experience do you have?" },
  { key: "goals", label: "What do you want to improve on?" },
  { key: "startDate", label: "When would you like to start your free trial?" },
] as const;

interface Message {
  id: number;
  text: string;
  from: "bot" | "user";
}

interface TrialChatProps {
  onClose: () => void;
}

export default function TrialChat({ onClose }: TrialChatProps) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "🏀 Welcome to 413OPENCOURT! Let's get you set up for a free trial.", from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(1);

  // Ask next question with typing delay
  useEffect(() => {
    if (step < 0 || step >= QUESTIONS.length || done) return;
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          text: QUESTIONS[step].label,
          from: "bot",
        },
      ]);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 600);
    return () => clearTimeout(timer);
  }, [step, done]);

  // Auto-scroll
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const val = input.trim();
    if (!val || sending || done) return;

    const currentQ = QUESTIONS[step];
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, text: val, from: "user" },
    ]);
    setAnswers((prev) => ({ ...prev, [currentQ.key]: val }));
    setInput("");

    if (step + 1 < QUESTIONS.length) {
      setStep((s) => s + 1);
    } else {
      // All questions answered — submit to backend
      setSending(true);
      const allAnswers = { ...answers, [currentQ.key]: val };

      try {
        const res = await fetch("/api/trial-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allAnswers),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit");
        }

        setDone(true);
        setMessages((prev) => [
          ...prev,
          {
            id: msgIdRef.current++,
            text: "✅ Thanks! Your trial request has been submitted. We'll be in touch shortly! 🏀\n\nOpening WhatsApp to connect with your coach...",
            from: "bot",
          },
        ]);

        // Open WhatsApp after a moment
        setTimeout(() => {
          const msg = encodeURIComponent(
            `Hi Coach! I just signed up for a free trial on the website 🏀\n\nName: ${allAnswers.name}\nAge: ${allAnswers.age}\nGender: ${allAnswers.gender}\nExperience: ${allAnswers.experience} years\nGoals: ${allAnswers.goals}\nStart: ${allAnswers.startDate}`
          );
          window.open(`https://wa.me/6591885348?text=${msg}`, "_blank");
        }, 2000);
      } catch (err: any) {
        setError(err.message || "Something went wrong. Please try again.");
        setSending(false);
        setMessages((prev) => [
          ...prev,
          {
            id: msgIdRef.current++,
            text: "❌ Something went wrong submitting your request. Please try again.",
            from: "bot",
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  // Start the conversation
  const handleStart = () => {
    setStep(0);
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, text: "Let's start! What's your name?", from: "bot" },
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        className="w-full md:w-[420px] h-[600px] md:h-[600px] md:rounded-2xl bg-[#0b141a] flex flex-col overflow-hidden shadow-2xl border border-white/10"
        style={{ maxHeight: "100dvh" }}
      >
        {/* Header */}
        <div className="bg-[#1f2c33] px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            C
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">413OPENCOURT Coach</p>
            <p className="text-gray-400 text-xs">online</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth">
          {messages.length === 1 && step === -1 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="text-6xl mb-4">🏀</div>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Answer a few quick questions and we'll get your free trial set up!
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold text-sm transition-colors"
              >
                Start
              </button>
            </div>
          )}

          {messages.slice(1).map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "bg-[#005c4b] text-white rounded-br-md"
                    : "bg-[#1f2c33] text-white rounded-bl-md"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-[#1f2c33] px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <div ref={chatEnd} />
        </div>

        {/* Input */}
        <div className="bg-[#1f2c33] px-3 py-2 flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step < 0 ? "" : "Type a message..."}
            disabled={step < 0 || sending || done}
            className="flex-1 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || step < 0 || sending || done}
            className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
