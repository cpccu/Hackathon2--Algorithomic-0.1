import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "navy" | "success" | "warning" | "error" | "info" | "neutral";
}

export function Badge({
  className,
  variant = "brand",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    navy: "bg-slate-100 text-brand-navy border-slate-300",
    success: "bg-semantic-success-bg text-semantic-success-text border-green-200",
    warning: "bg-semantic-warning-bg text-semantic-warning-text border-amber-200",
    error: "bg-semantic-error-bg text-semantic-error-text border-red-200",
    info: "bg-semantic-info-bg text-semantic-info-text border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
