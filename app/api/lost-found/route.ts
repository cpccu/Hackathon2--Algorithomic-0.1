import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, or, ilike, SQL } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/lost-found
 * Browse public/verified Lost & Found items with filtering and search.
 * Privacy rule: Never expose reporter email, student ID, or personal data.
 */
export async function GET(req: NextRequest) {
  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type")?.trim().toUpperCase() || "ALL";
    const category = searchParams.get("category")?.trim() || "ALL";
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL";

    const conditions: SQL[] = [
      // Only show items that are verified or public, not archived
      eq(schema.lostFoundItems.verificationStatus, "VERIFIED"),
    ];

    if (type === "LOST" || type === "FOUND") {
      conditions.push(eq(schema.lostFoundItems.type, type));
    }

    if (category !== "ALL") {
      conditions.push(eq(schema.lostFoundItems.category, category));
    }

    if (status !== "ALL") {
      conditions.push(eq(schema.lostFoundItems.status, status));
    }

    if (q) {
      conditions.push(
        or(
          ilike(schema.lostFoundItems.title, `%${q}%`),
          ilike(schema.lostFoundItems.description, `%${q}%`),
          ilike(schema.lostFoundItems.location, `%${q}%`),
          ilike(schema.lostFoundItems.category, `%${q}%`)
        )!
      );
    }

    const items = await db
      .select({
        id: schema.lostFoundItems.id,
        type: schema.lostFoundItems.type,
        title: schema.lostFoundItems.title,
        description: schema.lostFoundItems.description,
        category: schema.lostFoundItems.category,
        location: schema.lostFoundItems.location,
        dateOccurred: schema.lostFoundItems.dateOccurred,
        imageUrl: schema.lostFoundItems.imageUrl,
        status: schema.lostFoundItems.status,
        verificationStatus: schema.lostFoundItems.verificationStatus,
        createdAt: schema.lostFoundItems.createdAt,
      })
      .from(schema.lostFoundItems)
      .where(and(...conditions))
      .orderBy(desc(schema.lostFoundItems.createdAt))
      .limit(100);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: unknown) {
    console.error("[API Lost-Found GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch items." }, { status: 500 });
  }
}

/**
 * POST /api/lost-found
 * Authenticated student reports a lost or found item.
 * Strictly derives reporterId from session.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  // Rate Limiting: Max 5 reports per user per hour
  const rateLimit = await checkRateLimit(auth.user.id, "lost_found", 5);
  if (!rateLimit.allowed) return rateLimit.response!;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const type = body.type?.trim().toUpperCase();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const category = body.category?.trim();
    const location = body.location?.trim();
    const dateOccurred = body.dateOccurred ? new Date(body.dateOccurred) : null;
    const imageUrl = body.imageUrl?.trim() || null;
    const eventId = body.eventId?.trim() || null;
    const contactPreference = body.contactPreference?.trim() || "CAMPUSOS_IN_APP";

    if (!type || (type !== "LOST" && type !== "FOUND")) {
      return NextResponse.json({ success: false, error: "Valid type (LOST or FOUND) is required." }, { status: 400 });
    }

    if (!title || !description || !category || !location || !dateOccurred || isNaN(dateOccurred.getTime())) {
      return NextResponse.json(
        { success: false, error: "Title, description, category, location, and valid date are required." },
        { status: 400 }
      );
    }

    if (title.length > 200 || description.length > 3000) {
      return NextResponse.json(
        { success: false, error: "Title or description exceeds allowed length." },
        { status: 400 }
      );
    }

    const itemId = `lf_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
    const now = new Date();

    await db.insert(schema.lostFoundItems).values({
      id: itemId,
      reporterId: auth.user.id,
      type,
      title,
      description,
      category,
      location,
      eventId,
      dateOccurred,
      imageUrl,
      contactPreference,
      status: "OPEN",
      verificationStatus: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          type === "LOST"
            ? "Lost item report submitted. Your report is awaiting moderation."
            : "Found item report submitted. Thank you for reporting this item.",
        itemId,
        item: {
          id: itemId,
          type,
          title,
          category,
          location,
          status: "OPEN",
          verificationStatus: "PENDING",
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[API Lost-Found POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit report." }, { status: 500 });
  }
}
