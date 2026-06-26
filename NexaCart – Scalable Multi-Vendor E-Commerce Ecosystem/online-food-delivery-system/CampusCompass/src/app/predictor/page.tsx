"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  Compass, Search, GraduationCap, CheckCircle, ShieldAlert, Award, Star, 
  ArrowRight, Loader2, Sparkles, MapPin, IndianRupee, HelpCircle, Activity 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { College } from "@/types";
import { predictAdmission, PredictionResult, HISTORICAL_CUTOFFS } from "@/lib/predictor";
import { calculateMatchScore, DEFAULT_PREFERENCES, UserPreferences } from "@/lib/matchScore";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PredictionWithMatch extends PredictionResult {
  matchScore: number;
}

const SIMULATION_EXAMPLES = [
  { examType: "JEE Main", score: "1500", label: "JEE Main AIR 1,500", category: "Engineering" },
  { examType: "CAT", score: "98.8", label: "CAT 98.8 Percentile", category: "Management" },
  { examType: "NEET", score: "620", label: "NEET AIR 620", category: "Medical" },
  { examType: "GATE", score: "810", label: "GATE 810 Score", category: "M.Tech" },
];

const POPULAR_CUTOFFS = [
  { name: "IIT Bombay", exam: "JEE Main", cutoff: "1 - 400" },
  { name: "IIM Bangalore", exam: "CAT", cutoff: "99.5%+" },
  { name: "AIIMS Delhi", exam: "NEET", cutoff: "1 - 80" },
  { name: "FMS Delhi", exam: "CAT", cutoff: "98.2%+" },
];

function ProbabilityGauge({ probability }: { probability: string }) {
  const colors = {
    Safe: { stroke: "#10b981", text: "text-emerald-650 bg-emerald-50 border-emerald-100", percentage: 95 },
    Target: { stroke: "#f59e0b", text: "text-amber-650 bg-amber-50 border-amber-100", percentage: 75 },
    Dream: { stroke: "#8b5cf6", text: "text-purple-650 bg-purple-50 border-purple-100", percentage: 50 },
    Unlikely: { stroke: "#ef4444", text: "text-rose-605 bg-rose-50 border-rose-100", percentage: 20 },
  };

  const current = colors[probability as keyof typeof colors] || colors.Unlikely;
  const radius = 26;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - current.percentage / 100);

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle 
          cx="32" 
          cy="32" 
          r={radius} 
          className="stroke-slate-100 fill-transparent" 
          strokeWidth={stroke} 
        />
        <circle 
          cx="32" 
          cy="32" 
          r={radius} 
          className="fill-transparent transition-all duration-700 ease-out" 
          stroke={current.stroke}
          strokeWidth={stroke} 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[7px] uppercase font-bold text-slate-400">Admit</span>
        <span className={`text-[10px] font-black tracking-tight px-1 rounded ${current.text.split(' ')[0]}`}>
          {probability}
        </span>
      </div>
    </div>
  );
}

function MatchScoreRing({ score }: { score: number }) {
  const radius = 26;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle 
          cx="32" 
          cy="32" 
          r={radius} 
          className="stroke-slate-100 fill-transparent" 
          strokeWidth={stroke} 
        />
        <circle 
          cx="32" 
          cy="32" 
          r={radius} 
          className="stroke-indigo-600 fill-transparent transition-all duration-700 ease-out" 
          strokeWidth={stroke} 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xs font-black text-slate-850">{score}%</span>
        <span className="text-[7px] uppercase font-bold text-slate-450">Match</span>
      </div>
    </div>
  );
}

