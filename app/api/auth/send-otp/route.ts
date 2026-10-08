import { NextRequest, NextResponse } from "next/server";
import { requestOtp } from "@/lib/auth/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose, fullName, studentId } = body;

    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const result = await requestOtp({
      email,
      purpose,
      fullName,
      studentId,
      clientIp,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Verification code dispatched.",
    });
  } catch (err: unknown) {
    console.error("[API send-otp] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
