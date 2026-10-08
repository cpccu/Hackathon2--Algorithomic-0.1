"use client";

import * as React from "react";
import {
  BookOpen,
  Building2,
  MapPin,
  HelpCircle,
  Users,
  GraduationCap,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Mail,
} from "lucide-react";
import { UniversalSearchResultItem } from "@/lib/services/campus-search";
import Link from "next/link";

interface SearchResultCardProps {
  item: UniversalSearchResultItem;
  onSelect: (item: UniversalSearchResultItem) => void;
}

export function SearchResultCard({ item, onSelect }: SearchResultCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "resource":
        return {
          icon: BookOpen,
          bg: "bg-brand-50",
          text: "text-brand-700",
          border: "border-brand-200/60",
          label: "Resource",
        };
      case "department":
        return {
          icon: Building2,
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200/60",
          label: "Department",
        };
      case "location":
        return {
          icon: MapPin,
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200/60",
          label: "Campus Location",
        };
      case "faq":
        return {
          icon: HelpCircle,
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200/60",
          label: "FAQ",
        };
      case "club":
        return {
          icon: Users,
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200/60",
          label: "Student Club",
        };
      case "university":
        return {
          icon: GraduationCap,
          bg: "bg-sky-50",
          text: "text-sky-700",
          border: "border-sky-200/60",
          label: "University Info",
        };
      default:
        return {
          icon: Compass,
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200/60",
          label: "General",
        };
    }
  };

  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Header: Type Badge & Verified Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.category || config.label}</span>
            </span>

            {item.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          {item.department && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-md">
              {item.department}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-1.5">
          {item.title}
        </h3>

        {/* Description Snippet */}
        {item.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
          {item.location && (
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          )}

          {item.metadata?.startAt && !item.location && (
            <span className="text-[11px] font-medium text-slate-500">
              {new Date(item.metadata.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}

          {item.metadata?.courseCode && (
            <span className="font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
              {item.metadata.courseCode}
            </span>
          )}

          {item.metadata?.email && !item.location && (
            <span className="flex items-center gap-1 text-slate-500 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.metadata.email}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 font-semibold text-brand-600 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span>
            {item.type === "resource"
              ? "Open Resource"
              : item.type === "event"
              ? "View Event"
              : item.type === "location"
              ? "View Location"
              : item.type === "faq"
              ? "View Answer"
              : item.type === "club"
              ? "View Club"
              : "View Details"}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
