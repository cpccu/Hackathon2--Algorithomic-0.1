"use client";

import * as React from "react";
import { Search, Filter, X } from "lucide-react";

interface ResourceFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (val: string) => void;
  selectedCourse: string;
  onCourseChange: (val: string) => void;
  onReset: () => void;
}

const CATEGORIES = [
  "All",
  "Syllabus",
  "Lecture Notes",
  "Lab Manual",
  "Exam Prep",
  "Reference Book",
];

const DEPARTMENTS = [
  "All",
  "Computer Science & Engineering",
  "Electrical & Electronic Engineering",
  "Mathematics & Physical Sciences",
  "Business Administration",
];

const COURSES = [
  "All",
  "CSE-311",
  "EEE-201",
  "MAT-102",
];

export function ResourceFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDepartment,
  onDepartmentChange,
  selectedCourse,
  onCourseChange,
  onReset,
}: ResourceFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "All" ||
    selectedDepartment !== "All" ||
    selectedCourse !== "All";

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      {/* 1. Primary Real Search Bar */}
      <div className="relative flex items-center w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search resources by title, course, or department..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Dropdown Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Course Code Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1">
            Course Code
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Filter Reset Pill */}
      {hasActiveFilters && (
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
          <span className="text-slate-400">Filtering results</span>
          <button
            onClick={onReset}
            className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset all filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
