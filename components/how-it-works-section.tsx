"use client";

import * as React from "react";
import {
  Compass,
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Bell,
  ArrowRight,
  Headphones,
  SearchCheck,
  Sparkles,
  MousePointerClick,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [visibleStages, setVisibleStages] = React.useState<Set<string>>(
    new Set()
  );
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
  }, []);

  // IntersectionObserver to reveal each stage and track the active narrative step
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleStages((prev) => new Set(prev).add(entry.target.id));

            if (entry.target.id === "stage-discover") setActiveStep(1);
            if (entry.target.id === "stage-find") setActiveStep(2);
            if (entry.target.id === "stage-act") setActiveStep(3);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const ids = [
      "hiw-intro",
      "stage-discover",
      "stage-find",
      "stage-act",
      "hiw-final",
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleStages.has(id);

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 bg-surface-subtle border-b border-slate-200 overflow-hidden"
      aria-label="How CampusOS Works: Discover, Find, Act"
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:52px_52px] pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =================================================================
         * 1. SECTION INTRO
         * ================================================================= */}
        <div
          id="hiw-intro"
          className={cn(
            "text-center max-w-3xl mx-auto mb-20 sm:mb-28 transition-all duration-700 ease-out",
            isVisible("hiw-intro")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            HOW IT WORKS
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
            From finding information to taking action.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything you need. Three simple steps designed to simplify campus life for every City University student.
          </p>
        </div>

        {/* =================================================================
         * 2. THE THREE STAGES WITH CONNECTING SPINE
         * ================================================================= */}
        <div className="relative">
          {/* Subtle Continuous Visual Connecting Path (Spine) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-10 bottom-24 w-0.5 bg-slate-200">
            {/* Illuminated Active Indicator Bead */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-brand-100 transition-all duration-500 ease-out"
              style={{
                top:
                  activeStep === 1
                    ? "10%"
                    : activeStep === 2
                    ? "50%"
                    : "90%",
              }}
            />
          </div>

          <div className="space-y-24 sm:space-y-36">
            {/* =============================================================
             * STAGE 01: DISCOVER
             * ============================================================= */}
            <div
              id="stage-discover"
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-700 ease-out",
                isVisible("stage-discover")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              )}
            >
              {/* Text Editorial Column */}
              <div className="space-y-3 md:text-right md:pr-8">
                <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
                  01
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                  Discover
                </h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Explore campus events, resources, notices, and student services.
                </p>
                <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  <span>Aggregated Campus Streams</span>
                </div>
              </div>

              {/* Visual Stream Representation */}
              <div className="md:pl-8">
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:border-brand-200 transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Available Campus Updates</span>
                    <span className="text-brand-600 font-semibold">Live Feed</span>
                  </div>

                  {/* Micro update item 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Annual Hackathon Registration Open
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      Events
                    </span>
                  </div>

                  {/* Micro update item 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Fall Term Midterm Exam Schedule
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      Notice
                    </span>
                  </div>

                  {/* Micro update item 3 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Compass className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Department Office Directory 2026
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      Services
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================================
             * STAGE 02: FIND
             * ============================================================= */}
            <div
              id="stage-find"
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-700 ease-out",
                isVisible("stage-find")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              )}
            >
              {/* Visual Search Match Card (Left on Desktop) */}
              <div className="order-2 md:order-1 md:pr-8">
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-brand-200 transition-all">
                  {/* Search Query Preview */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-brand-navy">
                    <Search className="h-4 w-4 text-brand-600 shrink-0" />
                    <span>What do you need?</span>
                  </div>

                  {/* Immediate Search Resolution Card */}
                  <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                        Universal Match
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 1 Instant Result
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-brand-navy">
                      CSE 301 Programming Course Pack (PDF)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Found in Academic Repository • Verified Syllabus
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Editorial Column (Right on Desktop) */}
              <div className="order-1 md:order-2 space-y-3 md:pl-8">
                <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
                  02
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                  Find
                </h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Search and discover the information you need from one connected campus platform.
                </p>
                <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  <span>Instant Cross-Module Index</span>
                </div>
              </div>
            </div>

            {/* =============================================================
             * STAGE 03: ACT
             * ============================================================= */}
            <div
              id="stage-act"
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-700 ease-out",
                isVisible("stage-act")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              )}
            >
              {/* Text Editorial Column */}
              <div className="space-y-3 md:text-right md:pr-8">
                <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
                  03
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                  Act
                </h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Take the next step with the information you found.
                </p>
                <div className="pt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  <span>Actionable Campus Dispatch</span>
                </div>
              </div>

              {/* Visual Action Options Representation */}
              <div className="md:pl-8">
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Direct Action Hub</span>
                    <span className="text-brand-600 font-semibold">Immediate Step</span>
                  </div>

                  {/* Action 1: Selected & Completed */}
                  <div className="p-3.5 rounded-xl border border-brand-300 bg-brand-50/70 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-navy">
                          Register for Event
                        </p>
                        <p className="text-[10px] text-brand-700 font-medium">
                          Confirmed • Ticket dispatched
                        </p>
                      </div>
                    </div>
                    <Badge variant="brand" className="text-[10px]">
                      Active
                    </Badge>
                  </div>

                  {/* Action 2: Secondary Options */}
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-medium">Open Resource</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Headphones className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-medium">Ask Helpdesk</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <SearchCheck className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-medium">Report Lost Item</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
         * 3. FINAL CONNECTION MESSAGE
         * ================================================================= */}
        <div
          id="hiw-final"
          className={cn(
            "mt-24 sm:mt-36 pt-16 border-t border-slate-200 text-center transition-all duration-700 ease-out",
            isVisible("hiw-final")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>The Student Journey</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
            Discover. Find. Act.
          </h3>

          <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            CampusOS keeps your campus journey connected.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span>City University Digital Infrastructure</span>
          </div>
        </div>
      </div>
    </section>
  );
}
