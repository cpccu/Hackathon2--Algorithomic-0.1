"use client";

import * as React from "react";
import { Sparkles, Calendar, BookOpen, Headphones, SearchX } from "lucide-react";

export function CampusVisual() {
  return (
    <div className="relative w-full h-[240px] sm:h-[280px] lg:h-[300px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900/5 via-brand-600/10 to-cyan-500/10 border border-brand-100/50">
      {/* Background Architectural Grid Lines */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:28px_28px] opacity-70"
        aria-hidden="true"
      />

      {/* Radiant Glow Behind Center Structure */}
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-brand-500/20 to-cyan-400/30 blur-2xl pointer-events-none" />

      {/* Central Campus Core: Stylized Digital Quad Dome / Atrium */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Futuristic University Beacon */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-brand-50 shadow-xl shadow-brand-500/15 border border-white flex items-center justify-center group">
          {/* Internal Rings */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-inner text-white font-black text-2xl tracking-tighter">
            CU
          </div>

          {/* Orbiting Orbital Ring 1 */}
          <div className="absolute -inset-3 rounded-full border border-dashed border-brand-400/40 animate-[spin_24s_linear_infinite]" />
          {/* Orbiting Orbital Ring 2 */}
          <div className="absolute -inset-6 rounded-full border border-slate-300/40 animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        {/* Central Foundation Platform */}
        <div className="w-40 sm:w-52 h-4 mt-3 rounded-full bg-gradient-to-r from-transparent via-brand-600/20 to-transparent blur-xs" />
      </div>

      {/* Floating Service Satellite 1: Events (Top Left) */}
      <div className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50 animate-[bounce_4s_ease-in-out_infinite]">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-700">Events Hub</span>
      </div>

      {/* Floating Service Satellite 2: Resources (Bottom Left) */}
      <div className="absolute bottom-6 left-8 sm:left-16 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50 animate-[bounce_5s_ease-in-out_infinite_1s]">
        <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-700">Resource Vault</span>
      </div>

      {/* Floating Service Satellite 3: Helpdesk (Top Right) */}
      <div className="absolute top-8 right-6 sm:right-12 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50 animate-[bounce_4.5s_ease-in-out_infinite_0.5s]">
        <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <Headphones className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-700">Smart Helpdesk</span>
      </div>

      {/* Floating Service Satellite 4: Lost & Found (Bottom Right) */}
      <div className="absolute bottom-7 right-8 sm:right-16 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50 animate-[bounce_5.5s_ease-in-out_infinite_1.5s]">
        <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <SearchX className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-700">Lost & Found</span>
      </div>
    </div>
  );
}
