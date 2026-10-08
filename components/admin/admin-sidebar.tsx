"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Building2,
  Users,
  MapPin,
  HelpCircle,
  Sparkles,
  School,
  History,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  X,
  Menu,
  Tag,
  MessageSquareWarning,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "events"
  | "notices"
  | "departments"
  | "faculty"
  | "locations"
  | "faqs"
  | "clubs"
  | "university"
  | "lost-found"
  | "complaints"
  | "audit";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  adminName: string;
}

const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Operations Overview", icon: LayoutDashboard },
  { id: "events", label: "Event Management", icon: Calendar },
  { id: "lost-found", label: "Lost & Found", icon: Tag },
  { id: "complaints", label: "Complaint Box", icon: MessageSquareWarning },
  { id: "notices", label: "Official Notices", icon: Bell },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "faculty", label: "Faculty & Staff", icon: Users },
  { id: "locations", label: "Campus Locations", icon: MapPin },
  { id: "faqs", label: "Campus FAQs", icon: HelpCircle },
  { id: "clubs", label: "Student Clubs", icon: Sparkles },
  { id: "university", label: "University Profile", icon: School },
  { id: "audit", label: "Audit Logs", icon: History },
];

export function AdminSidebar({
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onCloseMobile,
  adminName,
}: AdminSidebarProps) {
  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Top Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-400">
              Admin Console
            </span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            Campus<span className="text-indigo-400">OS</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/80 font-bold ml-1">
              OPS
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">City University Operations</p>
        </div>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Identity Card */}
      <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
          AD
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{adminName}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            Authorized Admin
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Campus Data Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Return to Student App & Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Student Dashboard</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
