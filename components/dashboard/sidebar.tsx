"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Calendar,
  BookOpen,
  Headphones,
  SearchX,
  MessageSquareWarning,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  loggingOut: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Universal Search", icon: Search },
  { id: "events", label: "Events", icon: Calendar },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "helpdesk", label: "Smart Helpdesk", icon: Headphones },
  { id: "lost-found", label: "Lost & Found", icon: SearchX },
  { id: "complaints", label: "Complaint Box", icon: MessageSquareWarning },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  onLogout,
  loggingOut,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/80 lg:bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Brand & Close on Mobile */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-600/20 text-white font-bold text-base transition-transform group-hover:scale-105">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-tight group-hover:text-brand-600 transition-colors">
                  Campus<span className="text-brand-600">OS</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  City University
                </span>
              </div>
            </Link>

            {/* Close button for mobile drawer */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6 space-y-1">
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Gateway
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                    isActive
                      ? "text-brand-700 bg-brand-50/80 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-brand-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-5 bg-brand-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Area: Settings & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <button
            onClick={() => {
              onSelectTab("settings");
              onCloseMobile();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
              activeTab === "settings"
                ? "text-brand-700 bg-brand-50 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
