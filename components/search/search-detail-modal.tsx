"use client";

import * as React from "react";
import {
  X,
  ExternalLink,
  MapPin,
  Building2,
  BookOpen,
  HelpCircle,
  Users,
  GraduationCap,
  Mail,
  Calendar,
  CheckCircle2,
  FileText,
  Compass,
} from "lucide-react";
import { UniversalSearchResultItem } from "@/lib/services/campus-search";

interface SearchDetailModalProps {
  item: UniversalSearchResultItem | null;
  onClose: () => void;
}

export function SearchDetailModal({ item, onClose }: SearchDetailModalProps) {
  React.useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <BookOpen className="w-5 h-5 text-brand-600" />;
      case "department":
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case "location":
        return <MapPin className="w-5 h-5 text-emerald-600" />;
      case "faq":
        return <HelpCircle className="w-5 h-5 text-amber-600" />;
      case "club":
        return <Users className="w-5 h-5 text-purple-600" />;
      case "university":
        return <GraduationCap className="w-5 h-5 text-sky-600" />;
      default:
        return <Compass className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "resource":
        return "bg-brand-50 text-brand-700 border-brand-200/60";
      case "department":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "location":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "faq":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "club":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "university":
        return "bg-sky-50 text-sky-700 border-sky-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
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
            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shadow-xs">
              {getTypeIcon(item.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getTypeBadgeStyle(
                    item.type
                  )}`}
                >
                  {item.category || item.type}
                </span>
                {item.verificationStatus === "VERIFIED" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
                {item.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {item.description && (
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {item.type === "faq" ? "Verified Answer" : "Overview & Details"}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Key Facts / Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {item.department && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Department</span>
                  <span className="font-semibold text-slate-800">{item.department}</span>
                </div>
              </div>
            )}

            {item.location && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Campus Location</span>
                  <span className="font-semibold text-slate-800">{item.location}</span>
                </div>
              </div>
            )}

            {item.metadata?.courseCode && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Course Code</span>
                  <span className="font-semibold text-slate-800">{item.metadata.courseCode}</span>
                </div>
              </div>
            )}

            {item.metadata?.email && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Email Contact</span>
                  <span className="font-semibold text-slate-800">{item.metadata.email}</span>
                </div>
              </div>
            )}

            {item.metadata?.contactEmail && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Contact Email</span>
                  <span className="font-semibold text-slate-800">{item.metadata.contactEmail}</span>
                </div>
              </div>
            )}

            {item.metadata?.building && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">Building</span>
                  <span className="font-semibold text-slate-800">{item.metadata.building}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>

          {item.url && item.url.startsWith("http") ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-xs"
            >
              <span>Visit Official Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : item.type === "resource" ? (
            <a
              href={item.url}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-xs"
            >
              <span>View in Resource Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
