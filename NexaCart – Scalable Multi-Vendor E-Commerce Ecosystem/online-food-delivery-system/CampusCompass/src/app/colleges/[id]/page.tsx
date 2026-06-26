import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { College } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import SaveButton from "@/features/colleges/SaveButton";
import ReviewForm from "@/features/colleges/ReviewForm";
import RecentlyViewedTracker from "@/features/colleges/RecentlyViewedTracker";
import DetailMatchScore from "@/features/colleges/DetailMatchScore";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, IndianRupee, GraduationCap, ShieldCheck, ChevronRight, Award, Trophy, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch college details
  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      courses: true,
    },
  });

  if (!college) {
    notFound();
  }

  // Check if saved by current user
  const session = await getServerSession(authOptions);
  let isSaved = false;

  if (session?.user?.id) {
    const saved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: session.user.id,
          collegeId: id,
        },
      },
    });
    isSaved = !!saved;
  }

  // Fetch related colleges in the same location or category (limit 3), excluding current
  let relatedColleges: College[] = [];
  try {
    relatedColleges = await prisma.college.findMany({
      where: {
        OR: [
          { location: college.location },
          { imageUrl: college.imageUrl }, // Same type (engineering/business/medical)
        ],
        id: { not: id },
      },
      take: 3,
    });
  } catch (error) {
    console.error("Failed to fetch related colleges:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RecentlyViewedTracker collegeId={id} />
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-indigo-650 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/colleges" className="hover:text-indigo-650 transition-colors">Colleges</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-650 truncate max-w-[200px] sm:max-w-xs">{college.name}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm mb-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full">
          <Image
            src={college.imageUrl}
            alt={college.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-90"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Text overlays */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <MapPin className="h-3.5 w-3.5" />
                <span>{college.location}</span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-4xl leading-tight drop-shadow-sm">
                {college.name}
              </h1>
            </div>
            
            <div className="shrink-0 flex items-center gap-3">
              <SaveButton
                collegeId={college.id}
                initialIsSaved={isSaved}
                collegeName={college.name}
              />
            </div>
          </div>
        </div>

        {/* Core Quick Metrics */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white border-t border-slate-150 p-6 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Student Rating</span>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-extrabold text-slate-900">{college.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-medium">({college.reviews.length})</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Annual Fee</span>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <IndianRupee className="h-4 w-4 text-slate-700" />
              <span className="text-lg font-extrabold text-slate-900">
                {new Intl.NumberFormat("en-IN").format(college.fees)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Placements Rate</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-indigo-650">
              <Trophy className="h-4 w-4 text-indigo-600" />
              <span className="text-lg font-extrabold text-indigo-600">{college.placementPercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Overview
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {college.description}
            </p>
          </section>

          {/* Courses Offered */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Courses Offered
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {college.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-snug">{course.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Placement Statistics */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-600" />
              Placement Performance
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>On-Campus Placements</span>
                  <span className="font-extrabold text-indigo-600">{college.placementPercentage.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${college.placementPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 border border-slate-105 p-4 flex items-start gap-3">
                <Users className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Placement Insight</h4>
                  <p className="text-xs leading-relaxed text-slate-500 mt-1">
                    With a placement record of {college.placementPercentage.toFixed(0)}%, this campus remains among the elite performers, far exceeding the typical industry benchmark of 65%. Most recruits secure positions in top multinationals and technology hubs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Colleges */}
          {relatedColleges.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Related Colleges</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedColleges.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/colleges/${rel.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-video bg-slate-100 w-full overflow-hidden">
                      <Image
                        src={rel.imageUrl}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-103"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">{rel.location}</h4>
                      <h3 className="mt-1 text-sm font-bold text-slate-950 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {rel.name}
                      </h3>
                      <div className="mt-auto pt-3 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{formatCurrency(rel.fees)}</span>
                        <span className="text-indigo-600">{rel.placementPercentage.toFixed(0)}% Placed</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Reviews & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Match Score Widget */}
          <DetailMatchScore college={{
            ...college,
            courses: college.courses.map((co) => co.name),
          }} />

          {/* Post review form */}
          <ReviewForm collegeId={id} />

          {/* Reviews List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Student Reviews ({college.reviews.length})</h3>
            
            {college.reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-5 divide-y divide-slate-100">
                {college.reviews.map((review, idx) => (
                  <div key={review.id} className={`pt-4 first:pt-0`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{review.userName}</h4>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-slate-500 mt-2 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    
                    <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                      Posted on {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
