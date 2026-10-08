"use client";

import * as React from "react";
import {
  X,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { LostFoundItemData } from "./item-card";

interface ItemDetailModalProps {
  item: LostFoundItemData;
  onClose: () => void;
  onItemUpdated?: () => void;
}

export function ItemDetailModal({ item, onClose, onItemUpdated }: ItemDetailModalProps) {
  const [detailData, setDetailData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [claiming, setClaiming] = React.useState(false);
  const [claimMessage, setClaimMessage] = React.useState("");
  const [contactInfo, setContactInfo] = React.useState("");
  const [submittingClaim, setSubmittingClaim] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);
  const [statusFeedback, setStatusFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/lost-found/${item.id}`);
        if (res.ok) {
          const data = await res.json();
          setDetailData(data);
        }
      } catch (err) {
        console.error("Failed to load item detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [item.id]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claimMessage || claimMessage.length < 10) {
      setStatusFeedback({
        type: "error",
        text: "Please provide a detailed description (at least 10 characters) explaining why this item belongs to you.",
      });
      return;
    }

    setSubmittingClaim(true);
    setStatusFeedback(null);

    try {
      const res = await fetch(`/api/lost-found/${item.id}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: claimMessage,
          contactInfo: contactInfo || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit claim.");
      }

      setStatusFeedback({
        type: "success",
        text: "Your claim has been submitted to CampusOS Administration. You can track its status under 'My Reports & Claims'.",
      });
      setClaiming(false);
      if (onItemUpdated) onItemUpdated();
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: err.message || "Failed to submit claim." });
    } finally {
      setSubmittingClaim(false);
    }
  }

  async function handleMarkResolved() {
    if (!confirm("Are you sure you want to mark this report as Resolved?")) return;

    setResolving(true);
    setStatusFeedback(null);

    try {
      const res = await fetch(`/api/lost-found/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update report.");

      setStatusFeedback({ type: "success", text: "Report marked as Resolved." });
      if (onItemUpdated) onItemUpdated();
    } catch (err: any) {
      setStatusFeedback({ type: "error", text: err.message || "Failed to update report." });
    } finally {
      setResolving(false);
    }
  }

  const isLost = item.type === "LOST";
  const isReporter = detailData?.isReporter;
  const canClaim = detailData?.canClaim;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isLost
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {item.type}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {item.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {statusFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                statusFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusFeedback.text}</span>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {item.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(item.dateOccurred).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                Status: <strong className="font-semibold text-slate-900">{item.status}</strong>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Details
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {item.description}
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 flex items-start gap-2.5 text-xs text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Campus Privacy Protection:</strong> Student personal contact details are never exposed directly.
              All recoveries and claims are securely brokered through CampusOS.
            </p>
          </div>

          {/* Action section */}
          {isReporter ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                You reported this item. If this item has been recovered or claimed, you can mark it as resolved.
              </p>
              {item.status !== "RESOLVED" && item.status !== "ARCHIVED" && (
                <button
                  onClick={handleMarkResolved}
                  disabled={resolving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {resolving ? "Updating..." : "Mark as Resolved"}
                </button>
              )}
            </div>
          ) : isLost ? (
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Did you find this item?
              </div>
              <p className="leading-relaxed">
                Please submit a <strong>Found Item Report</strong> on this portal, or bring the item to the
                <strong> Proctor's Office / Campus Security Desk</strong> for secure recovery.
              </p>
            </div>
          ) : canClaim && !claiming ? (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setClaiming(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
              >
                Is this yours? Claim This Item
              </button>
            </div>
          ) : null}

          {/* Inline Claim Form */}
          {claiming && (
            <form onSubmit={handleClaimSubmit} className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Submit Proof of Ownership
                </h4>
                <button
                  type="button"
                  onClick={() => setClaiming(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why do you believe this item is yours? *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe unique identifying features (serial numbers, stickers, contents, scratches)..."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Contact Notes
                </label>
                <input
                  type="text"
                  placeholder="Best time to contact or preferred campus pickup location"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingClaim}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {submittingClaim ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {submittingClaim ? "Submitting Claim..." : "Submit Claim for Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
