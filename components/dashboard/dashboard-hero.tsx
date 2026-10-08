"use client";

import * as React from "react";
import { CampusVisual } from "@/components/dashboard/campus-visual";
import { UniversalSearch } from "@/components/dashboard/universal-search";
import { Sparkles } from "lucide-react";

export function DashboardHero() {
  return (
    <section className="relative w-full rounded-3xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
      {/* Subtle Top-Right Ambient Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-100/40 via-cyan-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Universal Search Surface */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>City University Digital Gateway</span>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your campus, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600">connected.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
              Find events, resources, answers and campus services — all in one place.
            </p>
          </div>

          {/* Universal Campus Search */}
          <div className="pt-2">
            <UniversalSearch />
          </div>
        </div>

        {/* Right Column: Original Connected Campus Visual */}
        <div className="lg:col-span-5 w-full">
          <CampusVisual />
        </div>
      </div>
    </section>
  );
}
