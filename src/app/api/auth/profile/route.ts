import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/app/actions/auth";

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await updateProfile(formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
