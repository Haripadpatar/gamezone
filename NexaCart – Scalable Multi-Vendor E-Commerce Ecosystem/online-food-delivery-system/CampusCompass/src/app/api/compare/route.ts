import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";
import { z } from "zod";

const saveComparisonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  collegeIds: z.array(z.string()).min(1, "At least one college is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const result = saveComparisonSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { name, collegeIds } = result.data;

    const saved = await prisma.comparisonHistory.create({
      data: {
        userId: session.user.id,
        name,
        collegeIds,
      },
    });

    return apiSuccess(saved, 201);
  } catch (error) {
    console.error("Save comparison error:", error);
    return apiError("Failed to save comparison board", "SERVER_ERROR", 500);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const comparisons = await prisma.comparisonHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(comparisons);
  } catch (error) {
    console.error("Get comparisons error:", error);
    return apiError("Failed to fetch comparisons", "SERVER_ERROR", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Comparison ID is required", "VALIDATION_ERROR", 400);
    }

    await prisma.comparisonHistory.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return apiSuccess({ message: "Comparison deleted successfully" });
  } catch (error) {
    console.error("Delete comparison error:", error);
    return apiError("Failed to delete comparison", "SERVER_ERROR", 500);
  }
}
