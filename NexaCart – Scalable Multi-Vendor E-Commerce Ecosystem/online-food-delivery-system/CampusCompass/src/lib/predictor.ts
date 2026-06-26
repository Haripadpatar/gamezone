import { College } from "@/types";

export interface PredictionResult {
  collegeId: string;
  collegeName: string;
  location: string;
  fees: number;
  imageUrl: string;
  rating: number;
  placementPercentage: number;
  probability: "Safe" | "Target" | "Dream" | "Unlikely";
  confidenceScore: number;
  explanation: string;
}

// Cutoff criteria database for JEE Main, CAT, NEET, GATE
interface CutoffMap {
  [collegeName: string]: {
    [examType: string]: {
      min: number; // Best/median cutoff (e.g. higher score, lower rank)
      max: number; // Closing cutoff
    };
  };
}

// Low ranks are better for JEE Main and NEET. Higher scores/percentiles are better for CAT and GATE.
export const HISTORICAL_CUTOFFS: CutoffMap = {
  "Indian Institute of Technology (IIT), Bombay": {
    "JEE Main": { min: 1, max: 400 },
    "GATE": { min: 820, max: 950 },
  },
  "Indian Institute of Management (IIM), Bangalore": {
    "CAT": { min: 99.5, max: 99.98 },
  },
  "All India Institute of Medical Sciences (AIIMS), Delhi": {
    "NEET": { min: 1, max: 80 },
  },
  "Birla Institute of Technology and Science (BITS), Pilani": {
    "JEE Main": { min: 400, max: 3200 },
  },
  "Delhi Technological University (DTU)": {
    "JEE Main": { min: 1200, max: 10000 },
  },
  "Symbiosis Institute of Business Management (SIBM), Pune": {
    "CAT": { min: 96.0, max: 98.5 },
  },
  "Christian Medical College (CMC), Vellore": {
    "NEET": { min: 80, max: 850 },
  },
  "National Institute of Technology (NIT), Trichy": {
    "JEE Main": { min: 500, max: 4500 },
  },
  "Faculty of Management Studies (FMS), Delhi": {
    "CAT": { min: 98.2, max: 99.6 },
  },
  "Armed Forces Medical College (AFMC), Pune": {
    "NEET": { min: 100, max: 1200 },
  },
};

