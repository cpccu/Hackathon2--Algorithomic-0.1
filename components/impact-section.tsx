"use client";

import * as React from "react";
import {
  Share2,
  MessageSquare,
  FileSpreadsheet,
  Newspaper,
  Users,
  Calendar,
  BookOpen,
  Headphones,
  SearchCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BeforeToken {
  id: string;
  name: string;
  icon: React.ElementType;
  position: string;
}

const beforeTokens: BeforeToken[] = [
  {
    id: "fb",
    name: "Facebook Groups",
    icon: Share2,
    position: "top-4 left-6 -rotate-6",
  },
  {
    id: "msg",
    name: "Messenger",
    icon: MessageSquare,
    position: "top-8 right-8 rotate-6",
  },
  {
    id: "forms",
    name: "Google Forms",
    icon: FileSpreadsheet,
    position: "bottom-10 left-10 rotate-3",
  },
  {
    id: "boards",
    name: "Notice Boards",
    icon: Newspaper,
    position: "bottom-8 right-12 -rotate-4",
  },
  {
    id: "word",
    name: "Word of Mouth",
    icon: Users,
    position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12",
  },
];

const afterModules = [
  { name: "Events", icon: Calendar, tag: "Campus Life" },
  { name: "Resources", icon: BookOpen, tag: "Academic" },
  { name: "Helpdesk", icon: Headphones, tag: "Support" },
  { name: "Lost & Found", icon: SearchCheck, tag: "Campus Ops" },
];

const impactPoints = [
  {
    num: "01",
    statement: "One place to discover",
    description: "Every official campus update, workshop, and announcement coordinated under one single feed.",
  },
  {
    num: "02",
    statement: "One search to find",
    description: "Instant unified query matching across syllabi, departments, notices, and directories.",
  },
  {
    num: "03",
    statement: "One platform to act",
    description: "From event registration to reporting lost belongings, take direct action without jumping platforms.",
  },
];

export function ImpactSection() {
  const [visibleElements, setVisibleElements] = React.useState<Set<string>>(
    new Set()
  );
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
  }, []);

  // IntersectionObserver to sequence elements on scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const ids = [
      "impact-intro",
      "impact-before",
      "impact-transform",
      "impact-after",
      "impact-points",
      "impact-final",
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleElements.has(id);

  return (
    <section
      id="impact"
      className="relative py-24 sm:py-32 bg-white border-b border-slate-200 overflow-hidden"
      aria-label="Why CampusOS & Student Impact"
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f018_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f018_1px,transparent_1px)] bg-[size:52px_52px] pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =================================================================
         * 1. SECTION INTRO
         * ================================================================= */}
        <div
          id="impact-intro"
          className={cn(
            "text-center max-w-3xl mx-auto mb-20 sm:mb-28 transition-all duration-700 ease-out",
            isVisible("impact-intro")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            WHY CAMPUSOS
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
            Less searching. More doing.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            The transformation from fragmented communication into an authoritative digital campus ecosystem for City University.
          </p>
        </div>

        {/* =================================================================
         * 2. BEFORE VS AFTER TRANSFORMATION SHOWCASE
         * ================================================================= */}
        <div className="space-y-16 sm:space-y-24">
          {/* ---------------------------------------------------------------
           * BEFORE — TODAY (Scattered Information)
           * --------------------------------------------------------------- */}
          <div
            id="impact-before"
            className={cn(
              "rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-10 transition-all duration-700 ease-out",
              isVisible("impact-before")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
                  Before CampusOS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-2">
                  Information is scattered.
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Students spend time searching for it.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Fragmented Channels
              </span>
            </div>

            {/* Visual Scattered Matrix */}
            <div className="relative min-h-[220px] sm:min-h-[260px] rounded-2xl bg-white/70 border border-slate-200/80 p-4 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Scattered Floating Tokens */}
              <div className="w-full h-full relative min-h-[200px]">
                {beforeTokens.map((token) => {
                  const Icon = token.icon;
                  return (
                    <div
                      key={token.id}
                      className={cn(
                        "absolute p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 transition-transform duration-500",
                        token.position
                      )}
                    >
                      <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {token.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------
           * TRANSFORMATION CONNECTOR
           * --------------------------------------------------------------- */}
          <div
            id="impact-transform"
            className={cn(
              "text-center py-2 transition-all duration-700 ease-out",
              isVisible("impact-transform")
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            )}
          >
            <div className="inline-flex flex-col items-center gap-2">
              <div className="h-8 w-px bg-slate-300" />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>CampusOS brings it together.</span>
              </div>
              <div className="h-8 w-px bg-slate-300" />
            </div>
          </div>

          {/* ---------------------------------------------------------------
           * AFTER — WITH CAMPUSOS (Connected Campus Ecosystem)
           * --------------------------------------------------------------- */}
          <div
            id="impact-after"
            className={cn(
              "rounded-3xl border border-brand-200/90 bg-white p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all duration-700 ease-out",
              isVisible("impact-after")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  With CampusOS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-2">
                  Connected campus experience.
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Organized, authoritative, and calm.
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Unified Ecosystem
              </span>
            </div>

            {/* Central CampusOS Network Visual */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-surface-subtle border border-slate-200/80 flex flex-col items-center justify-center text-center">
              {/* Central CampusOS Beacon */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-brand-200 shadow-md mb-8 inline-block">
                <span className="text-2xl sm:text-4xl font-black text-brand-navy tracking-tight">
                  Campus
                </span>
                <span className="text-2xl sm:text-4xl font-black text-brand-600 tracking-tight">
                  OS
                </span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                  City University Core Hub
                </p>
              </div>

              {/* 4 Connected Area Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
                {afterModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-1.5 hover:border-brand-200 hover:shadow-xs transition-all"
                    >
                      <div className="h-8 w-8 mx-auto rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-none">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.tag}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
         * 3. THREE IMPACT POINTS
         * ================================================================= */}
        <div
          id="impact-points"
          className={cn(
            "mt-24 sm:mt-32 pt-16 border-t border-slate-200 transition-all duration-700 ease-out",
            isVisible("impact-points")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              The Product Impact
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mt-1">
              Purpose-built for student success.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {impactPoints.map((point) => (
              <div
                key={point.num}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-brand-200 hover:shadow-xs transition-all"
              >
                <span className="text-2xl sm:text-3xl font-black text-brand-600/35 tracking-tight block">
                  {point.num}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-brand-navy tracking-tight">
                  {point.statement}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================================
         * 4. FINAL IMPACT MESSAGE
         * ================================================================= */}
        <div
          id="impact-final"
          className={cn(
            "mt-24 sm:mt-32 pt-16 border-t border-slate-200 text-center transition-all duration-700 ease-out",
            isVisible("impact-final")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <p className="text-lg sm:text-2xl font-semibold text-slate-500 tracking-tight">
            From scattered information
          </p>

          <h3 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight mt-2">
            To one connected campus.
          </h3>

          <div className="mt-6 inline-block">
            <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-brand-navy">
              Campus
            </span>
            <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-brand-600">
              OS.
            </span>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span>City University Digital Transformation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
