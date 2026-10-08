import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getUserNotifications } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Returns authenticated user's notifications with unread counts.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const data = await getUserNotifications(auth.user.id, {
      limit,
      offset,
      unreadOnly,
    });

    return NextResponse.json({
      success: true,
      notifications: data.notifications,
      total: data.total,
      unreadCount: data.unreadCount,
    });
  } catch (err: unknown) {
    console.error("[API Notifications GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}
