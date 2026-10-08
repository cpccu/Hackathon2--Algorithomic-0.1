"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CeilingLampProps {
  isLightOn: boolean;
  className?: string;
}

export function CeilingLamp({ isLightOn, className }: CeilingLampProps) {
  return (
    <div className={cn("relative flex flex-col items-center select-none pointer-events-none", className)}>
      {/* =========================================================
       * 1. CEILING MOUNT CANOPY & HANGING CORD
       * ========================================================= */}
      {/* Ceiling Rose Canopy */}
      <div className="w-12 h-3 rounded-b-md bg-gradient-to-b from-slate-700 to-slate-900 border-b border-slate-600 shadow-md" />

      {/* Hanging Black Matte Cable */}
      <div className="w-[3px] h-16 sm:h-24 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900" />

      {/* Socket Hardware Collar */}
      <div className="w-6 h-3 rounded-t-sm bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-t border-amber-500/60" />

      {/* =========================================================
       * 2. MODERN DOME LAMP SHADE
       * Modern Scandinavian study lamp with clean curvature
       * ========================================================= */}
      <div className="relative flex flex-col items-center">
        {/* Shade Exterior Body */}
        <div
          className={cn(
            "relative w-36 sm:w-48 md:w-56 h-18 sm:h-24 md:h-28 rounded-t-full border-t transition-all duration-700 overflow-hidden",
            isLightOn
              ? "bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-amber-300/30 shadow-[0_-4px_24px_rgba(251,191,36,0.1)]"
              : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800"
          )}
          style={{
            clipPath: "polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)",
          }}
        >
          {/* Subtle Metallic Highlight Streak on Shade */}
          <div className="absolute inset-y-0 left-1/3 w-8 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Lower Shade Rim Bezel */}
        <div
          className={cn(
            "w-36 sm:w-48 md:w-56 h-2 rounded-full transition-all duration-500",
            isLightOn
              ? "bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.8)]"
              : "bg-slate-850 border-t border-slate-750"
          )}
        />

        {/* Light Bulb (visible just under rim) */}
        <div
          className={cn(
            "w-10 sm:w-12 h-10 sm:h-12 rounded-full -mt-4 transition-all duration-500 flex items-center justify-center",
            isLightOn
              ? "bg-gradient-to-b from-white to-amber-200 shadow-[0_0_30px_#fef08a,0_0_60px_rgba(251,191,36,0.6)] scale-100 opacity-100"
              : "bg-slate-800/80 scale-90 opacity-40 border border-slate-700"
          )}
        >
          {/* Subtle Filament Core */}
          {isLightOn && (
            <div className="w-3 h-4 rounded-full border border-amber-400 bg-amber-300/60 animate-pulse" />
          )}
        </div>
      </div>

      {/* =========================================================
       * 3. REALISTIC SOFT ILLUMINATION LIGHT BEAM
       * Projects naturally downwards onto the room surface
       * Pure multi-stop conic/radial gradient — NO blur filters
       * ========================================================= */}
      <div
        className={cn(
          "absolute top-28 sm:top-36 left-1/2 -translate-x-1/2 w-[720px] sm:w-[980px] md:w-[1200px] h-[700px] sm:h-[850px] pointer-events-none transition-opacity duration-700 ease-out z-0",
          isLightOn ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 8%, rgba(254,243,199,0.24) 0%, rgba(251,191,36,0.12) 28%, rgba(37,99,235,0.05) 55%, transparent 75%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
