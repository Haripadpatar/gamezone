"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, IndianRupee, Bookmark, Trophy, Check, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { College } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateMatchScore, DEFAULT_PREFERENCES, UserPreferences } from "@/lib/matchScore";

interface CollegeCardProps {
  college: College;
  viewMode?: "grid" | "list";
  isSaved?: boolean;
  onSaveToggle?: () => void;
  isCompared?: boolean;
  onCompareToggle?: () => void;
  showActions?: boolean;
  actionOverride?: React.ReactNode;
}

export function CollegeCard({
  college,
  viewMode = "grid",
  isSaved = false,
  onSaveToggle,
  isCompared = false,
  onCompareToggle,
  showActions = true,
  actionOverride,
}: CollegeCardProps) {
  const [preferences] = useLocalStorage<UserPreferences>("user_preferences", DEFAULT_PREFERENCES);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    if (preferences) {
      setMatchScore(calculateMatchScore(college, preferences));
    }
  }, [college, preferences]);

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-emerald-600 text-white border-emerald-500/10";
    if (score >= 50) return "bg-amber-500 text-slate-900 border-amber-400/10";
    return "bg-rose-500 text-white border-rose-450/10";
  };

  return (
    <Card className={cn("group overflow-hidden flex flex-col", {
      "md:flex-row": viewMode === "list",
    })}>
      {/* College Image */}
      <div
        className={cn("relative bg-slate-100 overflow-hidden shrink-0", {
          "aspect-video md:w-72": viewMode === "list",
          "aspect-video": viewMode === "grid",
        })}
      >
        <Image
          src={college.imageUrl}
          alt={college.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Rating Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-slate-705 shadow-sm border border-slate-100">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{college.rating.toFixed(1)}</span>
        </div>

        {/* AI Match Score Overlay */}
        {matchScore !== null && (
          <div className={cn("absolute top-3 right-3 flex items-center gap-1 rounded-full backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-black shadow-sm border", getMatchColor(matchScore))}>
            <span>{matchScore}% Match</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-650">
              <MapPin className="h-3 w-3" />
              <span>{college.location}</span>
            </div>
            
            <Link href={`/colleges/${college.id}`}>
              <h3 className="mt-1.5 text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                {college.name}
              </h3>
            </Link>
          </div>

          {/* Bookmark Button */}
          {onSaveToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onSaveToggle();
              }}
              className="shrink-0 rounded-lg p-1.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer focus:outline-none"
              title={isSaved ? "Remove bookmark" : "Bookmark college"}
            >
              <Bookmark
                className={cn("h-4.5 w-4.5", {
                  "fill-indigo-655 text-indigo-600": isSaved,
                })}
              />
            </button>
          )}
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {college.description}
        </p>

        {/* Courses tag */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {college.courses.slice(0, 2).map((course, idx) => (
            <Badge key={idx} variant="neutral">
              {course}
            </Badge>
          ))}
          {college.courses.length > 2 && (
            <Badge variant="neutral" className="text-slate-400">
              +{college.courses.length - 2} more
            </Badge>
          )}
        </div>

        {/* Lower Metrics bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Annual Fee</span>
            <div className="flex items-center text-sm font-extrabold text-slate-900 mt-0.5">
              <IndianRupee className="h-3.5 w-3.5 text-slate-700" />
              <span>{new Intl.NumberFormat("en-IN").format(college.fees)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Placements</span>
            <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
              {college.placementPercentage.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100">
            {actionOverride ? (
              actionOverride
            ) : (
              <>
                {onCompareToggle && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      onCompareToggle();
                    }}
                    variant={isCompared ? "secondary" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5 cursor-pointer text-xs"
                  >
                    {isCompared ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-indigo-650" />
                        Added to Compare
                      </>
                    ) : (
                      <>
                        <GitCompare className="h-3.5 w-3.5 text-slate-400" />
                        Compare
                      </>
                    )}
                  </Button>
                )}
                <Link
                  href={`/colleges/${college.id}`}
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs bg-slate-900 text-white hover:bg-slate-800"
                  >
                    View Details
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default CollegeCard;
