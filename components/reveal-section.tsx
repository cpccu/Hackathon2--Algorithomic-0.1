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
  Network,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IncomingNode {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  startPos: { x: number; y: number; rotate: number };
  orbitPos: { x: number; y: number; angle: number };
}

const incomingNodes: IncomingNode[] = [
  {
    id: "groups",
    name: "Social Feeds",
    category: "Community",
    icon: Share2,
    startPos: { x: -340, y: -220, rotate: -8 },
    orbitPos: { x: -160, y: -100, angle: 210 },
  },
  {
    id: "chats",
    name: "Direct Chats",
    category: "Messaging",
    icon: MessageSquare,
    startPos: { x: 340, y: -200, rotate: 9 },
    orbitPos: { x: 160, y: -90, angle: 330 },
  },
  {
    id: "forms",
    name: "Online Forms",
    category: "Submissions",
    icon: FileSpreadsheet,
    startPos: { x: 320, y: 190, rotate: -6 },
    orbitPos: { x: 150, y: 110, angle: 30 },
  },
  {
    id: "notices",
    name: "Notice Boards",
    category: "Bulletins",
    icon: Newspaper,
    startPos: { x: -320, y: 210, rotate: 7 },
    orbitPos: { x: -150, y: 110, angle: 150 },
  },
  {
    id: "word",
    name: "Word of Mouth",
    category: "Informal",
    icon: Users,
    startPos: { x: 0, y: -280, rotate: 4 },
    orbitPos: { x: 0, y: -160, angle: 270 },
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
  const ratio = (val - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

export function RevealSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Resize and reduced motion listeners
  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const updateSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Scroll tracking with requestAnimationFrame
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
          const totalDistance = rect.height - windowHeight;

          if (totalDistance <= 0) {
            ticking = false;
            return;
          }

          const current = -rect.top;
          const p = clamp(current / totalDistance, 0, 1);
          setScrollProgress(p);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const motionScale = isMobile ? 0.45 : 1;

  // -----------------------------------------------------------------
  // PHASES
  // Phase 1 (0.00 - 0.28): Scattered elements move inward towards center
  // Phase 2 (0.24 - 0.48): Unification focal point & "FROM SCATTERED TO CONNECTED"
  // Phase 3 (0.46 - 0.76): "CAMPUSOS" grand reveal
  // Phase 4 (0.60 - 0.86): Tagline reveals ("One campus. One platform.")
  // Phase 5 (0.50 - 0.90): Digital campus network graphic & concentric visual
  // Phase 6 (0.86 - 1.00): Gentle upward exit glide into features
  // -----------------------------------------------------------------

  // Phase 2: "FROM SCATTERED TO CONNECTED"
  const scatteredToConnectedOpacity =
    scrollProgress >= 0.18 && scrollProgress < 0.48
      ? scrollProgress < 0.28
        ? mapRange(scrollProgress, 0.18, 0.28, 0, 1)
        : mapRange(scrollProgress, 0.4, 0.48, 1, 0)
      : 0;

  const scatteredToConnectedTranslateY = mapRange(
    scrollProgress,
    0.18,
    0.48,
    20,
    -15
  );

  // Phase 3: "CAMPUSOS" (Stays sharp and high-contrast throughout)
  const campusOSOpacity =
    scrollProgress >= 0.44
      ? scrollProgress < 0.54
        ? mapRange(scrollProgress, 0.44, 0.54, 0, 1)
        : 1
      : 0;

  const campusOSScale =
    scrollProgress >= 0.44
      ? scrollProgress < 0.56
        ? mapRange(scrollProgress, 0.44, 0.56, 0.9, 1)
        : 1
      : 0.9;

  const campusOSTranslateY =
    scrollProgress >= 0.44
      ? scrollProgress < 0.56
        ? mapRange(scrollProgress, 0.44, 0.56, 24, 0)
        : mapRange(scrollProgress, 0.85, 1.0, 0, -32)
      : 24;

  // Phase 4: Taglines
  const tagline1Opacity =
    scrollProgress >= 0.54
      ? scrollProgress < 0.64
        ? mapRange(scrollProgress, 0.54, 0.64, 0, 1)
        : 1
      : 0;

  const tagline2Opacity =
    scrollProgress >= 0.64
      ? scrollProgress < 0.74
        ? mapRange(scrollProgress, 0.64, 0.74, 0, 1)
        : 1
      : 0;

  // Phase 5: Digital Campus Visual (Network Rings & Nodes)
  const networkVisualOpacity =
    scrollProgress >= 0.48
      ? scrollProgress < 0.62
        ? mapRange(scrollProgress, 0.48, 0.62, 0, 0.85)
        : scrollProgress > 0.88
        ? mapRange(scrollProgress, 0.88, 0.98, 0.85, 0.4)
        : 0.85
      : 0;

  const networkVisualScale = mapRange(scrollProgress, 0.48, 0.72, 0.85, 1);

  // Reduced motion static fallback
  if (reducedMotion) {
    return (
      <section id="reveal" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="brand" className="mb-4">
            FROM SCATTERED TO CONNECTED
          </Badge>
          <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-brand-navy mb-4">
            CAMPUS<span className="text-brand-600">OS</span>
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2">
            One campus. One platform.
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Everything you need, brought together into one unified digital campus ecosystem.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="reveal"
      className="relative min-h-[350vh] sm:min-h-[400vh] bg-white border-b border-slate-200"
      aria-label="CampusOS Transformation & Platform Reveal"
    >
      {/* Sticky Fullscreen Story Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 select-none">
        {/* Subtle Architectural Coordinate Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:52px_52px] pointer-events-none opacity-50" />

        {/* Central Luminous Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[840px] h-[600px] rounded-full pointer-events-none opacity-40 transition-all duration-700"
          style={{
            background:
              scrollProgress > 0.4
                ? "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(219,234,254,0.18) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(241,245,249,0.3) 0%, transparent 60%)",
          }}
        />

        {/* =================================================================
         * PHASE 5: DIGITAL CAMPUS NETWORK VISUAL (Architectural Rings & Vector Lines)
         * ================================================================= */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200"
          style={{
            opacity: networkVisualOpacity,
            transform: `scale(${networkVisualScale})`,
          }}
        >
          {/* Subtle Concentric Orbital Rings */}
          <div className="relative w-[340px] sm:w-[540px] md:w-[680px] h-[340px] sm:h-[540px] md:h-[680px] flex items-center justify-center">
            {/* Outer Orbital Ring */}
            <div className="absolute inset-0 rounded-full border border-slate-200/70 border-dashed animate-[spin_120s_linear_infinite]" />

            {/* Middle Coordinated Ring */}
            <div className="absolute inset-10 sm:inset-16 rounded-full border border-brand-200/50" />

            {/* Inner Core Ring */}
            <div className="absolute inset-24 sm:inset-36 rounded-full border border-brand-300/40 bg-brand-50/20 backdrop-blur-2xs" />

            {/* Connected Radial Network Lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full text-brand-200/60"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Radial spokes extending from core to satellite nodes */}
              <line x1="250" y1="250" x2="100" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
              <line x1="250" y1="250" x2="400" y2="130" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
              <line x1="250" y1="250" x2="390" y2="360" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
              <line x1="250" y1="250" x2="110" y2="360" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
              <line x1="250" y1="250" x2="250" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />

              {/* Satellite Node Anchor Rings */}
              <circle cx="100" cy="120" r="4" fill="#3B82F6" fillOpacity="0.4" />
              <circle cx="400" cy="130" r="4" fill="#3B82F6" fillOpacity="0.4" />
              <circle cx="390" cy="360" r="4" fill="#3B82F6" fillOpacity="0.4" />
              <circle cx="110" cy="360" r="4" fill="#3B82F6" fillOpacity="0.4" />
              <circle cx="250" cy="70" r="4" fill="#2563EB" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        {/* =================================================================
         * PHASE 1: SCATTERED SOURCES CONVERGING TOWARD CENTER
         * ================================================================= */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {incomingNodes.map((node) => {
            const Icon = node.icon;

            // Travel curve:
            // 0.0 -> 0.32: moves from startPos towards (0, 0)
            // 0.32 -> 0.45: compresses into central core & fades out
            let x = 0;
            let y = 0;
            let rotate = 0;
            let scale = 1;
            let opacity = 0;

            if (scrollProgress < 0.05) {
              opacity = 0;
              x = node.startPos.x * motionScale;
              y = node.startPos.y * motionScale;
            } else if (scrollProgress >= 0.05 && scrollProgress < 0.35) {
              const t = mapRange(scrollProgress, 0.05, 0.35, 0, 1);
              opacity = clamp(t * 1.5, 0, 0.85);
              x = (node.startPos.x + (node.orbitPos.x - node.startPos.x) * t) * motionScale;
              y = (node.startPos.y + (node.orbitPos.y - node.startPos.y) * t) * motionScale;
              rotate = node.startPos.rotate * (1 - t * 0.8);
              scale = 1 - t * 0.15;
            } else if (scrollProgress >= 0.35 && scrollProgress < 0.48) {
              // Collapsing fully into core
              const t = mapRange(scrollProgress, 0.35, 0.48, 0, 1);
              opacity = clamp(0.85 * (1 - t * 1.3), 0, 1);
              x = (node.orbitPos.x * (1 - t)) * motionScale;
              y = (node.orbitPos.y * (1 - t)) * motionScale;
              rotate = node.startPos.rotate * (1 - t);
              scale = 0.85 * (1 - t * 0.7);
            } else {
              opacity = 0;
            }

            return (
              <div
                key={node.id}
                className="absolute transition-transform duration-75 will-change-transform"
                style={{
                  transform: `translate3d(${Math.round(x)}px, ${Math.round(
                    y
                  )}px, 0) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
                  opacity,
                }}
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-xs">
                  <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{node.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================================
         * PHASE 2: "FROM SCATTERED TO CONNECTED" EDITORIAL MESSAGE
         * ================================================================= */}
        <div
          className="absolute z-10 max-w-3xl mx-auto text-center px-4 transition-all duration-200 will-change-transform"
          style={{
            opacity: scatteredToConnectedOpacity,
            transform: `translate3d(0, ${scatteredToConnectedTranslateY}px, 0)`,
            display:
              scrollProgress < 0.15 || scrollProgress > 0.52 ? "none" : "block",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            System Transition
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-navy leading-tight">
            FROM SCATTERED
          </h2>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-600 leading-tight mt-1 sm:mt-2">
            TO CONNECTED
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-md mx-auto">
            Bringing disparate university services into a single verified digital architecture.
          </p>
        </div>

        {/* =================================================================
         * PHASE 3 & 4: "CAMPUSOS" REVEAL & TAGLINES
         * ================================================================= */}
        <div
          className="relative z-20 max-w-4xl mx-auto text-center px-4 transition-all duration-200 will-change-transform"
          style={{
            opacity: campusOSOpacity,
            transform: `translate3d(0, ${campusOSTranslateY}px, 0) scale(${campusOSScale})`,
            display: scrollProgress < 0.42 ? "none" : "block",
          }}
        >
          {/* Subtle Category Badge */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 text-brand-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                The Unified Campus Platform
              </span>
            </div>
          </div>

          {/* Phase 3: Major Editorial Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none select-none">
              <span className="text-brand-navy">Campus</span>
              <span className="text-brand-600">OS</span>
            </h1>
          </div>

          {/* Phase 4: Primary Tagline */}
          <div
            className="transition-all duration-300"
            style={{
              opacity: tagline1Opacity,
              transform: `translate3d(0, ${(1 - tagline1Opacity) * 12}px, 0)`,
            }}
          >
            <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One campus. One platform.
            </p>
          </div>

          {/* Phase 4: Secondary Supportive Tagline */}
          <div
            className="transition-all duration-300 mt-3 sm:mt-4"
            style={{
              opacity: tagline2Opacity,
              transform: `translate3d(0, ${(1 - tagline2Opacity) * 12}px, 0)`,
            }}
          >
            <p className="text-base sm:text-lg md:text-xl font-medium text-slate-600 max-w-xl mx-auto leading-relaxed">
              Everything you need, brought together.
            </p>
          </div>

          {/* Unified Platform Capability Summary Pill */}
          <div className="mt-8 sm:mt-10 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-500 bg-white/90 border border-slate-200/90 rounded-full px-5 py-2 shadow-xs backdrop-blur-xs">
            <span className="flex items-center gap-1.5 text-brand-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Events</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-brand-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Resources</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-brand-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Helpdesk</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-brand-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Lost & Found</span>
            </span>
          </div>
        </div>

        {/* Phase 6: Ambient Scroll Continuity Indicator */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none transition-opacity duration-300"
          style={{
            opacity:
              scrollProgress > 0.65 && scrollProgress < 0.95
                ? mapRange(scrollProgress, 0.65, 0.75, 0, 1)
                : 0,
          }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Scroll to explore platform capabilities
          </span>
        </div>
      </div>
    </section>
  );
}
