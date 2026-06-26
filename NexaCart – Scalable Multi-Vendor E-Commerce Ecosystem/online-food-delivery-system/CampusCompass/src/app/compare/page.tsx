"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  GitCompare, Trash, Plus, Star, MapPin, IndianRupee, 
  Trophy, Search, ArrowLeft, Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { College } from "@/types";

export default function ComparePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // All colleges pool for selection
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected colleges slots
  const [selectedColleges, setSelectedColleges] = useState<(College | null)[]>([null, null, null]);

  const [boardName, setBoardName] = useState("");
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [savedComparisons, setSavedComparisons] = useLocalStorage<any[]>("saved_comparisons", []);

  const handleSaveBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) {
      toast("Please enter a name for your comparison board", "error");
      return;
    }
    
    const collegeIds = activeColleges.map((c) => c.id);

    if (session?.user) {
      try {
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: boardName.trim(), collegeIds }),
        });
        const resData = await res.json();
        if (!res.ok || !resData.success) {
          toast(resData.error?.message || "Failed to save comparison to database", "error");
          return;
        }
      } catch (err) {
        console.error("Save comparison to DB error:", err);
        toast("Connection error when saving comparison", "error");
        return;
      }
    }

    const newBoard = {
      id: Math.random().toString(36).substring(2, 9),
      name: boardName.trim(),
      collegeIds,
    };
    setSavedComparisons((prev) => [...(prev || []), newBoard]);
    setBoardName("");
    setIsSavingBoard(false);
    toast(`Comparison board "${newBoard.name}" saved!`, "success");
  };
  
  // Search text for each slot
  const [searchQueries, setSearchQueries] = useState<string[]>(["", "", ""]);
  
  // Show dropdowns
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false, false, false]);

  // Keyboard navigation focus state for each slot dropdown list
  const [focusedIndexes, setFocusedIndexes] = useState<number[]>([-1, -1, -1]);

  // SSR-safe LocalStorage compared colleges synchronizer
  const [comparedColleges, setComparedColleges] = useLocalStorage<College[]>("compared_colleges", []);

  // Sync state with localStorage once it finishes reading from client side
  useEffect(() => {
    if (comparedColleges.length > 0) {
      const newSelection: (College | null)[] = [null, null, null];
      comparedColleges.forEach((col, idx) => {
        if (idx < 3) newSelection[idx] = col;
      });
      setSelectedColleges(newSelection);
    }
  }, [comparedColleges]);

  // Load all colleges for autocomplete
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/colleges?limit=100");
        const resData = await res.json();
        if (res.ok && resData.success) {
          setAllColleges(resData.data.colleges);
        } else {
          toast("Failed to load colleges", "error");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to load colleges data", "error");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Update localStorage helper
  const syncStorage = (list: (College | null)[]) => {
    const active = list.filter((c): c is College => c !== null);
    setComparedColleges(active);
  };

  // Handle selecting a college in a slot
  const selectCollege = (slotIndex: number, college: College) => {
    if (selectedColleges.some((c) => c?.id === college.id)) {
      toast("This college is already added to comparison", "error");
      return;
    }

    const updated = [...selectedColleges];
    updated[slotIndex] = college;
    setSelectedColleges(updated);
    syncStorage(updated);
    
    // Reset inputs
    const updatedQueries = [...searchQueries];
    updatedQueries[slotIndex] = "";
    setSearchQueries(updatedQueries);

    const updatedDropdowns = [...showDropdowns];
    updatedDropdowns[slotIndex] = false;
    setShowDropdowns(updatedDropdowns);

    const updatedFocus = [...focusedIndexes];
    updatedFocus[slotIndex] = -1;
    setFocusedIndexes(updatedFocus);

    toast(`${college.name} added`, "success");
  };

  // Remove a college from a slot
  const removeCollege = (slotIndex: number) => {
    const updated = [...selectedColleges];
    updated[slotIndex] = null;
    setSelectedColleges(updated);
    syncStorage(updated);
    toast("College removed from comparison", "info");
  };

  // Filtered colleges for search
  const getFilteredColleges = (query: string) => {
    if (!query) return allColleges.slice(0, 5);
    return allColleges.filter((c) => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.location.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Keyboard navigation for dropdown autocomplete list
  const handleKeyDown = (e: React.KeyboardEvent, slotIndex: number) => {
    const query = searchQueries[slotIndex];
    const filtered = getFilteredColleges(query);
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndexes((prev) => {
        const next = [...prev];
        next[slotIndex] = Math.min(prev[slotIndex] + 1, filtered.length - 1);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndexes((prev) => {
        const next = [...prev];
        next[slotIndex] = Math.max(prev[slotIndex] - 1, 0);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentFocus = focusedIndexes[slotIndex];
      if (currentFocus >= 0 && currentFocus < filtered.length) {
        selectCollege(slotIndex, filtered[currentFocus]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdowns((prev) => {
        const next = [...prev];
        next[slotIndex] = false;
        return next;
      });
      setFocusedIndexes((prev) => {
        const next = [...prev];
        next[slotIndex] = -1;
        return next;
      });
    }
  };

  // Calculate best performers
  const activeColleges = selectedColleges.filter((c): c is College => c !== null);
  const minFee = activeColleges.length > 0 ? Math.min(...activeColleges.map((c) => c.fees)) : 0;
  const maxFeePool = activeColleges.length > 0 ? Math.max(...activeColleges.map((c) => c.fees)) : 1;
  const maxRating = activeColleges.length > 0 ? Math.max(...activeColleges.map((c) => c.rating)) : 0;
  const maxPlacement = activeColleges.length > 0 ? Math.max(...activeColleges.map((c) => c.placementPercentage)) : 0;

  // Calculate best value ROI college ID
  let bestRoiId = "";
  if (activeColleges.length > 1) {
    let maxRoi = -1;
    activeColleges.forEach((c) => {
      const feeTerm = c.fees === 0 ? 1 : c.fees;
      const roi = c.placementPercentage / feeTerm;
      if (roi > maxRoi) {
        maxRoi = roi;
        bestRoiId = c.id;
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <GitCompare className="h-7 w-7 text-indigo-600" />
            Compare Colleges
          </h1>
          <p className="mt-2 text-slate-500">Compare details of up to 3 colleges side-by-side to make the right choice.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeColleges.length > 0 && (
            <div className="relative">
              {isSavingBoard ? (
                <form onSubmit={handleSaveBoard} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-inner animate-slide-in">
                  <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Board name (e.g. My B-Schools)..."
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 text-slate-800"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="px-3 py-1 text-[10px] font-bold cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white">Save</Button>
                  <button type="button" onClick={() => setIsSavingBoard(false)} className="text-xs text-slate-400 hover:text-slate-655 px-1 font-semibold cursor-pointer">Cancel</button>
                </form>
              ) : (
                <Button
                  onClick={() => setIsSavingBoard(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1 font-bold cursor-pointer border-indigo-150 hover:bg-indigo-50/20 text-indigo-755 text-xs px-4.5 py-2.5"
                >
                  Save Comparison Board
                </Button>
              )}
            </div>
          )}
          <Link
            href="/colleges"
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-850 transition-all bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Explorer
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Headers column */}
            <div className="hidden md:flex flex-col bg-slate-50/50 p-6 divide-y divide-slate-100 font-semibold text-slate-500 text-sm">
              <div className="h-64 flex items-center justify-center shrink-0 border-b-0">
                <span className="text-slate-400 uppercase tracking-wider text-xs font-bold">Parameters</span>
              </div>
              <div className="py-6 shrink-0 h-20 flex items-center">Location</div>
              <div className="py-6 shrink-0 h-24 flex items-center">Annual Tuition Fee</div>
              <div className="py-6 shrink-0 h-24 flex items-center">Placement Success</div>
              <div className="py-6 shrink-0 h-24 flex items-center">Average Student Rating</div>
              <div className="py-6 shrink-0 h-44 flex items-start pt-6">Offered Courses</div>
              <div className="py-6 flex-1 flex items-start pt-6">Overview</div>
            </div>

            {/* Selection Slots */}
            {selectedColleges.map((college, idx) => {
              const query = searchQueries[idx];
              const filtered = getFilteredColleges(query);

              return (
                <div key={idx} className="flex flex-col text-slate-700 text-sm transition-all duration-300 hover:bg-slate-50/30 group">
                  {/* Slot Header */}
                  <div className="h-64 p-6 flex flex-col justify-between border-b border-slate-100 shrink-0">
                    {college ? (
                      <div className="h-full flex flex-col justify-between">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3 shrink-0">
                          <Image
                            src={college.imageUrl}
                            alt={college.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <button
                            onClick={() => removeCollege(idx)}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shadow-sm cursor-pointer border border-slate-100"
                            title="Remove selection"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-end">
                          <Link href={`/colleges/${college.id}`}>
                            <h3 className="font-extrabold text-slate-900 leading-tight hover:text-indigo-650 transition-colors line-clamp-2">
                              {college.name}
                            </h3>
                          </Link>
                          {college.id === bestRoiId && (
                            <div className="mt-2 w-fit">
                              <Badge variant="indigo" className="font-black text-[9px] uppercase tracking-wider bg-indigo-600 text-white animate-pulse">
                                ★ Best Value (High ROI)
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-full flex flex-col justify-center border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-2xl p-4 bg-slate-50/50 transition-all duration-300">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200 mb-2">
                          <Plus className="h-5 w-5" />
                        </div>
                        <span className="text-center text-xs font-semibold text-slate-505 mb-4">Add College</span>
                        
                        {/* Selector Search */}
                        <div className="relative">
                          <Input
                            type="text"
                            value={query}
                            onFocus={() => {
                              setShowDropdowns((prev) => {
                                const next = [...prev];
                                next[idx] = true;
                                return next;
                              });
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onChange={(e) => {
                              const updated = [...searchQueries];
                              updated[idx] = e.target.value;
                              setSearchQueries(updated);
                              setFocusedIndexes((prev) => {
                                const next = [...prev];
                                next[idx] = -1;
                                return next;
                              });
                            }}
                            icon={<Search className="h-3.5 w-3.5" />}
                            placeholder="Select college..."
                            className="py-1.5"
                          />
                          
                          {/* Keyboard Accessible Dropdown */}
                          {showDropdowns[idx] && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => {
                                  setShowDropdowns((prev) => {
                                    const next = [...prev];
                                    next[idx] = false;
                                    return next;
                                  });
                                }}
                              />
                              <div className="absolute left-0 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-20">
                                {filtered.length === 0 ? (
                                  <div className="p-2 text-center text-xs text-slate-450">No colleges found</div>
                                ) : (
                                  filtered.map((col, fIdx) => (
                                    <button
                                      key={col.id}
                                      onClick={() => selectCollege(idx, col)}
                                      onMouseEnter={() => {
                                        setFocusedIndexes((prev) => {
                                          const next = [...prev];
                                          next[idx] = fIdx;
                                          return next;
                                        });
                                      }}
                                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                                        focusedIndexes[idx] === fIdx 
                                          ? "bg-indigo-50 text-indigo-750" 
                                          : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                                      }`}
                                    >
                                      <span className="truncate">{col.name}</span>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 ml-2 shrink-0">{col.location}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Matrix parameters data */}
                  
                  {/* Location */}
                  <div className="p-6 h-20 flex items-center border-b border-slate-100">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</span>
                    {college ? (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {college.location}
                      </span>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                  {/* Fees */}
                  <div className={`p-6 h-24 flex flex-col justify-center border-b border-slate-100 transition-colors duration-300 ${
                    college && college.fees === minFee && activeColleges.length > 1
                      ? "bg-gradient-to-r from-emerald-50/20 to-emerald-50/40 border-y border-emerald-100/70" 
                      : ""
                  }`}>
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Fees</span>
                    {college ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-extrabold text-slate-900 flex items-center text-xs">
                            <IndianRupee className="h-3.5 w-3.5 text-slate-650" />
                            {new Intl.NumberFormat("en-IN").format(college.fees)}
                          </span>
                          {college.fees === minFee && activeColleges.length > 1 && (
                            <Badge variant="success">Lowest Fee</Badge>
                          )}
                        </div>
                        {/* Relative Fee Bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-450 to-emerald-550 rounded-full transition-all duration-300"
                            style={{ width: `${(college.fees / maxFeePool) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                  {/* Placements */}
                  <div className={`p-6 h-24 flex flex-col justify-center border-b border-slate-100 transition-colors duration-300 ${
                    college && college.placementPercentage === maxPlacement && activeColleges.length > 1
                      ? "bg-gradient-to-r from-indigo-50/20 to-indigo-50/40 border-y border-indigo-100/70"
                      : ""
                  }`}>
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Placements</span>
                    {college ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-extrabold text-indigo-650 flex items-center gap-1 text-xs">
                            <Trophy className="h-3.5 w-3.5 text-indigo-500" />
                            {college.placementPercentage.toFixed(0)}% Placed
                          </span>
                          {college.placementPercentage === maxPlacement && activeColleges.length > 1 && (
                            <Badge variant="indigo">Best Placed</Badge>
                          )}
                        </div>
                        {/* Placement Bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-550 to-indigo-650 rounded-full transition-all duration-300"
                            style={{ width: `${college.placementPercentage}%` }}
                          />
                        </div>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                  {/* Rating */}
                  <div className={`p-6 h-24 flex flex-col justify-center border-b border-slate-100 transition-colors duration-300 ${
                    college && college.rating === maxRating && activeColleges.length > 1
                      ? "bg-gradient-to-r from-amber-50/20 to-amber-50/40 border-y border-amber-100/70"
                      : ""
                  }`}>
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Rating</span>
                    {college ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-extrabold text-slate-800 flex items-center gap-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {college.rating.toFixed(1)} / 5.0
                          </span>
                          {college.rating === maxRating && activeColleges.length > 1 && (
                            <Badge variant="warning">Top Rated</Badge>
                          )}
                        </div>
                        {/* Rating Bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-450 to-amber-550 rounded-full transition-all duration-300"
                            style={{ width: `${(college.rating / 5.0) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                  {/* Offered Courses list */}
                  <div className="p-6 h-44 flex flex-col border-b border-slate-100 overflow-y-auto">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Offered Courses</span>
                    {college ? (
                      <div className="flex flex-wrap gap-1.5">
                        {college.courses.map((course, idx) => (
                          <Badge key={idx} variant="neutral">{course}</Badge>
                        ))}
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                  {/* Description Overview */}
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Overview</span>
                    {college ? (
                      <p className="text-xs leading-relaxed text-slate-500 italic">
                        &ldquo;{college.description}&rdquo;
                      </p>
                    ) : <span className="text-slate-300">-</span>}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
