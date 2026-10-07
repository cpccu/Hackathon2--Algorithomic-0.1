import * as React from "react";
import { Calendar, BookOpen, Headphones, SearchCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const capabilities = [
  {
    title: "Campus Events",
    description:
      "Centralized university calendar for workshops, hackathons, club sessions, seminars, and official academic schedules.",
    icon: Calendar,
    status: "Planned",
  },
  {
    title: "Resource Hub",
    description:
      "Curated repository of academic materials, syllabus archives, previous question papers, and shared study guides.",
    icon: BookOpen,
    status: "Planned",
  },
  {
    title: "Smart Helpdesk",
    description:
      "Direct ticketing, academic queries, administrative guidance, and verified campus FAQ support for students.",
    icon: Headphones,
    status: "Planned",
  },
  {
    title: "Lost & Found",
    description:
      "Streamlined campus-wide reporting system to quickly submit, search, match, and claim lost student belongings.",
    icon: SearchCheck,
    status: "Planned",
  },
];

export function VisionSection() {
  return (
    <section id="vision" className="py-20 bg-surface-subtle border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="brand" className="mb-3">
            Product Vision
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy">
            Everything You Need. One Campus.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            A comprehensive suite of student-centered digital modules engineered to modernize student life across City University.
          </p>
        </div>

        {/* 4 Capability Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="bg-white border-slate-200 hover:border-brand-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="neutral" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardDescription className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Module Capability</span>
                  <span className="font-medium text-slate-500">Upcoming in later phase</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Visual disclaimer note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-500 italic">
            * Capability modules are currently in planning. Interactive workflows and backend connections will be introduced in subsequent steps.
          </p>
        </div>
      </div>
    </section>
  );
}
