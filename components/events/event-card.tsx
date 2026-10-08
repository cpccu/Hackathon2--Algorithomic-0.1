"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  organizer: string;
  departmentId?: string | null;
  venue: string;
  startAt: string;
  endAt?: string | null;
  registrationUrl?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  verificationStatus: string;
  verifiedAt?: string | null;
  isRegistered?: boolean;
}

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onRegister?: (event: EventItem) => void;
}

export function EventCard({ event, onSelect, onRegister }: EventCardProps) {
  const startDate = new Date(event.startAt);
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "workshop":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "seminar":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "competition":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      case "academic":
        return "bg-brand-50 text-brand-700 border-brand-200/60";
      case "cultural":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="group relative p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                event.category
              )}`}
            >
              {event.category}
            </span>

            {event.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          {event.isRegistered ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200/60">
              <Sparkles className="w-3 h-3 text-brand-600" />
              Registered
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
          {event.title}
        </h3>

        {/* Description snippet */}
        {event.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Key Event Metadata */}
        <div className="space-y-1.5 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{formattedDate}</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Organized by {event.organizer}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 font-semibold text-slate-500 group-hover:text-brand-600 transition-colors">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {event.isRegistered ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold transition-colors"
          >
            Registration Pass
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRegister) onRegister(event);
              else onSelect(event);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-xs active:scale-95"
          >
            Register
          </button>
        )}
      </div>
    </div>
  );
}
