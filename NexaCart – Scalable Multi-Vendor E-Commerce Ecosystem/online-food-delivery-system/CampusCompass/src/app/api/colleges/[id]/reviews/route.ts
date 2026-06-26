import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewSchema } from "@/features/colleges/schemas";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { id: collegeId } = await params;
    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { rating, comment } = result.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return apiError("College not found", "NOT_FOUND", 404);
    }

    const review = await prisma.review.create({
      data: {
        collegeId,
        rating,
        comment,
        userName: session.user.name || "Anonymous",
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { collegeId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.college.update({
      where: { id: collegeId },
      data: { rating: parseFloat(averageRating.toFixed(1)) },
    });

    return apiSuccess(review, 201);
  } catch (error) {
    console.error("Create review API error:", error);
    return apiError("Failed to post review", "SERVER_ERROR", 500);
  }
}
