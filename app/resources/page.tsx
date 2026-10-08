"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { ResourceDetailModal } from "@/components/resources/resource-detail-modal";
import { ResourceRecord } from "@/lib/db";
import { BookOpen, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
}

export default function ResourcesPage() {
  const router = useRouter();

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Resource State
  const [resources, setResources] = React.useState<ResourceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedDepartment, setSelectedDepartment] = React.useState("All");
  const [selectedCourse, setSelectedCourse] = React.useState("All");

  // Detail Modal State
  const [activeResource, setActiveResource] = React.useState<ResourceRecord | null>(null);

  // 1. Authenticate Session
  React.useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

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
        clearTimeout(timeoutId);
        if (isMounted) router.push("/auth");
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Fetch Resources from Real PostgreSQL API
  const fetchResources = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedDepartment !== "All") params.set("department", selectedDepartment);
      if (selectedCourse !== "All") params.set("courseCode", selectedCourse);

      const res = await fetch(`/api/resources?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to retrieve resources.");
      } else {
        setResources(data.resources || []);
      }
    } catch {
      clearTimeout(timeoutId);
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDepartment, selectedCourse]);

  // Debounced query fetching
  React.useEffect(() => {
    if (authLoading) return;
    const timeout = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timeout);
  }, [authLoading, fetchResources]);

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDepartment("All");
    setSelectedCourse("All");
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
        activeTab="resources"
        onSelectTab={(tab) => {
          if (tab === "dashboard") router.push("/dashboard");
          else if (tab === "resources") {
            // Already on resources
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Academic Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Resource Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Find the materials you need, all in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                {resources.length} {resources.length === 1 ? "Resource" : "Resources"} Available
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <ResourceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            onReset={handleResetFilters}
          />

          {/* Resource Grid / Loading / Empty State */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Searching verified academic resources...</p>
              <p className="text-xs text-slate-400 mt-0.5">Fetching course materials and syllabi</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-800">Error Loading Resources</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchResources}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-16 px-4 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No resources match your search</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No course materials match your current search or filters. Try adjusting your query or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onOpenDetails={(r) => setActiveResource(r)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="pt-6 pb-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>© 2026 CampusOS Resource Hub — City University</p>
            <span className="text-emerald-600 font-medium">PostgreSQL Connected</span>
          </footer>
        </main>
      </div>

      {/* Modal View for Resource Details */}
      <ResourceDetailModal
        resource={activeResource}
        onClose={() => setActiveResource(null)}
      />
    </div>
  );
}
