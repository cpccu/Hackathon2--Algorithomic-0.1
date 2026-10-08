"use client";

import * as React from "react";
import {
  Tag,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Check,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AdminItem {
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
  reporterId: string;
  reporterName?: string | null;
  reporterEmail?: string | null;
  createdAt: string;
}

interface AdminClaim {
  id: string;
  itemId: string;
  claimantId: string;
  claimantName?: string | null;
  claimantEmail?: string | null;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export function LostFoundTab() {
  const [items, setItems] = React.useState<AdminItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [verificationFilter, setVerificationFilter] = React.useState("ALL");

  // Selected item for viewing claims
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [claims, setClaims] = React.useState<AdminClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = React.useState(false);

  // Action in flight
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (verificationFilter !== "ALL") params.set("verificationStatus", verificationFilter);

      const res = await fetch(`/api/admin/lost-found?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load lost & found items.");
      } else {
        setItems(data.items || []);
      }
    } catch {
      setError("Network error fetching items.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, verificationFilter]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function loadClaimsForItem(itemId: string) {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setClaims([]);
      return;
    }

    setSelectedItemId(itemId);
    setLoadingClaims(true);
    try {
      const res = await fetch(`/api/admin/lost-found/${itemId}/claims`);
      const data = await res.json();
      if (res.ok && data.success) {
        setClaims(data.claims || []);
      } else {
        setClaims([]);
      }
    } catch {
      setClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  }

  async function handleUpdateItem(id: string, updates: Partial<AdminItem>) {
    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/lost-found/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to update item.");
      } else {
        await loadItems();
      }
    } catch {
      alert("Error updating item.");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Are you sure you want to permanently delete this item? This action is logged.")) return;

    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/lost-found/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete item.");
      } else {
        await loadItems();
        if (selectedItemId === id) setSelectedItemId(null);
      }
    } catch {
      alert("Error deleting item.");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleModerateClaim(itemId: string, claimId: string, status: "APPROVED" | "REJECTED") {
    setActionInProgress(claimId);
    try {
      const res = await fetch(`/api/admin/lost-found/${itemId}/claims`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to moderate claim.");
      } else {
        // Reload claims and items (since approving marks item as CLAIMED)
        await loadClaimsForItem(itemId);
        await loadItems();
      }
    } catch {
      alert("Error moderating claim.");
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
            <Tag className="w-5 h-5 text-indigo-600" />
            Lost &amp; Found Moderation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, verify community submissions, and resolve ownership claims.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reports by title, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Types</option>
            <option value="LOST">Lost Reports</option>
            <option value="FOUND">Found Reports</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Moderation Status</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="VERIFIED">Verified &amp; Public</option>
            <option value="REJECTED">Rejected</option>
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
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <span className="text-xs">Loading items...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No lost &amp; found items matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isClaimsOpen = selectedItemId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition hover:border-slate-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.type === "LOST"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    {item.verificationStatus === "PENDING" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDING REVIEW
                      </span>
                    )}
                    {item.verificationStatus === "VERIFIED" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                    {item.verificationStatus === "REJECTED" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> REJECTED
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-white">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Reported by: <span className="font-semibold text-slate-700">{item.reporterEmail || item.reporterName || "Student"}</span> •{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{item.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Location: <strong className="text-slate-600">{item.location}</strong> • Date:{" "}
                    <strong className="text-slate-600">{new Date(item.dateOccurred).toLocaleDateString()}</strong>
                  </p>
                </div>

                {/* Administrative Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.verificationStatus !== "VERIFIED" && (
                      <button
                        onClick={() => handleUpdateItem(item.id, { verificationStatus: "VERIFIED" })}
                        disabled={actionInProgress === item.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify &amp; Publish
                      </button>
                    )}
                    {item.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateItem(item.id, { verificationStatus: "REJECTED" })}
                        disabled={actionInProgress === item.id}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Reject Report
                      </button>
                    )}
                    {item.status !== "RESOLVED" && item.status !== "ARCHIVED" && (
                      <button
                        onClick={() => handleUpdateItem(item.id, { status: "RESOLVED" })}
                        disabled={actionInProgress === item.id}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    )}
                    {item.status !== "ARCHIVED" && (
                      <button
                        onClick={() => handleUpdateItem(item.id, { status: "ARCHIVED" })}
                        disabled={actionInProgress === item.id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === "FOUND" && (
                      <button
                        onClick={() => loadClaimsForItem(item.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-indigo-200"
                      >
                        {isClaimsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        Inspect Claims
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={actionInProgress === item.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Permanently Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Claims Tray */}
                {isClaimsOpen && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        Claims Filed For This Item
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        {claims.length} Claim{claims.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {loadingClaims ? (
                      <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        Loading claims...
                      </div>
                    ) : claims.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">No claims filed yet for this found item.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {claims.map((claim) => (
                          <div
                            key={claim.id}
                            className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800">
                                Claimant: {claim.claimantEmail || claim.claimantName || "Student"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  claim.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : claim.status === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {claim.status}
                              </span>
                            </div>

                            <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                              &ldquo;{claim.message}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-400">
                                Filed: {new Date(claim.createdAt).toLocaleDateString()}
                              </span>
                              {claim.status === "PENDING" && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleModerateClaim(item.id, claim.id, "APPROVED")}
                                    disabled={actionInProgress === claim.id}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-[11px] font-semibold transition flex items-center gap-1"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    Approve Claim
                                  </button>
                                  <button
                                    onClick={() => handleModerateClaim(item.id, claim.id, "REJECTED")}
                                    disabled={actionInProgress === claim.id}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-[11px] font-semibold transition flex items-center gap-1"
                                  >
                                    <UserX className="w-3 h-3" />
                                    Reject Claim
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
