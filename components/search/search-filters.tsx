"use client";

import * as React from "react";
import { Search, X, Sparkles, Filter } from "lucide-react";

interface SearchFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onSubmitSearch: () => void;
}

const CATEGORIES = [
  { id: "all", label: "All Verified" },
  { id: "resource", label: "Academic Resources" },
  { id: "department", label: "Departments" },
  { id: "location", label: "Locations & Facilities" },
  { id: "faq", label: "FAQs & Policies" },
  { id: "club", label: "Clubs & Societies" },
  { id: "university", label: "University Info" },
];

const SUGGESTED_QUERIES = [
  "CSE",
  "Library",
  "Admission",
  "CSE resources",
  "Auditorium",
  "Robotics Club",
  "Cafeteria",
  "Tuition fee",
];

export function SearchFilters({
  query,
  onQueryChange,
  selectedType,
  onTypeChange,
  onSubmitSearch,
}: SearchFiltersProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch();
  };

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-2xl bg-white border border-slate-200/80 shadow-xs focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-200"
      >
        <div className="pl-4 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search City University (e.g. CSE, Library, Admission, Clubs, Resources)..."
          className="w-full py-4 pr-24 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pl-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedType === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onTypeChange(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pl-1 text-[11px]">
          <Sparkles className="w-3 h-3 text-brand-500" />
          Suggested:
        </span>
        {SUGGESTED_QUERIES.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => onQueryChange(pill)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/50 text-xs transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
