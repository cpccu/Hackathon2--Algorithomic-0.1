"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, LogIn, UserPlus } from "lucide-react";
import { WallSwitch } from "@/components/auth/wall-switch";
import { CeilingLamp } from "@/components/auth/ceiling-lamp";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [isLightOn, setIsLightOn] = React.useState(false);
  const [activeForm, setActiveForm] = React.useState<"none" | "login" | "register">("none");
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Form switching animation handler
  const handleSelectForm = (target: "login" | "register") => {
    if (activeForm === target) return;

    if (activeForm === "none") {
      setActiveForm(target);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveForm(target);
        setIsTransitioning(false);
      }, 180);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col justify-between transition-colors duration-700 ease-out overflow-x-hidden relative select-none",
        isLightOn ? "bg-[#0b1329]" : "bg-[#060a15]"
      )}
    >
      {/* =========================================================
       * ROOM ARCHITECTURE: WALL PLASTER & FLOOR PERSPECTIVE
       * Subtle architectural depth lines indicating an interior room
       * ========================================================= */}
      {/* Wall Texture / Coordinate Datum Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#33415512_1px,transparent_1px),linear-gradient(to_bottom,#33415512_1px,transparent_1px)] bg-[size:56px_56px] pointer-events-none opacity-40"
        aria-hidden="true"
      />

      {/* Ceiling Trim Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700/60 to-transparent pointer-events-none" />

      {/* =========================================================
       * TOP NAVIGATION BAR
       * ========================================================= */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Campus</span>
        </Link>

        {/* Wordmark in Header */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tight text-white">
            Campus<span className="text-brand-500">OS</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-widest">
            Authentication
          </span>
        </div>
      </header>

      {/* =========================================================
       * MAIN ROOM SCENE
       * Physical Layout:
       * - LEFT / SIDE: Physical Wall-Mounted Switch
       * - CENTER / UPPER: Modern Hanging Ceiling Lamp
       * - BELOW LAMP: Auth Navigation Options & Active Form
       * ========================================================= */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
        {/* =========================================================
         * 1. LEFT / SIDE WALL: PHYSICAL LIGHT SWITCH
         * Positioned on the wall, physically separated from the lamp
         * ========================================================= */}
        <div className="w-full lg:w-48 flex justify-center lg:justify-start lg:sticky lg:top-28 z-30 pt-2 lg:pt-14 order-2 lg:order-1">
          <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 shadow-xl backdrop-blur-xs flex flex-col items-center">
            <WallSwitch isLightOn={isLightOn} onToggle={setIsLightOn} />
          </div>
        </div>

        {/* =========================================================
         * 2. CENTER STAGE: CEILING LAMP & ILLUMINATED AUTHENTICATION
         * Positioned in the upper central room area
         * ========================================================= */}
        <div className="flex-1 w-full flex flex-col items-center order-1 lg:order-2">
          {/* Ceiling Lamp Fixture */}
          <div className="w-full flex justify-center mb-2 sm:mb-4">
            <CeilingLamp isLightOn={isLightOn} />
          </div>

          {/* Room Title / Status */}
          <div
            className={cn(
              "text-center max-w-md mx-auto transition-all duration-500 mb-6",
              isLightOn ? "opacity-100 translate-y-0" : "opacity-40 translate-y-1"
            )}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>City University Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Campus<span className="text-brand-500">OS</span> Authentication
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              {isLightOn
                ? "Select an option below to access your account."
                : "The room is dark. Flip the wall switch to illuminate CampusOS."}
            </p>
          </div>

          {/* =========================================================
           * 3. AUTHENTICATION CONTROLS (UNDERNEATH THE LAMP)
           * Becomes visible ONLY after lamp turns ON
           * ========================================================= */}
          <div
            className={cn(
              "w-full max-w-xl mx-auto flex flex-col items-center transition-all duration-700 ease-out",
              isLightOn
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-6 scale-[0.98] pointer-events-none"
            )}
            aria-hidden={!isLightOn}
          >
            {/* -----------------------------------------------------
             * OPTION BUTTONS: [ LOGIN ]  [ CREATE ACCOUNT ]
             * Side-by-side buttons — NOT two forms!
             * ----------------------------------------------------- */}
            <div className="inline-flex items-center p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 shadow-xl mb-6 sm:mb-8">
              {/* Option 1: LOGIN */}
              <button
                type="button"
                onClick={() => handleSelectForm("login")}
                className={cn(
                  "flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 outline-none select-none",
                  activeForm === "login"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                )}
                aria-pressed={activeForm === "login"}
              >
                <LogIn className="w-4 h-4" />
                <span>LOGIN</span>
              </button>

              {/* Option 2: CREATE ACCOUNT */}
              <button
                type="button"
                onClick={() => handleSelectForm("register")}
                className={cn(
                  "flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 outline-none select-none",
                  activeForm === "register"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-900/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                )}
                aria-pressed={activeForm === "register"}
              >
                <UserPlus className="w-4 h-4" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>

            {/* -----------------------------------------------------
             * FORM DISPLAY AREA: EXACTLY ONE ACTIVE FORM AT A TIME
             * - Initial: neither form is open (shows instruction prompt)
             * - Click LOGIN: only LoginForm appears
             * - Click CREATE ACCOUNT: only RegisterForm appears
             * ----------------------------------------------------- */}
            <div className="w-full max-w-md mx-auto">
              {activeForm === "none" && (
                <div className="text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 border-dashed text-slate-400">
                  <p className="text-sm font-medium">
                    Choose <span className="text-white font-semibold">LOGIN</span> or{" "}
                    <span className="text-white font-semibold">CREATE ACCOUNT</span> above to continue.
                  </p>
                </div>
              )}

              {/* ACTIVE FORM CONTAINER (Smooth crossfade/slide) */}
              <div
                className={cn(
                  "transition-all duration-200 ease-out",
                  isTransitioning
                    ? "opacity-0 translate-y-3 scale-[0.98]"
                    : "opacity-100 translate-y-0 scale-100"
                )}
              >
                {/* 1. Only Login Form */}
                {activeForm === "login" && (
                  <div className="w-full animate-in fade-in-50 duration-300">
                    <LoginForm />
                  </div>
                )}

                {/* 2. Only Register Form */}
                {activeForm === "register" && (
                  <div className="w-full animate-in fade-in-50 duration-300">
                    <RegisterForm />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Room Floor Baseboard Trim & Footer */}
      <footer className="relative z-20 w-full text-center py-6 border-t border-slate-800/80 text-xs text-slate-400">
        <p>© 2026 CampusOS. Built for City University students.</p>
      </footer>
    </div>
  );
}
