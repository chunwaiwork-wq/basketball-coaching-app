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

type Tab = "overview" | "students" | "videos" | "bookings" | "sessions";

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

  useEffect(() => {
    const stored = localStorage.getItem("coachPin") || "";
    if (stored) {
      setPin(stored);
      setAuthed(true);
      loadData(stored);
      loadSessions(stored);
    }
    setChecking(false);
  }, []);

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
      <main className="min-h-screen bg-[#030303] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <span className="text-2xl">👑</span>
            </div>
            <h1 className="text-2xl font-black text-white">Coach Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your coach PIN to manage the academy</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              required
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-base hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access Admin Panel
            </button>
          </form>
          <a href="/dashboard/videos" className="block text-center text-sm text-gray-500 hover:text-gray-300 mt-6 transition-colors">
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
    { id: "bookings", label: "Bookings", icon: "📅" },
  ];

  const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-SG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gray-400 text-sm mb-1">Welcome back, Coach</p>
            <h1 className="text-4xl font-black text-white">
              COACH{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ADMIN PANEL
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Manage students, videos, and bookings in one place</p>
          </motion.div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-sm font-semibold transition-all w-fit"
          >
            ✕ Log out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Students", value: stats.students, icon: "👥" },
            { label: "Videos", value: stats.videos, icon: "🎥" },
            { label: "Sessions Done", value: stats.sessions, icon: "⏱️" },
            { label: "Bookings", value: stats.bookings, icon: "📅" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
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
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && tab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">👥 Students</h2>
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handlePickStudent(s.id)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-200 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all cursor-pointer"
                    title={`Add video for ${s.name}`}
                  >
                    {s.name} <span className="text-gray-500">· {s._count?.videos ?? 0} videos</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">📋 Quick Actions</h2>
              <p className="text-gray-400 text-sm mb-4">Use the tabs above to manage content.</p>
              <button onClick={() => setTab("videos")} className="px-5 py-2.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-semibold hover:bg-blue-600/30 transition-all">
                ➕ Add a Training Video
              </button>
            </div>
          </div>
        )}

        {!loading && tab === "students" && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">All Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">PIN</th>
                    <th className="px-6 py-3">Videos</th>
                    <th className="px-6 py-3">Bookings</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-gray-500">{s.id}</td>
                      <td className="px-6 py-3 text-white font-semibold">{s.name}</td>
                      <td className="px-6 py-3 text-gray-400 font-mono">{s.pin}</td>
                      <td className="px-6 py-3 text-gray-300">{s._count?.videos ?? 0}</td>
                      <td className="px-6 py-3 text-gray-300">{s._count?.bookings ?? 0}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handlePickStudent(s.id)}
                          className="text-xs px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-all whitespace-nowrap"
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
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">➕ Add Video</h2>
              <form onSubmit={handleAddVideo} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Student</label>
                  <select
                    value={addStudentId}
                    onChange={(e) => setAddStudentId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select student…</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0a0a1a]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="PAST" className="bg-[#0a0a1a]">📼 Past Training Video</option>
                    <option value="DRIBBLING" className="bg-[#0a0a1a]">🏀 Dribbling</option>
                    <option value="SHOOTING" className="bg-[#0a0a1a]">🎯 Shooting</option>
                    <option value="PLAYS" className="bg-[#0a0a1a]">📋 Plays</option>
                    <option value="SKILLSETS" className="bg-[#0a0a1a]">⚡ Skillsets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. Session on 010826"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">YouTube URL or Video ID</label>
                  <input
                    type="text"
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/VIDEOID or VIDEOID"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25"
                  >
                    ➕ Add Video
                  </button>
                  {addMsg && (
                    <p className={`mt-3 text-sm ${addMsg.ok ? "text-green-400" : "text-red-400"}`}>{addMsg.text}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Video List */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">All Videos ({videos.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Video ID</th>
                      <th className="px-6 py-3">Added</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {videos.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-3 text-white font-semibold">{v.title}</td>
                        <td className="px-6 py-3 text-gray-300">{v.student?.name ?? "—"}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">{v.category}</span>
                        </td>
                        <td className="px-6 py-3 text-gray-400 font-mono text-xs">{v.url}</td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{new Date(v.createdAt).toLocaleDateString("en-SG")}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${v.url}`, "_blank")}
                            className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 mr-2 transition-all"
                          >
                            ▶ Watch
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(v.id)}
                            className="text-xs px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-all"
                          >
                            ✕ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No videos yet.</td>
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
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">⏱️ Clock In / Clock Out</h2>
              <p className="text-gray-500 text-sm mb-4">Select a student, then clock them in when the session starts and out when it ends.</p>
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <select
                  value={clockStudentId}
                  onChange={(e) => { setClockStudentId(e.target.value); setSessionMsg(null); }}
                  className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Select student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                      {s.name}
                      {sessions.find((x) => x.studentId === s.id && x.status === "active") ? " — 🔴 clocked in" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleClock("in")}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-sm hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-600/25 whitespace-nowrap"
                >
                  🟢 Clock In
                </button>
                <button
                  onClick={() => handleClock("out")}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold text-sm hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/25 whitespace-nowrap"
                >
                  🔴 Clock Out
                </button>
              </div>
              {sessionMsg && (
                <p className={`mt-3 text-sm ${sessionMsg.ok ? "text-green-400" : "text-red-400"}`}>{sessionMsg.text}</p>
              )}

              {/* Active sessions live */}
              {sessions.some((s) => s.status === "active") && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Currently in session</p>
                  {sessions.filter((s) => s.status === "active").map((s) => {
                    const elapsed = Math.max(0, Math.floor((now - new Date(s.clockIn).getTime()) / 60000));
                    return (
                      <div key={s.id} className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                        <span className="text-white font-semibold">{s.student.name}</span>
                        <span className="text-green-400 font-mono text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          {Math.floor(elapsed / 60)}h {elapsed % 60}m in session
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attendance per student */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white">📈 Attendance</h2>
                <p className="text-gray-500 text-sm mt-0.5">Set each student's package (4 or 8 sessions) and see how many they've attended.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Package</th>
                      <th className="px-6 py-3">Attended</th>
                      <th className="px-6 py-3">Remaining</th>
                      <th className="px-6 py-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {students.map((s) => {
                      const attended = sessions.filter((x) => x.studentId === s.id && x.status === "completed").length;
                      const pkg = s.packageSize ?? null;
                      const remaining = pkg ? Math.max(0, pkg - attended) : null;
                      const pct = pkg ? Math.min(100, Math.round((attended / pkg) * 100)) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-3 text-white font-semibold">{s.name}</td>
                          <td className="px-6 py-3">
                            <select
                              value={pkg ?? ""}
                              onChange={(e) => handleSetPackage(s.id, e.target.value === "" ? null : parseInt(e.target.value))}
                              className="px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500 text-xs"
                            >
                              <option value="" className="bg-[#0a0a1a]">Not set</option>
                              <option value={4} className="bg-[#0a0a1a]">4 sessions</option>
                              <option value={8} className="bg-[#0a0a1a]">8 sessions</option>
                            </select>
                          </td>
                          <td className="px-6 py-3 text-gray-300">
                            {attended}
                            {pkg !== null && <span className="text-gray-600"> / {pkg}</span>}
                          </td>
                          <td className="px-6 py-3">
                            {remaining !== null ? (
                              <span className={remaining === 0 ? "text-red-400 font-bold" : "text-gray-300"}>{remaining} left</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            {pkg !== null && (
                              <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${remaining === 0 ? "bg-red-500" : "bg-green-500"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No students yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session history */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-lg font-bold text-white">🕐 Session History ({sessions.filter((s) => s.status !== "active").length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">Clocked In</th>
                      <th className="px-6 py-3">Clocked Out</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {sessions.filter((s) => s.status !== "active").map((s) => {
                      const durMin = s.clockOut ? Math.max(1, Math.round((new Date(s.clockOut).getTime() - new Date(s.clockIn).getTime()) / 60000)) : 0;
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-3 text-white font-semibold">{s.student.name}</td>
                          <td className="px-6 py-3 text-gray-400">{new Date(s.clockIn).toLocaleString("en-SG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-6 py-3 text-gray-400">{s.clockOut ? new Date(s.clockOut).toLocaleString("en-SG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                          <td className="px-6 py-3 text-gray-300">{durMin} min</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${
                              s.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              className="text-xs px-3 py-1.5 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-all"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {sessions.filter((s) => s.status !== "active").length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No sessions yet. Clock a student in to get started!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "bookings" && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">All Bookings ({bookings.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-white">{fmtDate(b.date)}</td>
                      <td className="px-6 py-3 text-gray-300">{b.student?.name ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-400">{b.duration} min</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          b.status === "confirmed" ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : b.status === "booked" ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : b.status === "completed" ? "bg-white/10 text-gray-300 border-white/20"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No bookings yet.</td>
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
