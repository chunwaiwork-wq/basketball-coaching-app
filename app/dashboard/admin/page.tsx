"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Student {
  id: number;
  name: string;
  pin: string;
  packageSize?: number | null;
  _count?: { videos: number; bookings: number };
}

interface SessionRec {
  id: number;
  studentId: number;
  clockIn: string;
  clockOut: string | null;
  status: string;
  student: { id: number; name: string; packageSize?: number | null };
}

interface PaymentRec {
  id: number;
  studentId: number | null;
  amount: number;
  sessions: number | null;
  method: string;
  note: string | null;
  paidAt: string;
  student: { id: number; name: string } | null;
}

interface Video {
  id: number;
  title: string;
  url: string;
  category: string;
  createdAt: string;
  student: { id: number; name: string };
}

interface Booking {
  id: number;
  date: string;
  duration: number;
  status: string;
  student?: { id: number; name: string } | null;
}

type Tab = "overview" | "students" | "videos" | "bookings" | "sessions" | "revenue";

export default function CoachAdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const [students, setStudents] = useState<Student[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<SessionRec[]>([]);
  const [loading, setLoading] = useState(false);

  // Sessions tab state
  const [clockStudentId, setClockStudentId] = useState("");
  const [sessionMsg, setSessionMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Add video form state
  const [addStudentId, setAddStudentId] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addCategory, setAddCategory] = useState("PAST");
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Revenue tab state
  const [payments, setPayments] = useState<PaymentRec[]>([]);
  const [revenueTotals, setRevenueTotals] = useState<{
    allTime: number; thisMonth: number; thisYear: number;
    count: number; avgPerPayment: number; payingStudents: number;
  } | null>(null);
  const [byStudent, setByStudent] = useState<{ studentId: number; name: string; total: number; count: number }[]>([]);
  const [monthly, setMonthly] = useState<{ month: string; total: number }[]>([]);
  const [revStudentId, setRevStudentId] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revSessions, setRevSessions] = useState("");
  const [revMethod, setRevMethod] = useState("PayNow");
  const [revNote, setRevNote] = useState("");
  const [revDate, setRevDate] = useState("");
  const [revMsg, setRevMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("coachPin") || "";
    if (stored) {
      setPin(stored);
      setAuthed(true);
      loadData(stored);
      loadSessions(stored);
      loadPayments(stored);
    }
    setChecking(false);
  }, []);

  // Refresh revenue whenever the Revenue tab is opened
  useEffect(() => {
    if (tab === "revenue" && pin) loadPayments(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Live clock for the sessions tab (tick every 30s to update elapsed time)
  useEffect(() => {
    if (tab !== "sessions") return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [tab]);

  const loadData = async (p: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/coach/admin?pin=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        setLoading(false);
        return;
      }
      setStudents(data.students || []);
      setVideos(data.videos || []);
      setBookings(data.bookings || []);
    } catch {
      setError("Network error loading admin data");
    }
    setLoading(false);
  };

  const loadSessions = async (p: string) => {
    try {
      const res = await fetch(`/api/coach/admin/sessions?pin=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (res.ok) setSessions(data.sessions || []);
    } catch {
      // non-fatal
    }
  };

  const loadPayments = async (p: string) => {
    try {
      const res = await fetch(`/api/coach/admin/payments?pin=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
        setRevenueTotals(data.totals || null);
        setByStudent(data.byStudent || []);
        setMonthly(data.monthly || []);
      }
    } catch {
      // non-fatal
    }
  };

  const handleAddPayment = async () => {
    setRevMsg(null);
    const isBulk = revStudentId === "bulk";
    if (!revStudentId) {
      setRevMsg({ ok: false, text: "Choose a student — or pick “Bulk month total”" });
      return;
    }
    const amt = parseFloat(revAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setRevMsg({ ok: false, text: "Enter an amount greater than 0" });
      return;
    }
    const res = await fetch("/api/coach/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin,
        studentId: isBulk ? null : parseInt(revStudentId),
        amount: amt,
        sessions: revSessions === "" ? null : parseInt(revSessions),
        method: revMethod,
        note: revNote,
        paidAt: revDate ? new Date(revDate).toISOString() : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const nm = data.payment?.student?.name ?? "bulk total";
      setRevMsg({ ok: true, text: `✅ Logged $${amt.toFixed(2)} from ${nm}` });
      setRevAmount("");
      setRevSessions("");
      setRevNote("");
      setRevDate("");
      await loadPayments(pin);
    } else {
      setRevMsg({ ok: false, text: data.error || "Failed to log payment" });
    }
  };

  const handleDeletePayment = async (paymentId: number, label: string) => {
    if (!confirm(`Delete this payment record (${label})? This cannot be undone.`)) return;
    const res = await fetch("/api/coach/admin/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, paymentId }),
    });
    if (res.ok) {
      setRevMsg({ ok: true, text: "Payment deleted" });
      await loadPayments(pin);
    } else {
      const data = await res.json().catch(() => ({}));
      setRevMsg({ ok: false, text: data.error || "Failed to delete payment" });
    }
  };

  const handleClock = async (action: "in" | "out") => {
    setSessionMsg(null);
    if (!clockStudentId) {
      setSessionMsg({ ok: false, text: "Select a student first" });
      return;
    }
    const res = await fetch("/api/coach/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, studentId: parseInt(clockStudentId), action }),
    });
    const data = await res.json();
    if (res.ok) {
      setSessionMsg({ ok: true, text: data.message || "Done" });
      await Promise.all([loadSessions(pin), loadData(pin)]);
    } else {
      setSessionMsg({ ok: false, text: data.error || "Clock action failed" });
    }
  };

  const handleSetPackage = async (studentId: number, packageSize: number | null) => {
    const res = await fetch("/api/coach/admin/students/package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, studentId, packageSize }),
    });
    if (res.ok) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, packageSize } : s))
      );
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to update package size");
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Delete this session record? This cannot be undone.")) return;
    const res = await fetch("/api/coach/admin/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, sessionId }),
    });
    if (res.ok) {
      await Promise.all([loadSessions(pin), loadData(pin)]);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete session");
    }
  };

  // Reset a student's session count after they renew their package.
  // Previously attended sessions are archived (kept in history, no longer counted).
  const handleResetSessions = async (studentId: number, name: string) => {
    if (
      !confirm(
        `Reset ${name}'s session count?\n\nTheir attended sessions will be ARCHIVED (kept in history, but no longer counted) so their package starts fresh. Use this when they renew.`
      )
    )
      return;
    const res = await fetch("/api/coach/admin/sessions/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, studentId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSessionMsg({
        ok: true,
        text: `🔄 ${name} reset — ${data.archived} session${data.archived === 1 ? "" : "s"} archived. Package starts fresh.`,
      });
      await Promise.all([loadSessions(pin), loadData(pin)]);
    } else {
      setSessionMsg({ ok: false, text: data.error || "Reset failed" });
    }
  };

  // Undo an accidental reset: restore archived sessions so they count again.
  const handleUndoReset = async (studentId: number, name: string) => {
    if (!confirm(`Undo reset for ${name}?\n\nTheir archived sessions will count toward the package again.`)) return;
    const res = await fetch("/api/coach/admin/sessions/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, studentId, undo: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSessionMsg({
        ok: true,
        text: `↩️ ${name} — ${data.restored} archived session${data.restored === 1 ? "" : "s"} restored.`,
      });
      await Promise.all([loadSessions(pin), loadData(pin)]);
    } else {
      setSessionMsg({ ok: false, text: data.error || "Undo failed" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    const res = await fetch(`/api/coach/admin?pin=${encodeURIComponent(pin)}`);
    if (res.ok) {
      localStorage.setItem("coachPin", pin);
      setAuthed(true);
      await Promise.all([loadData(pin), loadSessions(pin)]);
    } else {
      setError("Invalid coach PIN");
    }
    setChecking(false);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);
    if (!addStudentId || !addTitle.trim() || !addUrl.trim()) {
      setAddMsg({ ok: false, text: "Student, title, and URL are required" });
      return;
    }
    // Accept full YouTube/shorts URLs, extract the video ID
    let videoId = addUrl.trim();
    const m = videoId.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) videoId = m[1];

    const res = await fetch("/api/coach/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, studentId: parseInt(addStudentId), title: addTitle.trim(), url: videoId, category: addCategory }),
    });
    const data = await res.json();
    if (res.ok) {
      setAddMsg({ ok: true, text: `Added "${addTitle.trim()}" to ${data.studentName || "student"}` });
      setAddTitle("");
      setAddUrl("");
      await loadData(pin);
    } else {
      setAddMsg({ ok: false, text: data.error || "Failed to add video" });
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    const res = await fetch("/api/coach/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, videoId: id }),
    });
    if (res.ok) {
      await loadData(pin);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete video");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("coachPin");
    setAuthed(false);
    setPin("");
  };

  // Click a student → jump to Add Video form with them preselected
  const handlePickStudent = (id: number) => {
    setAddStudentId(String(id));
    setTab("videos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-[#171717] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#E07B3C]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-[#E9DFC9]/[0.03] backdrop-blur-xl border border-[#E9DFC9]/[0.08] rounded-2xl p-8"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C65A24] to-[#A34717] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C65A24]/25">
              <span className="text-2xl">👑</span>
            </div>
            <h1 className="text-2xl font-black text-[#E9DFC9]">Coach Admin</h1>
            <p className="text-[#E9DFC9]/70 text-sm mt-1">Enter your coach PIN to manage the academy</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] text-center text-2xl tracking-[0.5em] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] focus:ring-1 focus:ring-[#C65A24]/50 transition-all"
              required
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-3.5 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] text-[#E9DFC9] rounded-xl font-bold text-base hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#C65A24]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access Admin Panel
            </button>
          </form>
          <a href="/dashboard/videos" className="block text-center text-sm text-[#E9DFC9]/55 hover:text-[#E9DFC9]/85 mt-6 transition-colors">
            ← Back to dashboard
          </a>
        </motion.div>
      </main>
    );
  }

  const stats = {
    students: students.length,
    videos: videos.length,
    bookings: bookings.length,
    sessions: sessions.filter((s) => s.status === "completed").length,
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "students", label: "Students", icon: "👥" },
    { id: "videos", label: "Videos", icon: "🎥" },
    { id: "sessions", label: "Sessions", icon: "⏱️" },
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "bookings", label: "Bookings", icon: "📅" },
  ];

  const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-SG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-[#171717] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C65A24]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C65A24]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#E9DFC9]/70 text-sm mb-1">Welcome back, Coach</p>
            <h1 className="text-4xl font-black text-[#E9DFC9]">
              COACH{" "}
              <span className="bg-gradient-to-r from-[#E07B3C] to-[#E9DFC9] bg-clip-text text-transparent">
                ADMIN PANEL
              </span>
            </h1>
            <p className="text-[#E9DFC9]/70 mt-1">Manage students, videos, and bookings in one place</p>
          </motion.div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 text-red-300 hover:bg-[#A34717]/30 border border-red-500/30 rounded-xl text-sm font-semibold transition-all w-fit"
          >
            ✕ Log out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Students", value: stats.students, icon: "👥" },
            { label: "Videos", value: stats.videos, icon: "🎥" },
            { label: "Sessions Done", value: stats.sessions, icon: "⏱️" },
            { label: "Revenue", value: `$${(revenueTotals?.allTime ?? 0).toFixed(0)}`, icon: "💰" },
            { label: "Bookings", value: stats.bookings, icon: "📅" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-5 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-[#E9DFC9]">{s.value}</div>
              <div className="text-[#E9DFC9]/55 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[#E9DFC9] text-[#171717] shadow-lg"
                  : "bg-[#E9DFC9]/5 text-[#E9DFC9]/70 hover:text-[#E9DFC9] border border-[#E9DFC9]/10"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#E07B3C]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && tab === "overview" && (
          <div className="space-y-6">
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#E9DFC9] mb-4">👥 Students</h2>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handlePickStudent(s.id)}
                    className="px-4 py-2 bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-full text-sm text-[#E9DFC9]/90 hover:bg-[#C65A24]/20 hover:border-[#C65A24]/40 transition-all cursor-pointer"
                    title={`Add video for ${s.name}`}
                  >
                    {s.name} <span className="text-[#E9DFC9]/55">· {s._count?.videos ?? 0} videos</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#E9DFC9] mb-2">📋 Quick Actions</h2>
              <p className="text-[#E9DFC9]/70 text-sm mb-4">Use the tabs above to manage content.</p>
              <button onClick={() => setTab("videos")} className="px-5 py-2.5 bg-[#C65A24]/20 text-[#E07B3C] border border-[#C65A24]/30 rounded-xl text-sm font-semibold hover:bg-[#C65A24]/30 transition-all">
                ➕ Add a Training Video
              </button>
            </div>
          </div>
        )}

        {!loading && tab === "students" && (
          <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06]">
              <h2 className="text-lg font-bold text-[#E9DFC9]">All Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">PIN</th>
                    <th className="px-6 py-3">Videos</th>
                    <th className="px-6 py-3">Bookings</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-[#E9DFC9]/[0.02]">
                      <td className="px-6 py-3 text-[#E9DFC9]/55">{s.id}</td>
                      <td className="px-6 py-3 text-[#E9DFC9] font-semibold">{s.name}</td>
                      <td className="px-6 py-3 text-[#E9DFC9]/70 font-mono">{s.pin}</td>
                      <td className="px-6 py-3 text-[#E9DFC9]/85">{s._count?.videos ?? 0}</td>
                      <td className="px-6 py-3 text-[#E9DFC9]/85">{s._count?.bookings ?? 0}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handlePickStudent(s.id)}
                          className="text-xs px-3 py-1.5 bg-[#C65A24]/20 border border-[#C65A24]/30 rounded-lg text-[#E07B3C] hover:bg-[#C65A24]/30 transition-all whitespace-nowrap"
                        >
                          ➕ Add video
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === "videos" && (
          <div className="space-y-8">
            {/* Add Video Form */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#E9DFC9] mb-4">➕ Add Video</h2>
              <form onSubmit={handleAddVideo} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#E9DFC9]/70 mb-1.5">Student</label>
                  <select
                    value={addStudentId}
                    onChange={(e) => setAddStudentId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all"
                  >
                    <option value="">Select student…</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#171717]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#E9DFC9]/70 mb-1.5">Category</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all"
                  >
                    <option value="PAST" className="bg-[#171717]">📼 Past Training Video</option>
                    <option value="DRIBBLING" className="bg-[#171717]">🏀 Dribbling</option>
                    <option value="SHOOTING" className="bg-[#171717]">🎯 Shooting</option>
                    <option value="PLAYS" className="bg-[#171717]">📋 Plays</option>
                    <option value="SKILLSETS" className="bg-[#171717]">⚡ Skillsets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#E9DFC9]/70 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. Session on 010826"
                    className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#E9DFC9]/70 mb-1.5">YouTube URL or Video ID</label>
                  <input
                    type="text"
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/VIDEOID or VIDEOID"
                    className="w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#C65A24] to-[#E07B3C] text-[#E9DFC9] rounded-xl font-bold text-sm hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#C65A24]/25"
                  >
                    ➕ Add Video
                  </button>
                  {addMsg && (
                    <p className={`mt-3 text-sm ${addMsg.ok ? "text-[#E07B3C]" : "text-[#E07B3C]"}`}>{addMsg.text}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Video List */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#E9DFC9]">All Videos ({videos.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Video ID</th>
                      <th className="px-6 py-3">Added</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                    {videos.map((v) => (
                      <tr key={v.id} className="hover:bg-[#E9DFC9]/[0.02]">
                        <td className="px-6 py-3 text-[#E9DFC9] font-semibold">{v.title}</td>
                        <td className="px-6 py-3 text-[#E9DFC9]/85">{v.student?.name ?? "—"}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 text-[#E9DFC9]/85">{v.category}</span>
                        </td>
                        <td className="px-6 py-3 text-[#E9DFC9]/70 font-mono text-xs">{v.url}</td>
                        <td className="px-6 py-3 text-[#E9DFC9]/55 text-xs">{new Date(v.createdAt).toLocaleDateString("en-SG")}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${v.url}`, "_blank")}
                            className="text-xs px-3 py-1.5 bg-[#E9DFC9]/5 border border-[#E9DFC9]/10 rounded-lg text-[#E9DFC9]/85 hover:bg-[#E9DFC9]/10 mr-2 transition-all"
                          >
                            ▶ Watch
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(v.id)}
                            className="text-xs px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-[#A34717]/30 transition-all"
                          >
                            ✕ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#E9DFC9]/55">No videos yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "sessions" && (
          <div className="space-y-8">
            {/* Clock In / Clock Out */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#E9DFC9] mb-1">⏱️ Clock In / Clock Out</h2>
              <p className="text-[#E9DFC9]/55 text-sm mb-4">Select a student, then clock them in when the session starts and out when it ends.</p>
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <select
                  value={clockStudentId}
                  onChange={(e) => { setClockStudentId(e.target.value); setSessionMsg(null); }}
                  className="flex-1 px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all"
                >
                  <option value="">Select student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#171717]">
                      {s.name}
                      {sessions.find((x) => x.studentId === s.id && x.status === "active") ? " — 🔴 clocked in" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleClock("in")}
                  className="px-6 py-3 bg-gradient-to-r from-[#A34717] to-[#C65A24] text-[#E9DFC9] rounded-xl font-bold text-sm hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#A34717]/25 whitespace-nowrap"
                >
                  🟢 Clock In
                </button>
                <button
                  onClick={() => handleClock("out")}
                  className="px-6 py-3 bg-gradient-to-r from-[#A34717] to-[#C65A24] text-[#E9DFC9] rounded-xl font-bold text-sm hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#A34717]/25 whitespace-nowrap"
                >
                  🔴 Clock Out
                </button>
              </div>
              {sessionMsg && (
                <p className={`mt-3 text-sm ${sessionMsg.ok ? "text-[#E07B3C]" : "text-[#E07B3C]"}`}>{sessionMsg.text}</p>
              )}

              {/* Active sessions live */}
              {sessions.some((s) => s.status === "active") && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs text-[#E9DFC9]/55 uppercase tracking-wider">Currently in session</p>
                  {sessions.filter((s) => s.status === "active").map((s) => {
                    const elapsed = Math.max(0, Math.floor((now - new Date(s.clockIn).getTime()) / 60000));
                    return (
                      <div key={s.id} className="flex items-center justify-between bg-[#C65A24]/10 border border-[#C65A24]/30 rounded-xl px-4 py-3">
                        <span className="text-[#E9DFC9] font-semibold">{s.student.name}</span>
                        <span className="text-[#E07B3C] font-mono text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#E07B3C] animate-pulse" />
                          {Math.floor(elapsed / 60)}h {elapsed % 60}m in session
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attendance per student */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06]">
                <h2 className="text-lg font-bold text-[#E9DFC9]">📈 Attendance</h2>
                <p className="text-[#E9DFC9]/55 text-sm mt-0.5">Set each student&apos;s package (4, 8, 10 or 12 sessions) and see how many they&apos;ve attended.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Package</th>
                      <th className="px-6 py-3">Attended</th>
                      <th className="px-6 py-3">Remaining</th>
                      <th className="px-6 py-3">Progress</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                    {students.map((s) => {
                      const attended = sessions.filter((x) => x.studentId === s.id && x.status === "completed").length;
                      const archived = sessions.filter((x) => x.studentId === s.id && x.status === "archived").length;
                      const pkg = s.packageSize ?? null;
                      const remaining = pkg ? Math.max(0, pkg - attended) : null;
                      const pct = pkg ? Math.min(100, Math.round((attended / pkg) * 100)) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-[#E9DFC9]/[0.02]">
                          <td className="px-6 py-3 text-[#E9DFC9] font-semibold">{s.name}</td>
                          <td className="px-6 py-3">
                            <select
                              value={pkg ?? ""}
                              onChange={(e) => handleSetPackage(s.id, e.target.value === "" ? null : parseInt(e.target.value))}
                              className="px-2 py-1.5 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-lg text-[#E9DFC9]/85 focus:outline-none focus:border-[#C65A24] text-xs"
                            >
                              <option value="" className="bg-[#171717]">Not set</option>
                              <option value={4} className="bg-[#171717]">4 sessions</option>
                              <option value={8} className="bg-[#171717]">8 sessions</option>
                              <option value={10} className="bg-[#171717]">10 sessions</option>
                              <option value={12} className="bg-[#171717]">12 sessions</option>
                            </select>
                          </td>
                          <td className="px-6 py-3 text-[#E9DFC9]/85">
                            {attended}
                            {pkg !== null && <span className="text-[#E9DFC9]/40"> / {pkg}</span>}
                          </td>
                          <td className="px-6 py-3">
                            {remaining !== null ? (
                              <span className={remaining === 0 ? "text-[#E07B3C] font-bold" : "text-[#E9DFC9]/85"}>{remaining} left</span>
                            ) : (
                              <span className="text-[#E9DFC9]/40">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            {pkg !== null && (
                              <div className="w-28 h-2 bg-[#E9DFC9]/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${remaining === 0 ? "bg-[#C65A24]" : "bg-[#C65A24]"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleResetSessions(s.id, s.name)}
                                disabled={attended === 0}
                                title={
                                  attended === 0
                                    ? "No sessions to reset yet"
                                    : `Renewed? Reset ${s.name}'s count back to ${pkg ?? "full"}`
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                                  attended === 0
                                    ? "bg-[#E9DFC9]/[0.03] border-[#E9DFC9]/[0.08] text-[#E9DFC9]/40 cursor-not-allowed"
                                    : "bg-[#C65A24]/20 border-[#C65A24]/30 text-[#E07B3C] hover:bg-[#C65A24]/30"
                                }`}
                              >
                                🔄 Reset
                              </button>
                              {archived > 0 && attended === 0 && (
                                <button
                                  onClick={() => handleUndoReset(s.id, s.name)}
                                  title={`Undo reset — restore ${archived} archived session${archived === 1 ? "" : "s"}`}
                                  className="text-xs px-2.5 py-1.5 rounded-lg border bg-[#E9DFC9]/[0.03] border-[#E9DFC9]/[0.08] text-[#E9DFC9]/85 hover:bg-[#E9DFC9]/[0.08] transition-all whitespace-nowrap"
                                >
                                  ↩️ Undo
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#E9DFC9]/55">No students yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session history */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06]">
                <h2 className="text-lg font-bold text-[#E9DFC9]">🕐 Session History ({sessions.filter((s) => s.status !== "active").length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Clocked In</th>
                      <th className="px-6 py-3">Clocked Out</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                    {sessions.filter((s) => s.status !== "active").map((s) => {
                      const durMin = s.clockOut ? Math.max(1, Math.round((new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime()) / 60000)) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-[#E9DFC9]/[0.02]">
                          <td className="px-6 py-3 text-[#E9DFC9] font-semibold">{s.student.name}</td>
                          <td className="px-6 py-3 text-[#E9DFC9]/70">{new Date(s.clockIn).toLocaleString("en-SG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-6 py-3 text-[#E9DFC9]/70">{s.clockOut ? new Date(s.clockOut).toLocaleString("en-SG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                          <td className="px-6 py-3 text-[#E9DFC9]/85">{durMin} min</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${
                              s.status === "completed" ? "bg-[#C65A24]/20 text-[#E07B3C] border-[#C65A24]/30"
                              : s.status === "archived" ? "bg-[#E9DFC9]/10 text-[#E9DFC9]/70 border-[#E9DFC9]/20"
                              : "bg-[#C65A24]/20 text-[#E9DFC9] border-[#C65A24]/30"
                            }`}>
                              {s.status === "archived" ? "archived · prev plan" : s.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              className="text-xs px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-[#A34717]/30 transition-all"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {sessions.filter((s) => s.status !== "active").length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#E9DFC9]/55">No sessions yet. Clock a student in to get started!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "revenue" && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total earned", value: revenueTotals?.allTime ?? 0, icon: "💰", accent: "from-[#C65A24]/20 to-[#A34717]/5 border-[#C65A24]/25" },
                { label: "This month", value: revenueTotals?.thisMonth ?? 0, icon: "📅", accent: "from-[#C65A24]/20 to-[#C65A24]/5 border-[#C65A24]/25" },
                { label: "This year", value: revenueTotals?.thisYear ?? 0, icon: "🎯", accent: "from-[#E9DFC9]/20 to-[#C65A24]/5 border-[#E9DFC9]/25" },
                { label: "Avg payment", value: revenueTotals?.avgPerPayment ?? 0, icon: "📊", accent: "from-[#C65A24]/20 to-[#E9DFC9]/5 border-[#C65A24]/25" },
              ].map((c) => (
                <div key={c.label} className={`bg-gradient-to-br ${c.accent} border rounded-2xl p-5`}>
                  <div className="flex items-center gap-2 text-[#E9DFC9]/70 text-xs uppercase tracking-wider mb-2">
                    <span className="text-base">{c.icon}</span>
                    {c.label}
                  </div>
                  <p className="text-2xl lg:text-3xl font-black text-[#E9DFC9]">${c.value.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Log a payment */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#E9DFC9] mb-1">💵 Log a payment</h2>
              <p className="text-[#E9DFC9]/55 text-sm mb-4">Record money received from a student — package renewals, drop-ins, anything.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <select
                  value={revStudentId}
                  onChange={(e) => { setRevStudentId(e.target.value); setRevMsg(null); }}
                  className="px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all"
                >
                  <option value="" className="bg-[#171717]">Student…</option>
                  <option value="bulk" className="bg-[#171717]">📦 Bulk month total (no student)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#171717]">{s.name}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={revAmount}
                  onChange={(e) => setRevAmount(e.target.value)}
                  placeholder="Amount ($)"
                  className="px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] transition-all"
                />

                <input
                  type="number"
                  min="0"
                  value={revSessions}
                  onChange={(e) => setRevSessions(e.target.value)}
                  placeholder="Sessions (opt)"
                  className="px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] transition-all"
                />

                <select
                  value={revMethod}
                  onChange={(e) => setRevMethod(e.target.value)}
                  className="px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all"
                >
                  {["PayNow", "Cash", "Bank Transfer", "Card", "Other"].map((m) => (
                    <option key={m} value={m} className="bg-[#171717]">{m}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={revDate}
                  onChange={(e) => setRevDate(e.target.value)}
                  title="Payment date (defaults to today)"
                  className="px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] focus:outline-none focus:border-[#C65A24] transition-all [color-scheme:dark]"
                />

                <button
                  onClick={handleAddPayment}
                  className="px-5 py-3 bg-gradient-to-r from-[#A34717] to-[#C65A24] text-[#E9DFC9] rounded-xl font-bold text-sm hover:from-[#C65A24] hover:to-[#E07B3C] transition-all shadow-lg shadow-[#A34717]/25 whitespace-nowrap"
                >
                  + Add payment
                </button>
              </div>

              <input
                type="text"
                value={revNote}
                onChange={(e) => setRevNote(e.target.value)}
                placeholder="Note (optional) — e.g. 4-session renewal, July block"
                className="mt-3 w-full px-4 py-3 bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-xl text-[#E9DFC9] placeholder-[#E9DFC9]/40 focus:outline-none focus:border-[#C65A24] transition-all"
              />

              {revMsg && (
                <p className={`mt-3 text-sm ${revMsg.ok ? "text-[#E07B3C]" : "text-[#E07B3C]"}`}>{revMsg.text}</p>
              )}
            </div>

            {/* Last 6 months + revenue by student */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#E9DFC9] mb-1">📈 Last 6 months</h2>
                <p className="text-[#E9DFC9]/55 text-sm mb-5">Monthly money collected</p>
                <div className="space-y-3">
                  {monthly.map((m) => {
                    const max = Math.max(...monthly.map((x) => x.total), 1);
                    const pct = Math.round((m.total / max) * 100);
                    const [yr, mo] = m.month.split("-");
                    const label = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleDateString("en-SG", { month: "short" });
                    return (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="text-xs text-[#E9DFC9]/55 w-9 shrink-0">{label}</span>
                        <div className="flex-1 h-6 bg-[#E9DFC9]/[0.04] rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#A34717] to-[#E07B3C] rounded-lg transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[#E9DFC9]/85 w-20 text-right shrink-0">
                          ${m.total.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06]">
                  <h2 className="text-lg font-bold text-[#E9DFC9]">🏆 Revenue by student</h2>
                  <p className="text-[#E9DFC9]/55 text-sm mt-0.5">{revenueTotals?.payingStudents ?? 0} paying students</p>
                </div>
                <div className="divide-y divide-[#E9DFC9]/[0.04] max-h-[340px] overflow-y-auto">
                  {byStudent.map((b) => (
                    <div key={b.studentId} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-[#E9DFC9] font-semibold text-sm">{b.name}</p>
                        <p className="text-[#E9DFC9]/55 text-xs">{b.count} payment{b.count === 1 ? "" : "s"}</p>
                      </div>
                      <span className="text-[#E07B3C] font-bold font-mono text-sm">${b.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {byStudent.length === 0 && (
                    <p className="px-6 py-10 text-center text-[#E9DFC9]/55 text-sm">No payments logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment history */}
            <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#E9DFC9]">🧾 Payment history ({payments.length})</h2>
                {revenueTotals && revenueTotals.allTime > 0 && (
                  <span className="text-sm text-[#E9DFC9]/70">
                    Total: <span className="text-[#E07B3C] font-bold">${revenueTotals.allTime.toFixed(2)}</span>
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Sessions</th>
                      <th className="px-6 py-3">Note</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#E9DFC9]/[0.02]">
                        <td className="px-6 py-3 text-[#E9DFC9]/70 whitespace-nowrap">
                          {new Date(p.paidAt).toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-3 text-[#E9DFC9] font-semibold">
                          {p.student?.name ?? <span className="text-[#E9DFC9]/70 italic font-normal">📦 Bulk total</span>}
                        </td>
                        <td className="px-6 py-3 text-[#E9DFC9]/70">{p.method}</td>
                        <td className="px-6 py-3 text-[#E9DFC9]/70">{p.sessions ?? "—"}</td>
                        <td className="px-6 py-3 text-[#E9DFC9]/55 max-w-[220px] truncate">{p.note || "—"}</td>
                        <td className="px-6 py-3 text-right text-[#E07B3C] font-bold font-mono">${p.amount.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleDeletePayment(p.id, `$${p.amount.toFixed(2)} · ${p.student?.name ?? ""}`)}
                            className="text-xs px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-[#A34717]/30 transition-all"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-[#E9DFC9]/55">
                          No payments yet. Log your first one above ☝️
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "bookings" && (
          <div className="bg-[#E9DFC9]/[0.03] border border-[#E9DFC9]/[0.08] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E9DFC9]/[0.06]">
              <h2 className="text-lg font-bold text-[#E9DFC9]">All Bookings ({bookings.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#E9DFC9]/55 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DFC9]/[0.04]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#E9DFC9]/[0.02]">
                      <td className="px-6 py-3 text-[#E9DFC9]">{fmtDate(b.date)}</td>
                      <td className="px-6 py-3 text-[#E9DFC9]/85">{b.student?.name ?? "—"}</td>
                      <td className="px-6 py-3 text-[#E9DFC9]/70">{b.duration} min</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          b.status === "confirmed" ? "bg-[#C65A24]/20 text-[#E07B3C] border-[#C65A24]/30"
                          : b.status === "booked" ? "bg-[#C65A24]/20 text-[#E07B3C] border-[#C65A24]/30"
                          : b.status === "completed" ? "bg-[#E9DFC9]/10 text-[#E9DFC9]/85 border-[#E9DFC9]/20"
                          : "bg-[#C65A24]/20 text-[#E9DFC9] border-[#C65A24]/30"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-[#E9DFC9]/55">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
