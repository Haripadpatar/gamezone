"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface RecentlyViewedTrackerProps {
  collegeId: string;
}

export default function RecentlyViewedTracker({ collegeId }: RecentlyViewedTrackerProps) {
  const [, setRecentlyViewed] = useLocalStorage<string[]>("recently_viewed", []);

  useEffect(() => {
    setRecentlyViewed((prev) => {
      // Ensure prev is an array, remove duplicate of current ID, prepend, and slice to last 4 entries
      const list = Array.isArray(prev) ? prev : [];
      const filtered = list.filter((id) => id !== collegeId);
      return [collegeId, ...filtered].slice(0, 4);
    });
  }, [collegeId, setRecentlyViewed]);

  return null;
}
