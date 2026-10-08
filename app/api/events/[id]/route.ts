import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getDrizzleDb, getSession } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
    }

    // 1. Session Authentication
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

    const db = getDrizzleDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
    }

    // 2. Fetch Event (Must be VERIFIED)
    const [eventRow] = await db
      .select()
      .from(schema.events)
      .where(and(eq(schema.events.id, eventId), eq(schema.events.verificationStatus, "VERIFIED")))
      .limit(1);

    if (!eventRow) {
      return NextResponse.json({ success: false, error: "Event not found or not verified." }, { status: 404 });
    }

    // 3. Check User Registration Status
    const [registration] = await db
      .select()
      .from(schema.eventRegistrations)
      .where(
        and(
          eq(schema.eventRegistrations.eventId, eventId),
          eq(schema.eventRegistrations.userId, session.userId),
          eq(schema.eventRegistrations.status, "REGISTERED")
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      event: {
        id: eventRow.id,
        title: eventRow.title,
        description: eventRow.description,
        category: eventRow.category,
        organizer: eventRow.organizer,
        departmentId: eventRow.departmentId,
        venue: eventRow.venue,
        startAt: eventRow.startAt.toISOString(),
        endAt: eventRow.endAt ? eventRow.endAt.toISOString() : null,
        registrationUrl: eventRow.registrationUrl,
        sourceUrl: eventRow.sourceUrl,
        sourceName: eventRow.sourceName,
        verificationStatus: eventRow.verificationStatus,
        verifiedAt: eventRow.verifiedAt ? eventRow.verifiedAt.toISOString() : null,
        isRegistered: Boolean(registration),
        registration: registration
          ? {
              id: registration.id,
              status: registration.status,
              registeredAt: registration.registeredAt.toISOString(),
            }
          : null,
      },
    });
  } catch (err: unknown) {
    console.error("[API Event Detail] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to retrieve event details." }, { status: 500 });
  }
}