export default function PredictorPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  
  // Form params
  const [examType, setExamType] = useState("JEE Main");
  const [score, setScore] = useState("");
  
  // Results
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
  const [hasPredicted, setHasPredicted] = useState(false);

  // Sync preferences
  const [preferences] = useLocalStorage<UserPreferences>("user_preferences", DEFAULT_PREFERENCES);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load all colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch("/api/colleges?limit=100");
        const resData = await res.json();
        if (res.ok && resData.success) {
          setColleges(resData.data.colleges);
        } else {
          toast("Failed to load college cutoff data", "error");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to connect to colleges service", "error");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, [toast]);

  const runPrediction = (exam: string, rawScore: string) => {
    const scoreNum = parseFloat(rawScore);
    if (isNaN(scoreNum) || scoreNum <= 0) {
      toast("Please enter a valid rank, score, or percentile", "error");
      return;
    }

    if (exam === "CAT" && (scoreNum > 100 || scoreNum < 0)) {
      toast("CAT Percentile must be between 0 and 100", "error");
      return;
    }

    if (exam === "GATE" && scoreNum > 1000) {
      toast("GATE Score cannot exceed 1000", "error");
      return;
    }

    const results = predictAdmission(colleges, exam, scoreNum);
    
    // Map with dynamic Match Scores
    const resultsWithMatch = results.map((res) => {
      const fullCollege = colleges.find((c) => c.id === res.collegeId);
      const matchScore = fullCollege 
        ? calculateMatchScore(fullCollege, preferences || DEFAULT_PREFERENCES)
        : 80;
      return {
        ...res,
        matchScore,
      };
    });

    setPredictions(resultsWithMatch);
    setHasPredicted(true);

    if (session?.user) {
      fetch("/api/predictor/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType: exam, score: scoreNum }),
      }).catch((err) => console.error("Failed to store predictor query:", err));
    }

    toast("Cutoff logic simulation completed!", "success");
  };

  const handlePredictForm = (e: React.FormEvent) => {
    e.preventDefault();
    runPrediction(examType, score);
  };

  const handleQuickTry = (exam: string, scoreVal: string) => {
    setExamType(exam);
    setScore(scoreVal);
    runPrediction(exam, scoreVal);
  };

  const getChartData = () => {
    return predictions.slice(0, 4).map((res) => {
      const cutoffs = HISTORICAL_CUTOFFS[res.collegeName];
      const maxCutoff = cutoffs?.[examType]?.max || 0;
      return {
        name: res.collegeName
          .replace(/Indian Institute of Technology|Indian Institute of Management|All India Institute of Medical Sciences|National Institute of Technology/g, (m) => {
            if (m.includes("Technology")) return "IIT";
            if (m.includes("Management")) return "IIM";
            if (m.includes("Medical")) return "AIIMS";
            return "NIT";
          })
          .split(',')[0].trim(),
        "Closing Cutoff": maxCutoff,
        "Your Score/Rank": parseFloat(score),
      };
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Premium Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            AI-Powered Admission Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Smart College <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Predictor</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            Simulate your admission chances across engineering, management, and medical campuses. Our engine maps your scores against historical closing bounds combined with your personalized preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Form Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-slate-200 bg-white shadow-md h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-indigo-650 animate-spin-slow" />
                Parameters
              </h3>
              
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                AI ACTIVE
              </div>
            </div>

            {loadingColleges ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-450 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="text-xs font-bold">Syncing cutoffs database...</span>
              </div>
            ) : (
              <form onSubmit={handlePredictForm} className="space-y-5">
                {/* Exam type select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">Entrance Exam</label>
                  <select
                    value={examType}
                    onChange={(e) => {
                      setExamType(e.target.value);
                      setScore("");
                      setHasPredicted(false);
                    }}
                    className="block w-full rounded-xl border border-slate-250 bg-white py-2.5 px-3.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="JEE Main">JEE Main (B.Tech)</option>
                    <option value="CAT">CAT (MBA)</option>
                    <option value="NEET">NEET (MBBS)</option>
                    <option value="GATE">GATE (M.Tech)</option>
                  </select>
                </div>

                {/* Score input */}
                <div>
                  <Input
                    label={
                      examType === "CAT"
                        ? "Percentile (%)"
                        : examType === "GATE"
                        ? "GATE Score (out of 1000)"
                        : "All India Rank (AIR)"
                    }
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={
                      examType === "CAT"
                        ? "e.g., 98.8"
                        : examType === "GATE"
                        ? "e.g., 780"
                        : "e.g., 1450"
                    }
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {examType === "JEE Main" || examType === "NEET"
                      ? "Note: A lower rank (like AIR 100) indicates a stronger competitive result."
                      : "Note: A higher percentile/score represents a stronger result."}
                  </p>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold cursor-pointer transition-all"
                >
                  Analyze Cutoffs & Predict
                </Button>
              </form>
            )}

            {/* AI Engine Info Box */}
            <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Activity className="h-4 w-4 text-indigo-600" />
                AI Prediction Insights
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                Our recommendation engine uses historical median and closing cutoffs. Confidence levels scale according to standard distribution patterns relative to exam variance.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {!hasPredicted ? (
            /* Redesigned Initial Panel with Interactive Slices */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md space-y-8 min-h-[450px] flex flex-col justify-between">
              
              {/* Headings */}
              <div className="text-center max-w-md mx-auto space-y-2 pt-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <GraduationCap className="h-7 w-7 text-indigo-650" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Configure Parameters</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your entrance details to the left, or try one of the instant simulation templates below.
                </p>
              </div>

              {/* Simulation Quick Try Buttons */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider text-center">
                  Quick Simulation Templates
                </h4>
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {SIMULATION_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => handleQuickTry(ex.examType, ex.score)}
                      disabled={loadingColleges}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/20 hover:border-indigo-100 text-left transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                        {ex.category}
                      </span>
                      <span className="text-xs font-bold text-slate-800 mt-1 block group-hover:text-slate-950">
                        {ex.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* popular Cutoffs Reference list */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center mb-3">
                  Historical Admission Benchmarks
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {POPULAR_CUTOFFS.map((col) => (
                    <div key={col.name} className="p-2 rounded-lg bg-slate-50/60 border border-slate-100">
                      <span className="font-bold text-slate-800 block truncate">{col.name}</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">{col.exam}: {col.cutoff}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : predictions.length === 0 ? (
            /* No matches found state */
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl text-center min-h-[400px]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert className="h-7 w-7 text-rose-650" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No predictions matched</h3>
              <p className="mt-2 text-xs text-slate-500 max-w-sm leading-relaxed">
                We couldn't find any institutions in our database accepting {examType} with cutoffs matching your score. Try adjusting the parameters.
              </p>
            </div>
          ) : (
            /* Results Panel */
            <div className="space-y-6">
              
              {/* Chart & Recharts Integration */}
              {isMounted && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Left Chart Panel */}
                  <div className="sm:col-span-2 min-w-0 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-indigo-650" />
                      Cutoff Comparison
                    </h4>
                    <div className="h-56 w-full min-w-0 relative">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} />
                          <Bar dataKey="Closing Cutoff" fill="#e2e8f0" radius={[3, 3, 0, 0]} barSize={16} />
                          <Bar dataKey="Your Score/Rank" fill="#4f46e5" radius={[3, 3, 0, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Overall Stats Gauge Panel */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between items-center text-center">
                    <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Overall Forecast</span>
                    
                    <div className="my-2">
                      <ProbabilityGauge probability={predictions[0].probability} />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800">
                        Top Chance: {predictions[0].probability}
                      </span>
                      <p className="text-[10px] text-slate-450 leading-tight">
                        Model predicts a peak confidence of {predictions[0].confidenceScore}% for your best match.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Predicted Recommendations
              </h3>

              {/* Grid of Results */}
              <div className="grid grid-cols-1 gap-6">
                {predictions.map((res) => (
                  <div
                    key={res.collegeId}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center gap-6"
                  >
                    {/* Ring Meters */}
                    <div className="flex gap-4 shrink-0 justify-center w-full md:w-auto pt-2 md:pt-0">
                      <ProbabilityGauge probability={res.probability} />
                      <MatchScoreRing score={res.matchScore} />
                    </div>

                    {/* Mid Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{res.location}</span>
                        <span className="text-slate-200">&bull;</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Fees: {formatCurrency(res.fees)}/Yr
                        </span>
                      </div>
                      
                      <Link href={`/colleges/${res.collegeId}`}>
                        <h4 className="text-base font-bold text-slate-900 hover:text-indigo-650 transition-colors leading-tight">
                          {res.collegeName}
                        </h4>
                      </Link>
                      
                      <p className="text-xs leading-relaxed text-slate-500 mt-2 font-medium">
                        {res.explanation}
                      </p>
                    </div>

                    {/* Confidence Meter Slider */}
                    <div className="md:w-32 text-center shrink-0 w-full pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col items-center gap-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Confidence</span>
                      <span className="text-base font-black text-indigo-600">{res.confidenceScore}%</span>
                      <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                          style={{ width: `${res.confidenceScore}%` }}
                        />
                      </div>
                      <Link
                        href={`/colleges/${res.collegeId}`}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 underline mt-2 block"
                      >
                        Explore Campus
                      </Link>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
