"use client";

import * as React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
}

export function ServiceCard({
  title,
  description,
  tag,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/5 transition-all duration-200 cursor-pointer text-left"
    >
      <div>
        {/* Top Header: Icon & Category Tag */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              iconBg,
              iconColor
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded-md">
            {tag}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-800 group-hover:text-brand-700 transition-colors mb-1.5 flex items-center gap-1">
          <span>{title}</span>
          <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-brand-600" />
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Subtle Bottom Accent Indicator */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
        <span>Open service</span>
        <span>→</span>
      </div>
    </div>
  );
}
