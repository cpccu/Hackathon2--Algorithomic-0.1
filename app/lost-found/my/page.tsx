"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  Check,
  Tag,
  MapPin,
  Calendar,
  ShieldAlert,
} from "lucide-react";

interface ItemRecord {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  location: string;
  dateOccurred: string;
  imageUrl?: string | null;
  status: "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
}

interface ClaimRecord {
  id: string;
  itemId: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  itemTitle: string;
  itemCategory: string;
  itemLocation: string;
  itemStatus: string;
}

export default function MyLostFoundPage() {
  const [activeTab, setActiveTab] = React.useState<"lost" | "found" | "claims">("lost");
  const [lostReports, setLostReports] = React.useState<ItemRecord[]>([]);
  const [foundReports, setFoundReports] = React.useState<ItemRecord[]>([]);
  const [claims, setClaims] = React.useState<ClaimRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lost-found/my");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth";
          return;
        }
        throw new Error("Failed to load your records.");
      }
      const data = await res.json();
      setLostReports(data.lostReports || []);
      setFoundReports(data.foundReports || []);
      setClaims(data.claims || []);
    } catch (err: any) {
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  async function handleMarkResolved(itemId: string) {
    if (!confirm("Are you sure you want to mark this item as Resolved / Recovered?")) return;

    setResolvingId(itemId);
    try {
      const res = await fetch(`/api/lost-found/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item.");

      // Refresh list
      await loadData();
    } catch (err: any) {
      alert(err.message || "Could not mark as resolved.");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/lost-found"
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition"
            title="Back to Lost & Found"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900">My Reports & Claims</h1>
            <p className="text-[11px] text-slate-400">Track and manage your recovery activity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lost-found/report-lost"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            href="/lost-found/report-found"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("lost")}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "lost"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Lost Items Reported
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              {lostReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("found")}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "found"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Found Items Handed In
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              {foundReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("claims")}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "claims"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Claims You Filed
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              {claims.length}
            </span>
          </button>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Loading your records...</p>
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
            {/* 1. LOST ITEMS TAB */}
            {activeTab === "lost" && (
              <div className="space-y-4">
                {lostReports.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">No lost item reports</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      You haven&apos;t filed any lost item reports. If you misplaced an item on campus, report it to notify the community and security.
                    </p>
                    <Link
                      href="/lost-found/report-lost"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Report Lost Item
                    </Link>
                  </div>
                ) : (
                  lostReports.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            LOST
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                          {item.verificationStatus === "PENDING" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Awaiting Admin Moderation
                            </span>
                          )}
                          {item.verificationStatus === "VERIFIED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Live &amp; Verified
                            </span>
                          )}
                          {item.verificationStatus === "REJECTED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Moderation Rejected
                            </span>
                          )}
                          {item.status === "RESOLVED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" /> Recovered / Resolved
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400">
                          Filed {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(item.dateOccurred).toLocaleDateString()}
                          </span>
                        </div>

                        {item.status !== "RESOLVED" && item.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleMarkResolved(item.id)}
                            disabled={resolvingId === item.id}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            {resolvingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Mark as Recovered
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. FOUND ITEMS TAB */}
            {activeTab === "found" && (
              <div className="space-y-4">
                {foundReports.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                      <Tag className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">No found items reported</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Found an abandoned item on campus? Help your fellow students by submitting a found item report.
                    </p>
                    <Link
                      href="/lost-found/report-found"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Report Found Item
                    </Link>
                  </div>
                ) : (
                  foundReports.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            FOUND
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                          {item.verificationStatus === "PENDING" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Awaiting Admin Moderation
                            </span>
                          )}
                          {item.verificationStatus === "VERIFIED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Live &amp; Verified
                            </span>
                          )}
                          {item.status === "CLAIMED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Claim Handed Over
                            </span>
                          )}
                          {item.status === "RESOLVED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" /> Handed Back
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400">
                          Filed {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(item.dateOccurred).toLocaleDateString()}
                          </span>
                        </div>

                        {item.status !== "RESOLVED" && item.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleMarkResolved(item.id)}
                            disabled={resolvingId === item.id}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            {resolvingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Mark Handover Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. CLAIMS FILED TAB */}
            {activeTab === "claims" && (
              <div className="space-y-4">
                {claims.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
                      <Archive className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">No active claims filed</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      If you see a found item in the public feed that belongs to you, open its details and click &quot;Claim This Item&quot;.
                    </p>
                    <Link
                      href="/lost-found"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                    >
                      <Search className="w-4 h-4" />
                      Browse Found Items
                    </Link>
                  </div>
                ) : (
                  claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-slate-900">{claim.itemTitle}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {claim.itemCategory}
                          </span>
                        </div>

                        {claim.status === "PENDING" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Claim Under Review
                          </span>
                        )}
                        {claim.status === "APPROVED" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Claim Approved — Handover Ready
                          </span>
                        )}
                        {claim.status === "REJECTED" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Claim Rejected
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700">
                        <span className="font-semibold text-slate-800">Your claim evidence:</span>
                        <p className="mt-1">{claim.message}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <span>Found at: {claim.itemLocation}</span>
                        <span>Filed: {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
