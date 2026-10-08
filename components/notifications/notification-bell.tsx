"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  Search,
  MessageSquareWarning,
  Info,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Loader2,
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

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = React.useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch("/api/notifications/unread-count", {
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      clearTimeout(timeoutId);
      // ignore transient network errors
    }
  }, []);

  // Fetch recent notifications when dropdown opens
  const fetchRecentNotifications = React.useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch("/api/notifications?limit=5", {
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling every 20 seconds
  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Click outside to close and Escape key listener
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleDropdown = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      fetchRecentNotifications();
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    // Optimistically mark as read
    if (!notif.readAt) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      // Call API
      try {
        await fetch(`/api/notifications/${notif.id}/read`, {
          method: "PATCH",
        });
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }

    setOpen(false);

    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type.startsWith("EVENT_")) {
      return <Calendar className="w-4 h-4 text-brand-600" />;
    }
    if (type.startsWith("LOST_FOUND_")) {
      return <Search className="w-4 h-4 text-amber-600" />;
    }
    if (type.startsWith("COMPLAINT_")) {
      return <MessageSquareWarning className="w-4 h-4 text-rose-600" />;
    }
    return <Info className="w-4 h-4 text-cyan-600" />;
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={cn(
          "relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20",
          open && "bg-slate-100 text-slate-800"
        )}
        aria-label="Campus Notifications"
        title="Campus Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                <span className="text-xs font-medium">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  You're all caught up with your campus activity.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50/80 text-left relative",
                      isUnread ? "bg-brand-50/25" : "bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        notif.type.startsWith("EVENT_") && "bg-brand-50 text-brand-600",
                        notif.type.startsWith("LOST_FOUND_") && "bg-amber-50 text-amber-600",
                        notif.type.startsWith("COMPLAINT_") && "bg-rose-50 text-rose-600",
                        !notif.type.startsWith("EVENT_") &&
                          !notif.type.startsWith("LOST_FOUND_") &&
                          !notif.type.startsWith("COMPLAINT_") &&
                          "bg-cyan-50 text-cyan-600"
                      )}
                    >
                      {getIconForType(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={cn(
                            "text-xs truncate",
                            isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                          )}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.actionUrl && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-brand-600">
                          <span>View details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/40 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-white transition-all shadow-2xs"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
