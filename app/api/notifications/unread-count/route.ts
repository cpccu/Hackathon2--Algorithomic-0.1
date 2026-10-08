import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getUnreadNotificationCount } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/unread-count
 * Returns the unread notification count for authenticated user.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const count = await getUnreadNotificationCount(auth.user.id);
    return NextResponse.json({
      success: true,
      count,
      unreadCount: count,
    });
  } catch (err: unknown) {
    console.error("[API Notifications Unread Count GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unread count." },
      { status: 500 }
    );
  }
}
