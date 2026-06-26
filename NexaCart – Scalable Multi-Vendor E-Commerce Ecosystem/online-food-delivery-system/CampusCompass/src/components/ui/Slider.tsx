import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valueLabel: string;
}

export function Slider({ className, label, valueLabel, ...props }: SliderProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <label className="font-semibold text-slate-700">{label}</label>
        <span className="font-semibold text-indigo-605">{valueLabel}</span>
      </div>
      <input
        type="range"
        className={cn(
          "w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          className
        )}
        {...props}
      />
    </div>
  );
}

export default Slider;
