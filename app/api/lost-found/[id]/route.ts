import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/lost-found/[id]
 * View single Lost & Found item details.
 * Protects reporter privacy and enforces verification visibility.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const auth = await requireAuth(req);
    const viewerId = auth.authorized ? auth.user.id : null;
    const viewerRole = auth.authorized ? auth.user.role : null;

    const [item] = await db
      .select({
        id: schema.lostFoundItems.id,
        reporterId: schema.lostFoundItems.reporterId,
        type: schema.lostFoundItems.type,
        title: schema.lostFoundItems.title,
        description: schema.lostFoundItems.description,
        category: schema.lostFoundItems.category,
        location: schema.lostFoundItems.location,
        eventId: schema.lostFoundItems.eventId,
        dateOccurred: schema.lostFoundItems.dateOccurred,
        imageUrl: schema.lostFoundItems.imageUrl,
        contactPreference: schema.lostFoundItems.contactPreference,
        status: schema.lostFoundItems.status,
        verificationStatus: schema.lostFoundItems.verificationStatus,
        createdAt: schema.lostFoundItems.createdAt,
        updatedAt: schema.lostFoundItems.updatedAt,
        resolvedAt: schema.lostFoundItems.resolvedAt,
      })
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.id, params.id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    const isReporter = viewerId !== null && item.reporterId === viewerId;
    const isAdmin = viewerRole === "ADMIN";

    // Non-verified items are only visible to the original reporter or admins
    if (item.verificationStatus !== "VERIFIED" && !isReporter && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "This item is pending moderation." },
        { status: 403 }
      );
    }

    // Strip internal reporterId before sending to client
    const { reporterId, ...safeItem } = item;

    return NextResponse.json({
      success: true,
      item: safeItem,
      isReporter,
      canClaim: !isReporter && safeItem.type === "FOUND" && safeItem.status === "OPEN",
    });
  } catch (err: unknown) {
    console.error("[API Lost-Found Detail GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch item." }, { status: 500 });
  }
}

/**
 * PATCH /api/lost-found/[id]
 * Reporter or Admin can update item status (e.g., mark RESOLVED).
 */
export async function PATCH(
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
    const [existing] = await db
      .select()
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    const isReporter = existing.reporterId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";

    if (!isReporter && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to modify this report." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const now = new Date();
    const updateData: Partial<typeof schema.lostFoundItems.$inferInsert> = {
      updatedAt: now,
    };

    if (body.status !== undefined) {
      const newStatus = body.status.toUpperCase();
      if (["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"].includes(newStatus)) {
        updateData.status = newStatus;
        if (newStatus === "RESOLVED") {
          updateData.resolvedAt = now;
        }
      }
    }

    // Only admin can change verification status
    if (body.verificationStatus !== undefined && isAdmin) {
      const newVer = body.verificationStatus.toUpperCase();
      if (["PENDING", "VERIFIED", "REJECTED"].includes(newVer)) {
        updateData.verificationStatus = newVer;
      }
    }

    const [updatedItem] = await db
      .update(schema.lostFoundItems)
      .set(updateData)
      .where(eq(schema.lostFoundItems.id, params.id))
      .returning();

    // In-App Notification: Notify reporter when item is resolved
    if (updateData.status === "RESOLVED" && existing.status !== "RESOLVED") {
      await createNotification({
        userId: existing.reporterId,
        type: "LOST_FOUND_RESOLVED",
        title: "Lost & Found Case Resolved",
        message: `The Lost & Found case "${existing.title}" has been marked resolved.`,
        entityType: "lost_found",
        entityId: params.id,
        actionUrl: `/lost-found/my`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Report status updated successfully.",
      status: updatedItem?.status || updateData.status || existing.status,
      item: updatedItem,
    });
  } catch (err: unknown) {
    console.error("[API Lost-Found Detail PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update item." }, { status: 500 });
  }
}
