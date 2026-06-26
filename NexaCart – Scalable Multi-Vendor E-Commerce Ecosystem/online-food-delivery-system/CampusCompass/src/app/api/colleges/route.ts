import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const minFee = parseFloat(searchParams.get("minFee") || "0");
    const maxFee = parseFloat(searchParams.get("maxFee") || "2000000");
    const sortBy = searchParams.get("sortBy") || "rating";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const skip = (page - 1) * limit;

    const where: Prisma.CollegeWhereInput = {
      fees: {
        gte: minFee,
        lte: maxFee,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { courses: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (location && location !== "All") {
      where.location = { equals: location, mode: "insensitive" };
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput = {};
    if (sortBy === "fees") {
      orderBy.fees = sortOrder as Prisma.SortOrder;
    } else if (sortBy === "placementPercentage") {
      orderBy.placementPercentage = sortOrder as Prisma.SortOrder;
    } else {
      orderBy.rating = sortOrder as Prisma.SortOrder;
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: true,
          courses: true,
        },
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedColleges = colleges.map((c) => ({
      ...c,
      courses: c.courses.map((co) => co.name),
    }));

    return apiSuccess({
      colleges: mappedColleges,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Fetch colleges API error:", error);
    return apiError("Failed to fetch colleges", "FETCH_ERROR", 500);
  }
}
