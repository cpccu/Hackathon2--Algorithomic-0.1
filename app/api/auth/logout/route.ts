import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { deleteSession } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("campusos_session")?.value;

    if (sessionCookie) {
      const payload = verifySessionToken(sessionCookie);
      if (payload?.sessionId) {
        await deleteSession(payload.sessionId);
      }
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });

    // Expire cookie immediately
    response.cookies.set({
      name: "campusos_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: unknown) {
    console.error("[API logout] Error:", err);
    return NextResponse.json({ success: false, error: "Logout failed." }, { status: 500 });
  }
}
