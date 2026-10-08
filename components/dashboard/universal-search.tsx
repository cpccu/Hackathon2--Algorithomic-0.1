"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Sparkles,
  Command,
  Loader2,
  CheckCircle2,
  BookOpen,
  Building2,
  MapPin,
  HelpCircle,
  Users,
  GraduationCap,
  Compass,
  CornerDownLeft,
} from "lucide-react";
import { UniversalSearchResultItem } from "@/lib/services/campus-search";

const SUGGESTIONS = [
  "What do you need? Try: Where is the library?",
  "What do you need? Try: Where is the CSE department?",
  "What do you need? Try: Learn SQL in Resource Hub",
  "What do you need? Try: What are the admission criteria?",
  "What do you need? Try: Any upcoming CSE events?",
];

const QUICK_PILLS = [
  "CSE",
  "Library",
  "Admission",
  "CSE resources",
  "Auditorium",
  "Cafeteria",
];

export function UniversalSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [suggestionIdx, setSuggestionIdx] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);
  const [results, setResults] = React.useState<UniversalSearchResultItem[]>([]);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = React.useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Animated placeholder suggestion cycler
  React.useEffect(() => {
    if (isFocused || query.length > 0) return;
    const interval = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isFocused, query]);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Outside click listener to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live debounced search against real PostgreSQL API
  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    setSelectedIndex(-1);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/campus/search?q=${encodeURIComponent(trimmed)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setResults(data.results || []);
            setAiSummary(data.aiSummary || null);
            setSuggestedActions(data.suggestedActions || []);
          }
        }
      } catch (err) {
        console.warn("Dropdown search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Keyboard navigation within dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelectItem(results[selectedIndex]);
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectItem = (item: UniversalSearchResultItem) => {
    setIsOpen(false);
    if (item.type === "resource") {
      router.push(item.url);
    } else if (item.type === "event") {
      router.push(item.url || "/events");
    } else {
      router.push(`/search?q=${encodeURIComponent(item.title)}`);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <BookOpen className="w-4 h-4 text-brand-600" />;
      case "department":
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case "location":
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case "faq":
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case "club":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "university":
        return <GraduationCap className="w-4 h-4 text-sky-600" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Label & Shortcut Indicator */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <label
          htmlFor="universal-search-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>WHAT DO YOU NEED?</span>
        </label>
        <button
          type="button"
          onClick={() => {
            inputRef.current?.focus();
            setIsFocused(true);
          }}
          className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100/80 hover:bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-200/50 transition-colors"
        >
          <Command className="w-3 h-3" /> K
        </button>
      </div>

      {/* Main Search Input Form */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full rounded-2xl bg-white border transition-all duration-200 z-30 ${
          isFocused
            ? "border-brand-500 ring-4 ring-brand-500/10 shadow-lg shadow-brand-500/5"
            : "border-slate-200 hover:border-slate-300 shadow-sm"
        }`}
      >
        <div className="pl-4 pr-2 text-slate-400">
          {loading ? (
            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          id="universal-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={SUGGESTIONS[suggestionIdx]}
          autoComplete="off"
          className="w-full py-4 pr-12 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        <button
          type="submit"
          className="absolute right-2.5 p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-transform active:scale-95 shadow-sm shadow-brand-600/30"
          aria-label="Submit search"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Real-Time Dropdown Results Surface */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Searching verified campus records...</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              {aiSummary && (
                <div className="px-4 py-2.5 bg-gradient-to-r from-brand-50/80 to-blue-50/40 border-b border-brand-100/60 flex items-start gap-2 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-brand-700">CampusOS Intelligence: </span>
                    <span className="text-slate-700">{aiSummary}</span>
                  </div>
                </div>
              )}

              {suggestedActions.length > 0 && (
                <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Actions:</span>
                  {suggestedActions.slice(0, 3).map((act) => (
                    <button
                      key={act.url}
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        router.push(act.url);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 bg-white border border-brand-200/80 hover:bg-brand-50 px-2 py-0.5 rounded-full transition-colors"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-brand-500" />
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Verified Match Results</span>
                <span className="flex items-center gap-1">
                  <span>Use</span>
                  <span className="px-1 py-0.5 rounded bg-white border border-slate-200">↑</span>
                  <span className="px-1 py-0.5 rounded bg-white border border-slate-200">↓</span>
                  <span>to navigate</span>
                </span>
              </div>

              <div className="py-1 divide-y divide-slate-100">
                {results.map((item, idx) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onMouseDown={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                      selectedIndex === idx ? "bg-brand-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200/60 shrink-0">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {item.title}
                        </span>
                        {item.verificationStatus === "VERIFIED" && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description || item.department || item.location || item.category}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0 self-center">
                      {item.category || item.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer action to full search page */}
              <div
                onMouseDown={() => {
                  setIsOpen(false);
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-center text-xs font-bold text-brand-700 border-t border-slate-100 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View all verified results for &ldquo;{query}&rdquo;</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                {aiSummary || `No verified records found for "${query}"`}
              </p>
              <p className="text-[11px] text-slate-400">
                CampusOS only displays officially verified City University information.
              </p>
              {suggestedActions.length > 0 && (
                <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                  {suggestedActions.map((act) => (
                    <button
                      key={act.url}
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        router.push(act.url);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full border border-brand-200 transition-colors"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-brand-500" />
                    </button>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onMouseDown={() => {
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  Explore Campus Directory →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Discovery Pills */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-slate-500 select-none no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          Quick queries:
        </span>
        {QUICK_PILLS.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => {
              setQuery(pill);
              inputRef.current?.focus();
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/40 transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
