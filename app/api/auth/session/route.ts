import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getSession, findUserById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("campusos_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const activeSession = await getSession(payload.sessionId);
    if (!activeSession) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await findUserById(activeSession.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.name, // backward compatibility
        studentId: user.studentId,
        role: user.role || "STUDENT",
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err: unknown) {
    console.error("[API session] Error:", err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
