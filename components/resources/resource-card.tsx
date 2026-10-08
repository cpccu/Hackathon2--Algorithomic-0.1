"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Eye,
  Building,
  GraduationCap,
  Calendar,
  AlertCircle,
  FileCode,
  FileArchive,
} from "lucide-react";
import { ResourceRecord } from "@/lib/db";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: ResourceRecord;
  onOpenDetails: (resource: ResourceRecord) => void;
}

export function ResourceCard({ resource, onOpenDetails }: ResourceCardProps) {
  const isFileAvailable = Boolean(resource.fileUrl && resource.fileUrl.trim().length > 0);

  const getFileBadge = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case "PDF":
        return {
          icon: FileText,
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200/50",
        };
      case "ZIP":
        return {
          icon: FileArchive,
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200/50",
        };
      default:
        return {
          icon: FileCode,
          bg: "bg-brand-50",
          text: "text-brand-700",
          border: "border-brand-200/50",
        };
    }
  };

  const badge = getFileBadge(resource.fileType);
  const Icon = badge.icon;

  return (
    <div className="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/5 transition-all duration-200">
      <div>
        {/* Top Meta: Category & Format Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
            {resource.category}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border",
              badge.bg,
              badge.text,
              badge.border
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{resource.fileType}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(resource)}
          className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {resource.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {resource.description}
        </p>
      </div>

      {/* Course & Department Sub-metadata */}
      <div>
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            {resource.courseCode}
          </span>
          <span className="text-[11px] truncate max-w-[160px]" title={resource.department}>
            {resource.department}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(resource)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-semibold border border-slate-200 hover:border-brand-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>

          {isFileAvailable ? (
            <a
              href={resource.fileUrl!}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-transform active:scale-95 shadow-sm shadow-brand-600/20"
              title="Download file"
              aria-label="Download resource"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span
              className="p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
              title="Resource file is not available yet"
              aria-label="File not available"
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
