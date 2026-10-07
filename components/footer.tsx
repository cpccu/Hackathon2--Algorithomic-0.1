import * as React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand Info */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Campus<span className="text-brand-500">OS</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                City University
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400">
              One Campus. One Platform. Everything You Need.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unified digital campus platform empowering students, faculty, and administration with coordinated technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium">
            <Link href="#home" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="#problem" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="#vision" className="hover:text-white transition-colors">
              Features
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 cursor-not-allowed">
              Step 1 Foundation
            </span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CampusOS. City University. All rights reserved.</p>
          <p className="text-slate-600">
            Engineered for City University Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}
