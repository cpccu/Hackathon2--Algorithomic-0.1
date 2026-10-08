"use client";

import * as React from "react";
import { Calendar, ArrowRight, MapPin, Clock, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { EventItem } from "@/components/events/event-card";

export function UpcomingEvents() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadUpcomingEvents() {
      try {
        const res = await fetch("/api/events?limit=3&timeframe=upcoming");
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setEvents(data.events || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load upcoming events:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUpcomingEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs h-full min-h-[220px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Upcoming Events</h3>
          </div>
          <Link
            href="/events"
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 hover:underline flex items-center gap-0.5"
          >
            <span>All Events</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Checking verified event schedule...</span>
          </div>
        ) : events.length === 0 ? (
          /* Truthful Empty State */
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 mb-2.5">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No verified events available right now.</p>
            <p className="text-xs text-slate-400 max-w-xs mt-0.5">
              Official university seminars, workshops, and club activities will appear here once officially scheduled.
            </p>
            <Link
              href="/events"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Explore Events Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          /* Real Verified Events List */
          <div className="space-y-3">
            {events.map((evt) => {
              const startDate = new Date(evt.startAt);
              const formattedDate = startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const formattedTime = startDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <Link
                  key={evt.id}
                  href="/events"
                  className="block p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-semibold text-indigo-700">{evt.category}</span>
                    <span className="text-slate-400">{formattedDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{evt.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedTime}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {evt.venue}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synchronized with City University Calendar</span>
        </span>
      </div>
    </div>
  );
}
