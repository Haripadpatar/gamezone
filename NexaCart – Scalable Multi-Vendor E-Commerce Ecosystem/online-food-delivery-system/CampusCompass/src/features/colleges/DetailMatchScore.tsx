"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateMatchScore, DEFAULT_PREFERENCES, UserPreferences } from "@/lib/matchScore";
import PreferencesModal from "@/features/colleges/PreferencesModal";
import { College } from "@/types";

interface DetailMatchScoreProps {
  college: College;
}

export default function DetailMatchScore({ college }: DetailMatchScoreProps) {
  const [preferences] = useLocalStorage<UserPreferences>("user_preferences", DEFAULT_PREFERENCES);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (preferences) {
      setMatchScore(calculateMatchScore(college, preferences));
    }
  }, [college, preferences]);

  if (matchScore === null) return null;

  const getStatusText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 50) return "Moderate Match";
    return "Low Match";
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-55/30 border-emerald-100 text-emerald-950";
    if (score >= 50) return "bg-amber-55/30 border-amber-100 text-amber-950";
    return "bg-rose-55/30 border-rose-100 text-rose-950";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-600";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <>
      <Card className={`p-6 border ${getBgColor(matchScore)} shadow-sm`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider">AI Match Matchmaker</h3>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-500 cursor-pointer focus:outline-none"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Adjust
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-black">{matchScore}%</span>
            <span className="text-xs font-bold ml-2 opacity-80">{getStatusText(matchScore)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(matchScore)}`}
            style={{ width: `${matchScore}%` }}
          />
        </div>

        <p className="mt-3 text-[11px] leading-relaxed opacity-75">
          Calculated using your personalized preferences for location, budget, ratings, and course categories. Click Adjust to update criteria.
        </p>
      </Card>

      <PreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
