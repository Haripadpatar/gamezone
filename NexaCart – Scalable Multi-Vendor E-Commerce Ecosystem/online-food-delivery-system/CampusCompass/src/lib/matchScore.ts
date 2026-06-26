import { College } from "@/types";

export interface UserPreferences {
  maxFee: number;
  location: string;
  courseCategory: string; // "Engineering" | "Management" | "Medical" | "All"
  importanceFees: number; // 1 to 5
  importancePlacement: number; // 1 to 5
  importanceRating: number; // 1 to 5
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  maxFee: 1200000,
  location: "All",
  courseCategory: "All",
  importanceFees: 3,
  importancePlacement: 4,
  importanceRating: 4,
};

// Check if college offers courses matching preference category
function getCategoryMatch(courses: string[], category: string): number {
  if (!category || category === "All") return 100;

  const catLower = category.toLowerCase();
  
  // Basic keywords mapping
  const matches = courses.some(course => {
    const cLower = course.toLowerCase();
    if (catLower === "engineering") {
      return cLower.includes("b.tech") || cLower.includes("b.e.") || cLower.includes("m.tech");
    }
    if (catLower === "management" || catLower === "business") {
      return cLower.includes("mba") || cLower.includes("pgp") || cLower.includes("management");
    }
    if (catLower === "medical" || catLower === "medicine") {
      return cLower.includes("mbbs") || cLower.includes("md ") || cLower.includes("ms ") || cLower.includes("nursing") || cLower.includes("pediatrics");
    }
    return false;
  });

  return matches ? 100 : 20;
}

export function calculateMatchScore(college: College, prefs: UserPreferences): number {
  // 1. Fees Score (lower is better, compare with max preferred fee)
  let feeScore = 100;
  if (college.fees > prefs.maxFee) {
    // Drop score linearly up to 2x the max fee
    const diff = college.fees - prefs.maxFee;
    feeScore = Math.max(0, 100 - (diff / prefs.maxFee) * 100);
  } else {
    // Bonus for being cheaper than target
    const savingRatio = (prefs.maxFee - college.fees) / prefs.maxFee;
    feeScore = Math.min(100, 80 + savingRatio * 20);
  }

  // 2. Location Score
  let locationScore = 100;
  if (prefs.location !== "All" && college.location.toLowerCase() !== prefs.location.toLowerCase()) {
    locationScore = 30; // Not 0 because they might relocate
  }

  // 3. Course/Category Score
  const categoryScore = getCategoryMatch(college.courses, prefs.courseCategory);

  // 4. Rating Score (out of 5)
  const ratingScore = (college.rating / 5.0) * 100;

  // 5. Placement Score (percentage is already 0-100)
  const placementScore = college.placementPercentage;

  // Calculate Weighted Average
  const wFees = prefs.importanceFees;
  const wPlacement = prefs.importancePlacement;
  const wRating = prefs.importanceRating;
  const wLocation = 2; // Constant baseline weight
  const wCategory = 4; // Higher baseline weight for major course interests

  const totalWeight = wFees + wPlacement + wRating + wLocation + wCategory;
  const weightedSum = 
    (feeScore * wFees) +
    (placementScore * wPlacement) +
    (ratingScore * wRating) +
    (locationScore * wLocation) +
    (categoryScore * wCategory);

  return Math.round(weightedSum / totalWeight);
}
