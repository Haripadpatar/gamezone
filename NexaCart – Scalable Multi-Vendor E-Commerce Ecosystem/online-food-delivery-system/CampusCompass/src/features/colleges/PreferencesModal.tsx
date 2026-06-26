"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/lib/matchScore";
import { formatCurrency } from "@/lib/utils";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (prefs: UserPreferences) => void;
}

export default function PreferencesModal({ isOpen, onClose, onSave }: PreferencesModalProps) {
  const [storedPrefs, setStoredPrefs] = useLocalStorage<UserPreferences>(
    "user_preferences",
    DEFAULT_PREFERENCES
  );

  const [maxFee, setMaxFee] = useState(DEFAULT_PREFERENCES.maxFee);
  const [location, setLocation] = useState(DEFAULT_PREFERENCES.location);
  const [courseCategory, setCourseCategory] = useState(DEFAULT_PREFERENCES.courseCategory);
  const [importanceFees, setImportanceFees] = useState(DEFAULT_PREFERENCES.importanceFees);
  const [importancePlacement, setImportancePlacement] = useState(DEFAULT_PREFERENCES.importancePlacement);
  const [importanceRating, setImportanceRating] = useState(DEFAULT_PREFERENCES.importanceRating);

  // Sync state when preferences are loaded or modal opens
  useEffect(() => {
    if (isOpen && storedPrefs) {
      setMaxFee(storedPrefs.maxFee ?? DEFAULT_PREFERENCES.maxFee);
      setLocation(storedPrefs.location ?? DEFAULT_PREFERENCES.location);
      setCourseCategory(storedPrefs.courseCategory ?? DEFAULT_PREFERENCES.courseCategory);
      setImportanceFees(storedPrefs.importanceFees ?? DEFAULT_PREFERENCES.importanceFees);
      setImportancePlacement(storedPrefs.importancePlacement ?? DEFAULT_PREFERENCES.importancePlacement);
      setImportanceRating(storedPrefs.importanceRating ?? DEFAULT_PREFERENCES.importanceRating);
    }
  }, [isOpen, storedPrefs]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newPrefs: UserPreferences = {
      maxFee,
      location,
      courseCategory,
      importanceFees,
      importancePlacement,
      importanceRating,
    };
    setStoredPrefs(newPrefs);
    if (onSave) onSave(newPrefs);
    onClose();
  };

  const locations = ["All", "Mumbai", "Bangalore", "Delhi", "Pune", "Pilani", "Vellore", "Trichy"];
  const categories = [
    { value: "All", label: "Any Course" },
    { value: "Engineering", label: "Engineering (B.Tech / M.Tech)" },
    { value: "Management", label: "Business / MBA" },
    { value: "Medical", label: "Medical / MBBS" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-100">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Match Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize how we calculate your college match scores.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
          {/* Targets */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-650">Admission Targets</h4>
            
            {/* Course Interest */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Course Interest</label>
              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Preferred Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Budget Slider */}
            <div>
              <Slider
                label="Maximum Annual Budget"
                valueLabel={formatCurrency(maxFee)}
                min="50000"
                max="1500000"
                step="50000"
                value={maxFee}
                onChange={(e) => setMaxFee(parseInt(e.target.value))}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Metric Importance Weights */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-650">Score Priorities</h4>
              <div className="group relative">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-48 rounded-lg bg-slate-900 p-2 text-[10px] text-white shadow-md group-hover:block z-10 leading-normal">
                  Adjust sliders to place higher importance on fees, placements, or ratings during matching.
                </div>
              </div>
            </div>

            {/* Fees Importance */}
            <div>
              <Slider
                label="Importance of Lower Fees"
                valueLabel={`${importanceFees}/5`}
                min="1"
                max="5"
                step="1"
                value={importanceFees}
                onChange={(e) => setImportanceFees(parseInt(e.target.value))}
              />
            </div>

            {/* Placement Importance */}
            <div>
              <Slider
                label="Importance of Placements"
                valueLabel={`${importancePlacement}/5`}
                min="1"
                max="5"
                step="1"
                value={importancePlacement}
                onChange={(e) => setImportancePlacement(parseInt(e.target.value))}
              />
            </div>

            {/* Rating Importance */}
            <div>
              <Slider
                label="Importance of Student Ratings"
                valueLabel={`${importanceRating}/5`}
                min="1"
                max="5"
                step="1"
                value={importanceRating}
                onChange={(e) => setImportanceRating(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="cursor-pointer font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            className="cursor-pointer font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Apply & Save
          </Button>
        </div>
      </div>
    </div>
  );
}
