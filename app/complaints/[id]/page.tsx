"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  MapPin,
  Calendar,
  MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";

interface ComplaintDetail {
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

const TIMELINE_STEPS = [
  { key: "SUBMITTED", label: "Submitted", desc: "Logged in CampusOS" },
  { key: "UNDER_REVIEW", label: "Under Review", desc: "Assigned for evaluation" },
  { key: "IN_PROGRESS", label: "In Progress", desc: "Action is being taken" },
  { key: "RESOLVED", label: "Resolved", desc: "Remediation complete" },
  { key: "CLOSED", label: "Closed", desc: "Case archived" },
];

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = React.useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    async function loadComplaint() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/complaints/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth");
            return;
          }
          if (res.status === 403) {
            throw new Error("Access Denied: You can only view your own complaints.");
          }
          if (res.status === 404) {
            throw new Error("Complaint not found.");
          }
          throw new Error("Failed to load complaint details.");
        }
        const data = await res.json();
        setComplaint(data.complaint);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadComplaint();
  }, [id, router]);

  function copyReference(ref: string) {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getStepIndex(status: ComplaintDetail["status"]) {
    switch (status) {
      case "SUBMITTED":
        return 0;
      case "UNDER_REVIEW":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "RESOLVED":
        return 3;
      case "CLOSED":
        return 4;
      default:
        return 0;
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
            <h1 className="text-sm font-bold text-slate-900">Complaint Tracking</h1>
            <p className="text-[11px] text-slate-400">Reference: {complaint?.referenceNumber || "Loading..."}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
          <Lock className="w-3.5 h-3.5" />
          Private Record
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm">Fetching complaint status...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Unable to Display Complaint</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Link
              href="/complaints"
              className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Return to My Complaints
            </Link>
          </div>
        )}

        {!loading && !error && complaint && (
          <>
            {/* Top Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                      {complaint.referenceNumber}
                    </span>
                    <button
                      onClick={() => copyReference(complaint.referenceNumber)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition"
                      title="Copy Reference"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                    {complaint.subject}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                    {complaint.category.replace("_", " ")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      complaint.priority === "HIGH"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : complaint.priority === "MEDIUM"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {complaint.priority} PRIORITY
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resolution Progress Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const activeIdx = getStepIndex(complaint.status);
                    const isDone = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-2xl border transition relative ${
                          isCurrent
                            ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/20"
                            : isDone
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-300" />
                          )}
                          <span className="text-xs font-bold">{step.label}</span>
                        </div>
                        <p className="text-[11px] opacity-75">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grievance Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Report Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {complaint.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Submitted: {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                  {complaint.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Location: {complaint.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Official Response Section */}
              {complaint.adminResponse ? (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                      Official CampusOS Administration Response
                    </div>
                    {complaint.respondedAt && (
                      <span className="text-xs text-emerald-700 font-medium">
                        {new Date(complaint.respondedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed pl-6">
                    {complaint.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-400">
                  No response posted yet. A designated university officer is reviewing this case.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
