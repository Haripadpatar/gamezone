"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  SlidersHorizontal, Grid, List, 
  ChevronLeft, ChevronRight, 
  Loader2, GitCompare, X, ArrowRight, BookOpen
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CollegeCard } from "@/features/colleges/CollegeCard";
import { College } from "@/types";
import PreferencesModal from "@/features/colleges/PreferencesModal";

export default function CollegesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 450);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [location, setLocation] = useState("All");
  const [maxFee, setMaxFee] = useState(1200000);
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Data states
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  // SSR-safe LocalStorage synchronizer
  const [comparedColleges, setComparedColleges] = useLocalStorage<College[]>("compared_colleges", []);

  const locations = ["All", "Mumbai", "Bangalore", "Delhi", "Pune", "Pilani", "Vellore", "Trichy"];

  // Load saved college IDs
  const loadSavedIds = useCallback(async () => {
    if (session) {
      try {
        const res = await fetch("/api/saved");
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            setSavedIds(resData.data.map((c: any) => c.id));
          }
        }
      } catch (err) {
        console.error("Error loading saved ids:", err);
      }
    } else {
      setSavedIds([]);
    }
  }, [session]);

  useEffect(() => {
    loadSavedIds();
  }, [session, loadSavedIds]);

  // Fetch colleges from API
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        location,
        maxFee: maxFee.toString(),
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: "6",
      });
      
      const res = await fetch(`/api/colleges?${params.toString()}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setColleges(resData.data.colleges);
        setTotal(resData.data.total);
        setTotalPages(resData.data.totalPages);
      } else {
        toast(resData.error?.message || "Failed to fetch colleges", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred while fetching colleges", "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, location, maxFee, sortBy, sortOrder, page, toast]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Save/Unsave bookmark
  const toggleSave = async (collegeId: string, collegeName: string) => {
    if (!session) {
      toast("Please sign in to save colleges", "info");
      return;
    }

    const isSaved = savedIds.includes(collegeId);
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved?collegeId=${collegeId}`, {
          method: "DELETE",
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          setSavedIds((prev) => prev.filter((id) => id !== collegeId));
          toast(`${collegeName} removed from bookmarks`, "success");
        } else {
          toast(resData.error?.message || "Failed to unsave college", "error");
        }
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId }),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          setSavedIds((prev) => [...prev, collegeId]);
          toast(`${collegeName} saved successfully!`, "success");
        } else {
          toast(resData.error?.message || "Failed to save college", "error");
        }
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred. Please try again.", "error");
    }
  };

  // Compare Toggle
  const toggleCompare = (college: College) => {
    const isCompared = comparedColleges.some((c) => c.id === college.id);
    if (isCompared) {
      setComparedColleges((prev) => prev.filter((c) => c.id !== college.id));
      toast(`${college.name} removed from comparison`, "info");
    } else {
      if (comparedColleges.length >= 3) {
        toast("You can compare up to 3 colleges at a time", "error");
        return;
      }
      setComparedColleges((prev) => [...prev, college]);
      toast(`${college.name} added to comparison`, "success");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Explore Top Colleges</h1>
        <p className="mt-2 text-slate-500">Discover your ideal campus by filtering location, fees, and placement percentages.</p>
      </div>

      {/* Grid of Filters + Listing */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              Filters
            </h2>
            <button
              onClick={() => {
                setSearch("");
                setLocation("All");
                setMaxFee(1200000);
                setSortBy("rating");
                setSortOrder("desc");
                setPage(1);
              }}
              className="text-xs font-semibold text-indigo-650 hover:text-indigo-500 cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Search filter */}
            <div>
              <Input
                label="Search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="IIT, engineering..."
              />
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Location</label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="mt-2 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Fees slider */}
            <div>
              <Slider
                label="Max Annual Fee"
                valueLabel={formatCurrency(maxFee)}
                min="0"
                max="1200000"
                step="50000"
                value={maxFee}
                onChange={(e) => {
                  setMaxFee(parseInt(e.target.value));
                  setPage(1);
                }}
              />
            </div>

            {/* AI Preferences Trigger */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <Button
                onClick={() => setIsPrefsOpen(true)}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 cursor-pointer font-bold border-indigo-100 hover:bg-indigo-50/20 text-indigo-700 text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Customize AI Match
              </Button>
            </div>
          </div>
        </div>

        {/* Listing section */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 font-medium mr-2">
                Showing <span className="font-bold text-slate-900">{total}</span> colleges
              </span>
              {search && (
                <Badge variant="neutral" className="gap-1 bg-slate-50 text-slate-600 border border-slate-200 normal-case py-1">
                  Search: "{search}"
                  <button onClick={() => setSearch("")} className="hover:text-rose-600 transition-colors cursor-pointer ml-1 flex items-center justify-center">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {location !== "All" && (
                <Badge variant="indigo" className="gap-1 normal-case py-1">
                  Location: {location}
                  <button onClick={() => { setLocation("All"); setPage(1); }} className="hover:text-indigo-900 transition-colors cursor-pointer ml-1 flex items-center justify-center">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {maxFee < 1200000 && (
                <Badge variant="success" className="gap-1 normal-case py-1">
                  Fee ≤ {formatCurrency(maxFee)}
                  <button onClick={() => { setMaxFee(1200000); setPage(1); }} className="hover:text-emerald-950 transition-colors cursor-pointer ml-1 flex items-center justify-center">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 py-1.5 px-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="rating">Rating</option>
                  <option value="fees">Fees</option>
                  <option value="placementPercentage">Placement Rate</option>
                </select>
              </div>

              {/* View layout toggle */}
              <div className="hidden sm:flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  } transition-colors cursor-pointer`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  } transition-colors cursor-pointer`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loader Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col border border-slate-200 rounded-2xl p-4 bg-white space-y-4">
                  <div className="aspect-video w-full bg-slate-100 animate-pulse rounded-xl" />
                  <div className="h-5 bg-slate-100 animate-pulse rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-1/2" />
                  <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-full mt-4" />
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            /* Empty state */
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No colleges found"
              description="No institutions matched your search parameters. Try widening your filters or clearing search text."
              action={
                <Button
                  onClick={() => {
                    setSearch("");
                    setLocation("All");
                    setMaxFee(1200000);
                    setPage(1);
                  }}
                  variant="primary"
                  size="sm"
                  className="cursor-pointer"
                >
                  Reset Search Filters
                </Button>
              }
            />
          ) : (
            /* Listing Cards */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                  : "flex flex-col gap-6"
              }
            >
              {colleges.map((college) => {
                const isSaved = savedIds.includes(college.id);
                const isCompared = comparedColleges.some((c) => c.id === college.id);

                return (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    viewMode={viewMode}
                    isSaved={isSaved}
                    onSaveToggle={() => toggleSave(college.id, college.name)}
                    isCompared={isCompared}
                    onCompareToggle={() => toggleCompare(college)}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Widget */}
      {comparedColleges.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] w-full max-w-lg px-4 pointer-events-none">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur-md pointer-events-auto animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                <GitCompare className="h-5 w-5 text-indigo-650" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Compare Colleges</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {comparedColleges.length} of 3 selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setComparedColleges([]);
                  toast("Cleared comparison list", "info");
                }}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer focus:outline-none"
                title="Clear all"
              >
                <X className="h-4 w-4" />
              </button>
              
              <Link
                href="/compare"
                className="flex items-center gap-1"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1 cursor-pointer font-bold px-4 py-2"
                >
                  Compare Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Match Preferences Modal */}
      <PreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        onSave={() => {
          toast("Match preferences updated successfully!", "success");
        }}
      />
    </div>
  );
}
