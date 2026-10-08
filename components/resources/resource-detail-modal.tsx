"use client";

import * as React from "react";
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  FileCode,
  FileArchive,
} from "lucide-react";
import { ResourceRecord } from "@/lib/db";
import { cn } from "@/lib/utils";

interface ResourceDetailModalProps {
  resource: ResourceRecord | null;
  onClose: () => void;
}

export function ResourceDetailModal({ resource, onClose }: ResourceDetailModalProps) {
  React.useEffect(() => {
    if (!resource) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resource, onClose]);

  if (!resource) return null;

  const isFileAvailable = Boolean(resource.fileUrl && resource.fileUrl.trim().length > 0);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case "PDF":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "ZIP":
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      default:
        return <FileCode className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100/60">
              {getFileIcon(resource.fileType)}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/50">
                {resource.category}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Course: <span className="text-slate-700 font-semibold">{resource.courseCode}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
            {resource.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400" /> Department
            </span>
            <p className="font-semibold text-slate-800">{resource.department}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Format
            </span>
            <p className="font-semibold text-slate-800">{resource.fileType} Document</p>
          </div>
          <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/50">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Added to Hub
            </span>
            <p className="font-semibold text-slate-800">
              {new Date(resource.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Actions or Graceful Fallback Notice */}
        <div className="space-y-3 pt-2">
          {isFileAvailable ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resource.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Resource</span>
              </a>
              <a
                href={resource.fileUrl!}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center gap-2.5 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Resource file is not available yet. Please check back later.</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
