import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/lost-found/[id]/claims
 * Admin views all claims for a given item with claimant details.
 */
export async function GET(
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
    const claims = await db
      .select({
        id: schema.lostFoundClaims.id,
        itemId: schema.lostFoundClaims.itemId,
        claimantId: schema.lostFoundClaims.claimantId,
        message: schema.lostFoundClaims.message,
        contactInfo: schema.lostFoundClaims.contactInfo,
        status: schema.lostFoundClaims.status,
        adminNotes: schema.lostFoundClaims.adminNotes,
        createdAt: schema.lostFoundClaims.createdAt,
        updatedAt: schema.lostFoundClaims.updatedAt,
        claimantName: schema.users.name,
        claimantEmail: schema.users.email,
        claimantStudentId: schema.users.studentId,
      })
      .from(schema.lostFoundClaims)
      .leftJoin(schema.users, eq(schema.lostFoundClaims.claimantId, schema.users.id))
      .where(eq(schema.lostFoundClaims.itemId, params.id))
      .orderBy(desc(schema.lostFoundClaims.createdAt));

    return NextResponse.json({
      success: true,
      claims,
    });
  } catch (err: unknown) {
    console.error("[API Admin Claims GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load claims." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/lost-found/[id]/claims
 * Admin approves or rejects a claim.
 * Body: { claimId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string }
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
    const body = await req.json();
    const { claimId, status, adminNotes } = body;

    if (!claimId || !status || !["APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Valid claimId and status ('APPROVED' | 'REJECTED') are required." },
        { status: 400 }
      );
    }

    const [claim] = await db
      .select()
      .from(schema.lostFoundClaims)
      .where(eq(schema.lostFoundClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found." }, { status: 404 });
    }

    const now = new Date();
    const newStatus = status.toUpperCase();

    const [updatedClaim] = await db
      .update(schema.lostFoundClaims)
      .set({
        status: newStatus,
        adminNotes: adminNotes?.trim() || claim.adminNotes,
        updatedAt: now,
      })
      .where(eq(schema.lostFoundClaims.id, claimId))
      .returning();

    // If claim approved, update parent item status to CLAIMED
    if (newStatus === "APPROVED") {
      await db
        .update(schema.lostFoundItems)
        .set({
          status: "CLAIMED",
          updatedAt: now,
        })
        .where(eq(schema.lostFoundItems.id, params.id));
    }

    // In-App Notification: Notify claimant of resolution
    const [parentItem] = await db
      .select({ title: schema.lostFoundItems.title })
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.id, params.id))
      .limit(1);

    const itemTitle = parentItem?.title || "your claimed item";

    if (newStatus === "APPROVED") {
      await createNotification({
        userId: claim.claimantId,
        type: "LOST_FOUND_CLAIM_APPROVED",
        title: "Claim Approved",
        message: `Your claim for "${itemTitle}" has been approved.`,
        entityType: "lost_found",
        entityId: params.id,
        actionUrl: `/lost-found/my`,
      });
    } else if (newStatus === "REJECTED") {
      await createNotification({
        userId: claim.claimantId,
        type: "LOST_FOUND_CLAIM_REJECTED",
        title: "Claim Update",
        message: `Your claim for "${itemTitle}" was not approved.`,
        entityType: "lost_found",
        entityId: params.id,
        actionUrl: `/lost-found/my`,
      });
    }

    await createAuditLog(
      auth.user.id,
      `ADMIN_${newStatus}_CLAIM`,
      "LOST_FOUND_ITEM",
      params.id,
      `Claim ${claimId} set to ${newStatus}`
    );

    return NextResponse.json({
      success: true,
      message: `Claim ${newStatus.toLowerCase()} successfully.`,
      status: newStatus,
      claim: updatedClaim,
    });
  } catch (err: unknown) {
    console.error("[API Admin Claims PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update claim." }, { status: 500 });
  }
}
