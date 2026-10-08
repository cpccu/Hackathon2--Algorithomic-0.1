import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getDrizzleDb, getSession } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
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

    // 2. Fetch User's Active Registrations Joined with Events
    const rows = await db
      .select({
        registrationId: schema.eventRegistrations.id,
        registrationStatus: schema.eventRegistrations.status,
        registeredAt: schema.eventRegistrations.registeredAt,
        eventId: schema.events.id,
        title: schema.events.title,
        description: schema.events.description,
        category: schema.events.category,
        organizer: schema.events.organizer,
        departmentId: schema.events.departmentId,
        venue: schema.events.venue,
        startAt: schema.events.startAt,
        endAt: schema.events.endAt,
        registrationUrl: schema.events.registrationUrl,
        sourceUrl: schema.events.sourceUrl,
        sourceName: schema.events.sourceName,
        verificationStatus: schema.events.verificationStatus,
      })
      .from(schema.eventRegistrations)
      .innerJoin(schema.events, eq(schema.eventRegistrations.eventId, schema.events.id))
      .where(
        and(
          eq(schema.eventRegistrations.userId, session.userId),
          eq(schema.eventRegistrations.status, "REGISTERED"),
          eq(schema.events.verificationStatus, "VERIFIED")
        )
      )
      .orderBy(asc(schema.events.startAt));

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upcoming: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const past: any[] = [];

    for (const r of rows) {
      const item = {
        id: r.eventId,
        title: r.title,
        description: r.description,
        category: r.category,
        organizer: r.organizer,
        venue: r.venue,
        startAt: r.startAt.toISOString(),
        endAt: r.endAt ? r.endAt.toISOString() : null,
        sourceUrl: r.sourceUrl,
        sourceName: r.sourceName,
        verificationStatus: r.verificationStatus,
        registrationId: r.registrationId,
        registrationStatus: r.registrationStatus,
        registeredAt: r.registeredAt.toISOString(),
        referenceId: `CAMPUSOS-EVT-${r.registrationId.toUpperCase()}`,
      };

      const isUpcoming = r.startAt >= now || (r.endAt && r.endAt >= now);
      if (isUpcoming) {
        upcoming.push(item);
      } else {
        past.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      upcoming,
      past,
      total: rows.length,
    });
  } catch (err: unknown) {
    console.error("[API Events My] Query error:", err);
    return NextResponse.json({ success: false, error: "Failed to retrieve registered events." }, { status: 500 });
  }
}
