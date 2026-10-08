"use client";

import * as React from "react";
import { ArrowRight, Compass, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrimaryCtaState = "idle" | "opening" | "ready";

export function HeroSection() {
  const heroRef = React.useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = React.useState(0);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [primaryState, setPrimaryState] = React.useState<PrimaryCtaState>("idle");
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  // Scroll handler for subtle cinematic parallax
  React.useEffect(() => {
    const handleScroll = () => {
      // Limit calculation to when hero is near viewport
      if (window.scrollY < 1200) {
        setScrollY(window.scrollY);
      }
    };

    const mediaQueryMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQueryMotion.matches);

    const updateDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateDesktop();
    window.addEventListener("resize", updateDesktop);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", updateDesktop);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Desktop subtle mouse parallax handler
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDesktop || reducedMotion || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Subtle normalized coordinate between -1 and 1
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);

      // Dampened travel distance (max 12px)
      setMousePos({
        x: Math.round(normalizedX * 12),
        y: Math.round(normalizedY * 10),
      });
    },
    [isDesktop, reducedMotion]
  );

  const handleMouseLeave = React.useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrimaryClick = () => {
    if (primaryState !== "idle") return;
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Phase 1: Action initiates -> "Opening CampusOS"
    setPrimaryState("opening");

    // Phase 2: Completion feedback -> "CampusOS ✓"
    const t1 = setTimeout(() => {
      setPrimaryState("ready");
    }, 600);

    // Phase 3: Smooth navigation to vision section
    const t2 = setTimeout(() => {
      scrollToSection("vision");
    }, 1350);

    // Phase 4: Gracefully restore idle state
    const t3 = setTimeout(() => {
      setPrimaryState("idle");
    }, 2600);

    timeoutRefs.current.push(t1, t2, t3);
  };

  // Scroll offset styling (parallax movement without fading out text/buttons)
  const contentParallaxStyle =
    !reducedMotion && scrollY > 0
      ? {
          transform: `translate3d(0, ${Math.round(scrollY * -0.12)}px, 0)`,
        }
      : undefined;

  const bgParallaxStyle =
    !reducedMotion
      ? {
          transform: `translate3d(${mousePos.x}px, ${mousePos.y + Math.round(scrollY * 0.08)}px, 0)`,
          transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }
      : undefined;

  const archParallaxStyle =
    !reducedMotion
      ? {
          transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6 + Math.round(scrollY * 0.05)}px, 0)`,
          transition: "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }
      : undefined;

  return (
    <section
      ref={heroRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-white border-b border-slate-200 select-none pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16"
      aria-label="CampusOS Introduction"
    >
      {/* ==================================================
       * 1. EDITORIAL CAMPUS BACKGROUND (Architectural Layers)
       * ================================================== */}
      <div className="absolute inset-0 pointer-events-none hero-animate-bg">
        {/* Soft atmospheric light well */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] sm:w-[980px] lg:w-[1240px] h-[520px] rounded-full opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.06) 0%, rgba(219,234,254,0.18) 45%, rgba(255,255,255,0) 70%)",
          }}
        />

        {/* Academic Arch & Vault Structural Geometry (SVG) */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-45 sm:opacity-60"
          style={archParallaxStyle}
        >
          <svg
            className="w-full max-w-5xl h-auto text-slate-200/80"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Stately collegiate vaulted arches */}
            <path
              d="M100 600V280C100 160 220 80 500 80C780 80 900 160 900 280V600"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <path
              d="M220 600V320C220 220 310 160 500 160C690 160 780 220 780 320V600"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M340 600V360C340 280 400 240 500 240C600 240 660 280 660 360V600"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            {/* Classical Keystone Apex */}
            <circle cx="500" cy="80" r="5" fill="#2563EB" fillOpacity="0.4" />
            <circle cx="500" cy="160" r="4" fill="#0F172A" fillOpacity="0.3" />
            <circle cx="500" cy="240" r="3" fill="#2563EB" fillOpacity="0.25" />
            <line x1="500" y1="40" x2="500" y2="280" stroke="currentColor" strokeWidth="0.75" />
            {/* Horizon datum line */}
            <line x1="50" y1="360" x2="950" y2="360" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 5" />
          </svg>
        </div>

        {/* Fine Architectural Grid Pattern */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:52px_52px]"
          style={bgParallaxStyle}
        />

        {/* Soft Vignette Mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0) 60%, rgba(248,250,252,0.3) 100%)",
          }}
        />
      </div>

      {/* ==================================================
       * 2. MAIN HERO EDITORIAL CONTENT (Choreographed Stagger)
       * ================================================== */}
      <div
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center my-auto"
        style={contentParallaxStyle}
      >
        {/* Step B: University Context Badge */}
        <div className="flex justify-center mb-5 sm:mb-6 hero-animate-badge">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50/90 border border-slate-200/90 text-slate-700 shadow-2xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 ring-4 ring-brand-100" />
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-700">
              City University Digital Platform
            </span>
          </div>
        </div>

        {/* Step C: Brand Title — CampusOS */}
        <div className="hero-animate-title mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-slate-400 mb-1">
            Official Student Operating System
          </p>
          <div className="inline-block">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-navy">
              Campus
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-600">
              OS
            </span>
          </div>
        </div>

        {/* Step D: Primary Editorial Headline */}
        <div className="max-w-4xl mx-auto space-y-1 sm:space-y-2 mt-4 sm:mt-6">
          <h1 className="hero-animate-headline-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-brand-navy leading-[1.08]">
            One Campus. One Platform.
          </h1>
          <h2 className="hero-animate-headline-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-800 leading-[1.08]">
            Everything You Need.
          </h2>
        </div>

        {/* Step E: Description */}
        <div className="hero-animate-desc mt-6 sm:mt-8 max-w-2xl mx-auto">
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
            CampusOS brings City University campus information, resources, events, and student services into one unified digital platform.
          </p>
        </div>

        {/* Step F: CTA Action Buttons */}
        <div className="hero-animate-cta mt-8 sm:mt-11 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4.5">
          {/* PRIMARY BUTTON: Interactive Micro-Interaction */}
          <Button
            variant="primary"
            size="lg"
            className={cn(
              "group relative w-full sm:w-auto min-w-[204px] h-[50px] px-7 py-3 text-base font-semibold rounded-lg shadow-sm overflow-hidden",
              "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-300 ease-out",
              primaryState === "ready"
                ? "bg-brand-700 ring-2 ring-brand-300/60 shadow-md"
                : primaryState === "opening"
                ? "bg-brand-700 shadow-inner"
                : "bg-brand-600 hover:bg-brand-700"
            )}
            onClick={handlePrimaryClick}
            disabled={primaryState !== "idle"}
            aria-live="polite"
            aria-label={
              primaryState === "idle"
                ? "Get Started with CampusOS"
                : primaryState === "opening"
                ? "Opening CampusOS platform"
                : "CampusOS ready"
            }
          >
            {/* Grid overlay container ensuring zero layout jitter during transitions */}
            <div className="relative inline-grid place-items-center w-full h-full">
              {/* Normal State: "Get Started →" */}
              <div
                className={cn(
                  "col-start-1 row-start-1 flex items-center justify-center gap-2.5 transition-all duration-300 ease-out",
                  primaryState === "idle"
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </div>

              {/* Action State Phase 1: "Opening CampusOS" with smooth loader */}
              <div
                className={cn(
                  "col-start-1 row-start-1 flex items-center justify-center gap-2.5 transition-all duration-300 ease-out",
                  primaryState === "opening"
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                )}
              >
                <Loader2 className="h-4 w-4 animate-spin text-white/95" />
                <span className="tracking-tight text-white/95">Opening CampusOS</span>
              </div>

              {/* Action State Phase 2: "CampusOS ✓" */}
              <div
                className={cn(
                  "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-all duration-300 ease-out",
                  primaryState === "ready"
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                )}
              >
                <span className="font-semibold text-white">CampusOS</span>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5 stroke-[3] transition-transform duration-200 scale-105" />
                </span>
              </div>
            </div>
          </Button>

          {/* SECONDARY BUTTON: Subtle Elevation & Compass Rotation */}
          <Button
            variant="outline"
            size="lg"
            className="group w-full sm:w-auto min-w-[175px] h-[50px] px-6 py-3 text-base font-medium border-slate-300 text-slate-700 bg-white/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:translate-y-0 transition-all duration-300 ease-out gap-2.5 rounded-lg"
            onClick={() => scrollToSection("problem")}
          >
            <Compass className="h-4 w-4 text-slate-500 transition-all duration-300 ease-out group-hover:rotate-45 group-hover:scale-110 group-hover:text-brand-600" />
            <span>Explore Campus</span>
          </Button>
        </div>

        {/* CampusOS Platform Pill */}
        <div className="mt-8 sm:mt-10 inline-flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50/80 border border-slate-200/60 rounded-full px-3.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
          <span>Unified University Operating System</span>
        </div>
      </div>

      {/* ==================================================
       * 3. SCROLL INDICATOR (Bottom Anchor)
       * ================================================== */}
      <div className="relative z-10 pt-6 pb-2 text-center hero-animate-scroll">
        <button
          type="button"
          onClick={() => scrollToSection("problem")}
          className="group inline-flex flex-col items-center gap-1.5 text-slate-400 hover:text-brand-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-md p-1"
          aria-label="Scroll to explore features"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors">
            Scroll to explore
          </span>
          <div className="hero-scroll-indicator">
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
          </div>
        </button>
      </div>
    </section>
  );
}
