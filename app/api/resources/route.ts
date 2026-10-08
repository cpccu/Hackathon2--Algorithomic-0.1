import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getSession, getResources } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user via HTTP-only session cookie
    const sessionCookie = req.cookies.get("campusos_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized access. Please sign in." }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session. Please sign in." }, { status: 401 });
    }

    const session = await getSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired. Please sign in." }, { status: 401 });
    }

    // 2. Extract validated query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const department = searchParams.get("department") || undefined;
    const courseCode = searchParams.get("courseCode") || undefined;

    // 3. Query PostgreSQL via Drizzle ORM
    const items = await getResources({
      query,
      category,
      department,
      courseCode,
    });

    return NextResponse.json({
      success: true,
      resources: items,
      total: items.length,
    });
  } catch (err: unknown) {
    console.error("[API resources] Error fetching resources:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve resources. Please try again later." },
      { status: 500 }
    );
  }
}
