"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Slot {
  id: number;
  date: string;
  duration: number;
  status: string;
  studentId: number | null;
  student?: { id: number; name: string } | null;
  googleEventLink?: string | null;
}

export default function CoachingAdminPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => { loadSlots(); }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coach/slots");
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error("Failed to load slots", err);
    }
    setLoading(false);
  };

  const createSlots = async () => {
    if (!newDate || !newTime) {
      setMessage({ type: "error", text: "Pick a date and time" });
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const dateTime = new Date(`${newDate}T${newTime}:00`).toISOString();
      const res = await fetch("/api/coach/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: [{ date: dateTime, duration: newDuration }] }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Slot created! 🎯" });
        setNewDate("");
        setNewTime("");
        loadSlots();
      } else {
        setMessage({ type: "error", text: data.error || "Failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    }
    setCreating(false);
  };

  const updateStatus = async (slotId: number, status: string) => {
    try {
      const res = await fetch("/api/coach/slots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, status }),
      });
      if (res.ok) {
        loadSlots();
        if (status === "confirmed") setMessage({ type: "success", text: "Confirmed! ✅ Student notified via dashboard." });
        if (status === "cancelled") setMessage({ type: "success", text: "Cancelled." });
        if (status === "completed") setMessage({ type: "success", text: "Marked completed." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update" });
    }
  };

  const deleteSlot = async (slotId: number) => {
    if (!confirm("Delete this slot?")) return;
    try {
      const res = await fetch(`/api/coach/slots?slotId=${slotId}`, { method: "DELETE" });
      if (res.ok) {
        loadSlots();
        setMessage({ type: "success", text: "Deleted." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-SG", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
  const isPast = (iso: string) => new Date(iso) < new Date();

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-[#C65A24]/20 text-[#E07B3C]",
      booked: "bg-[#C65A24]/20 text-[#E9DFC9]",
      confirmed: "bg-[#C65A24]/20 text-[#E07B3C]",
      cancelled: "bg-[#C65A24]/20 text-[#E07B3C]",
      completed: "bg-[#E9DFC9]/20 text-[#E9DFC9]/70",
    };
    return colors[status] || "bg-[#E9DFC9]/20 text-[#E9DFC9]/70";
  };

  // Separate upcoming and past
  const upcomingSlots = slots.filter((s) => !isPast(s.date));
  const pastSlots = slots.filter((s) => isPast(s.date));

  return (
    <div className="min-h-screen bg-[#171717] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#E9DFC9] mb-2">
          🏀 <span className="bg-gradient-to-r from-[#E9DFC9] to-[#C65A24] bg-clip-text text-transparent">COACH DASHBOARD</span>
        </h1>
        <p className="text-[#E9DFC9]/70 mb-8">Manage your coaching schedule</p>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl text-sm ${
              message.type === "success" ? "bg-[#C65A24]/10 text-[#E07B3C] border border-[#C65A24]/20" : "bg-[#C65A24]/10 text-[#E07B3C] border border-[#C65A24]/20"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Create Slot */}
        <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-[#E9DFC9] mb-4">+ Create New Slot</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-[#E9DFC9]/55 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-4 py-2.5 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#E9DFC9]/55 mb-1">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-4 py-2.5 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#E9DFC9]/55 mb-1">Duration (min)</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value))}
                className="bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-xl px-4 py-2.5 text-[#E9DFC9] text-sm focus:outline-none focus:border-[#C65A24]/50"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
            <button
              onClick={createSlots}
              disabled={creating}
              className="px-6 py-2.5 bg-gradient-to-r from-[#C65A24] to-[#A34717] hover:from-[#C65A24] hover:to-[#C65A24] text-[#E9DFC9] text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {creating ? "⏳" : "➕ Create"}
            </button>
          </div>
        </div>

        {/* Upcoming Slots */}
        <h2 className="text-lg font-bold text-[#E9DFC9] mb-4">📅 Upcoming Sessions ({upcomingSlots.length})</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-6 w-6 text-[#E07B3C]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : upcomingSlots.length === 0 ? (
          <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-8 text-center mb-8">
            <p className="text-[#E9DFC9]/55">No upcoming sessions. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {upcomingSlots.map((slot, i) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(slot.status)}`}>
                    {slot.status}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#E9DFC9] text-sm font-semibold">{formatDate(slot.date)}</p>
                    <p className="text-[#E9DFC9]/70 text-xs">{formatTime(slot.date)} · {slot.duration} min</p>
                  </div>
                  {slot.student && (
                    <span className="text-[#E07B3C] text-xs font-medium bg-[#C65A24]/10 px-2 py-1 rounded-lg">
                      {slot.student.name}
                    </span>
                  )}
                  {slot.googleEventLink && (
                    <a href={slot.googleEventLink} target="_blank" rel="noopener noreferrer" className="text-[#E07B3C] text-xs font-bold bg-[#C65A24]/10 px-2 py-1 rounded-lg hover:bg-[#C65A24]/20 transition-all">
                      📅 View
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {slot.status === "booked" && (
                    <button onClick={() => updateStatus(slot.id, "confirmed")} className="px-3 py-1.5 bg-[#A34717]/20 hover:bg-[#A34717]/30 text-[#E07B3C] text-xs font-bold rounded-lg transition-all">
                      ✓ Confirm
                    </button>
                  )}
                  {slot.status === "confirmed" && (
                    <button onClick={() => updateStatus(slot.id, "completed")} className="px-3 py-1.5 bg-[#C65A24]/20 hover:bg-[#C65A24]/30 text-[#E07B3C] text-xs font-bold rounded-lg transition-all">
                      Done
                    </button>
                  )}
                  {(slot.status === "available" || slot.status === "booked") && (
                    <button onClick={() => deleteSlot(slot.id)} className="px-3 py-1.5 bg-red-600/20 hover:bg-[#A34717]/30 text-[#E07B3C] text-xs font-bold rounded-lg transition-all">
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Past Sessions */}
        {pastSlots.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-[#E9DFC9] mb-4">📋 Past Sessions ({pastSlots.length})</h2>
            <div className="space-y-2">
              {pastSlots.slice(-10).map((slot) => (
                <div key={slot.id} className="bg-[#E9DFC9]/[0.02] border border-[#E9DFC9]/[0.05] rounded-xl p-3 flex items-center justify-between gap-4 opacity-70">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(slot.status)}`}>
                      {slot.status}
                    </span>
                    <p className="text-[#E9DFC9]/70 text-sm">{formatDate(slot.date)} · {formatTime(slot.date)}</p>
                    {slot.student && <span className="text-[#E9DFC9]/55 text-xs">{slot.student.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
