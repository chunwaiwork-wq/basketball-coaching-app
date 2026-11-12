"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slot {
  id: number;
  date: string;
  duration: number;
  status: string;
  studentId: number | null;
  googleEventLink?: string | null;
}

export default function BookingsPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [myBookings, setMyBookings] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestDuration, setRequestDuration] = useState(60);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const sid = parseInt(localStorage.getItem("studentId") || "0");
    const sname = localStorage.getItem("studentName") || "";
    if (sid) {
      setStudentId(sid);
      setStudentName(sname);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  // Auto-refresh every 15 seconds so new slots appear without manual refresh
  useEffect(() => {
    if (!studentId) return;
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [studentId]);

  const handlePinSubmit = async () => {
    setPinError("");
    setPinLoading(true);
    try {
      const res = await fetch("/api/student/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("studentId", data.student.id.toString());
        localStorage.setItem("studentName", data.student.name);
        setStudentId(data.student.id);
        setStudentName(data.student.name);
      } else {
        setPinError(data.error || "Invalid PIN");
      }
    } catch {
      setPinError("Something went wrong. Try again.");
    }
    setPinLoading(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/bookings?studentId=${studentId}`);
      const data = await res.json();
      setMyBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to load data", err);
    }
    setLoading(false);
  };

  const handleRequestSession = async () => {
    if (!requestDate || !requestTime) {
      setMessage({ type: "error", text: "Pick a date and time for your session" });
      return;
    }
    const sid = studentId || parseInt(localStorage.getItem("studentId") || "0");
    if (!sid) return;
    setRequesting(true);
    setMessage(null);
    try {
      const dateTime = new Date(`${requestDate}T${requestTime}:00`).toISOString();
      // Create the slot
      const createRes = await fetch("/api/coach/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: [{ date: dateTime, duration: requestDuration }] }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create slot");
      // Book it for the student
      const slotId = createData.slots[0].id;
      const bookRes = await fetch("/api/student/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, studentId: sid }),
      });
      const bookData = await bookRes.json();
      if (bookRes.ok) {
        setMessage({ type: "success", text: "✅ Session requested! I'll confirm shortly." });
        setRequestDate("");
        setRequestTime("");
        loadData();
      } else {
        setMessage({ type: "error", text: bookData.error || "Failed to book" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Try again." });
    }
    setRequesting(false);
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
    <main className="min-h-screen bg-[#171717] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C65A24]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black text-[#E9DFC9] mb-2">
            BOOK{" "}
            <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">
              COACHING
            </span>
          </h1>
          <p className="text-[#E9DFC9]/70 mb-1">Hey {studentName || "baller"} — book your next session below</p>
          <p className="text-[#E9DFC9]/55 text-sm">📍 Venue: TBC after booking • 📲 I&apos;ll send a reminder before each session</p>
          {studentId && (
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[#C65A24]/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#C65A24] rounded-full animate-pulse" />
                Live — refreshes every 15s
              </p>
            </div>
          )}
          <div className="mb-10" />
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
                  ? "bg-[#C65A24]/10 text-[#E07B3C] border border-[#C65A24]/20"
                  : "bg-[#C65A24]/10 text-[#E07B3C] border border-[#C65A24]/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {!studentId ? (
          /* --- Student PIN Login Screen --- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto mt-10"
          >
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🏀</div>
              <h2 className="text-2xl font-bold text-[#E9DFC9] mb-2">Student Access</h2>
              <p className="text-[#E9DFC9]/70 text-sm mb-6">Enter your 4-digit PIN to book a session</p>

              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all"
                    style={{
                      borderColor: pinInput.length > i ? "#3b82f6" : "rgba(255,255,255,0.15)",
                      backgroundColor: pinInput.length > i ? "rgba(59,130,246,0.1)" : "transparent",
                      color: pinInput.length > i ? "#60a5fa" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {pinInput[i] || ""}
                  </div>
                ))}
              </div>

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => pinInput.length < 4 && setPinInput(pinInput + n)}
                    className="w-full aspect-square rounded-xl bg-[#E9DFC9]/5 hover:bg-[#E9DFC9]/10 border border-[#E9DFC9]/10 text-[#E9DFC9] text-xl font-bold transition-all active:scale-95"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput(pinInput.slice(0, -1))}
                  className="w-full aspect-square rounded-xl bg-[#E9DFC9]/5 hover:bg-[#E9DFC9]/10 border border-[#E9DFC9]/10 text-[#E9DFC9]/70 text-sm font-medium transition-all"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  onClick={() => pinInput.length < 4 && setPinInput(pinInput + "0")}
                  className="w-full aspect-square rounded-xl bg-[#E9DFC9]/5 hover:bg-[#E9DFC9]/10 border border-[#E9DFC9]/10 text-[#E9DFC9] text-xl font-bold transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4 || pinLoading}
                  className="w-full aspect-square rounded-xl bg-gradient-to-r from-[#C65A24] to-[#A34717] hover:from-[#C65A24] hover:to-[#C65A24] disabled:opacity-40 text-[#E9DFC9] text-sm font-bold transition-all flex items-center justify-center"
                >
                  {pinLoading ? "⏳" : "✓"}
                </button>
              </div>

              {/* Also accept keyboard input — type your PIN directly */}
              <div className="mt-4">
                <label className="text-[#E9DFC9]/55 text-xs mb-2 block">Or type your PIN:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={(e) => e.key === "Enter" && pinInput.length === 4 && handlePinSubmit()}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 rounded-xl bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 text-[#E9DFC9] text-center text-lg font-bold placeholder:text-[#E9DFC9]/40 focus:border-[#C65A24] focus:outline-none transition-all"
                />
              </div>

              {pinError && (
                <p className="text-red-400 text-sm mt-2">{pinError}</p>
              )}
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#E07B3C]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Request Your Own Session */}
            <div className="mt-6 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-5">
              <h3 className="text-base font-bold text-[#E9DFC9] mb-3 flex items-center gap-2">
                ✋ Request Your Own Session
              </h3>
              <p className="text-[#E9DFC9]/55 text-xs mb-4">Don't see a time that works? Pick your own slot below.</p>
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="block text-xs text-[#E9DFC9]/55 mb-1">Date</label>
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-3 py-2 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#E9DFC9]/55 mb-1">Time</label>
                  <input
                    type="time"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-3 py-2 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#E9DFC9]/55 mb-1">Duration</label>
                  <select
                    value={requestDuration}
                    onChange={(e) => setRequestDuration(parseInt(e.target.value))}
                    className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-3 py-2 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleRequestSession}
                  disabled={requesting}
                  className="px-5 py-2 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] hover:from-[#E9DFC9]/25 hover:to-[#C65A24] disabled:opacity-50 text-[#E9DFC9] text-sm font-semibold rounded-xl transition-all"
                >
                  {requesting ? "⏳" : "Request"}
                </button>
              </div>
            </div>

            {/* My Bookings */}
            <div>
              <h2 className="text-xl font-bold text-[#E9DFC9] mb-4 flex items-center gap-2">
                <span className="text-2xl">🏀</span> My Bookings
              </h2>
              {myBookings.length === 0 ? (
                <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-8 text-center">
                  <p className="text-[#E9DFC9]/55">No bookings yet. Grab a slot!</p>
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
                          ? "bg-[#C65A24]/5 border-[#C65A24]/20"
                          : isPast(slot.date) && slot.status === "booked"
                          ? "bg-[#E9DFC9]/5 border-[#E9DFC9]/20"
                          : "bg-[#E9DFC9]/[0.03] border-[#E9DFC9]/[0.08]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[#E9DFC9] font-semibold">{formatDate(slot.date)}</p>
                          <p className="text-[#E9DFC9]/70 text-sm mt-1">
                            🕐 {formatTime(slot.date)} · {slot.duration} min
                          </p>
                          <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${
                            slot.status === "confirmed"
                              ? "bg-[#C65A24]/20 text-[#E07B3C]"
                              : slot.status === "booked"
                              ? "bg-[#C65A24]/20 text-[#E9DFC9]"
                              : slot.status === "completed"
                              ? "bg-[#C65A24]/20 text-[#E07B3C]"
                              : ""
                          }`}>
                            {slot.status === "confirmed" ? "✅ Confirmed" : slot.status === "booked" ? "⏳ Pending" : slot.status === "completed" ? "✓ Completed" : slot.status}
                          </span>
                        </div>
                        {slot.status === "confirmed" && (
                          <a
                            href={slot.googleEventLink || getGoogleCalLink(slot)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3 py-2 bg-[#E9DFC9]/5 hover:bg-[#E9DFC9]/10 border border-[#E9DFC9]/10 text-[#E9DFC9] text-xs font-medium rounded-xl transition-all flex items-center gap-1"
                          >
                            📅 View in Calendar
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
