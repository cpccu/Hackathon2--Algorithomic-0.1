"use client";

import * as React from "react";
import {
  Calendar,
  BookOpen,
  Headphones,
  SearchCheck,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = React.useState<number>(1);
  const [visibleSections, setVisibleSections] = React.useState<Set<string>>(
    new Set()
  );

  // IntersectionObserver to trigger cinematic sequential reveals
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const ids = [
      "feat-intro",
      "feat-events",
      "feat-resources",
      "feat-helpdesk",
      "feat-lostfound",
      "feat-connection",
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <section
      id="vision"
      className="relative py-24 sm:py-32 bg-surface-subtle border-b border-slate-200 overflow-hidden"
      aria-label="CampusOS Core Features"
    >
      {/* Subtle Background Architectural Coordinate Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:52px_52px] pointer-events-none opacity-60" />

      {/* =================================================================
       * 1. SECTION INTRO
       * ================================================================= */}
      <div
        id="feat-intro"
        className={cn(
          "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 sm:mb-32 transition-all duration-700 ease-out",
          isVisible("feat-intro")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        )}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          EVERYTHING YOU NEED
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
          One platform for your campus.
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Four foundational pillars engineered to unify academic workflows, student communications, and campus operations into a single cohesive experience.
        </p>
      </div>

      {/* Container for sequential feature moments */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 sm:space-y-40">
        {/* =================================================================
         * FEATURE 01: CAMPUS EVENTS
         * ================================================================= */}
        <div
          id="feat-events"
          className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center transition-all duration-700 ease-out",
            isVisible("feat-events")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          {/* Left Column: Editorial Details */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
              01
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Campus Events
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Discover verified campus events and register in one place.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span>Centralized University Calendar</span>
            </div>
          </div>

          {/* Right Column: Visual Interface Representation */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Campus Event Engine
                    </h4>
                    <p className="text-sm font-bold text-slate-900">
                      Verified Event Discovery
                    </p>
                  </div>
                </div>
                <Badge variant="brand" className="text-xs">
                  Event Engine
                </Badge>
              </div>

              {/* Event Capability Showcase */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                    Seminars • Workshops • Competitions
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Real-Time Schedule
                  </span>
                </div>

                <div>
                  <h5 className="text-lg font-bold text-brand-navy">
                    Administrator-Published Campus Events
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Browse verified events published by university clubs and departments, register with one click, and access your digital QR pass.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Verified Campus Venues
                  </span>
                  <span className="font-semibold text-brand-600 flex items-center gap-1">
                    Instant Digital Pass <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
         * FEATURE 02: RESOURCE HUB
         * ================================================================= */}
        <div
          id="feat-resources"
          className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center transition-all duration-700 ease-out",
            isVisible("feat-resources")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          {/* Left Column: Visual Representation (Scattered -> Organized) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Repositories
                  </span>
                </div>
                <div className="flex gap-1.5 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                    All
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 font-medium">
                    Syllabus
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 font-medium">
                    Questions
                  </span>
                </div>
              </div>

              {/* Organized Document List - Capability Oriented */}
              <div className="space-y-3">
                {[
                  {
                    title: "Department Syllabi & Curriculum Guides",
                    tag: "Verified Course Frameworks",
                    type: "Academic Catalog",
                  },
                  {
                    title: "Previous Term Examination Archives",
                    tag: "Verified Question Collections",
                    type: "Study Repository",
                  },
                  {
                    title: "Academic Calendars & Guidelines",
                    tag: "Published Faculty Notices",
                    type: "Verified Archive",
                  },
                ].map((doc) => (
                  <div
                    key={doc.title}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-brand-200 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-semibold text-brand-navy truncate">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {doc.tag} • {doc.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-600 shrink-0 ml-3">
                      View
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Details */}
          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
              02
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Resource Hub
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Find verified academic resources, documents and campus information.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span>Scattered Documents → Organized Resources</span>
            </div>
          </div>
        </div>

        {/* =================================================================
         * FEATURE 03: SMART HELPDESK
         * ================================================================= */}
        <div
          id="feat-helpdesk"
          className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center transition-all duration-700 ease-out",
            isVisible("feat-helpdesk")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          {/* Left Column: Editorial Details */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
              03
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Smart Helpdesk
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Ask campus questions and receive grounded answers from verified information.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span>Instant Guidance & Verified Directory</span>
            </div>
          </div>

          {/* Right Column: Visual Conversation Representation */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              {/* Helpdesk Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      City University Helpdesk
                    </h4>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Grounded AI Assistant
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Campus Guide
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-4">
                {/* Student Query */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-brand-600 text-white p-3.5 text-xs sm:text-sm shadow-xs">
                    <p>Where is the Department of Computer Science office?</p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 text-xs font-bold">
                    <User className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Helpdesk Verified Answer */}
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 space-y-2">
                    <p className="font-medium">
                      Here is the verified campus directory record:
                    </p>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-brand-navy">
                        Department of Computer Science & Engineering
                      </p>
                      <p>Academic Building, Level 4 (Room 402)</p>
                      <p className="text-slate-500">
                        Office Hours: Sun–Thu, 9:00 AM – 4:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
         * FEATURE 04: LOST & FOUND / COMPLAINT BOX
         * ================================================================= */}
        <div
          id="feat-lostfound"
          className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center transition-all duration-700 ease-out",
            isVisible("feat-lostfound")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          {/* Left Column: Visual Representation (Report -> Track -> Resolve) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <SearchCheck className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Resolution Pipeline
                  </span>
                </div>
                <span className="text-xs font-semibold text-brand-600">
                  Report → Track → Resolve
                </span>
              </div>

              {/* Pipeline Workflow Items */}
              <div className="space-y-3.5">
                {/* Workflow State 1: Lost & Found */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <SearchCheck className="h-4.5 w-4.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        Lost Item Report
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Item logged • Matched with campus security database
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    Under Review
                  </span>
                </div>

                {/* Workflow State 2: Complaint / Facility */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        Campus Maintenance Ticket
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Admin dispatched • Verified and resolution confirmed
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Resolved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Details */}
          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <span className="text-4xl sm:text-5xl font-black text-brand-600/40 tracking-tight block">
              04
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Lost & Found
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Report, search and manage lost-and-found items securely.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              <span>Report → Track → Resolve</span>
            </div>
          </div>
        </div>

        {/* =================================================================
         * 6. FINAL FEATURE CONNECTION
         * "Four services. One campus platform. CAMPUSOS"
         * ================================================================= */}
        <div
          id="feat-connection"
          className={cn(
            "pt-16 sm:pt-24 border-t border-slate-200 text-center transition-all duration-700 ease-out",
            isVisible("feat-connection")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Layers className="h-3.5 w-3.5 text-brand-600" />
            <span>Unified Architecture</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
            Four services.
          </h3>
          <h4 className="text-3xl sm:text-5xl font-extrabold text-brand-600 tracking-tight mt-1 sm:mt-2">
            One campus platform.
          </h4>

          {/* Connected Hub Visual */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {[
              { name: "Campus Events", icon: Calendar },
              { name: "Resource Hub", icon: BookOpen },
              { name: "Smart Helpdesk", icon: Headphones },
              { name: "Lost & Found", icon: SearchCheck },
            ].map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-800"
                >
                  <Icon className="h-4 w-4 text-brand-600" />
                  <span>{mod.name}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <div className="inline-block">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-brand-navy">
                Campus
              </span>
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-brand-600">
                OS
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-2">
              Ready for Universal Campus Search
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
