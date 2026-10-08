"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { CampusServices } from "@/components/dashboard/campus-services";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { RecentNotices } from "@/components/dashboard/recent-notices";
import { Loader2 } from "lucide-react";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
  role?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Authenticate session on mount
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      router.push("/auth");
    }
  };

  // Loading State with brand indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">CampusOS</h3>
            <p className="text-xs text-slate-400 mt-0.5">Connecting to City University...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.fullName || "Student";
  const displayEmail = user?.email || "";

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-brand-500/10 selection:text-brand-700">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "resources") {
            router.push("/resources");
          } else if (tab === "search") {
            router.push("/search");
          } else if (tab === "helpdesk") {
            router.push("/helpdesk");
          } else if (tab === "events") {
            router.push("/events");
          } else if (tab === "lost-found") {
            router.push("/lost-found");
          } else if (tab === "complaints") {
            router.push("/complaints");
          } else if (tab === "notifications") {
            router.push("/notifications");
          }
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in-50 duration-300">
          {/* Hero Section with Search and Campus Visual */}
          <DashboardHero userName={displayName} studentId={user?.studentId} />

          {/* Core Campus Services Grid */}
          <CampusServices
            onSelectService={(serviceId) => {
              if (serviceId === "resources") {
                router.push("/resources");
              } else if (serviceId === "helpdesk") {
                router.push("/helpdesk");
              } else if (serviceId === "events") {
                router.push("/events");
              } else if (serviceId === "search") {
                router.push("/search");
              } else if (serviceId === "lost-found") {
                router.push("/lost-found");
              } else if (serviceId === "complaints") {
                router.push("/complaints");
              } else {
                setActiveTab(serviceId);
              }
            }}
          />

          {/* Upcoming Events & Recent Notices Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UpcomingEvents />
            <RecentNotices />
          </section>

          {/* Student Footer Meta */}
          <footer className="pt-6 pb-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>© 2026 CampusOS — City University Digital Platform</p>
            <div className="flex items-center gap-4">
              <span>Student ID: <strong className="text-slate-600 font-semibold">{user?.studentId || "Verified"}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">System Online</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
