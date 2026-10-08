import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getSession, getResourceById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const sessionCookie = req.cookies.get("campusos_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const session = await getSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired." }, { status: 401 });
    }

    const resourceId = params?.id;
    if (!resourceId) {
      return NextResponse.json({ success: false, error: "Resource ID is required." }, { status: 400 });
    }

    // 2. Fetch single resource from PostgreSQL
    const item = await getResourceById(resourceId);
    if (!item) {
      return NextResponse.json({ success: false, error: "Resource not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resource: item,
    });
  } catch (err: unknown) {
    console.error("[API resources/[id]] Error fetching resource:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve resource." },
      { status: 500 }
    );
  }
}
