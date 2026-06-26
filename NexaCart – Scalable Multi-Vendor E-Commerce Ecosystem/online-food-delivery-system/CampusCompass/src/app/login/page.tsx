"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { Compass, Mail, Lock, Loader2, Sparkles, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { loginSchema } from "@/features/auth/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast(result.error, "error");
        setLoading(false);
      } else {
        toast("Logged in successfully!", "success");
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast("An unexpected error occurred. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      
      {/* Left Panel: Clean, High-End SaaS Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12 lg:px-20 z-10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="mx-auto w-full max-w-sm space-y-8 relative z-10">
          {/* Logo & Branding */}
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Sign in to CampusCompass
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Or{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all inline-flex items-center gap-0.5">
                create a new account <ArrowRight className="h-3 w-3 inline" />
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5 relative">
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`block w-full rounded-xl border bg-slate-900/50 text-slate-100 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${
                    errors.email ? "border-rose-500" : "border-white/[0.08]"
                  }`}
                  placeholder="name@example.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                {isEmailValid && (
                  <div className="absolute inset-y-0 right-3.5 flex items-center text-emerald-400">
                    <CheckCircle className="h-4 w-4 fill-emerald-500/10" />
                  </div>
                )}
              </div>
              {errors.email && (
                <span className="text-[10px] font-bold text-rose-400 block">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-xl border bg-slate-900/50 text-slate-100 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${
                    errors.password ? "border-rose-500" : "border-white/[0.08]"
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
              </div>
              {errors.password && (
                <span className="text-[10px] font-bold text-rose-400 block">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Sign In
            </Button>
          </form>

          {/* Bottom Security Info */}
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-500 font-semibold pt-4">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <span>Secure encryption & session management active.</span>
          </div>
        </div>
      </div>

      {/* Right Panel: College-Themed Illustration Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden border-l border-white/[0.04]">
        {/* Background Image of a Campus */}
        <Image
          src="/images/colleges/engineering.png"
          alt="Campus Library and Grounds"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-35 filter brightness-95"
          priority
        />
        
        {/* Sleek Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/35 to-transparent z-10" />

        {/* Content Box */}
        <div className="relative z-20 flex flex-col justify-end p-16 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            AI Match System Active
          </div>
          
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-white leading-tight">
              Discover your ideal campus, cutoffs, and placements.
            </h3>
            <p className="text-sm text-slate-350 leading-relaxed font-semibold">
              CampusCompass provides candidates with dynamic cutoff calculators, return on investment analytics, and visual ROI matrix comparisons.
            </p>
          </div>

          {/* floating Stats Pill Badges */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average ROI</span>
              <span className="text-lg font-black text-indigo-400 mt-0.5 block">High Yield</span>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Match Score</span>
              <span className="text-lg font-black text-indigo-400 mt-0.5 block">Personalized</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
