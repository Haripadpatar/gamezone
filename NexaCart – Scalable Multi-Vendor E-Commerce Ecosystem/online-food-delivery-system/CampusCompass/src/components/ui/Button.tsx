import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]",
          {
            "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400":
              variant === "primary",
            "bg-slate-100 text-slate-905 hover:bg-slate-200":
              variant === "secondary",
            "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm":
              variant === "outline",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900":
              variant === "ghost",
            "bg-rose-600 text-white shadow-sm hover:bg-rose-500 disabled:bg-rose-400":
              variant === "danger",
            "text-indigo-600 hover:underline p-0 rounded-none bg-transparent active:scale-100 focus:ring-0":
              variant === "link",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4.5 py-2.5 text-sm": size === "md",
            "px-6 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export default Button;