export function predictAdmission(colleges: College[], examType: string, score: number): PredictionResult[] {
  const results: PredictionResult[] = [];

  for (const college of colleges) {
    const cutoffs = HISTORICAL_CUTOFFS[college.name];
    if (!cutoffs || !cutoffs[examType]) continue; // College does not accept this exam

    const { min, max } = cutoffs[examType];
    let probability: "Safe" | "Target" | "Dream" | "Unlikely" = "Unlikely";
    let confidenceScore = 0;
    let explanation = "";

    // Calculation logic based on exam metric
    if (examType === "JEE Main" || examType === "NEET") {
      // Lower ranks are better
      const rank = score;

      if (rank <= min) {
        probability = "Safe";
        confidenceScore = Math.round(95 + (1 - rank / min) * 4); // 95% - 99%
        explanation = `Your rank of ${rank} is exceptionally competitive, placing you well ahead of the historical median cutoff of ${min} for ${college.name}. Admission is highly probable.`;
      } else if (rank <= max) {
        probability = "Target";
        const range = max - min;
        const progress = (max - rank) / range;
        confidenceScore = Math.round(70 + progress * 24); // 70% - 94%
        explanation = `Your rank of ${rank} sits comfortably within the typical historical closing rank threshold of ${max} for this campus. Good chance of selection.`;
      } else if (rank <= max * 1.35) {
        probability = "Dream";
        const margin = max * 0.35;
        const progress = (max * 1.35 - rank) / margin;
        confidenceScore = Math.round(40 + progress * 29); // 40% - 69%
        explanation = `Your rank of ${rank} is slightly above the typical closing cutoff of ${max}. While admissions will be borderline, you stand a reasonable chance through subsequent counseling rounds.`;
      } else {
        probability = "Unlikely";
        confidenceScore = Math.max(10, Math.round(35 - ((rank - max * 1.35) / max) * 20)); // 10% - 39%
        explanation = `Your rank is significantly beyond the typical historical cutoff of ${max}. We suggest looking at target or safe institutions.`;
      }
    } else if (examType === "CAT") {
      // Higher percentiles are better
      const percentile = score;

      if (percentile >= max) {
        probability = "Safe";
        confidenceScore = Math.round(96 + ((percentile - max) / (100 - max)) * 3); // 96% - 99%
        explanation = `Your percentile of ${percentile}% is stellar, putting you at or above the typical top-percentile threshold of ${max}% for admissions.`;
      } else if (percentile >= min) {
        probability = "Target";
        const range = max - min;
        const progress = (percentile - min) / range;
        confidenceScore = Math.round(75 + progress * 20); // 75% - 95%
        explanation = `Your percentile of ${percentile}% matches the historical cutoff requirements (${min}% - ${max}%) for shortlisting. Highly competitive.`;
      } else if (percentile >= min - 1.5) {
        probability = "Dream";
        const progress = (percentile - (min - 1.5)) / 1.5;
        confidenceScore = Math.round(45 + progress * 29); // 45% - 74%
        explanation = `Your percentile of ${percentile}% is just below the typical cutoff of ${min}%. Admission is borderline but achievable, potentially depending on profile highlights or later shortlists.`;
      } else {
        probability = "Unlikely";
        confidenceScore = Math.max(10, Math.round(30 - (min - 1.5 - percentile) * 10));
        explanation = `Your percentile is below the required baseline threshold of ${min}% for shortlisting at this campus.`;
      }
    } else if (examType === "GATE") {
      // Higher scores are better (typical GATE scores out of 1000)
      const gateScore = score;

      if (gateScore >= max) {
        probability = "Safe";
        confidenceScore = Math.round(92 + Math.min(7, ((gateScore - max) / 100) * 7));
        explanation = `Your GATE score of ${gateScore} is above the top historical closing score of ${max}, making this a safe target for your M.Tech admissions.`;
      } else if (gateScore >= min) {
        probability = "Target";
        const range = max - min;
        const progress = (gateScore - min) / range;
        confidenceScore = Math.round(70 + progress * 21);
        explanation = `Your score of ${gateScore} is firmly inside the typical cutoff bracket of ${min} - ${max} for admissions.`;
      } else if (gateScore >= min - 80) {
        probability = "Dream";
        const progress = (gateScore - (min - 80)) / 80;
        confidenceScore = Math.round(40 + progress * 29);
        explanation = `Your score of ${gateScore} is slightly below the standard cutoff of ${min}. You may secure admission during spot rounds or through specialized category quotas.`;
      } else {
        probability = "Unlikely";
        confidenceScore = Math.max(10, Math.round(30 - ((min - 80 - gateScore) / 100) * 10));
        explanation = `Your GATE score of ${gateScore} is below the baseline historical threshold of ${min - 80} for shortlists.`;
      }
    }

    results.push({
      collegeId: college.id,
      collegeName: college.name,
      location: college.location,
      fees: college.fees,
      imageUrl: college.imageUrl,
      rating: college.rating,
      placementPercentage: college.placementPercentage,
      probability,
      confidenceScore,
      explanation,
    });
  }

  // Sort results by probability safety and confidence score descending
  const probWeight = { Safe: 4, Target: 3, Dream: 2, Unlikely: 1 };
  return results.sort((a, b) => {
    if (probWeight[a.probability] !== probWeight[b.probability]) {
      return probWeight[b.probability] - probWeight[a.probability];
    }
    return b.confidenceScore - a.confidenceScore;
  });
}
