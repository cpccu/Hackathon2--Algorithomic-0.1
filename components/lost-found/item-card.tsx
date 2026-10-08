"use client";

import * as React from "react";
import { MapPin, Calendar, Tag, ShieldCheck, Clock, ArrowRight } from "lucide-react";

export interface LostFoundItemData {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  location: string;
  dateOccurred: string;
  imageUrl?: string | null;
  status: "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
}

interface ItemCardProps {
  item: LostFoundItemData;
  onSelect: (item: LostFoundItemData) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const isLost = item.type === "LOST";

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                isLost
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {item.type}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              <Tag className="w-3 h-3 text-slate-400" />
              {item.category}
            </span>
          </div>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              item.status === "OPEN"
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : item.status === "CLAIMED"
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {item.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {item.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {new Date(item.dateOccurred).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
