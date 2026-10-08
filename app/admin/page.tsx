"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Loader2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";

import { AdminSidebar, type AdminTab } from "@/components/admin/admin-sidebar";
import { OverviewTab } from "@/components/admin/tabs/overview-tab";
import { EventsTab } from "@/components/admin/tabs/events-tab";
import { NoticesTab } from "@/components/admin/tabs/notices-tab";
import { DepartmentsTab } from "@/components/admin/tabs/departments-tab";
import { FacultyTab } from "@/components/admin/tabs/faculty-tab";
import { LocationsTab } from "@/components/admin/tabs/locations-tab";
import { FAQsTab } from "@/components/admin/tabs/faqs-tab";
import { ClubsTab } from "@/components/admin/tabs/clubs-tab";
import { UniversityTab } from "@/components/admin/tabs/university-tab";
import { AuditTab } from "@/components/admin/tabs/audit-tab";
import { LostFoundTab } from "@/components/admin/tabs/lost-found-tab";
import { ComplaintsTab } from "@/components/admin/tabs/complaints-tab";

interface UserSession {
  id: string;
  email: string;
  name?: string;
  studentId?: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<AdminTab>("overview");
  const [loggingOut, setLoggingOut] = React.useState(false);

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
            setLoading(false);
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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/auth");
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Verifying administrator authorization...</p>
      </div>
    );
  }

  // 403 Forbidden state for students or non-admin roles
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-100 text-rose-800 mb-2">
              403 Forbidden
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrative Domain
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Your account <span className="font-semibold text-slate-800">({user?.email})</span> does not hold
              administrative privileges. All unauthorized access attempts are monitored and logged.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Student Dashboard
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium transition"
            >
              Sign out and switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Authenticated Admin Console View
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        adminName={user.name || user.email.split("@")[0]}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
              aria-label="Open navigation menu"
            >
              <span className="sr-only">Open navigation</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              CampusOS <span className="mx-1">/</span> Management <span className="mx-1">/</span>
            </div>
            <span className="text-sm font-bold text-slate-800 capitalize tracking-tight">
              {activeTab} Management
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Student View
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                AD
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-none">{user.email}</div>
                <div className="text-[10px] font-medium text-indigo-600 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Campus Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && <OverviewTab onNavigateTab={setActiveTab} />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "lost-found" && <LostFoundTab />}
          {activeTab === "complaints" && <ComplaintsTab />}
          {activeTab === "notices" && <NoticesTab />}
          {activeTab === "departments" && <DepartmentsTab />}
          {activeTab === "faculty" && <FacultyTab />}
          {activeTab === "locations" && <LocationsTab />}
          {activeTab === "faqs" && <FAQsTab />}
          {activeTab === "clubs" && <ClubsTab />}
          {activeTab === "university" && <UniversityTab />}
          {activeTab === "audit" && <AuditTab />}
        </main>
      </div>
    </div>
  );
}
