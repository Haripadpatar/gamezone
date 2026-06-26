import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId: session.user.id },
      include: {
        college: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiSuccess(saved.map((s) => s.college));
  } catch (error) {
    console.error("Fetch saved colleges error:", error);
    return apiError("Failed to fetch saved colleges", "SERVER_ERROR", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { collegeId } = body;

    if (!collegeId) {
      return apiError("College ID is required", "VALIDATION_ERROR", 400);
    }

    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: session.user.id,
          collegeId,
        },
      },
    });

    if (existing) {
      return apiError("College is already saved", "DUPLICATE_SHORTLIST", 400);
    }

    const saved = await prisma.savedCollege.create({
      data: {
        userId: session.user.id,
        collegeId,
      },
    });

    return apiSuccess(saved, 201);
  } catch (error) {
    console.error("Save college error:", error);
    return apiError("Failed to save college", "SERVER_ERROR", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");

    if (!collegeId) {
      return apiError("College ID is required", "VALIDATION_ERROR", 400);
    }

    await prisma.savedCollege.delete({
      where: {
        userId_collegeId: {
          userId: session.user.id,
          collegeId,
        },
      },
    });

    return apiSuccess({ message: "College removed from saved list" });
  } catch (error) {
    console.error("Remove saved college error:", error);
    return apiError("Failed to remove college", "SERVER_ERROR", 500);
  }
}
