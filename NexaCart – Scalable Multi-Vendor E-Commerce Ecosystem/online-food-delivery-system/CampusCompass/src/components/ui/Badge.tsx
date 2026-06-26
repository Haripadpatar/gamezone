import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "indigo" | "success" | "danger" | "warning" | "neutral";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors",
        {
          "bg-indigo-50 border-indigo-100 text-indigo-700": variant === "indigo",
          "bg-emerald-50 border-emerald-100 text-emerald-700": variant === "success",
          "bg-rose-50 border-rose-100 text-rose-700": variant === "danger",
          "bg-amber-50 border-amber-100 text-amber-700": variant === "warning",
          "bg-slate-50 border-slate-100 text-slate-600": variant === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
