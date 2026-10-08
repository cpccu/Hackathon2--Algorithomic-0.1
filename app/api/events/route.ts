import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getDrizzleDb, getSession } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, ilike, gte, lt, desc, asc, inArray, isNull } from "drizzle-orm";

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

    // 2. Query Parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "All";
    const timeframe = (searchParams.get("timeframe")?.trim() || "upcoming").toLowerCase(); // 'upcoming' | 'past' | 'all'
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const now = new Date();

    // 3. Build WHERE clauses (Strict verificationStatus = 'VERIFIED')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [eq(schema.events.verificationStatus, "VERIFIED")];

    // Category filter
    if (category && category !== "All") {
      conditions.push(ilike(schema.events.category, category));
    }

    // Search query filter (title, description, category, organizer, venue)
    if (query) {
      const q = `%${query}%`;
      conditions.push(
        or(
          ilike(schema.events.title, q),
          ilike(schema.events.description, q),
          ilike(schema.events.category, q),
          ilike(schema.events.organizer, q),
          ilike(schema.events.venue, q)
        )
      );
    }

    // Timeframe filter
    if (timeframe === "upcoming") {
      conditions.push(
        or(
          gte(schema.events.startAt, now),
          gte(schema.events.endAt, now)
        )
      );
    } else if (timeframe === "past") {
      conditions.push(
        or(
          lt(schema.events.endAt, now),
          and(isNull(schema.events.endAt), lt(schema.events.startAt, now))
        )
      );
    }

    // 4. Fetch Events
    const orderByClause = timeframe === "past" ? desc(schema.events.startAt) : asc(schema.events.startAt);

    const eventRows = await db
      .select()
      .from(schema.events)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit);

    // 5. Check Logged-in User Registrations
    const registeredEventIds = new Set<string>();
    if (eventRows.length > 0) {
      const eventIds = eventRows.map((e) => e.id);
      const userRegistrations = await db
        .select({
          eventId: schema.eventRegistrations.eventId,
        })
        .from(schema.eventRegistrations)
        .where(
          and(
            eq(schema.eventRegistrations.userId, session.userId),
            eq(schema.eventRegistrations.status, "REGISTERED"),
            inArray(schema.eventRegistrations.eventId, eventIds)
          )
        );

      for (const reg of userRegistrations) {
        registeredEventIds.add(reg.eventId);
      }
    }

    const formattedEvents = eventRows.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      organizer: e.organizer,
      departmentId: e.departmentId,
      venue: e.venue,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt ? e.endAt.toISOString() : null,
      registrationUrl: e.registrationUrl,
      sourceUrl: e.sourceUrl,
      sourceName: e.sourceName,
      verificationStatus: e.verificationStatus,
      verifiedAt: e.verifiedAt ? e.verifiedAt.toISOString() : null,
      isRegistered: registeredEventIds.has(e.id),
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
    });
  } catch (err: unknown) {
    console.error("[API Events] Query error:", err);
    return NextResponse.json({ success: false, error: "Failed to retrieve events." }, { status: 500 });
  }
}
