"use client";

import * as React from "react";
import { Bell, ArrowUpRight } from "lucide-react";

export function RecentNotices() {
  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs h-full min-h-[220px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Recent Notices</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded-md">
            Official Bulletin
          </span>
        </div>

        {/* Elegant Empty State */}
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 mb-2.5">
            <Bell className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No recent notices.</p>
          <p className="text-xs text-slate-400 max-w-xs mt-0.5">
            Official administration notices, exam schedules, and holiday announcements will appear here.
          </p>
          <a
            href="/notifications"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>Open Notifications Center</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Office of the Registrar & Controller of Examinations</span>
        <a
          href="/notifications"
          className="text-brand-600 hover:text-brand-700 font-semibold text-[11px] inline-flex items-center gap-0.5"
        >
          <span>All Alerts</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
