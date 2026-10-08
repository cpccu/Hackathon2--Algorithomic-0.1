"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { EventItem } from "@/components/events/event-card";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Loader2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface RegisteredEventItem extends EventItem {
  registrationId: string;
  registrationStatus: string;
  registeredAt: string;
  referenceId: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
}

export default function MyEventsPage() {
  const router = useRouter();

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Registrations State
  const [upcoming, setUpcoming] = React.useState<RegisteredEventItem[]>([]);
  const [past, setPast] = React.useState<RegisteredEventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Active Detail Modal
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);

  // 1. Authenticate Session
  React.useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) {
          if (isMounted) router.push("/auth");
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
          if (isMounted) {
            setUser(data.user);
            setAuthLoading(false);
          }
        } else {
          if (isMounted) router.push("/auth");
        }
      } catch {
        if (isMounted) router.push("/auth");
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Fetch My Registrations
  const fetchMyEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/my");
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve your registrations.");
      } else {
        setUpcoming(
          (data.upcoming || []).map((e: RegisteredEventItem) => ({
            ...e,
            isRegistered: true,
          }))
        );
        setPast(
          (data.past || []).map((e: RegisteredEventItem) => ({
            ...e,
            isRegistered: true,
          }))
        );
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (authLoading) return;
    fetchMyEvents();
  }, [authLoading, fetchMyEvents]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    } finally {
      router.push("/auth");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-1" />
          <p className="text-sm font-semibold text-slate-800">Verifying session...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.fullName || "Student";
  const displayEmail = user?.email || "";
  const totalRegistrations = upcoming.length + past.length;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-brand-500/10 selection:text-brand-700">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="events"
        onSelectTab={(tab) => {
          if (tab === "dashboard") router.push("/dashboard");
          else if (tab === "resources") router.push("/resources");
          else if (tab === "search") router.push("/search");
          else if (tab === "helpdesk") router.push("/helpdesk");
          else if (tab === "events") router.push("/events");
          else router.push("/dashboard");
        }}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <DashboardHeader
          userName={displayName}
          userEmail={displayEmail}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in-50 duration-300">
          {/* Back button & Header Banner */}
          <div className="space-y-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Event Discovery</span>
            </Link>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-brand-50/40 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
                  <Ticket className="w-3.5 h-3.5 text-brand-600" />
                  <span>Student Event Passes</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  My Registrations
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Manage your active event passes, check-in reference IDs, and past campus attendance.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  {totalRegistrations} {totalRegistrations === 1 ? "Registration" : "Registrations"}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3 animate-pulse"
                >
                  <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-6 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : totalRegistrations === 0 ? (
            /* Empty state when no registrations */
            <div className="py-20 px-6 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  You haven&apos;t registered for any events yet.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Explore upcoming university workshops, tech talks, and cultural events to register.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Registrations Section */}
              {upcoming.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                    Upcoming Registrations ({upcoming.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcoming.map((evt) => {
                      const startDate = new Date(evt.startAt);
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

                      return (
                        <div
                          key={evt.id}
                          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {evt.category}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {evt.referenceId}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {evt.title}
                            </h3>

                            <div className="space-y-1 text-xs text-slate-500 pt-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                                <span className="font-semibold text-slate-700">{formattedDate}</span>
                                <span>•</span>
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formattedTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="truncate">{evt.venue}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Registration Confirmed
                            </span>

                            <button
                              type="button"
                              onClick={() => setSelectedEvent(evt)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View Pass</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past Registrations Section */}
              {past.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                    Past Event History ({past.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {past.map((evt) => {
                      const startDate = new Date(evt.startAt);
                      const formattedDate = startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={evt.id}
                          className="p-5 rounded-2xl bg-white/70 border border-slate-200/60 shadow-2xs space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{evt.category}</span>
                            <span>{formattedDate}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-700 line-clamp-1">{evt.title}</h4>
                          <p className="text-xs text-slate-400 truncate">{evt.venue}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal for viewing pass or cancelling */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegistrationChange={fetchMyEvents}
      />
    </div>
  );
}
