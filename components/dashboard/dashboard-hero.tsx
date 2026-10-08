"use client";

import * as React from "react";
import Link from "next/link";
import { CampusVisual } from "@/components/dashboard/campus-visual";
import { UniversalSearch } from "@/components/dashboard/universal-search";
import {
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Bell,
  Tag,
  CheckCircle2,
} from "lucide-react";

interface DashboardHeroProps {
  userName?: string;
  studentId?: string;
}

export function DashboardHero({ userName, studentId }: DashboardHeroProps) {
  const [stats, setStats] = React.useState<{
    unreadCount: number | null;
    upcomingEventsCount: number | null;
    resourcesCount: number | null;
  }>({
    unreadCount: null,
    upcomingEventsCount: null,
    resourcesCount: null,
  });

  React.useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const [unreadRes, eventsRes, resourcesRes] = await Promise.allSettled([
          fetch("/api/notifications/unread-count", { headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/events?timeframe=upcoming", { headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/resources", { headers: { "Cache-Control": "no-cache" } }),
        ]);

        let unread = 0;
        let events = 0;
        let resources = 0;

        if (unreadRes.status === "fulfilled" && unreadRes.value.ok) {
          const data = await unreadRes.value.json();
          if (data.success && typeof data.unreadCount === "number") {
            unread = data.unreadCount;
          }
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
          const data = await eventsRes.value.json();
          if (data.success && Array.isArray(data.events)) {
            events = data.events.length;
          }
        }

        if (resourcesRes.status === "fulfilled" && resourcesRes.value.ok) {
          const data = await resourcesRes.value.json();
          if (data.success && typeof data.total === "number") {
            resources = data.total;
          }
        }

        if (isMounted) {
          setStats({
            unreadCount: unread,
            upcomingEventsCount: events,
            resourcesCount: resources,
          });
        }
      } catch (err) {
        console.warn("Failed to load dashboard stat counts:", err);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative w-full rounded-3xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
      {/* Subtle Top-Right Ambient Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-100/40 via-cyan-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Universal Search Surface */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>City University Digital Gateway</span>
            </div>
            {studentId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ID: {studentId}</span>
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {userName ? (
                <>Welcome back, <span className="text-slate-800">{userName.split(" ")[0]}</span>.</>
              ) : (
                <>Your campus, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600">connected.</span></>
              )}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
              Find verified events, academic resources, answers and campus services — all in one place.
            </p>
          </div>

          {/* Real Live Stats Chips */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Link
              href="/notifications"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {stats.unreadCount !== null ? (
                  <>
                    <strong className="text-slate-900">{stats.unreadCount}</strong>{" "}
                    {stats.unreadCount === 1 ? "unread notification" : "unread notifications"}
                  </>
                ) : (
                  "Notifications"
                )}
              </span>
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {stats.upcomingEventsCount !== null ? (
                  <>
                    <strong className="text-slate-900">{stats.upcomingEventsCount}</strong>{" "}
                    {stats.upcomingEventsCount === 1 ? "upcoming event" : "upcoming events"}
                  </>
                ) : (
                  "Campus Events"
                )}
              </span>
            </Link>

            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>
                {stats.resourcesCount !== null ? (
                  <>
                    <strong className="text-slate-900">{stats.resourcesCount}</strong>{" "}
                    verified resources
                  </>
                ) : (
                  "Resource Hub"
                )}
              </span>
            </Link>
          </div>

          {/* Universal Campus Search */}
          <div className="pt-2">
            <UniversalSearch />
          </div>

          {/* Compact Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Quick Actions:
            </span>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Search className="w-3 h-3 text-brand-600" />
              <span>Search Campus</span>
            </Link>
            <Link
              href="/helpdesk"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Ask Helpdesk</span>
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <BookOpen className="w-3 h-3 text-brand-600" />
              <span>Browse Resources</span>
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>View Events</span>
            </Link>
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Tag className="w-3 h-3 text-purple-600" />
              <span>Lost & Found</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Original Connected Campus Visual */}
        <div className="lg:col-span-5 w-full">
          <CampusVisual />
        </div>
      </div>
    </section>
  );
}
