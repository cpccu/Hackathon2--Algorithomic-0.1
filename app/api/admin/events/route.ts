import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, ilike, or, and, SQL } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "ALL";

    const conditions: SQL[] = [];

    if (status !== "ALL") {
      conditions.push(eq(schema.events.verificationStatus, status.toUpperCase()));
    }

    if (q) {
      conditions.push(
        or(
          ilike(schema.events.title, `%${q}%`),
          ilike(schema.events.venue, `%${q}%`),
          ilike(schema.events.organizer, `%${q}%`)
        )!
      );
    }

    const eventRows = await db
      .select()
      .from(schema.events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.events.startAt));

    return NextResponse.json({
      success: true,
      events: eventRows,
    });
  } catch (err: unknown) {
    console.error("[API Admin Events GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const title = body.title?.trim();
    const description = (body.description || "Official City University Campus Event")?.trim();
    const category = (body.category || "GENERAL")?.trim();
    const organizer = (body.organizer || "City University Administration")?.trim();
    const venue = body.venue?.trim();
    const startAt = body.startAt || body.startDate;
    const endAt = body.endAt || body.endDate;
    const departmentId = body.departmentId || null;
    const registrationUrl = body.registrationUrl || null;
    const sourceUrl = body.sourceUrl || null;
    const sourceName = body.sourceName || "City University Administration";
    const verificationStatus = (body.verificationStatus || body.status || "PENDING").toUpperCase();
    const ignoreDuplicateWarning = Boolean(body.ignoreDuplicateWarning || body.forcePublish);

    if (!title || !venue || !startAt) {
      return NextResponse.json(
        { success: false, error: "Title, venue, and start time are required." },
        { status: 400 }
      );
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = endAt ? new Date(endAt) : null;

    // Check for similar events (title, date, or venue)
    if (!ignoreDuplicateWarning) {
      const existing = await db
        .select()
        .from(schema.events)
        .where(
          and(
            ilike(schema.events.title, `%${title}%`),
            eq(schema.events.venue, venue)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            hasWarning: true,
            warning: "DUPLICATE_SIMILARITY_WARNING",
            message: `Similar event "${existing[0].title}" already exists at venue "${existing[0].venue}". Review before publishing.`,
            matchingEvent: existing[0],
          },
          { status: 409 }
        );
      }
    }

    const now = new Date();
    const eventId = `evt_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.events).values({
      id: eventId,
      title,
      description,
      category,
      organizer,
      departmentId,
      venue,
      startAt: parsedStartAt,
      endAt: parsedEndAt,
      registrationUrl: registrationUrl?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || "City University Administration",
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(
      auth.user.id,
      isVerified ? "ADMIN_CREATED_AND_VERIFIED_EVENT" : "ADMIN_CREATED_EVENT",
      "EVENT",
      eventId,
      `Event title: ${title}`
    );

    return NextResponse.json(
      {
        success: true,
        message: isVerified ? "Event verified and published successfully." : "Event saved as pending draft.",
        eventId,
        event: {
          id: eventId,
          title,
          status: isVerified ? "VERIFIED" : "PENDING",
          verificationStatus: isVerified ? "VERIFIED" : "PENDING",
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[API Admin Events POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create event." }, { status: 500 });
  }
}
