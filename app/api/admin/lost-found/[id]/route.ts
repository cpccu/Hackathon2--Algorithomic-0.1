import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/lost-found/[id]
 * Moderate, verify, reject, resolve, or archive Lost & Found report.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
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

    const body = await req.json();
    const now = new Date();
    const updateData: Partial<typeof schema.lostFoundItems.$inferInsert> = {
      updatedAt: now,
    };

    if (body.verificationStatus !== undefined) {
      const newVer = body.verificationStatus.toUpperCase();
      if (["PENDING", "VERIFIED", "REJECTED"].includes(newVer)) {
        updateData.verificationStatus = newVer;
      }
    }

    if (body.status !== undefined) {
      const newStatus = body.status.toUpperCase();
      if (["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"].includes(newStatus)) {
        updateData.status = newStatus;
        if (newStatus === "RESOLVED") {
          updateData.resolvedAt = now;
        }
      }
    }

    await db.update(schema.lostFoundItems).set(updateData).where(eq(schema.lostFoundItems.id, params.id));

    // In-App Notification: Notify reporter on moderation outcome or case resolution
    if (updateData.verificationStatus === "VERIFIED" && existing.verificationStatus !== "VERIFIED") {
      await createNotification({
        userId: existing.reporterId,
        type: "LOST_FOUND_VERIFIED",
        title: "Lost & Found Report Verified",
        message: `Your Lost & Found report "${existing.title}" has been verified.`,
        entityType: "lost_found",
        entityId: params.id,
        actionUrl: `/lost-found/my`,
      });
    } else if (updateData.status === "RESOLVED" && existing.status !== "RESOLVED") {
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

    const finalStatus = updateData.status || existing.status;
    const finalVer = updateData.verificationStatus || existing.verificationStatus;

    let auditAction = "ADMIN_UPDATED_LOST_FOUND";
    if (updateData.verificationStatus === "VERIFIED") auditAction = "ADMIN_VERIFIED_LOST_FOUND";
    else if (updateData.verificationStatus === "REJECTED") auditAction = "ADMIN_REJECTED_LOST_FOUND";
    else if (updateData.status === "RESOLVED") auditAction = "ADMIN_RESOLVED_LOST_FOUND";
    else if (updateData.status === "ARCHIVED") auditAction = "ADMIN_ARCHIVED_LOST_FOUND";

    await createAuditLog(
      auth.user.id,
      auditAction,
      "LOST_FOUND_ITEM",
      params.id,
      `Status: ${finalStatus}, Verification: ${finalVer}`
    );

    return NextResponse.json({
      success: true,
      message: "Item updated successfully.",
      item: {
        id: params.id,
        status: finalStatus,
        verificationStatus: finalVer,
      },
    });
  } catch (err: unknown) {
    console.error("[API Admin Lost-Found PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update item." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/lost-found/[id]
 * Administrator deletes item report.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
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

    await db.delete(schema.lostFoundItems).where(eq(schema.lostFoundItems.id, params.id));

    await createAuditLog(
      auth.user.id,
      "ADMIN_DELETED_LOST_FOUND",
      "LOST_FOUND_ITEM",
      params.id,
      `Deleted ${existing.type}: ${existing.title}`
    );

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (err: unknown) {
    console.error("[API Admin Lost-Found DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete item." }, { status: 500 });
  }
}
