"use client";

import * as React from "react";
import {
  Bell,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Edit,
  Loader2,
  X,
} from "lucide-react";

export function NoticesTab() {
  const [notices, setNotices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingNotice, setEditingNotice] = React.useState<any | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState("Academic");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [sourceName, setSourceName] = React.useState("Official University Bulletin");

  const loadNotices = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/notices?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load notices.");
      } else {
        setNotices(data.notices || []);
      }
    } catch {
      setError("Network error loading notices.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const openCreateModal = () => {
    setEditingNotice(null);
    setTitle("");
    setContent("");
    setCategory("Academic");
    setSourceUrl("");
    setSourceName("Official University Bulletin");
    setModalOpen(true);
  };

  const openEditModal = (not: any) => {
    setEditingNotice(not);
    setTitle(not.title);
    setContent(not.content);
    setCategory(not.category);
    setSourceUrl(not.sourceUrl || "");
    setSourceName(not.sourceName || "");
    setModalOpen(true);
  };

  const handleSave = async (targetStatus: "VERIFIED" | "PENDING") => {
    if (!title.trim() || !content.trim()) {
      alert("Notice title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        content,
        category,
        sourceUrl: sourceUrl || null,
        sourceName: sourceName || null,
        verificationStatus: targetStatus,
      };

      let res: Response;
      if (editingNotice) {
        res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to save notice.");
      } else {
        setModalOpen(false);
        loadNotices();
      }
    } catch {
      alert("Error communicating with server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (noticeId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/notices/${noticeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });
      if (res.ok) loadNotices();
    } catch {
      alert("Error updating status.");
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/admin/notices/${noticeId}`, { method: "DELETE" });
      if (res.ok) loadNotices();
    } catch {
      alert("Error deleting notice.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Official Notices</h2>
          <p className="text-xs text-slate-500">
            Publish verified university notifications, exam schedules, and holiday announcements.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices, categories..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto">
          {["ALL", "VERIFIED", "PENDING", "ARCHIVED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No notices found</h4>
          <p className="text-xs text-slate-400">
            {statusFilter !== "ALL"
              ? `No notices match "${statusFilter}".`
              : "No campus notices have been published yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => {
            const isVerified = n.verificationStatus === "VERIFIED";
            const isPending = n.verificationStatus === "PENDING";
            const pubDate = new Date(n.publishedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVerified
                          ? "bg-emerald-50 text-emerald-700"
                          : isPending
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {n.verificationStatus}
                    </span>
                    <span className="text-[11px] text-slate-400">• {pubDate}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{n.content}</p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {isPending && (
                    <button
                      onClick={() => handleStatusChange(n.id, "VERIFIED")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Verify & Publish
                    </button>
                  )}
                  {isVerified && (
                    <button
                      onClick={() => handleStatusChange(n.id, "ARCHIVED")}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(n)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingNotice ? "Edit Notice" : "Publish Official Notice"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination Schedule — Spring 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Content *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full text of the notification as released by university authorities."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Holiday">Holiday</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Name</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Notice Link</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.cityuniversity.edu.bd/notice/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave("PENDING")}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave("VERIFIED")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Verify & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
