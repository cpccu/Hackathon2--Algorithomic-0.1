"use client";

import * as React from "react";
import {
  Share2,
  MessageSquare,
  FileSpreadsheet,
  Newspaper,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InfoSourceItem {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  initialScatter: { x: number; y: number; rotate: number };
  maxScatter: { x: number; y: number; rotate: number };
}

const infoSources: InfoSourceItem[] = [
  {
    id: "facebook",
    name: "Facebook Groups",
    category: "Unofficial Feeds",
    icon: Share2,
    initialScatter: { x: -160, y: -120, rotate: -4 },
    maxScatter: { x: -310, y: -210, rotate: -9 },
  },
  {
    id: "messenger",
    name: "Messenger",
    category: "Fragmented Chats",
    icon: MessageSquare,
    initialScatter: { x: 160, y: -100, rotate: 5 },
    maxScatter: { x: 320, y: -190, rotate: 11 },
  },
  {
    id: "forms",
    name: "Google Forms",
    category: "Disconnected Surveys",
    icon: FileSpreadsheet,
    initialScatter: { x: 170, y: 110, rotate: -5 },
    maxScatter: { x: 310, y: 170, rotate: -7 },
  },
  {
    id: "boards",
    name: "Notice Boards",
    category: "Physical Walls",
    icon: Newspaper,
    initialScatter: { x: -170, y: 120, rotate: 6 },
    maxScatter: { x: -300, y: 200, rotate: 10 },
  },
  {
    id: "wordofmouth",
    name: "Word of Mouth",
    category: "Unverified Rumors",
    icon: Users,
    initialScatter: { x: 0, y: -170, rotate: 3 },
    maxScatter: { x: 20, y: -270, rotate: 6 },
  },
];

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function mapRange(
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const normalized = (val - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

export function ProblemSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Resize and reduced motion listeners
  React.useEffect(() => {
    const checkMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(checkMotion.matches);

    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // High-performance scroll tracking via requestAnimationFrame
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalScrollDistance = rect.height - windowHeight;

          if (totalScrollDistance <= 0) {
            ticking = false;
            return;
          }

          // Calculate normalized progress (0.0 to 1.0)
          const currentDistance = -rect.top;
          const progress = clamp(currentDistance / totalScrollDistance, 0, 1);
          setScrollProgress(progress);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Distance scale factor based on screen size (prevent mobile horizontal overflow)
  const motionScale = isMobile ? 0.45 : 1;

  // -------------------------------------------------------------
  // PHASE CALCULATIONS
  // Phase 1 (0.00 - 0.22): Intro "Campus information is everywhere"
  // Phase 2 (0.22 - 0.42): 5 Sources Appear
  // Phase 3 (0.42 - 0.62): Scatter Effect & "Too many places..."
  // Phase 4 (0.62 - 0.80): Problem Statement "Information is everywhere / But nowhere is it together"
  // Phase 5 (0.80 - 1.00): Convergence into "CampusOS: One campus. One platform."
  // -------------------------------------------------------------

  // Opacity curves for text states (starts fully visible when scrolled to section)
  const introOpacity =
    scrollProgress < 0.2
      ? 1
      : mapRange(scrollProgress, 0.2, 0.28, 1, 0);

  const introTranslateY =
    scrollProgress < 0.2
      ? 0
      : mapRange(scrollProgress, 0.2, 0.28, 0, -20);

  const scatterTextOpacity =
    scrollProgress >= 0.38 && scrollProgress < 0.62
      ? scrollProgress < 0.46
        ? mapRange(scrollProgress, 0.38, 0.46, 0, 1)
        : mapRange(scrollProgress, 0.54, 0.62, 1, 0)
      : 0;

  const problemTextOpacity =
    scrollProgress >= 0.62 && scrollProgress < 0.82
      ? scrollProgress < 0.68
        ? mapRange(scrollProgress, 0.62, 0.68, 0, 1)
        : mapRange(scrollProgress, 0.76, 0.82, 1, 0)
      : 0;

  const secondLineStagger =
    scrollProgress >= 0.65 && scrollProgress < 0.82
      ? clamp(mapRange(scrollProgress, 0.66, 0.72, 0, 1), 0, 1)
      : 0;

  const campusOSOpacity =
    scrollProgress >= 0.82 ? mapRange(scrollProgress, 0.82, 0.92, 0, 1) : 0;

  const campusOSScale =
    scrollProgress >= 0.82 ? mapRange(scrollProgress, 0.82, 0.94, 0.88, 1) : 0.88;

  // Reduced motion alternative static render
  if (reducedMotion) {
    return (
      <section id="problem" className="py-24 bg-surface-subtle border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="warning" className="mb-4">
            THE PROBLEM
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight mb-4">
            Campus information is everywhere.
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Too many places. Too much searching. Information is everywhere, but nowhere is it together.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            {infoSources.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs text-center"
                >
                  <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{source.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{source.category}</p>
                </div>
              );
            })}
          </div>

          <div className="p-8 rounded-2xl bg-white border border-brand-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-2">
              CAMPUS<span className="text-brand-600">OS</span>
            </h3>
            <p className="text-base text-slate-600 font-medium">One campus. One platform.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="problem"
      className="relative min-h-[380vh] sm:min-h-[420vh] bg-surface-subtle border-b border-slate-200"
      aria-label="The Problem with Scattered Campus Information"
    >
      {/* Sticky Cinematic Screen */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 select-none">
        {/* Subtle Architectural Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none opacity-60" />

        {/* Ambient Soft Focal Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[760px] h-[540px] rounded-full pointer-events-none opacity-40 transition-all duration-700"
          style={{
            background:
              scrollProgress > 0.8
                ? "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(219,234,254,0.18) 40%, transparent 70%)"
                : "radial-gradient(circle, rgba(226,232,240,0.3) 0%, rgba(241,245,249,0.15) 50%, transparent 70%)",
          }}
        />

        {/* Progress Narrative Indicator */}
        <div className="absolute top-20 sm:top-22 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs backdrop-blur-xs z-30">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            {scrollProgress < 0.35
              ? "1. Discovery"
              : scrollProgress < 0.62
              ? "2. Fragmentation"
              : scrollProgress < 0.82
              ? "3. The Reality"
              : "4. Unified Solution"}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-100"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* =========================================================
         * LAYER 1: FLOATING INFORMATION SOURCES (Scattering & Convergence)
         * ========================================================= */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {infoSources.map((source, index) => {
            const Icon = source.icon;

            // Phase interpolation values:
            // Entering (0.16 -> 0.35)
            // Scattering (0.35 -> 0.65)
            // Perimeter hold (0.65 -> 0.80)
            // Converging to center (0.80 -> 0.95)

            let x = 0;
            let y = 0;
            let rotate = 0;
            let opacity = 0;
            let scale = 1;

            if (scrollProgress < 0.16) {
              // Not yet appeared
              opacity = 0;
              x = source.initialScatter.x * 1.8 * motionScale;
              y = source.initialScatter.y * 1.8 * motionScale;
              scale = 0.85;
            } else if (scrollProgress >= 0.16 && scrollProgress < 0.36) {
              // Phase 2: Entering toward initial orbit
              const t = mapRange(scrollProgress, 0.16, 0.36, 0, 1);
              opacity = clamp(t * 1.2, 0, 1);
              x = (source.initialScatter.x * (1.8 - 0.8 * t)) * motionScale;
              y = (source.initialScatter.y * (1.8 - 0.8 * t)) * motionScale;
              rotate = source.initialScatter.rotate * t;
              scale = 0.85 + 0.15 * t;
            } else if (scrollProgress >= 0.36 && scrollProgress < 0.65) {
              // Phase 3: Scattering outwards
              const t = mapRange(scrollProgress, 0.36, 0.65, 0, 1);
              opacity = clamp(1 - t * 0.25, 0.65, 1);
              x =
                (source.initialScatter.x +
                  (source.maxScatter.x - source.initialScatter.x) * t) *
                motionScale;
              y =
                (source.initialScatter.y +
                  (source.maxScatter.y - source.initialScatter.y) * t) *
                motionScale;
              rotate =
                source.initialScatter.rotate +
                (source.maxScatter.rotate - source.initialScatter.rotate) * t;
              scale = 1 - t * 0.1;
            } else if (scrollProgress >= 0.65 && scrollProgress < 0.8) {
              // Phase 4: Holding scattered around perimeter
              opacity = 0.65;
              x = source.maxScatter.x * motionScale;
              y = source.maxScatter.y * motionScale;
              rotate = source.maxScatter.rotate;
              scale = 0.9;
            } else {
              // Phase 5: Magnetic convergence to center (0.80 -> 0.95)
              const t = clamp(mapRange(scrollProgress, 0.8, 0.94, 0, 1), 0, 1);
              // Invert travel: move from maxScatter to (0, 0)
              x = source.maxScatter.x * (1 - t) * motionScale;
              y = source.maxScatter.y * (1 - t) * motionScale;
              rotate = source.maxScatter.rotate * (1 - t);
              scale = 0.9 * (1 - t * 0.75);
              opacity = clamp(0.65 * (1 - t * 1.1), 0, 1);
            }

            return (
              <div
                key={source.id}
                className="absolute transition-transform duration-75 will-change-transform"
                style={{
                  transform: `translate3d(${Math.round(x)}px, ${Math.round(
                    y
                  )}px, 0) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
                  opacity,
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/95 border border-slate-200/95 shadow-sm backdrop-blur-xs",
                    scrollProgress > 0.4 && scrollProgress < 0.8 && "border-slate-300 shadow-md"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-brand-navy shadow-2xs">
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-brand-navy leading-none">
                      {source.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {source.category}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================
         * LAYER 2: EDITORIAL MESSAGING STAGES (Synchronized Story)
         * ========================================================= */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          {/* --------------------------------------------------------
           * PHASE 1: "Campus information is everywhere."
           * -------------------------------------------------------- */}
          <div
            className="transition-all duration-200 will-change-transform"
            style={{
              opacity: introOpacity,
              transform: `translate3d(0, ${introTranslateY}px, 0)`,
              display: scrollProgress > 0.32 ? "none" : "block",
            }}
          >
            <div className="inline-flex items-center justify-center mb-4">
              <Badge variant="warning" className="px-3.5 py-1 text-xs tracking-wider uppercase font-semibold">
                THE PROBLEM
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy leading-tight">
              Campus information is everywhere.
            </h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              Every term, City University students search across disparate channels just to find basic schedules, announcements, and forms.
            </p>
          </div>

          {/* --------------------------------------------------------
           * PHASE 3: "Too many places. Too much searching."
           * -------------------------------------------------------- */}
          <div
            className="transition-all duration-200 will-change-transform"
            style={{
              opacity: scatterTextOpacity,
              transform: `translate3d(0, ${mapRange(
                scrollProgress,
                0.38,
                0.62,
                14,
                -14
              )}px, 0)`,
              display:
                scrollProgress < 0.32 || scrollProgress > 0.66 ? "none" : "block",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              Fragmented Channels
            </div>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy leading-tight">
              Too many places.
            </h3>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-500 leading-tight mt-1 sm:mt-2">
              Too much searching.
            </h3>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Crucial campus deadlines and resources get lost in endless notifications and group threads.
            </p>
          </div>

          {/* --------------------------------------------------------
           * PHASE 4: The Core Problem Statement
           * "Information is everywhere. But nowhere is it together."
           * -------------------------------------------------------- */}
          <div
            className="transition-all duration-200 will-change-transform"
            style={{
              opacity: problemTextOpacity,
              transform: `translate3d(0, ${mapRange(
                scrollProgress,
                0.62,
                0.82,
                12,
                -12
              )}px, 0)`,
              display:
                scrollProgress < 0.6 || scrollProgress > 0.85 ? "none" : "block",
            }}
          >
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-3">
              The Reality for Students
            </p>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-700 leading-tight">
              Information is everywhere.
            </h3>
            <div
              className="mt-2 sm:mt-3 transition-all duration-300"
              style={{
                opacity: secondLineStagger,
                transform: `translate3d(0, ${(1 - secondLineStagger) * 10}px, 0)`,
              }}
            >
              <h3 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-navy leading-tight">
                But nowhere is it together.
              </h3>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-8 h-px bg-slate-300" />
              <span>Scroll to see the convergence</span>
              <span className="w-8 h-px bg-slate-300" />
            </div>
          </div>

          {/* --------------------------------------------------------
           * PHASE 5: Convergence into CampusOS
           * "CAMPUSOS — One campus. One platform."
           * -------------------------------------------------------- */}
          <div
            className="transition-all duration-300 will-change-transform"
            style={{
              opacity: campusOSOpacity,
              transform: `scale(${campusOSScale})`,
              display: scrollProgress < 0.78 ? "none" : "block",
            }}
          >
            {/* Unified Hub Emblem */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>The Digital Front Door</span>
            </div>

            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700" />

              <div className="mb-2">
                <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-brand-navy">
                  CAMPUS
                </span>
                <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-brand-600">
                  OS
                </span>
              </div>

              <p className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight mt-1">
                One campus. One platform.
              </p>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                CampusOS unifies student communications, academic resources, club events, and support tickets into one central operating platform.
              </p>

              {/* Transition Indicator Pill */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-brand-700">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>5 Dispersed Sources → Unified Under CampusOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Bottom Scroll Indicator within Problem Section */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-300"
          style={{ opacity: scrollProgress < 0.9 ? 1 : 0.2 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {scrollProgress < 0.8 ? "Keep scrolling to unify" : "Next: Explore capabilities"}
          </span>
        </div>
      </div>
    </section>
  );
}
