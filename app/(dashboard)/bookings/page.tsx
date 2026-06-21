"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slot {
  id: number;
  date: string;
  duration: number;
  status: string;
  studentId: number | null;
}

export default function BookingsPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [myBookings, setMyBookings] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const sid = parseInt(localStorage.getItem("studentId") || "0");
    const sname = localStorage.getItem("studentName") || "";
    if (!sid) {
      window.location.href = "/auth";
      return;
    }
    setStudentId(sid);
    setStudentName(sname);
  }, []);

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, bookRes] = await Promise.all([
        fetch("/api/student/available-slots"),
        fetch(`/api/student/bookings?studentId=${studentId}`),
      ]);
      const availData = await availRes.json();
      const bookData = await bookRes.json();
      setAvailableSlots(availData.slots || []);
      setMyBookings(bookData.bookings || []);
    } catch (err) {
      console.error("Failed to load data", err);
    }
    setLoading(false);
  };

  const handleBook = async (slotId: number) => {
    setBooking(slotId);
    setMessage(null);
    try {
      const res = await fetch("/api/student/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, studentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "✅ Session booked! I'll confirm shortly." });
        loadData();
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to book. Try again." });
    }
    setBooking(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-SG", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
  };

  const isPast = (iso: string) => new Date(iso) < new Date();

  const getGoogleCalLink = (slot: Slot) => {
    const start = new Date(slot.date);
    const end = new Date(start.getTime() + slot.duration * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const text = encodeURIComponent("🏀 Basketball Coaching Session");
    const dates = `${fmt(start)}/${fmt(end)}`;
    const details = encodeURIComponent("Coaching session with 413OPENCOURT");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  };

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            BOOK{" "}
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              COACHING
            </span>
          </h1>
          <p className="text-gray-400 mb-2">Hey {studentName || "baller"} — book your next session below</p>
          <p className="text-gray-500 text-sm mb-10">📍 Venue: TBC after booking • 📲 I&apos;ll send a reminder before each session</p>
        </motion.div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Available Slots */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span> Available Sessions
              </h2>
              {availableSlots.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
                  <p className="text-gray-500">No available sessions right now. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableSlots.map((slot, i) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{formatDate(slot.date)}</p>
                          <p className="text-blue-400 text-sm mt-1">
                            🕐 {formatTime(slot.date)} · {slot.duration} min
                          </p>
                        </div>
                        <button
                          onClick={() => handleBook(slot.id)}
                          disabled={booking === slot.id}
                          className="shrink-0 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                        >
                          {booking === slot.id ? "⏳" : "Book"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* My Bookings */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏀</span> My Bookings
              </h2>
              {myBookings.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
                  <p className="text-gray-500">No bookings yet. Grab a slot!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((slot, i) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border rounded-xl p-5 transition-all ${
                        slot.status === "confirmed"
                          ? "bg-green-500/5 border-green-500/20"
                          : isPast(slot.date) && slot.status === "booked"
                          ? "bg-gray-500/5 border-gray-500/20"
                          : "bg-white/[0.03] border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{formatDate(slot.date)}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            🕐 {formatTime(slot.date)} · {slot.duration} min
                          </p>
                          <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${
                            slot.status === "confirmed"
                              ? "bg-green-500/20 text-green-400"
                              : slot.status === "booked"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : slot.status === "completed"
                              ? "bg-blue-500/20 text-blue-400"
                              : ""
                          }`}>
                            {slot.status === "confirmed" ? "✅ Confirmed" : slot.status === "booked" ? "⏳ Pending" : slot.status === "completed" ? "✓ Completed" : slot.status}
                          </span>
                        </div>
                        {slot.status === "confirmed" && (
                          <a
                            href={getGoogleCalLink(slot)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1"
                          >
                            📅 Add to Calendar
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
