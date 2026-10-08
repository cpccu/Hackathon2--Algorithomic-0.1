"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Bell,
  Calendar,
  Search,
  MessageSquareWarning,
  Info,
  CheckCheck,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
  role?: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Notifications State
  const [activeTab, setActiveTab] = React.useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [markingAll, setMarkingAll] = React.useState(false);

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

  // 2. Fetch Notifications
  const fetchNotifications = React.useCallback(async (tab: "ALL" | "UNREAD") => {
    setLoading(true);
    setError(null);
    try {
      const url = tab === "UNREAD" ? "/api/notifications?unreadOnly=true&limit=50" : "/api/notifications?limit=50";
      const res = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      setTotalCount(typeof data.total === "number" ? data.total : (data.notifications || []).length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications(activeTab);
    }
  }, [authLoading, user, activeTab, fetchNotifications]);

  // Handle Mark Single Read
  const handleMarkAsRead = async (notif: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (notif.readAt) return;

    setActionLoadingId(notif.id);
    try {
      const res = await fetch(`/api/notifications/${notif.id}/read`, {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        );
        setUnreadCount(0);
        if (activeTab === "UNREAD") {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Handle Item Click with deep linking
  const handleCardClick = async (notif: NotificationItem) => {
    if (!notif.readAt) {
      await handleMarkAsRead(notif);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth");
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "EVENT_REGISTERED":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">Event Registered</span>;
      case "EVENT_UPDATED":
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/60">Event Update</span>;
      case "EVENT_CANCELLED":
        return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/60">Event Cancelled</span>;
      case "LOST_FOUND_VERIFIED":
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">Item Verified</span>;
      case "LOST_FOUND_CLAIM_SUBMITTED":
        return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200/60">New Claim</span>;
      case "LOST_FOUND_CLAIM_APPROVED":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">Claim Approved</span>;
      case "LOST_FOUND_CLAIM_REJECTED":
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">Claim Rejected</span>;
      case "LOST_FOUND_RESOLVED":
        return <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200/60">Case Resolved</span>;
      case "COMPLAINT_SUBMITTED":
        return <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">Complaint Lodged</span>;
      case "COMPLAINT_STATUS_UPDATED":
        return <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200/60">Status Update</span>;
      case "COMPLAINT_RESPONSE":
        return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/60">Official Response</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">Notice</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.startsWith("EVENT_")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
          <Calendar className="w-5 h-5" />
        </div>
      );
    }
    if (type.startsWith("LOST_FOUND_")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <Search className="w-5 h-5" />
        </div>
      );
    }
    if (type.startsWith("COMPLAINT_")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          <MessageSquareWarning className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100">
        <Info className="w-5 h-5" />
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">CampusOS</h3>
            <p className="text-xs text-slate-400 mt-0.5">Verifying credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.fullName || "Student";
  const displayEmail = user?.email || "";

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab="notifications"
        onSelectTab={(tab) => {
          if (tab === "dashboard") router.push("/dashboard");
          else if (tab === "search") router.push("/search");
          else if (tab === "events") router.push("/events");
          else if (tab === "resources") router.push("/resources");
          else if (tab === "helpdesk") router.push("/helpdesk");
          else if (tab === "lost-found") router.push("/lost-found");
          else if (tab === "complaints") router.push("/complaints");
        }}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <DashboardHeader
          userName={displayName}
          userEmail={displayEmail}
          userRole={user?.role}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <button
              onClick={() => fetchNotifications(activeTab)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-2xs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Page Banner / Title */}
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-brand-50/30 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold mb-3 shadow-2xs">
                  <Bell className="w-3.5 h-3.5 text-brand-600" />
                  <span>Activity Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Campus Notifications
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-xl">
                  Stay updated on your registered events, lost item reports, and campus complaints in real time.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20 disabled:opacity-50 self-start md:self-auto"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{markingAll ? "Marking..." : "Mark All as Read"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>All Notifications</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === "ALL" ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                  )}
                >
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("UNREAD")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === "UNREAD"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                      activeTab === "UNREAD" ? "bg-brand-700 text-white" : "bg-rose-100 text-rose-700"
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </span>
          </div>

          {/* Notifications Feed */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-xs text-slate-500 font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Unable to load notifications</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => fetchNotifications(activeTab)}
                className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                Try Again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 px-4 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === "UNREAD" ? "You're all caught up!" : "No notifications yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {activeTab === "UNREAD"
                  ? "There are no unread notifications right now. Check back when you register for events or receive updates."
                  : "When you register for events, report lost items, or submit complaints, official updates will appear right here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleCardClick(notif)}
                    className={cn(
                      "p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group relative",
                      isUnread
                        ? "bg-brand-50/20 border-brand-200/70 hover:border-brand-300 hover:bg-brand-50/30 shadow-xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                    )}
                  >
                    {/* Left: Icon & Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {getTypeIcon(notif.type)}

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getTypeBadge(notif.type)}
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(notif.createdAt)}</span>
                            <span className="text-slate-300">•</span>
                            <span>{formatTimestamp(notif.createdAt)}</span>
                          </span>
                        </div>

                        <h3
                          className={cn(
                            "text-sm tracking-tight",
                            isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                          )}
                        >
                          {notif.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isUnread && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif, e)}
                          disabled={actionLoadingId === notif.id}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                      )}

                      {notif.actionUrl && (
                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 group-hover:bg-brand-600 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs">
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
