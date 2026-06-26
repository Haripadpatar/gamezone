import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(message: string, code = "BAD_REQUEST", status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: { message, code, details },
    },
    { status }
  );
}
