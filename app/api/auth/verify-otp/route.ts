import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, purpose, fullName, studentId } = body;

    const result = await verifyOtp({
      email,
      otp,
      purpose,
      fullName,
      studentId,
    });

    if (!result.success || !result.user || !result.sessionToken) {
      return NextResponse.json(
        { success: false, error: result.error || "Verification failed." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        fullName: result.user.name, // backward compatibility
        studentId: result.user.studentId,
        emailVerified: result.user.emailVerified,
      },
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: "campusos_session",
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: unknown) {
    console.error("[API verify-otp] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
