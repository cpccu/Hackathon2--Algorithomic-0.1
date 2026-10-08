"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw, Search } from "lucide-react";

interface Club {
  id: string;
  name: string;
  code: string | null;
  category: string;
  description: string | null;
  presidentName: string | null;
  advisorName: string | null;
  email: string | null;
  facebookUrl: string | null;
  meetingInfo: string | null;
  status: string;
  source: string;
}

const CLUB_CATEGORIES = ["TECHNICAL", "CULTURAL", "SPORTS", "DEBATE", "COMMUNITY", "OTHER"];

export function ClubsTab() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("TECHNICAL");
  const [description, setDescription] = useState("");
  const [presidentName, setPresidentName] = useState("");
  const [advisorName, setAdvisorName] = useState("");
  const [email, setEmail] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [meetingInfo, setMeetingInfo] = useState("");
  const [status, setStatus] = useState("VERIFIED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs");
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs || []);
      }
    } catch (err) {
      console.error("Failed to load clubs", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingClub(null);
    setName("");
    setCode("");
    setCategory("TECHNICAL");
    setDescription("");
    setPresidentName("");
    setAdvisorName("");
    setEmail("");
    setFacebookUrl("");
    setMeetingInfo("");
    setStatus("VERIFIED");
    setShowModal(true);
  }

  function openEditModal(c: Club) {
    setEditingClub(c);
    setName(c.name);
    setCode(c.code || "");
    setCategory(c.category || "TECHNICAL");
    setDescription(c.description || "");
    setPresidentName(c.presidentName || "");
    setAdvisorName(c.advisorName || "");
    setEmail(c.email || "");
    setFacebookUrl(c.facebookUrl || "");
    setMeetingInfo(c.meetingInfo || "");
    setStatus(c.status || "VERIFIED");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setStatusMessage({ type: "error", text: "Club Name is required." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const payload = {
      name,
      code: code ? code.toUpperCase().trim() : null,
      category,
      description: description || null,
      presidentName: presidentName || null,
      advisorName: advisorName || null,
      email: email || null,
      facebookUrl: facebookUrl || null,
      meetingInfo: meetingInfo || null,
      status,
    };

    try {
      let res;
      if (editingClub) {
        res = await fetch(`/api/admin/clubs/${editingClub.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/clubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      setShowModal(false);
      setStatusMessage({ type: "success", text: `Club ${editingClub ? "updated" : "added"} successfully!` });
      fetchClubs();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save club" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Club) {
    if (!confirm(`Are you sure you want to delete ${c.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/clubs/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete club");
      }
      setStatusMessage({ type: "success", text: `Club ${c.name} deleted.` });
      fetchClubs();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete club" });
    }
  }

  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase())) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Clubs & Societies</h2>
          <p className="text-sm text-slate-500">Manage recognized student organizations, executives, and leadership</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchClubs}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Club
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2 text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter clubs by name, code, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading clubs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No student clubs found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "No clubs match your filter criteria." : "Create the first verified campus club above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Club Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Leadership</th>
                  <th className="px-6 py-3">Meetings</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {c.code && (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {c.code}
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{c.name}</span>
                      </div>
                      {c.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>President: {c.presidentName || <span className="text-slate-400">—</span>}</div>
                      <div className="text-slate-400">Advisor: {c.advisorName || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {c.meetingInfo || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingClub ? "Edit Club" : "Add Student Club"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="CUCC"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Club Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="City University Computer Club"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {CLUB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Club objectives, workshops, and extracurricular activities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">President Name</label>
                  <input
                    type="text"
                    placeholder="Student Leader Name"
                    value={presidentName}
                    onChange={(e) => setPresidentName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Advisor</label>
                  <input
                    type="text"
                    placeholder="Faculty Member Name"
                    value={advisorName}
                    onChange={(e) => setAdvisorName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="club@cityuniversity.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook / Social</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Schedule / Room</label>
                <input
                  type="text"
                  placeholder="Every Thursday 4:00 PM in Seminar Hall"
                  value={meetingInfo}
                  onChange={(e) => setMeetingInfo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingClub ? "Update Club" : "Add Club"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
