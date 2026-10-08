"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  MessageSquareQuote,
  Lock,
} from "lucide-react";

interface ComplaintItem {
  id: string;
  referenceNumber: string;
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

export default function ComplaintsPage() {
  const [complaints, setComplaints] = React.useState<ComplaintItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/complaints");
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/auth";
            return;
          }
          throw new Error("Failed to load complaints.");
        }
        const data = await res.json();
        setComplaints(data.complaints || []);
      } catch (err: any) {
        setError(err.message || "Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  function getStatusBadge(status: ComplaintItem["status"]) {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Closed
          </span>
        );
      default:
        return null;
    }
  }

  function getPriorityBadge(priority: ComplaintItem["priority"]) {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            HIGH PRIORITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            LOW
          </span>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h1 className="text-sm font-bold text-slate-900">Student Complaint Box</h1>
          </div>
        </div>

        <Link
          href="/complaints/new"
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Submit Complaint
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Banner with Strict Confidentiality Notice */}
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 rounded-3xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-rose-200 border border-white/10">
              <Lock className="w-3.5 h-3.5" />
              Confidential &amp; Student-Protected
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              City University Grievance Redressal
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your voice matters. Submit issues regarding campus facilities, academic support, IT infrastructure, or student welfare. Every complaint is assigned a secure reference ID and monitored directly by University Administration.
            </p>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm">Loading your complaint records...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Submitted Complaints</h3>
                <p className="text-xs text-slate-500">Only you and authorized administrators can view these records.</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {complaints.length} Total
              </span>
            </div>

            {complaints.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No complaints filed</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  You have not submitted any complaints or grievances. If you face any issues on campus, you can file a confidential report anytime.
                </p>
                <Link
                  href="/complaints/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Submit a Complaint
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((item) => (
                  <Link
                    key={item.id}
                    href={`/complaints/${item.id}`}
                    className="block bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {item.referenceNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {item.category.replace("_", " ")}
                        </span>
                        {getPriorityBadge(item.priority)}
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition">
                          {item.subject}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                    </div>

                    {item.adminResponse && (
                      <div className="mt-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                        <MessageSquareQuote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Official Response: </span>
                          <span className="line-clamp-1">{item.adminResponse}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
