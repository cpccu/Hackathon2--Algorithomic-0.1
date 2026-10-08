import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, inArray, desc } from "drizzle-orm";
import crypto from "crypto";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/lost-found/[id]/claims
 * Retrieve claims for an item.
 * Allowed only for the item's original reporter or administrators.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const [item] = await db
      .select()
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.id, params.id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    const isReporter = item.reporterId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";

    if (!isReporter && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You cannot view claims for items you did not report." },
        { status: 403 }
      );
    }

    const claims = await db
      .select({
        id: schema.lostFoundClaims.id,
        itemId: schema.lostFoundClaims.itemId,
        message: schema.lostFoundClaims.message,
        contactInfo: schema.lostFoundClaims.contactInfo,
        status: schema.lostFoundClaims.status,
        createdAt: schema.lostFoundClaims.createdAt,
      })
      .from(schema.lostFoundClaims)
      .where(eq(schema.lostFoundClaims.itemId, params.id))
      .orderBy(desc(schema.lostFoundClaims.createdAt));

    return NextResponse.json({
      success: true,
      claims,
    });
  } catch (err: unknown) {
    console.error("[API Lost-Found Claims GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch claims." }, { status: 500 });
  }
}

/**
 * POST /api/lost-found/[id]/claims
 * Authenticated student submits a claim for a found item.
 * Prevents self-claims and duplicate active claims.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  // Rate Limiting: Max 5 claims per hour
  const rateLimit = await checkRateLimit(auth.user.id, "claim", 5);
  if (!rateLimit.allowed) return rateLimit.response!;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const [item] = await db
      .select()
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.id, params.id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    if (item.type !== "FOUND") {
      return NextResponse.json(
        { success: false, error: "Only found items can be claimed." },
        { status: 400 }
      );
    }

    if (item.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "This item is no longer open for claims." },
        { status: 400 }
      );
    }

    if (item.reporterId === auth.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot submit a claim for an item you reported yourself." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const message = body.message?.trim();
    const contactInfo = body.contactInfo?.trim() || null;

    if (!message || message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a detailed description (at least 10 characters) explaining why this item is yours." },
        { status: 400 }
      );
    }

    // Check for existing active claim by this user for this item
    const existingActiveClaims = await db
      .select()
      .from(schema.lostFoundClaims)
      .where(
        and(
          eq(schema.lostFoundClaims.itemId, params.id),
          eq(schema.lostFoundClaims.claimantId, auth.user.id),
          inArray(schema.lostFoundClaims.status, ["PENDING", "APPROVED"])
        )
      )
      .limit(1);

    if (existingActiveClaims.length > 0) {
      return NextResponse.json(
        { success: false, error: "You already have an active claim for this item." },
        { status: 409 }
      );
    }

    const claimId = `clm_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
    const now = new Date();

    await db.insert(schema.lostFoundClaims).values({
      id: claimId,
      itemId: params.id,
      claimantId: auth.user.id,
      message,
      contactInfo,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    // In-App Notification: Notify item reporter/finder that a claim was submitted
    await createNotification({
      userId: item.reporterId,
      type: "LOST_FOUND_CLAIM_SUBMITTED",
      title: "New Claim Submitted",
      message: `A new claim has been submitted for your found item "${item.title}".`,
      entityType: "lost_found",
      entityId: params.id,
      actionUrl: `/lost-found/my`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your claim has been submitted and is awaiting verification by the administration.",
        claimId,
        claim: {
          id: claimId,
          itemId: params.id,
          status: "PENDING",
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[API Lost-Found Claim POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit claim." }, { status: 500 });
  }
}
