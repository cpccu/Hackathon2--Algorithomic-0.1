import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/lost-found/my
 * Returns the authenticated student's own Lost reports, Found reports, and Claims.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    // 1. Fetch user's own lost and found items
    const userItems = await db
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
      .where(eq(schema.lostFoundItems.reporterId, auth.user.id))
      .orderBy(desc(schema.lostFoundItems.createdAt));

    const lostReports = userItems.filter((i) => i.type === "LOST");
    const foundReports = userItems.filter((i) => i.type === "FOUND");

    // 2. Fetch user's claims with joined item details
    const claims = await db
      .select({
        id: schema.lostFoundClaims.id,
        itemId: schema.lostFoundClaims.itemId,
        message: schema.lostFoundClaims.message,
        status: schema.lostFoundClaims.status,
        createdAt: schema.lostFoundClaims.createdAt,
        itemTitle: schema.lostFoundItems.title,
        itemCategory: schema.lostFoundItems.category,
        itemLocation: schema.lostFoundItems.location,
        itemStatus: schema.lostFoundItems.status,
      })
      .from(schema.lostFoundClaims)
      .innerJoin(schema.lostFoundItems, eq(schema.lostFoundClaims.itemId, schema.lostFoundItems.id))
      .where(eq(schema.lostFoundClaims.claimantId, auth.user.id))
      .orderBy(desc(schema.lostFoundClaims.createdAt));

    return NextResponse.json({
      success: true,
      lostReports,
      foundReports,
      claims,
    });
  } catch (err: unknown) {
    console.error("[API Lost-Found My GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch user reports." }, { status: 500 });
  }
}
