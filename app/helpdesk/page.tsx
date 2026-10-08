"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HelpdeskChat } from "@/components/helpdesk/helpdesk-chat";
import { Loader2, Sparkles, Headphones, ShieldCheck } from "lucide-react";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
}

export default function HelpdeskPage() {
  const router = useRouter();

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
        activeTab="helpdesk"
        onSelectTab={(tab) => {
          if (tab === "dashboard") router.push("/dashboard");
          else if (tab === "resources") router.push("/resources");
          else if (tab === "events") router.push("/events");
          else if (tab === "search") router.push("/search");
          else if (tab === "lost-found") router.push("/lost-found");
          else if (tab === "complaints") router.push("/complaints");
          else if (tab === "notifications") router.push("/notifications");
          else if (tab === "helpdesk") {
            // Already on helpdesk
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
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-brand-50/40 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Grounded AI Assistant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Smart Helpdesk
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Ask CampusOS about your university, departments, policies, and facilities.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Hallucination Guarantee</span>
              </span>
            </div>
          </div>

          {/* Interactive Chat Canvas */}
          <HelpdeskChat />
        </main>
      </div>
    </div>
  );
}
