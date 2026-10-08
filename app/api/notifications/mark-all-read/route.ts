import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { markAllNotificationsAsRead } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/mark-all-read
 * Marks all unread notifications belonging to the authenticated user as read.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const updatedCount = await markAllNotificationsAsRead(auth.user.id);

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
      count: updatedCount,
    });
  } catch (err: unknown) {
    console.error("[API Notifications Mark All Read POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to mark all notifications as read." },
      { status: 500 }
    );
  }
}
