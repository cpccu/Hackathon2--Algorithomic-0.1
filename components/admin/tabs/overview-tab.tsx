"use client";

import * as React from "react";
import {
  Calendar,
  Bell,
  Building2,
  Users,
  MapPin,
  HelpCircle,
  Sparkles,
  Ticket,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
  Tag,
  MessageSquareWarning,
} from "lucide-react";
import { AdminTab } from "../admin-sidebar";

interface StatsData {
  events: { total: number; verified: number; pending: number };
  notices: number;
  departments: number;
  faculty: number;
  locations: number;
  faqs: number;
  clubs: number;
  registrations: number;
  lostFound?: { total: number; pending: number };
  complaints?: { total: number; pending: number };
}

interface OverviewTabProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [recentLogs, setRecentLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/audit-logs"),
        ]);
        if (statsRes.ok) {
          const s = await statsRes.json();
          if (s.success) setStats(s.stats);
        }
        if (logsRes.ok) {
          const l = await logsRes.json();
          if (l.success) setRecentLogs((l.logs || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load admin overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cards = [
    {
      title: "Verified Events",
      count: stats?.events.verified ?? 0,
      sub: `${stats?.events.pending ?? 0} pending review`,
      icon: Calendar,
      tab: "events" as AdminTab,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Published Notices",
      count: stats?.notices ?? 0,
      sub: "Official Bulletins",
      icon: Bell,
      tab: "notices" as AdminTab,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Departments",
      count: stats?.departments ?? 0,
      sub: "Academic & Admin",
      icon: Building2,
      tab: "departments" as AdminTab,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Faculty Members",
      count: stats?.faculty ?? 0,
      sub: "Directory Records",
      icon: Users,
      tab: "faculty" as AdminTab,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      title: "Campus Locations",
      count: stats?.locations ?? 0,
      sub: "Physical Points",
      icon: MapPin,
      tab: "locations" as AdminTab,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: "Campus FAQs",
      count: stats?.faqs ?? 0,
      sub: "Helpdesk Knowledge",
      icon: HelpCircle,
      tab: "faqs" as AdminTab,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Student Clubs",
      count: stats?.clubs ?? 0,
      sub: "Affiliated Bodies",
      icon: Sparkles,
      tab: "clubs" as AdminTab,
      color: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      title: "Event Passes",
      count: stats?.registrations ?? 0,
      sub: "Student Check-ins",
      icon: Ticket,
      tab: "events" as AdminTab,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      title: "Lost & Found",
      count: stats?.lostFound?.total ?? 0,
      sub: `${stats?.lostFound?.pending ?? 0} pending review`,
      icon: Tag,
      tab: "lost-found" as AdminTab,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Complaint Box",
      count: stats?.complaints?.total ?? 0,
      sub: `${stats?.complaints?.pending ?? 0} pending review`,
      icon: MessageSquareWarning,
      tab: "complaints" as AdminTab,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Authenticated Administration Layer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            City University Digital Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Controlled data management system powering the Student Dashboard, Universal Search, and Grounded AI Helpdesk.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Neon DB Connected</span>
          </span>
        </div>
      </div>

      {/* Database-Backed Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Live Campus Data Telemetry</h3>
          <span className="text-xs font-medium text-slate-400">Zero-Fabrication Live Counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                type="button"
                onClick={() => onNavigateTab(c.tab)}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`p-2 rounded-xl border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="pt-4 space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {loading ? "..." : c.count}
                  </div>
                  <p className="text-xs font-bold text-slate-700">{c.title}</p>
                  <p className="text-[11px] text-slate-400">{c.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Activity Snapshot */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Administrative Operations</h3>
          </div>
          <button
            onClick={() => onNavigateTab("audit")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Full Audit Trail →
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No administrative actions recorded yet. All modifications will appear in this audit log.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <p className="text-[11px] text-slate-400">
                    Target: {log.entityType} ({log.entityId}) • By: {log.adminEmail || "Admin"}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
