"use client";

import * as React from "react";
import { Calendar, BookOpen, Headphones, SearchX, MessageSquareWarning } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/service-card";

interface CampusServicesProps {
  onSelectService: (serviceId: string) => void;
}

const SERVICES = [
  {
    id: "events",
    title: "EVENTS",
    description: "Discover what's happening on campus.",
    tag: "Campus Life",
    icon: Calendar,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "resources",
    title: "RESOURCES",
    description: "Find study materials and useful resources.",
    tag: "Academics",
    icon: BookOpen,
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    id: "helpdesk",
    title: "SMART HELPDESK",
    description: "Get answers about campus.",
    tag: "Support",
    icon: Headphones,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    id: "lost-found",
    title: "LOST & FOUND",
    description: "Report or find lost items.",
    tag: "Community",
    icon: SearchX,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "complaints",
    title: "COMPLAINT BOX",
    description: "Report campus issues and track resolutions.",
    tag: "Grievance",
    icon: MessageSquareWarning,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

export function CampusServices({ onSelectService }: CampusServicesProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Core Campus Services
          </h2>
          <p className="text-xs text-slate-500">
            Quick access to official City University platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {SERVICES.map((s) => (
          <ServiceCard
            key={s.id}
            title={s.title}
            description={s.description}
            tag={s.tag}
            icon={s.icon}
            iconBg={s.iconBg}
            iconColor={s.iconColor}
            onClick={() => onSelectService(s.id)}
          />
        ))}
      </div>
    </section>
  );
}
