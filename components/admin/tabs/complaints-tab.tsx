"use client";

import * as React from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  MessageSquareQuote,
  ShieldCheck,
  Send,
  Lock,
  ExternalLink,
} from "lucide-react";

interface AdminComplaint {
  id: string;
  referenceNumber: string;
  reporterId: string;
  reporterEmail?: string | null;
  reporterName?: string | null;
  category: string;
  subject: string;
  description: string;
  location?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminResponse?: string | null;
  respondedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export function ComplaintsTab() {
  const [complaints, setComplaints] = React.useState<AdminComplaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState("ALL");

  // Response Modal
  const [selectedComplaint, setSelectedComplaint] = React.useState<AdminComplaint | null>(null);
  const [responseStatus, setResponseStatus] = React.useState<AdminComplaint["status"]>("UNDER_REVIEW");
  const [responsePriority, setResponsePriority] = React.useState<AdminComplaint["priority"]>("MEDIUM");
  const [responseText, setResponseText] = React.useState("");
  const [savingResponse, setSavingResponse] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const loadComplaints = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);

      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load complaints.");
      } else {
        setComplaints(data.complaints || []);
      }
    } catch {
      setError("Network error fetching complaints.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  React.useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  function openRespondModal(c: AdminComplaint) {
    setSelectedComplaint(c);
    setResponseStatus(c.status);
    setResponsePriority(c.priority);
    setResponseText(c.adminResponse || "");
  }

  async function handleSaveResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSavingResponse(true);
    try {
      const res = await fetch(`/api/admin/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: responseStatus,
          priority: responsePriority,
          adminResponse: responseText.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to update complaint.");
      } else {
        setSelectedComplaint(null);
        await loadComplaints();
      }
    } catch {
      alert("Error saving response.");
    } finally {
      setSavingResponse(false);
    }
  }

  async function handleDeleteComplaint(id: string) {
    if (!confirm("Are you sure you want to permanently delete this complaint record? This action will be logged.")) return;

    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete complaint.");
      } else {
        await loadComplaints();
        if (selectedComplaint?.id === id) setSelectedComplaint(null);
      }
    } catch {
      alert("Error deleting complaint.");
    } finally {
      setActionInProgress(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Campus Complaint Box &amp; Grievances
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Confidential student inquiries, facility reports, and official administration responses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by reference number, subject, description, or student email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
          <span className="text-xs">Loading grievance records...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No complaints matching current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition hover:border-slate-300 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    {item.referenceNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {item.category.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.priority === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : item.priority === "MEDIUM"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.status === "IN_PROGRESS"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : item.status === "UNDER_REVIEW"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : item.status === "CLOSED"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Student: <span className="font-semibold text-slate-700">{item.reporterEmail || item.reporterName || "Confidential"}</span> •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{item.subject}</h3>
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{item.description}</p>
                {item.location && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Campus Location: <strong className="text-slate-600">{item.location}</strong>
                  </p>
                )}
              </div>

              {item.adminResponse && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                      Recorded Admin Response
                    </span>
                    {item.respondedAt && (
                      <span className="text-[10px] text-emerald-600 font-normal">
                        {new Date(item.respondedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{item.adminResponse}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => openRespondModal(item)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  {item.adminResponse ? "Edit Response / Status" : "Respond & Update Status"}
                </button>

                <button
                  onClick={() => handleDeleteComplaint(item.id)}
                  disabled={actionInProgress === item.id}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Permanently Delete Complaint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response & Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  {selectedComplaint.referenceNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Update Grievance &amp; Official Response
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResponse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Grievance Status
                  </label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={responsePriority}
                    onChange={(e) => setResponsePriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Official Administrative Response (Visible to Student)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the resolution steps taken, expected timeline, or remediation outcome..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResponse}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  {savingResponse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Publish Response
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
