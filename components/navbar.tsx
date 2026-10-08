"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#vision" },
  { label: "About", href: "#problem" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs"
          : "bg-white/60 backdrop-blur-xs border-b border-slate-200/40"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo / Wordmark */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-brand-navy group-hover:text-brand-600 transition-colors">
              Campus<span className="text-brand-600">OS</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              City University
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Portal Login
          </Link>
        </nav>

        {/* Desktop CTA Action Button */}
        <div className="hidden md:flex items-center">
          <Link href="/auth">
            <Button
              variant="primary"
              size="md"
              className="shadow-xs hover:shadow transition-all"
            >
              Enter CampusOS
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-brand-600 hover:bg-brand-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portal Login
            </Link>
          </div>
          <div className="pt-2">
            <Link href="/auth" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="primary"
                size="md"
                className="w-full"
              >
                Enter CampusOS
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
