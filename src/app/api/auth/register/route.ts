import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/app/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await registerUser(formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}
