"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchDetailModal } from "@/components/search/search-detail-modal";
import { UniversalSearchResultItem } from "@/lib/services/campus-search";
import {
  Search,
  Loader2,
  Sparkles,
  SearchX,
  Compass,
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  MapPin,
  HelpCircle,
  Users,
  GraduationCap,
} from "lucide-react";

interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  studentId: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Search States
  const [query, setQuery] = React.useState(initialQuery);
  const [selectedType, setSelectedType] = React.useState(initialType);
  const [results, setResults] = React.useState<UniversalSearchResultItem[]>([]);
  const [detectedIntent, setDetectedIntent] = React.useState<string | null>(null);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = React.useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeItem, setActiveItem] = React.useState<UniversalSearchResultItem | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

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

  // 2. Perform Search against Real PostgreSQL API
  const performSearch = React.useCallback(
    async (q: string, type: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setDetectedIntent(null);
        setLoading(false);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const params = new URLSearchParams();
        params.set("q", trimmed);
        if (type && type !== "all") {
          params.set("type", type);
        }

        const res = await fetch(`/api/campus/search?${params.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Failed to search campus records.");
          setResults([]);
          setDetectedIntent(null);
          setAiSummary(null);
          setSuggestedActions([]);
        } else {
          setResults(data.results || []);
          setDetectedIntent(data.intent || null);
          setAiSummary(data.aiSummary || null);
          setSuggestedActions(data.suggestedActions || []);
        }
      } catch {
        setError("Network error. Please verify your connection.");
        setResults([]);
        setDetectedIntent(null);
        setAiSummary(null);
        setSuggestedActions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Synchronize URL with Search State
  React.useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedType !== "all") params.set("type", selectedType);

    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.replace(newUrl);

    const timeout = setTimeout(() => {
      performSearch(query, selectedType);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, selectedType, authLoading, performSearch, router]);

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

  const handleSelectItem = (item: UniversalSearchResultItem) => {
    if (item.type === "resource") {
      router.push(item.url);
    } else {
      setActiveItem(item);
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

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "LOCATION_SEARCH":
        return "Campus Locations & Facilities";
      case "RESOURCE_SEARCH":
        return "Academic & Department Resources";
      case "EVENT_SEARCH":
        return "Campus Events & Schedules";
      case "DEPARTMENT_SEARCH":
        return "Academic Departments & Faculty";
      case "FAQ_SEARCH":
        return "Admissions & Official FAQs";
      case "CLUB_SEARCH":
        return "Clubs & Student Activities";
      default:
        return "Campus Directory";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-brand-500/10 selection:text-brand-700">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="search"
        onSelectTab={(tab) => {
          if (tab === "dashboard") router.push("/dashboard");
          else if (tab === "resources") router.push("/resources");
          else if (tab === "events") router.push("/events");
          else if (tab === "search") {
            // Already on search
          } else if (tab === "helpdesk") {
            router.push("/helpdesk");
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
                <span>Verified Campus Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Universal Campus Search
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Search verified departments, resources, campus locations, FAQs, and clubs.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>PostgreSQL Verified Data</span>
              </span>
            </div>
          </div>

          {/* Search Inputs & Filters */}
          <SearchFilters
            query={query}
            onQueryChange={setQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onSubmitSearch={() => performSearch(query, selectedType)}
          />

          {/* Search State & Results List */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-100 rounded-full" />
                    <div className="h-4 w-12 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-100 rounded-md" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : !query.trim() ? (
            /* Empty State: Initial State Before Query */
            <div className="py-16 px-6 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                <Compass className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  What do you need at City University?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Type a department name, topic, location, or course code to find verified records.
                </p>
              </div>

              {/* Quick Categories Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setQuery("CSE")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors"
                >
                  <Building2 className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="font-bold text-slate-800 block">CSE Department</span>
                  <span className="text-[11px] text-slate-400">Offices & Resources</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuery("library")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="font-bold text-slate-800 block">Central Library</span>
                  <span className="text-[11px] text-slate-400">Location & Hours</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuery("admission")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-left transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="font-bold text-slate-800 block">Admissions</span>
                  <span className="text-[11px] text-slate-400">Office & FAQs</span>
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* Empty State: No Matches */
            <div className="py-16 px-6 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  No verified campus information matched your search.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  CampusOS only displays officially verified City University records.
                  Try searching for a department, campus facility, or resource below.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {["CSE", "library", "admission", "resources", "events"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Try &ldquo;{term}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Search Results Grid */
            <div className="space-y-4">
              {aiSummary && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-blue-50/60 border border-brand-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-brand-900 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block">CampusOS Intelligence</span>
                      <p className="text-sm text-slate-800 font-medium">{aiSummary}</p>
                    </div>
                  </div>
                  {suggestedActions && suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {suggestedActions.map((act) => (
                        <button
                          key={act.url}
                          type="button"
                          onClick={() => router.push(act.url)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors shadow-2xs"
                        >
                          <span>{act.label}</span>
                          <span className="text-brand-500">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    Showing <strong className="text-slate-800">{results.length}</strong> verified{" "}
                    {results.length === 1 ? "result" : "results"} for &ldquo;
                    <strong className="text-slate-800">{query}</strong>&rdquo;
                  </span>
                  {detectedIntent && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-brand-600" />
                      <span>{getIntentLabel(detectedIntent)}</span>
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px]">Ranked by relevance & verification</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((item) => (
                  <SearchResultCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onSelect={handleSelectItem}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <SearchDetailModal
        item={activeItem}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-1" />
            <p className="text-sm font-semibold text-slate-800">Loading Universal Search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </React.Suspense>
  );
}
