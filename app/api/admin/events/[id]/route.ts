import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

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
    const eventId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.events.$inferInsert> = {
      updatedAt: now,
    };

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.organizer !== undefined) updateData.organizer = body.organizer.trim();
    if (body.venue !== undefined) updateData.venue = body.venue.trim();
    if (body.startAt !== undefined) updateData.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updateData.endAt = body.endAt ? new Date(body.endAt) : null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.registrationUrl !== undefined) updateData.registrationUrl = body.registrationUrl || null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl || null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName || null;

    if (body.verificationStatus !== undefined || body.status !== undefined) {
      const newStatus = (body.verificationStatus || body.status).toUpperCase();
      updateData.verificationStatus = newStatus;
      if (newStatus === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.events).set(updateData).where(eq(schema.events.id, eventId));

    // Notify registered students on meaningful changes or cancellation
    const isCancelled = updateData.verificationStatus === "CANCELLED" || updateData.verificationStatus === "ARCHIVED";
    const hadMeaningfulChange = Boolean(
      (updateData.title && updateData.title !== existing.title) ||
      (updateData.venue && updateData.venue !== existing.venue) ||
      (updateData.description && updateData.description !== existing.description) ||
      (updateData.organizer && updateData.organizer !== existing.organizer) ||
      (updateData.startAt && updateData.startAt.getTime() !== existing.startAt.getTime()) ||
      isCancelled
    );

    if (hadMeaningfulChange) {
      try {
        const registrations = await db
          .select({ userId: schema.eventRegistrations.userId })
          .from(schema.eventRegistrations)
          .where(
            and(
              eq(schema.eventRegistrations.eventId, eventId),
              eq(schema.eventRegistrations.status, "REGISTERED")
            )
          );

        const eventTitle = updateData.title || existing.title;
        for (const reg of registrations) {
          if (isCancelled) {
            await createNotification({
              userId: reg.userId,
              type: "EVENT_CANCELLED",
              title: "Event Cancelled",
              message: `"${eventTitle}" has been cancelled.`,
              entityType: "event",
              entityId: eventId,
              actionUrl: `/events`,
            });
          } else {
            await createNotification({
              userId: reg.userId,
              type: "EVENT_UPDATED",
              title: "Event Updated",
              message: `"${eventTitle}" has been updated. Check the event details for the latest information.`,
              entityType: "event",
              entityId: eventId,
              actionUrl: `/events`,
            });
          }
        }
      } catch (notifErr) {
        console.error("[Event Update Notification] Error:", notifErr);
      }
    }

    const finalStatus = updateData.verificationStatus || existing.verificationStatus;
    let auditAction = "ADMIN_UPDATED_EVENT";
    if (finalStatus === "VERIFIED") auditAction = "ADMIN_VERIFIED_EVENT";
    else if (finalStatus === "ARCHIVED") auditAction = "ADMIN_ARCHIVED_EVENT";

    await createAuditLog(auth.user.id, auditAction, "EVENT", eventId, `Status: ${finalStatus}`);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: {
        id: eventId,
        status: finalStatus,
        verificationStatus: finalStatus,
      },
    });
  } catch (err: unknown) {
    console.error("[API Admin Events PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update event." }, { status: 500 });
  }
}

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
    const eventId = params.id;
    await db.delete(schema.events).where(eq(schema.events.id, eventId));

    await createAuditLog(auth.user.id, "ADMIN_DELETED_EVENT", "EVENT", eventId);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (err: unknown) {
    console.error("[API Admin Events DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete event." }, { status: 500 });
  }
}
