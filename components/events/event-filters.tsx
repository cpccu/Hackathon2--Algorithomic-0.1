"use client";

import * as React from "react";
import { Search, X, Filter, Calendar } from "lucide-react";

interface EventFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  timeframe: "upcoming" | "past";
  onTimeframeChange: (tf: "upcoming" | "past") => void;
}

const CATEGORIES = [
  "All",
  "Academic",
  "Workshop",
  "Seminar",
  "Competition",
  "Cultural",
  "Club",
];

export function EventFilters({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  timeframe,
  onTimeframeChange,
}: EventFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar & Timeframe Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center rounded-2xl bg-white border border-slate-200/80 shadow-xs focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search events by title, organizer, or venue..."
            className="w-full py-3.5 pr-10 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Timeframe Pill Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100/80 border border-slate-200/50 self-start sm:self-auto shrink-0 text-xs">
          <button
            type="button"
            onClick={() => onTimeframeChange("upcoming")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              timeframe === "upcoming"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange("past")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              timeframe === "past"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pl-1">
          <Filter className="w-3.5 h-3.5" />
          Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
