"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User, IdCard, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  onSuccess?: (user: { id: string; email: string; fullName: string; studentId: string }) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [studentId, setStudentId] = React.useState("");
  const [email, setEmail] = React.useState("");

  const [step, setStep] = React.useState<"form" | "otp">("form");
  const [otp, setOtp] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const [cooldown, setCooldown] = React.useState(0);

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !studentId.trim() || !email.trim()) {
      setError("Please fill out all registration fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          studentId: studentId.trim(),
          email: email.trim(),
          purpose: "register",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Unable to send verification code.");
      } else {
        setStep("otp");
        setSuccessMsg("Verification code dispatched to your email.");
        setCooldown(60);
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          studentId: studentId.trim(),
          email: email.trim(),
          otp,
          purpose: "register",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid verification code.");
      } else {
        setSuccessMsg("Account successfully verified! Redirecting to CampusOS...");
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        }
      }
    } catch {
      setError("Network error verifying code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setOtp("");
    await handleSendCode({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-white transition-all">
      <div className="mb-6">
        <h3 className="text-2xl font-bold tracking-tight text-white">Create Your CampusOS Account</h3>
        <p className="text-sm text-slate-400 mt-1">Create your City University account.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === "form" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="reg-fullname" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-studentid" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Student ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-studentid"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="CU-2026-8841"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email / Gmail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md transition-all gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Enter verification code
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Sent to <span className="font-semibold text-slate-200">{email}</span>
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full h-11 font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md transition-all gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Create Account</span>
              </>
            )}
          </Button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Modify information
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={handleResend}
              className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-50 disabled:hover:text-brand-400 transition-colors font-semibold"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              <span>{cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
