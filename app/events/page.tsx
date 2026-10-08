"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EventCard, EventItem } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import {
  Calendar,
  Loader2,
  Sparkles,
  AlertCircle,
  Ticket,
  ShieldCheck,
  CalendarX,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
}

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("id");

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Event State
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [timeframe, setTimeframe] = React.useState<"upcoming" | "past">("upcoming");

  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);

  // Deep-link event loader
  React.useEffect(() => {
    if (!deepLinkId || authLoading) return;
    async function loadDeepLinkedEvent() {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(deepLinkId!)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.event) {
            setSelectedEvent(data.event);
          }
        }
      } catch (err) {
        console.error("Failed to load deep-linked event:", err);
      }
    }
    loadDeepLinkedEvent();
  }, [deepLinkId, authLoading]);

  // 1. Authenticate Session
  React.useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

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
        clearTimeout(timeoutId);
        if (isMounted) router.push("/auth");
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Fetch Events from Real PostgreSQL API
  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      params.set("timeframe", timeframe);

      const res = await fetch(`/api/events?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve events.");
        setEvents([]);
      } else {
        setEvents(data.events || []);
      }
    } catch {
      clearTimeout(timeoutId);
      setError("Network connection error. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, timeframe]);

  // Debounced search fetching
  React.useEffect(() => {
    if (authLoading) return;
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timeout);
  }, [authLoading, fetchEvents]);

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
          else if (tab === "lost-found") router.push("/lost-found");
          else if (tab === "complaints") router.push("/complaints");
          else if (tab === "notifications") router.push("/notifications");
          else if (tab === "events") {
            // Already on events
          } else {
            router.push("/dashboard");
          }
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
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-indigo-50/40 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Campus Life & Activities</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Campus Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Discover workshops, seminars, competitions, and activities across City University.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <Link
                href="/events/my"
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs inline-flex items-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4 text-brand-600" />
                <span>My Registrations</span>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <EventFilters
            query={searchQuery}
            onQueryChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Events Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-100 rounded-full" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-100 rounded-md" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                  <div className="h-8 w-full bg-slate-100 rounded-xl pt-2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            /* Truthful Zero-Data Empty State */
            <div className="py-20 px-6 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <CalendarX className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-800">
                  {timeframe === "upcoming"
                    ? "No verified upcoming events available right now."
                    : "No past events recorded."}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  CampusOS only displays officially verified City University events. Seminars,
                  workshops, and student club competitions will appear here once officially scheduled.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                {selectedCategory !== "All" || searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span>Return to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Events Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Showing <strong className="text-slate-800">{events.length}</strong> verified{" "}
                  {timeframe === "upcoming" ? "upcoming" : "past"}{" "}
                  {events.length === 1 ? "event" : "events"}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Official City University Schedule
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    onSelect={(e) => setSelectedEvent(e)}
                    onRegister={(e) => setSelectedEvent(e)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail & Registration Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegistrationChange={fetchEvents}
      />
    </div>
  );
}

export default function EventsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-1" />
            <p className="text-sm font-semibold text-slate-800">Loading Events...</p>
          </div>
        </div>
      }
    >
      <EventsPageContent />
    </React.Suspense>
  );
}
