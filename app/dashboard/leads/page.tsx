"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Lead {
  id: number;
  name: string;
  email: string;
  contacted: boolean;
  notes: string | null;
  createdAt: string;
}

export default function LeadsCRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "contacted">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter === "contacted") params.set("contacted", "true");
      else if (filter === "new") params.set("contacted", "false");

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleContacted = async (lead: Lead) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, contacted: !lead.contacted }),
    });
    if (res.ok) fetchLeads();
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedLead.id, notes: notesDraft }),
    });
    if (res.ok) {
      setSelectedLead({ ...selectedLead, notes: notesDraft });
      fetchLeads();
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedLead(null);
      fetchLeads();
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Contacted", "Notes", "Signup Date"];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.contacted ? "Yes" : "No",
      l.notes || "",
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "413opencourt-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: leads.length,
    contacted: leads.filter((l) => l.contacted).length,
    newLeads: leads.filter((l) => !l.contacted).length,
    conversion: leads.length > 0 ? Math.round((leads.filter((l) => l.contacted).length / leads.length) * 100) : 0,
  };

  return (
    <main className="min-h-screen bg-[#030303] p-6 md:p-10 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            LEADS{" "}
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              CRM
            </span>
          </h1>
          <p className="text-gray-400">Manage and follow up with your leads</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: stats.total, color: "from-blue-500/20 to-blue-600/5 border-blue-500/20" },
            { label: "New (Uncontacted)", value: stats.newLeads, color: "from-green-500/20 to-green-600/5 border-green-500/20" },
            { label: "Contacted", value: stats.contacted, color: "from-purple-500/20 to-purple-600/5 border-purple-500/20" },
            { label: "Contact Rate", value: `${stats.conversion}%`, color: "from-orange-500/20 to-orange-600/5 border-orange-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-b ${stat.color} backdrop-blur-xl border rounded-2xl p-5`}
            >
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "new", "contacted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {f === "all" ? "All" : f === "new" ? "New" : "Contacted"}
              </button>
            ))}
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl">📭</span>
              <p className="text-gray-400 mt-4 text-lg">No leads yet</p>
              <p className="text-gray-600 text-sm mt-1">
                {search ? "Try a different search term." : "Leads will appear here when people sign up for the free shooting guide."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 py-4">Name</th>
                      <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 py-4">Email</th>
                      <th className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 py-4">Signed Up</th>
                      <th className="text-center text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          selectedLead?.id === lead.id ? "bg-blue-500/5" : ""
                        }`}
                        onClick={() => {
                          setSelectedLead(lead);
                          setNotesDraft(lead.notes || "");
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center text-sm">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{lead.email}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              lead.contacted
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${lead.contacted ? "bg-green-400" : "bg-yellow-400"}`} />
                            {lead.contacted ? "Contacted" : "New"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleContacted(lead)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                lead.contacted
                                  ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20"
                                  : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                              }`}
                            >
                              {lead.contacted ? "Mark New" : "✓ Contacted"}
                            </button>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 border border-red-500/20 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {leads.map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center text-sm font-bold text-blue-400">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{lead.name}</p>
                          <p className="text-gray-500 text-xs">{lead.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          lead.contacted
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {lead.contacted ? "Contacted" : "New"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">
                      Signed up {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleContacted(lead)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          lead.contacted
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        {lead.contacted ? "Mark New" : "✓ Contacted"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNotesDraft(lead.notes || "");
                        }}
                        className="flex-1 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/20 transition-all"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Pagination footer */}
        {leads.length > 0 && (
          <p className="text-gray-600 text-sm text-center mt-4">
            Showing {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Notes Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedLead(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#030303] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">{selectedLead.name}</h3>
                <p className="text-gray-500 text-sm">{selectedLead.email}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Signed Up</p>
              <p className="text-gray-300 text-sm">
                {new Date(selectedLead.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Status</p>
                <button
                  onClick={() => toggleContacted(selectedLead)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedLead.contacted
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  }`}
                >
                  {selectedLead.contacted ? "✓ Contacted" : "Mark as Contacted"}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Notes</p>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              />
              <button
                onClick={saveNotes}
                className="mt-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Save Notes
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm(`Delete ${selectedLead.name} from leads?`)) {
                  deleteLead(selectedLead.id);
                }
              }}
              className="text-red-400 text-xs hover:text-red-300 transition-colors"
            >
              Delete this lead
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
