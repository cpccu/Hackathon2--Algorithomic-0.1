"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Send, ShieldAlert, Lock, MapPin } from "lucide-react";

const CATEGORIES = [
  { value: "ACADEMIC", label: "Academic / Faculty / Classes" },
  { value: "FACILITIES", label: "Campus Facilities / Labs / Washrooms" },
  { value: "IT_SERVICES", label: "IT Services / Wi-Fi / Student Portal" },
  { value: "ADMINISTRATION", label: "Administration / Registrar / Accounts" },
  { value: "TRANSPORT", label: "University Transport / Bus Service" },
  { value: "CAFETERIA", label: "Cafeteria / Food Quality & Hygiene" },
  { value: "HARASSMENT_SECURITY", label: "Harassment / Safety / Campus Security" },
  { value: "OTHER", label: "Other General Inquiries" },
];

export default function NewComplaintPage() {
  const router = useRouter();

  const [category, setCategory] = React.useState("FACILITIES");
  const [priority, setPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [subject, setSubject] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string; ref?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !description) {
      setStatusMessage({ type: "error", text: "Please enter both subject and description." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          priority,
          subject,
          location: location || null,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit complaint.");
      }

      setStatusMessage({
        type: "success",
        text: "Grievance submitted successfully.",
        ref: data.complaint?.referenceNumber,
      });

      setTimeout(() => {
        if (data.complaint?.id) {
          router.push(`/complaints/${data.complaint.id}`);
        } else {
          router.push("/complaints");
        }
      }, 1800);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to submit grievance." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/complaints"
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition"
            title="Back to Complaints"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900">File a Campus Complaint</h1>
            <p className="text-[11px] text-slate-400">Strictly confidential grievance redressal</p>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full mb-2">
              <Lock className="w-3.5 h-3.5" />
              Confidential &amp; Protected
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Submission</h2>
            <p className="text-sm text-slate-500 mt-1">
              Your report is kept strictly private between you and the University Administration. Other students will never see this record.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 text-sm ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{statusMessage.text}</p>
                {statusMessage.ref && (
                  <p className="text-xs font-mono mt-1 text-emerald-900">
                    Tracking Reference: <strong>{statusMessage.ref}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                      priority === p
                        ? p === "HIGH"
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : p === "MEDIUM"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-slate-700 text-white border-slate-700 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Subject / Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Broken AC in Lab 402, Wi-Fi outage in Library 3rd floor"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Campus Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g., Academic Building 2, Room 402 or Cafeteria Annex"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Describe what occurred, any impacted individuals, when it started, and any suggested resolution..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-y"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/complaints"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Grievance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
