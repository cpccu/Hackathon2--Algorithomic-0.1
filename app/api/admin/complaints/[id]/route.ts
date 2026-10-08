import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/complaints/[id]
 * Administrator updates complaint status, adds official administrative response.
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
      .from(schema.campusComplaints)
      .where(eq(schema.campusComplaints.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date();
    const updateData: Partial<typeof schema.campusComplaints.$inferInsert> = {
      updatedAt: now,
    };

    if (body.status !== undefined) {
      const newStatus = body.status.toUpperCase();
      if (["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(newStatus)) {
        updateData.status = newStatus;
        if (newStatus === "RESOLVED" || newStatus === "CLOSED") {
          updateData.resolvedAt = now;
        }
      }
    }

    if (body.priority !== undefined) {
      const newPrio = body.priority.toUpperCase();
      if (["LOW", "MEDIUM", "HIGH"].includes(newPrio)) {
        updateData.priority = newPrio;
      }
    }

    if (body.adminResponse !== undefined) {
      updateData.adminResponse = body.adminResponse?.trim() || null;
    }

    const [updatedComplaint] = await db
      .update(schema.campusComplaints)
      .set(updateData)
      .where(eq(schema.campusComplaints.id, params.id))
      .returning();

    // In-App Notification: Notify complaint owner of status change or response
    if (body.adminResponse && body.adminResponse.trim()) {
      await createNotification({
        userId: existing.reporterId,
        type: "COMPLAINT_RESPONSE",
        title: "New Complaint Response",
        message: "Your complaint has received a new response.",
        entityType: "complaint",
        entityId: params.id,
        actionUrl: `/complaints/${params.id}`,
      });
    } else if (updateData.status && updateData.status !== existing.status) {
      await createNotification({
        userId: existing.reporterId,
        type: "COMPLAINT_STATUS_UPDATED",
        title: "Complaint Status Updated",
        message: `Your complaint status has been updated to ${updateData.status}.`,
        entityType: "complaint",
        entityId: params.id,
        actionUrl: `/complaints/${params.id}`,
      });
    }

    const finalStatus = updateData.status || existing.status;
    let auditAction = "ADMIN_UPDATED_COMPLAINT";
    if (body.adminResponse) auditAction = "ADMIN_RESPONDED_COMPLAINT";
    else if (finalStatus === "RESOLVED") auditAction = "ADMIN_RESOLVED_COMPLAINT";
    else if (finalStatus === "CLOSED") auditAction = "ADMIN_CLOSED_COMPLAINT";

    await createAuditLog(
      auth.user.id,
      auditAction,
      "COMPLAINT",
      params.id,
      `Reference: ${existing.reference}, Status: ${finalStatus}`
    );

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully.",
      complaint: {
        ...updatedComplaint,
        referenceNumber: updatedComplaint?.reference,
      },
    });
  } catch (err: unknown) {
    console.error("[API Admin Complaints PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update complaint." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/complaints/[id]
 * Administrator deletes complaint.
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
      .from(schema.campusComplaints)
      .where(eq(schema.campusComplaints.id, params.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }

    await db.delete(schema.campusComplaints).where(eq(schema.campusComplaints.id, params.id));

    await createAuditLog(
      auth.user.id,
      "ADMIN_DELETED_COMPLAINT",
      "COMPLAINT",
      params.id,
      `Deleted complaint ${existing.reference}: ${existing.subject}`
    );

    return NextResponse.json({
      success: true,
      message: "Complaint deleted successfully.",
    });
  } catch (err: unknown) {
    console.error("[API Admin Complaints DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete complaint." }, { status: 500 });
  }
}
