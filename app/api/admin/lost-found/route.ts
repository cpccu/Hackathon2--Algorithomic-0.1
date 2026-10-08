import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, or, ilike, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/lost-found
 * Admin list all Lost & Found items with full moderation status.
 */
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
    const type = searchParams.get("type")?.trim().toUpperCase() || "ALL";
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL";
    const verificationStatus = searchParams.get("verificationStatus")?.trim().toUpperCase() || "ALL";

    const conditions: SQL[] = [];

    if (type === "LOST" || type === "FOUND") {
      conditions.push(eq(schema.lostFoundItems.type, type));
    }

    if (status !== "ALL") {
      conditions.push(eq(schema.lostFoundItems.status, status));
    }

    if (verificationStatus !== "ALL") {
      conditions.push(eq(schema.lostFoundItems.verificationStatus, verificationStatus));
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
        reporterId: schema.lostFoundItems.reporterId,
        type: schema.lostFoundItems.type,
        title: schema.lostFoundItems.title,
        description: schema.lostFoundItems.description,
        category: schema.lostFoundItems.category,
        location: schema.lostFoundItems.location,
        dateOccurred: schema.lostFoundItems.dateOccurred,
        imageUrl: schema.lostFoundItems.imageUrl,
        contactPreference: schema.lostFoundItems.contactPreference,
        status: schema.lostFoundItems.status,
        verificationStatus: schema.lostFoundItems.verificationStatus,
        createdAt: schema.lostFoundItems.createdAt,
        updatedAt: schema.lostFoundItems.updatedAt,
        reporterName: schema.users.name,
        reporterEmail: schema.users.email,
      })
      .from(schema.lostFoundItems)
      .leftJoin(schema.users, eq(schema.lostFoundItems.reporterId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.lostFoundItems.createdAt));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: unknown) {
    console.error("[API Admin Lost-Found GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load items." }, { status: 500 });
  }
}
