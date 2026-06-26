import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";
import { z } from "zod";

const historySchema = z.object({
  examType: z.string(),
  score: z.number(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const result = historySchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { examType, score } = result.data;

    const historyRecord = await prisma.predictorHistory.create({
      data: {
        userId: session.user.id,
        examType,
        score,
      },
    });

    return apiSuccess(historyRecord, 201);
  } catch (error) {
    console.error("Save predictor history error:", error);
    return apiError("Failed to save predictor history", "SERVER_ERROR", 500);
  }
}
