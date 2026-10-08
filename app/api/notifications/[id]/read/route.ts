import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/notifications/[id]/read
 * Marks a specific notification as read.
 * STRICT SECURITY: Verifies the notification belongs to the authenticated user.
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
    const notificationId = params.id;

    // Check if notification exists
    const [existing] = await db
      .select({ id: schema.notifications.id, userId: schema.notifications.userId, readAt: schema.notifications.readAt })
      .from(schema.notifications)
      .where(eq(schema.notifications.id, notificationId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Notification not found." },
        { status: 404 }
      );
    }

    // STRICT ISOLATION: Student A cannot touch Student B's notifications
    if (existing.userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You cannot modify another user's notifications." },
        { status: 403 }
      );
    }

    if (!existing.readAt) {
      await db
        .update(schema.notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(schema.notifications.id, notificationId),
            eq(schema.notifications.userId, auth.user.id)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (err: unknown) {
    console.error("[API Notification Mark Read PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read." },
      { status: 500 }
    );
  }
}
