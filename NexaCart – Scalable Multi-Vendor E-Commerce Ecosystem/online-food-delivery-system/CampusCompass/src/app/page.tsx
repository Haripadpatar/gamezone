import Link from "next/link";
import prisma from "@/lib/db";
import { Compass, BookOpen, GitCompare, Bookmark, ArrowRight, Star, GraduationCap, MapPin, IndianRupee } from "lucide-react";
import Image from "next/image";
import { College } from "@prisma/client";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // Fetch top 3 colleges based on ratings
  let featuredColleges: College[] = [];
  try {
    featuredColleges = await prisma.college.findMany({
      take: 3,
      orderBy: { rating: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch featured colleges for landing page:", error);
  }

  return (
    <div className="relative isolate overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-200 to-indigo-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero section */}
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="text-center">
          <div className="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4" />
            <span>Empowering Student Decisions</span>
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-[1.15]">
            Find Your Path. Discover Your <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">Future College</span>.
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            CampusCompass is a premium platform to explore top-tier universities, compare fees, placement statistics, and browse genuine student reviews.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/colleges"
              className="group flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-200 hover:translate-x-0.5"
            >
              Explore Colleges
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/compare"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Compare Colleges
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Comprehensive Search</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Search engineering, business, and medical colleges by location, rating, and fee structures.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <GitCompare className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Side-by-Side Comparison</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Compare up to 3 colleges simultaneously across placement rates, annual fees, locations, and courses.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Personalized Dashboard</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Save your favorite campuses to a personal shortlist. Access it anytime to compare or remove colleges.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Colleges Section */}
      {featuredColleges.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Top Rated Colleges</h2>
              <p className="mt-2 text-slate-500">Handpicked premium campuses with verified high academic excellence.</p>
            </div>
            <Link
              href="/colleges"
              className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              View all colleges <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredColleges.map((college) => (
              <Link
                key={college.id}
                href={`/colleges/${college.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={college.imageUrl}
                    alt={college.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{college.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                    <MapPin className="h-3 w-3" />
                    <span>{college.location}</span>
                  </div>
                  
                  <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {college.name}
                  </h3>
                  
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {college.description}
                  </p>

                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Annual Fee</span>
                      <div className="flex items-center text-sm font-extrabold text-slate-900 mt-0.5">
                        <IndianRupee className="h-3.5 w-3.5 text-slate-700" />
                        <span>{new Intl.NumberFormat("en-IN").format(college.fees)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Placement</span>
                      <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
                        {college.placementPercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-indigo-900 px-6 py-20 shadow-2xl rounded-3xl sm:px-12 md:py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start Your Journey Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-indigo-100">
            Create an account to save your shortlisted colleges and write campus reviews.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-900 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              Create Account
            </Link>
            <Link href="/colleges" className="text-sm font-semibold leading-6 text-white flex items-center gap-1 group">
              Browse Colleges <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
