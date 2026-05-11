import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/app/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await loginUser(formData);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
