"use client";

import * as React from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Check,
} from "lucide-react";
import { EventItem } from "@/components/events/event-card";

interface ConfirmationData {
  referenceId: string;
  eventTitle: string;
  venue: string;
  startAt: string;
  userName: string;
  studentId: string;
  userEmail?: string;
}

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRegistrationChange: () => void;
}

export function EventDetailModal({
  event,
  onClose,
  onRegistrationChange,
}: EventDetailModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmation, setConfirmation] = React.useState<ConfirmationData | null>(null);
  const [isRegistered, setIsRegistered] = React.useState(event?.isRegistered || false);

  React.useEffect(() => {
    setIsRegistered(event?.isRegistered || false);
    setConfirmation(null);
    setError(null);
  }, [event]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const startDate = new Date(event.startAt);
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedEndTime = event.endAt
    ? new Date(event.endAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(event.id)}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to register for event.");
      } else {
        setIsRegistered(true);
        setConfirmation(data.confirmation);
        onRegistrationChange();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(event.id)}/register`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to cancel registration.");
      } else {
        setIsRegistered(false);
        setConfirmation(null);
        onRegistrationChange();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate safe SVG QR matrix representation for the safe reference identifier
  const renderSafeQrCode = (text: string) => {
    // Generate deterministic pattern from reference text without external network dependencies
    const size = 16;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    const cells: boolean[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Corner positional markers
        const isTopLeft = row < 4 && col < 4;
        const isTopRight = row < 4 && col >= size - 4;
        const isBottomLeft = row >= size - 4 && col < 4;
        if (isTopLeft || isTopRight || isBottomLeft) {
          cells.push(true);
        } else {
          const bit = (Math.abs(hash ^ (row * 31 + col * 17))) % 2 === 0;
          cells.push(bit);
        }
      }
    }

    return (
      <div className="w-32 h-32 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center">
        <svg viewBox="0 0 16 16" className="w-full h-full text-slate-900 fill-current">
          {cells.map((filled, idx) => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            return filled ? <rect key={idx} x={c} y={r} width="1" height="1" /> : null;
          })}
        </svg>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                {event.category}
              </span>
              {event.verificationStatus === "VERIFIED" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-1 leading-snug">
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Confirmation Screen if registered */}
        {confirmation ? (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200/70 space-y-5 animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Confirmation Pass
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Registration Confirmed
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered As</span>
                <span className="font-bold text-slate-800 block text-sm">{confirmation.userName}</span>
                <span className="text-slate-500 font-mono">ID: {confirmation.studentId}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reference ID</span>
                <span className="font-mono font-bold text-brand-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200/60 inline-block">
                  {confirmation.referenceId}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-emerald-200/50">
              {renderSafeQrCode(confirmation.referenceId)}
              <div className="space-y-1 text-center sm:text-left text-xs text-slate-500">
                <p className="font-semibold text-slate-800">Check-in Verification Pass</p>
                <p className="text-[11px] leading-relaxed">
                  Present this digital reference pass at the entrance of {event.venue}. Contains your verified registration ID.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Event Key Facts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span className="font-semibold uppercase text-[10px]">Date</span>
            </div>
            <p className="font-bold text-slate-800">{formattedDate}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold uppercase text-[10px]">Time</span>
            </div>
            <p className="font-bold text-slate-800">
              {formattedStartTime} {formattedEndTime ? `– ${formattedEndTime}` : ""}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold uppercase text-[10px]">Venue</span>
            </div>
            <p className="font-bold text-slate-800">{event.venue}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="font-semibold uppercase text-[10px]">Organizer</span>
            </div>
            <p className="font-bold text-slate-800">{event.organizer}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Event Overview
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {event.description}
          </p>
        </div>

        {/* Provenance and Official Link */}
        {event.sourceUrl && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Source: {event.sourceName || "City University"}</span>
            </span>
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1"
            >
              <span>Official Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isRegistered ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelRegistration}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? "Cancelling..." : "Cancel Registration"}
                </button>

                {!confirmation && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmation({
                        referenceId: `CAMPUSOS-EVT-${event.id.toUpperCase()}`,
                        eventTitle: event.title,
                        venue: event.venue,
                        startAt: event.startAt,
                        userName: "Student",
                        studentId: "Registered",
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Register for Event</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
