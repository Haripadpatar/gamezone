"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  Bookmark, Trash, GitCompare, ArrowRight, Clock, Sparkles, 
  FolderHeart, Star, MapPin, IndianRupee, Loader2, Compass, Award, Plus, ArrowUpRight, GraduationCap, User
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CollegeCard } from "@/features/colleges/CollegeCard";
import { College } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  colleges: College[];
}

interface DashboardStats {
  savedCollegesCount: number;
  comparisonsCount: number;
  predictorUsageCount: number;
  averageMatchScore: number;
}

interface UserProfile {
  name: string;
  email: string;
}

interface DashboardData {
  stats: DashboardStats;
  profile: UserProfile;
  savedColleges: College[];
  savedComparisons: SavedComparison[];
  recentlyViewed: College[];
  recommendedColleges: { college: College; score: number }[];
  userPreferences: {
    maxFee: number;
    location: string;
    courseCategory: string;
    importanceFees: number;
    importancePlacement: number;
    importanceRating: number;
  };
}

interface DashboardClientProps {
  userName: string;
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
        <div className="h-8 w-8 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="h-8 w-12 bg-slate-100 rounded-lg"></div>
      <div className="h-3 w-32 bg-slate-50 rounded-md"></div>
    </div>
  );
}

function CollegeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-slate-200/65 rounded-3xl p-5 shadow-sm space-y-4 animate-pulse">
          <div className="h-40 bg-slate-150 rounded-2xl w-full"></div>
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-100 rounded-md"></div>
            <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
            <div className="h-3.5 w-full bg-slate-50/50 rounded-md"></div>
            <div className="h-3.5 w-5/6 bg-slate-50/50 rounded-md"></div>
          </div>
          <div className="h-8 bg-slate-100 rounded-lg w-full mt-4"></div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
      ))}
    </div>
  );
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Read local storage history and compare boards sync
  const [recentlyViewedIds] = useLocalStorage<string[]>("recently_viewed", []);
  const [comparedColleges, setComparedColleges] = useLocalStorage<College[]>("compared_colleges", []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentlyViewedIds }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData.data);
      } else {
        toast("Failed to load dashboard details", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error connecting to dashboard statistics API", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRemove = async (collegeId: string, collegeName: string) => {
    setRemovingId(collegeId);
    try {
      const res = await fetch(`/api/saved?collegeId=${collegeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast(`${collegeName} removed from shortlist`, "success");
        setComparedColleges((prev) => prev.filter((c) => c.id !== collegeId));
        fetchDashboardData();
      } else {
        toast("Failed to remove college", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred. Please try again.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleSaveRecommendation = async (college: College) => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: college.id }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast(`${college.name} saved successfully!`, "success");
        fetchDashboardData();
      } else {
        toast(resData.error?.message || "Failed to save college", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to save college", "error");
    }
  };

  const handleCompareAll = () => {
    if (!data || data.savedColleges.length === 0) return;
    const listToCompare = data.savedColleges.slice(0, 3);
    setComparedColleges(listToCompare);
    toast(`Comparing ${listToCompare.length} shortlisted colleges`, "success");
    router.push("/compare");
  };

  const handleLoadComparison = (comp: SavedComparison) => {
    if (!comp.colleges || comp.colleges.length === 0) {
      toast("Could not locate colleges in this comparison", "error");
      return;
    }
    setComparedColleges(comp.colleges);
    toast(`Loaded comparison board "${comp.name}"`, "success");
    router.push("/compare");
  };

  const handleDeleteComparison = async (compId: string) => {
    try {
      const res = await fetch(`/api/compare?id=${compId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Comparison board deleted", "success");
        fetchDashboardData();
      } else {
        toast("Failed to delete comparison board", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error deleting comparison board", "error");
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-10">
      {/* Personalized Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-indigo-200">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Showcase Edition
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {userName}! ✨
          </h2>
          <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
            Welcome to your personalized college discovery hub. Track your shortcuts, run AI match calculations, and launch comparison templates.
          </p>
        </div>
      </div>

      {/* Analytics Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Saved Colleges */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Bookmarked</span>
                <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                  <Bookmark className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900">{data?.stats.savedCollegesCount}</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Saved college profiles
                </p>
              </div>
            </div>

            {/* Card 2: Saved Comparisons */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Saved Boards</span>
                <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                  <GitCompare className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900">{data?.stats.comparisonsCount}</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Comparison boards logged
                </p>
              </div>
            </div>

            {/* Card 3: Predictor History */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Predictor History</span>
                <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                  <Compass className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-900">{data?.stats.predictorUsageCount}</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Cutoff simulations logged
                </p>
              </div>
            </div>

            {/* Card 4: Average Match Score */}
            <div className="bg-gradient-to-b from-indigo-50/10 to-indigo-50/30 border border-indigo-100/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950/70 uppercase tracking-wider">Avg Match Score</span>
                <div className="h-9 w-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                  <Star className="h-4.5 w-4.5 fill-white/20" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-3xl font-black text-indigo-950">{data?.stats.averageMatchScore}%</h3>
                  {data && data.stats.averageMatchScore > 0 && (
                    <span className="text-[10px] font-black text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      Strong Match
                    </span>
                  )}
                </div>
                <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${data?.stats.averageMatchScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Shortlist & Custom Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-indigo-50/40 border border-indigo-100/40 rounded-2xl p-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-indigo-600" />
              Saved Colleges
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Colleges bookmarked to your account. Select Compare to inspect details side-by-side.
            </p>
          </div>
          
          {!loading && data && data.savedColleges.length > 0 && (
            <Button
              onClick={handleCompareAll}
              variant="primary"
              size="sm"
              className="gap-1.5 cursor-pointer shrink-0 font-bold bg-indigo-650 hover:bg-indigo-600 text-xs px-4"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare Shortlist
            </Button>
          )}
        </div>

        {/* Saved Colleges Grid */}
        {loading ? (
          <CollegeGridSkeleton />
        ) : !data || data.savedColleges.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-sm px-6 max-w-xl mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Bookmark className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No saved colleges</h3>
            <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't added any colleges to your shortlist yet. Search our catalog and save your favorites to manage them here.
            </p>
            <div className="mt-6">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Browse Catalog
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.savedColleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                viewMode="grid"
                showActions={true}
                actionOverride={
                  <>
                    <Button
                      onClick={() => handleRemove(college.id, college.name)}
                      isLoading={removingId === college.id}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/10 cursor-pointer text-xs"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                    <Link
                      href={`/colleges/${college.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs"
                      >
                        View Details
                      </Button>
                    </Link>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Grid of Comparisons, History & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-200/60">
        
        {/* Saved Comparisons */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FolderHeart className="h-5 w-5 text-indigo-600" />
            Recent Comparisons
          </h3>
          
          {loading ? (
            <ListSkeleton />
          ) : !data || data.savedComparisons.length === 0 ? (
            <div className="border border-slate-200/80 rounded-2xl p-8 text-center bg-white">
              <span className="text-xs text-slate-450 font-semibold block">No saved comparisons</span>
              <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto leading-normal">
                Assemble colleges on the Compare page, then save your board to reload them instantly here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.savedComparisons.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-all"
                >
                  <div className="truncate pr-4">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{comp.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold truncate">
                      {comp.colleges.map((c) => c.name).join(" vs ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteComparison(comp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50/20 cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    <Button
                      onClick={() => handleLoadComparison(comp)}
                      variant="primary"
                      size="sm"
                      className="text-xs gap-1 font-bold cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Load
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Recently Viewed
          </h3>

          {loading ? (
            <ListSkeleton />
          ) : !data || data.recentlyViewed.length === 0 ? (
            <div className="border border-slate-200/80 rounded-2xl p-8 text-center bg-white">
              <span className="text-xs text-slate-450 font-semibold block">History is clear</span>
              <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto leading-normal">
                Detail pages you visit will appear here for fast backtracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentlyViewed.map((col) => (
                <Link
                  key={col.id}
                  href={`/colleges/${col.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <div className="truncate pr-4">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{col.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">
                      {col.location} &bull; {formatCurrency(col.fees)}/Yr
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-450 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Summary */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            User Profile Summary
          </h3>

          {loading ? (
            <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ) : !data ? (
            <div className="border border-slate-200 rounded-2xl p-8 text-center bg-white text-xs text-slate-400">
              Failed to load profile.
            </div>
          ) : (
            <div className="bg-white border border-slate-250/75 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm uppercase">
                  {data.profile.name.slice(0, 2)}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{data.profile.name}</h4>
                  <span className="text-[10px] text-slate-450 font-semibold block truncate">{data.profile.email}</span>
                </div>
              </div>

              {/* Match Preferences Sublist */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Match Settings</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Max Fee</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5 truncate">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(data.userPreferences.maxFee)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Preferred Location</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5 truncate">
                      {data.userPreferences.location}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Course Interests</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5 truncate">
                      {data.userPreferences.courseCategory}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">Placement Weight</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5">
                      {data.userPreferences.importancePlacement}/5
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Personalized AI Recommendations */}
      <div className="pt-8 border-t border-slate-200/60 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
          Recommended For You
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-105 rounded-2xl p-5 h-56 animate-pulse"></div>
            ))}
          </div>
        ) : !data || data.recommendedColleges.length === 0 ? (
          <div className="border border-slate-200/80 rounded-2xl p-8 text-center bg-white">
            <span className="text-xs text-slate-400 font-semibold block">All recommended colleges saved!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendedColleges.map(({ college, score }) => (
              <Card
                key={college.id}
                className="p-5 border border-indigo-50 bg-gradient-to-b from-indigo-50/5 to-white flex flex-col justify-between hover:shadow-sm transition-all animate-fade-in"
              >
                <div>
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                      {college.location}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[9px] font-black text-indigo-700">
                      {score}% Match
                    </span>
                  </div>
                  
                  <Link href={`/colleges/${college.id}`}>
                    <h4 className="text-sm font-extrabold text-slate-900 hover:text-indigo-650 transition-colors line-clamp-1 leading-tight">
                      {college.name}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {college.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                      <IndianRupee className="h-3 w-3 text-slate-600" />
                      {new Intl.NumberFormat("en-IN").format(college.fees)}
                    </span>
                    <span>&bull;</span>
                    <span className="text-indigo-600 font-bold">{college.placementPercentage.toFixed(0)}% Placement</span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2.5">
                  <Button
                    onClick={() => handleSaveRecommendation(college)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[11px] font-bold cursor-pointer border-indigo-100 text-indigo-700 hover:bg-indigo-50/20"
                  >
                    Quick Save
                  </Button>
                  <Link
                    href={`/colleges/${college.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-[11px] font-bold cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
