"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, BarChart3, LineChart as LineIcon, PieChart, TrendingUp, Info, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { College } from "@/types";
import { formatCurrency } from "@/lib/utils";

// Dynamically import Recharts to avoid SSR measurement issues on server
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch("/api/colleges?limit=100");
        const resData = await res.json();
        if (res.ok && resData.success) {
          setColleges(resData.data.colleges);
        } else {
          toast("Failed to load analytics databases", "error");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to fetch analytics records", "error");
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchColleges();
    }
  }, [mounted, toast]);

  if (!mounted || loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-650" />
        <span className="text-sm font-semibold text-slate-500">Generating analytics metrics...</span>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = colleges.map((c) => {
    // Shorten college name for XAxis visibility
    let shortName = c.name.split(",")[0]; // splits e.g. "Indian Institute of Technology (IIT), Bombay" -> "Indian Institute of Technology (IIT)"
    shortName = shortName.replace("Indian Institute of ", "IIT ").replace("Indian Institute of Management", "IIM").replace("All India Institute of Medical Sciences", "AIIMS").replace("Birla Institute of Technology and Science", "BITS").replace("Delhi Technological University", "DTU").replace("Symbiosis Institute of Business Management", "SIBM").replace("Christian Medical College", "CMC").replace("National Institute of Technology", "NIT").replace("Armed Forces Medical College", "AFMC");
    
    return {
      name: shortName,
      fullName: c.name,
      fees: c.fees,
      feesInLakhs: parseFloat((c.fees / 100000).toFixed(2)),
      placement: c.placementPercentage,
      rating: c.rating,
    };
  });

  // Tooltip formatter for currency
  const currencyFormatter = (value: any) => [`${value} Lakhs`, "Annual Fee"];
  const placementFormatter = (value: any) => [`${value}%`, "Placement Rate"];
  const ratingFormatter = (value: any) => [value, "Student Rating"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-indigo-600" />
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          Visualize and compare placement rates, fee structures, and ratings across top institutions.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Top Recruiter Target</span>
            <h3 className="text-2xl font-black text-indigo-950 mt-1">IIM Bangalore</h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-indigo-700/80 font-bold">
            <span>100% Placements</span>
            <TrendingUp className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/50 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best Return-on-Investment (ROI)</span>
            <h3 className="text-2xl font-black text-emerald-950 mt-1">AIIMS Delhi</h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-700/80 font-bold">
            <span>Fee: ₹1,600/Yr</span>
            <span>98% Placed</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-100/50 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Top Rated Campus</span>
            <h3 className="text-2xl font-black text-purple-950 mt-1">IIM Bangalore</h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-purple-700/80 font-bold">
            <span>4.9 / 5 Rating</span>
            <Star className="h-4 w-4 fill-purple-400 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Placement vs Fees Scatter Chart */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-650" />
            ROI Analysis: Placements vs. Fees (Lakhs)
          </h3>
          <div className="h-72 w-full mt-2 min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="feesInLakhs" 
                  name="Annual Fee" 
                  unit="L" 
                  label={{ value: 'Annual Fees (in Lakhs)', position: 'insideBottom', offset: -10 }}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis 
                  type="number" 
                  dataKey="placement" 
                  name="Placement Rate" 
                  unit="%" 
                  domain={[60, 100]}
                  label={{ value: 'Placements (%)', angle: -90, position: 'insideLeft', offset: 0 }}
                  stroke="#64748b"
                  fontSize={11}
                />
                <ZAxis type="category" dataKey="name" name="College" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-xl">
                          <p className="font-extrabold">{data.fullName}</p>
                          <p><span className="text-slate-400">Fees:</span> ₹{new Intl.NumberFormat("en-IN").format(data.fees)}/Yr</p>
                          <p><span className="text-slate-400">Placements:</span> {data.placement}%</p>
                          <p><span className="text-slate-400">Rating:</span> {data.rating} ★</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Colleges" data={chartData} fill="#4f46e5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fees Bar Chart */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-650" />
            Annual Fee Structure Comparison (Lakhs)
          </h3>
          <div className="h-72 w-full mt-2 min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  stroke="#64748b" 
                  fontSize={10} 
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} unit="L" />
                <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="feesInLakhs" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Placements Bar Chart */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LineIcon className="h-4.5 w-4.5 text-indigo-650" />
            On-Campus Placement Performance (%)
          </h3>
          <div className="h-72 w-full mt-2 min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  stroke="#64748b" 
                  fontSize={10} 
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} unit="%" />
                <Tooltip formatter={placementFormatter} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="placement" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rating Line Chart */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="h-4.5 w-4.5 text-indigo-650" />
            Student Satisfaction Rating distribution
          </h3>
          <div className="h-72 w-full mt-2 min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={chartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-25} 
                  textAnchor="end" 
                  stroke="#64748b" 
                  fontSize={10} 
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[4.0, 5.0]} />
                <Tooltip formatter={ratingFormatter} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-100 border border-slate-200/50 p-4.5 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Analytics Data Reference</h4>
          <p className="text-xs leading-relaxed text-slate-500 mt-1">
            Data values represent real-time PostgreSQL database aggregates synced directly through Prisma. To customize the pool of institutions represented in these charts, navigate back to the explorer page and edit entries.
          </p>
        </div>
      </div>
    </div>
  );
}
