"use client";

import * as React from "react";
import { Menu, ShieldCheck, Shield } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  userRole?: string;
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({
  userName,
  userEmail,
  userRole,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  // Get student initials
  const initials = React.useMemo(() => {
    if (!userName) return "CU";
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  // Compute time-based greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>{greeting}, <span className="text-brand-600">{userName}</span></span>
          </h2>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Your campus, connected.
          </p>
        </div>
      </div>

      {/* Right: Notifications, Badge, & User Profile */}
      <div className="flex items-center gap-3">
        {/* Admin Console Link for authorized administrators */}
        {userRole === "ADMIN" && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin Console</span>
          </Link>
        )}

        {/* Verification badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{userRole === "ADMIN" ? "Administrator" : "Verified Student"}</span>
        </div>

        {/* Interactive Notifications Popover */}
        <NotificationBell />

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {userName}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
              {userEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
