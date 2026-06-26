import { registerSchema } from "@/features/auth/schemas";
import { apiSuccess, apiError } from "@/lib/api-helper";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.issues[0].message, "VALIDATION_ERROR", 400);
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiError("User with this email already exists", "EMAIL_EXISTS", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return apiSuccess({ message: "User registered successfully", userId: user.id }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Something went wrong. Please try again later.", "SERVER_ERROR", 500);
  }
}
