"use client";

import * as React from "react";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface WallSwitchProps {
  isLightOn: boolean;
  onToggle: (state: boolean) => void;
  className?: string;
}

export function WallSwitch({ isLightOn, onToggle, className }: WallSwitchProps) {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
  }, []);

  const handleToggle = () => {
    onToggle(!isLightOn);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(!isLightOn);
    }
  };

  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      {/* Subtle Wall Instruction Hint */}
      {!isLightOn && (
        <div className="mb-4 text-center animate-bounce">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-slate-900/90 border border-amber-400/40 shadow-lg">
            Turn on the light to enter CampusOS
          </span>
        </div>
      )}

      {/* Accessible Alternative Screen-Reader / Keyboard Action Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="sr-only focus:not-sr-only focus:mb-3 focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-amber-400 focus:text-slate-950 focus:text-xs focus:font-bold focus:shadow-md"
        aria-label={isLightOn ? "Turn off room light" : "Turn on room light"}
      >
        {isLightOn ? "Turn off room light" : "Turn on room light"}
      </button>

      {/* =========================================================
       * REALISTIC WALL-MOUNTED LIGHT SWITCH
       * Classic Architectural Faceplate with 3D Rocker Switch
       * ========================================================= */}
      <div
        className={cn(
          "relative w-28 sm:w-32 p-3 sm:p-3.5 rounded-2xl border transition-all duration-500 cursor-pointer group shadow-2xl",
          isLightOn
            ? "bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 border-slate-300 shadow-[0_12px_28px_rgba(0,0,0,0.35),0_0_12px_rgba(251,191,36,0.2)]"
            : "bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-slate-700/80 shadow-[0_16px_32px_rgba(0,0,0,0.6)]"
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="switch"
        tabIndex={0}
        aria-checked={isLightOn}
        aria-label="Room Wall Light Switch"
      >
        {/* Top Mounting Screw Impression */}
        <div className="flex justify-center mb-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-colors",
              isLightOn ? "bg-slate-300 border-slate-400" : "bg-slate-700 border-slate-600"
            )}
          >
            <div className={cn("w-1.5 h-[1px]", isLightOn ? "bg-slate-500" : "bg-slate-900")} />
          </div>
        </div>

        {/* Switch Bezel Recess Box */}
        <div
          className={cn(
            "relative mx-auto w-14 sm:w-16 h-24 sm:h-28 rounded-lg p-1.5 border transition-all duration-300 flex items-center justify-center",
            isLightOn
              ? "bg-slate-300 border-slate-400/80 shadow-inner"
              : "bg-slate-950 border-slate-800 shadow-inner"
          )}
        >
          {/* 3D Physical Rocker Switch Button */}
          <div
            className={cn(
              "w-full h-full rounded-md border flex flex-col justify-between items-center py-2 transition-all ease-out relative overflow-hidden",
              reducedMotion ? "duration-100" : "duration-300",
              isLightOn
                ? "bg-gradient-to-b from-white via-slate-100 to-slate-200 border-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                : "bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-slate-700 shadow-[0_-4px_10px_rgba(0,0,0,0.4)]"
            )}
            style={{
              // Physical tilt angle: UP when ON, DOWN when OFF
              transform: reducedMotion
                ? "none"
                : isLightOn
                ? "perspective(260px) rotateX(14deg) translateY(-2px)"
                : "perspective(260px) rotateX(-14deg) translateY(2px)",
              transformOrigin: "center center",
            }}
          >
            {/* Top Indicator (ON position) */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                  isLightOn ? "text-brand-600 font-extrabold" : "text-slate-600"
                )}
              >
                ON
              </span>
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full mt-0.5 transition-all",
                  isLightOn
                    ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                    : "bg-slate-700"
                )}
              />
            </div>

            {/* Tactile Ridged Finger Grip in Center */}
            <div className="w-6 sm:w-7 flex flex-col gap-0.5 items-center opacity-40">
              <div className={cn("w-full h-[1.5px] rounded-full", isLightOn ? "bg-slate-400" : "bg-slate-600")} />
              <div className={cn("w-full h-[1.5px] rounded-full", isLightOn ? "bg-slate-400" : "bg-slate-600")} />
              <div className={cn("w-full h-[1.5px] rounded-full", isLightOn ? "bg-slate-400" : "bg-slate-600")} />
            </div>

            {/* Bottom Indicator (OFF position) */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                  isLightOn ? "text-slate-400" : "text-slate-400"
                )}
              >
                OFF
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Mounting Screw Impression */}
        <div className="flex justify-center mt-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-colors",
              isLightOn ? "bg-slate-300 border-slate-400" : "bg-slate-700 border-slate-600"
            )}
          >
            <div className={cn("w-1.5 h-[1px]", isLightOn ? "bg-slate-500" : "bg-slate-900")} />
          </div>
        </div>
      </div>

      {/* Switch Label Beneath */}
      <span
        className={cn(
          "mt-2.5 text-[10px] font-semibold tracking-wider uppercase transition-colors",
          isLightOn ? "text-slate-300" : "text-slate-500"
        )}
      >
        Room Switch
      </span>
    </div>
  );
}
