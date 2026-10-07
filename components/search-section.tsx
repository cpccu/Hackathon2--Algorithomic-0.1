"use client";

import * as React from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Headphones,
  Bell,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  CornerDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoResult {
  id: string;
  title: string;
  type: "Resource" | "Event" | "Helpdesk" | "Notice";
  sourceName: string;
  metadata: string;
  icon: React.ElementType;
  badgeVariant: "brand" | "warning" | "info" | "success";
}

const demoResults: DemoResult[] = [
  {
    id: "res-1",
    title: "CSE Programming Fundamentals",
    type: "Resource",
    sourceName: "Academic Repository",
    metadata: "Course Pack • PDF • Department of CSE",
    icon: BookOpen,
    badgeVariant: "brand",
  },
  {
    id: "res-2",
    title: "CSE Department Seminar",
    type: "Event",
    sourceName: "Campus Calendar",
    metadata: "Auditorium Hall B • Friday, 3:00 PM",
    icon: Calendar,
    badgeVariant: "warning",
  },
  {
    id: "res-3",
    title: "Where is the CSE Department Office?",
    type: "Helpdesk",
    sourceName: "Smart Helpdesk",
    metadata: "Building 3, Level 4 (Room 402) • Verified Guide",
    icon: Headphones,
    badgeVariant: "info",
  },
  {
    id: "res-4",
    title: "Midterm Examination Notice",
    type: "Notice",
    sourceName: "Official Bulletin",
    metadata: "Published Oct 05 • Office of the Controller",
    icon: Bell,
    badgeVariant: "success",
  },
];

const TARGET_QUERY = "Where can I find CSE resources?";

export function SearchSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);
  const [typedText, setTypedText] = React.useState("");
  const [isTypingComplete, setIsTypingComplete] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [activeResultIndex, setActiveResultIndex] = React.useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Check reduced motion
  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
  }, []);

  // IntersectionObserver to trigger the search animation sequence
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing simulation sequence
  React.useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setTypedText(TARGET_QUERY);
      setIsTypingComplete(true);
      setShowResults(true);
      return;
    }

    let currentIndex = 0;
    setTypedText("");
    setIsTypingComplete(false);
    setShowResults(false);

    // Initial slight pause before typing starts
    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (currentIndex < TARGET_QUERY.length) {
          setTypedText(TARGET_QUERY.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTypingComplete(true);

          // Brief pause after typing completes, then trigger search activation
          setTimeout(() => {
            setIsSearching(true);

            // Results reveal after brief search pulse
            setTimeout(() => {
              setIsSearching(false);
              setShowResults(true);
            }, 450);
          }, 350);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }, 550);

    return () => clearTimeout(startTimeout);
  }, [inView, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="search"
      className="relative py-24 sm:py-32 bg-white border-b border-slate-200 overflow-hidden"
      aria-label="Universal Campus Search Demonstration"
    >
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-50" />

      {/* Central Soft Ambient Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] sm:w-[840px] h-[520px] rounded-full pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          background:
            showResults
              ? "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(219,234,254,0.18) 45%, transparent 70%)"
              : "radial-gradient(circle, rgba(241,245,249,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =================================================================
         * 1. SECTION INTRO
         * ================================================================= */}
        <div
          className={cn(
            "text-center max-w-3xl mx-auto mb-14 sm:mb-20 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            ONE SEARCH
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
            Find what you need across campus.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything on campus, in one search. Instead of asking which group or notice board holds an answer, search once across all university services.
          </p>
        </div>

        {/* =================================================================
         * 2. MAIN SEARCH INTERFACE
         * ================================================================= */}
        <div
          className={cn(
            "max-w-3xl mx-auto transition-all duration-700 ease-out",
            inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          {/* Large Premium Search Field */}
          <div
            className={cn(
              "relative rounded-2xl bg-white border transition-all duration-300 p-2 sm:p-2.5 shadow-sm",
              isSearching
                ? "border-brand-500 ring-4 ring-brand-100 shadow-md"
                : showResults
                ? "border-brand-300 shadow-md"
                : "border-slate-300 hover:border-slate-400"
            )}
          >
            <div className="flex items-center gap-3 px-3 sm:px-4 py-2">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                  showResults
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Search className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 flex items-center text-base sm:text-lg font-medium text-brand-navy">
                {typedText ? (
                  <span className="truncate">{typedText}</span>
                ) : (
                  <span className="text-slate-400 select-none">
                    What do you need?
                  </span>
                )}
                {/* Blinking Editorial Cursor */}
                <span
                  className={cn(
                    "inline-block w-0.5 h-5 ml-1 bg-brand-600 transition-opacity",
                    isTypingComplete && showResults
                      ? "opacity-0"
                      : "animate-pulse"
                  )}
                />
              </div>

              {/* Action Indicator Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 shrink-0">
                <span>Enter</span>
                <CornerDownLeft className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Demonstration Notice */}
          <div className="mt-2 text-center">
            <span className="text-[11px] font-medium text-slate-400">
              * Simulated Universal Search index across all City University databases
            </span>
          </div>

          {/* =================================================================
           * 3. SEQUENTIAL SEARCH RESULTS
           * ================================================================= */}
          <div className="mt-8 space-y-3">
            {demoResults.map((result, idx) => {
              const Icon = result.icon;
              const isCardVisible = showResults;

              return (
                <div
                  key={result.id}
                  onMouseEnter={() => setActiveResultIndex(idx)}
                  onMouseLeave={() => setActiveResultIndex(null)}
                  className={cn(
                    "group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs cursor-pointer transition-all duration-300 ease-out",
                    "hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5",
                    isCardVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-6 scale-95 pointer-events-none",
                    activeResultIndex === idx && "border-brand-500 bg-brand-50/15"
                  )}
                  style={{
                    transitionDelay: reducedMotion ? "0ms" : `${idx * 110}ms`,
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Category Icon Badge */}
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={result.badgeVariant}
                          className="text-[10px] uppercase font-bold py-0.5 px-2"
                        >
                          {result.type}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          via {result.sourceName}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-brand-navy truncate group-hover:text-brand-600 transition-colors">
                        {result.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {result.metadata}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Arrow */}
                  <div className="shrink-0 ml-4 flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================================
           * 4. UNIFIED RESULT CONVERGENCE & KEY MESSAGE
           * ================================================================= */}
          <div
            className={cn(
              "mt-14 sm:mt-20 pt-10 border-t border-slate-200 text-center transition-all duration-700 ease-out",
              showResults
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            {/* Visual Stream Convergence Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 mb-6 shadow-2xs">
              <span className="text-brand-700 font-bold">Resource</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-bold">Event</span>
              <span className="text-slate-300">•</span>
              <span className="text-sky-700 font-bold">Helpdesk</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">Notice</span>
              <span className="text-slate-400">→</span>
              <span className="text-brand-600 font-bold">CAMPUSOS</span>
            </div>

            {/* Key Editorial Message */}
            <h3 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight">
              Everything, connected.
            </h3>

            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              CampusOS turns scattered campus information into one searchable experience.
            </p>

            {/* Bottom Section Continuity Anchor */}
            <div className="mt-12 pt-8 border-t border-slate-100 max-w-md mx-auto text-center space-y-1">
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                The CampusOS Promise
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                One search. One campus. Everything you need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
