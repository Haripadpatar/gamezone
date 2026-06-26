import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";
import { calculateMatchScore, DEFAULT_PREFERENCES, UserPreferences } from "@/lib/matchScore";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    let recentlyViewedIds: string[] = [];
    try {
      const body = await req.json();
      recentlyViewedIds = body.recentlyViewedIds || [];
    } catch (e) {
      // Request body might be empty
    }

    const userId = session.user.id;

    // Fetch user details including relationships in a single query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedColleges: {
          include: {
            college: {
              include: {
                courses: true,
              },
            },
          },
        },
        savedComparisons: true,
        predictorQueries: true,
      },
    });

    if (!user) {
      return apiError("User not found", "NOT_FOUND", 404);
    }

    // Set user preferences with fallbacks
    const prefs: UserPreferences = {
      maxFee: user.maxFee ?? DEFAULT_PREFERENCES.maxFee,
      location: user.locationPref ?? DEFAULT_PREFERENCES.location,
      courseCategory: user.coursePref ?? DEFAULT_PREFERENCES.courseCategory,
      importanceFees: user.impFees ?? DEFAULT_PREFERENCES.importanceFees,
      importancePlacement: user.impPlacement ?? DEFAULT_PREFERENCES.importancePlacement,
      importanceRating: user.impRating ?? DEFAULT_PREFERENCES.importanceRating,
    };

    // 1. Map saved colleges
    const savedCollegesMapped = user.savedColleges.map((sc) => ({
      ...sc.college,
      courses: sc.college.courses.map((co) => co.name),
    }));

    // 2. Calculate average match score for saved colleges
    let averageMatchScore = 0;
    if (savedCollegesMapped.length > 0) {
      const totalScore = savedCollegesMapped.reduce((acc, col) => {
        return acc + calculateMatchScore(col, prefs);
      }, 0);
      averageMatchScore = Math.round(totalScore / savedCollegesMapped.length);
    }

    // 3. Fetch recently viewed colleges details
    let recentlyViewedMapped: any[] = [];
    if (recentlyViewedIds.length > 0) {
      const viewedColleges = await prisma.college.findMany({
        where: { id: { in: recentlyViewedIds } },
        include: {
          courses: true,
        },
      });

      // Maintain user's browsing order
      const viewedSorted = recentlyViewedIds
        .map((id) => viewedColleges.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c);

      recentlyViewedMapped = viewedSorted.map((c) => ({
        ...c,
        courses: c.courses.map((co) => co.name),
      }));
    }

    // 4. Fetch details for saved comparisons
    const savedComparisonsMapped = [];
    for (const comp of user.savedComparisons) {
      const colleges = await prisma.college.findMany({
        where: { id: { in: comp.collegeIds } },
        include: {
          courses: true,
        },
      });
      const collegesMapped = colleges.map((c) => ({
        ...c,
        courses: c.courses.map((co) => co.name),
      }));
      savedComparisonsMapped.push({
        id: comp.id,
        name: comp.name,
        collegeIds: comp.collegeIds,
        colleges: collegesMapped,
        createdAt: comp.createdAt,
      });
    }

    // 5. Recommended Colleges
    const savedIds = savedCollegesMapped.map((c) => c.id);
    const nonSavedColleges = await prisma.college.findMany({
      where: {
        id: { notIn: savedIds },
      },
      include: {
        courses: true,
      },
      take: 30, // Pool size for personalization
    });

    const recommendations = nonSavedColleges
      .map((col) => {
        const colMapped = {
          ...col,
          courses: col.courses.map((co) => co.name),
        };
        return {
          college: colMapped,
          score: calculateMatchScore(colMapped, prefs),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Return top 3 personalized recommendations

    return apiSuccess({
      stats: {
        savedCollegesCount: user.savedColleges.length,
        comparisonsCount: user.savedComparisons.length,
        predictorUsageCount: user.predictorQueries.length,
        averageMatchScore,
      },
      profile: {
        name: user.name,
        email: user.email,
      },
      savedColleges: savedCollegesMapped,
      savedComparisons: savedComparisonsMapped,
      recentlyViewed: recentlyViewedMapped,
      recommendedColleges: recommendations,
      userPreferences: prefs,
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return apiError("Failed to fetch dashboard stats", "SERVER_ERROR", 500);
  }
}
