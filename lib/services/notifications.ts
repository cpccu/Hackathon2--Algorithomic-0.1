import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, isNull, count, sql, gte } from "drizzle-orm";
import crypto from "crypto";

export type NotificationType =
  | "EVENT_REGISTERED"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "LOST_FOUND_VERIFIED"
  | "LOST_FOUND_CLAIM_SUBMITTED"
  | "LOST_FOUND_CLAIM_APPROVED"
  | "LOST_FOUND_CLAIM_REJECTED"
  | "LOST_FOUND_RESOLVED"
  | "COMPLAINT_SUBMITTED"
  | "COMPLAINT_STATUS_UPDATED"
  | "COMPLAINT_RESPONSE"
  | "SYSTEM";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: "event" | "lost_found" | "complaint" | "system" | string | null;
  entityId?: string | null;
  actionUrl?: string | null;
}

/**
 * Creates a server-side notification for a user.
 * Includes duplicate spam prevention within a reasonable time window.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<schema.Notification | null> {
  const { userId, type, title, message, entityType, entityId, actionUrl } = params;

  if (!userId || !type || !title || !message) {
    console.warn("[Notifications Service] Missing required fields for createNotification");
    return null;
  }

  const db = getDrizzleDb();
  if (!db) {
    console.warn("[Notifications Service] Database unavailable");
    return null;
  }

  try {
    // Duplicate prevention: check if identical notification was dispatched within last 1 minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existing = await db
      .select({ id: schema.notifications.id })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.type, type),
          entityId ? eq(schema.notifications.entityId, entityId) : sql`true`,
          eq(schema.notifications.title, title.trim()),
          gte(schema.notifications.createdAt, oneMinuteAgo)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Duplicate suppressed
      return null;
    }

    const notificationId = `notif_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const [created] = await db
      .insert(schema.notifications)
      .values({
        id: notificationId,
        userId,
        type,
        title: title.trim(),
        message: message.trim(),
        entityType: entityType || null,
        entityId: entityId || null,
        actionUrl: actionUrl || null,
      })
      .returning();

    return created || null;
  } catch (err) {
    console.error("[Notifications Service] Error creating notification:", err);
    return null;
  }
}

/**
 * Retrieves notifications for an authenticated user with pagination and unread counts.
 */
export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
): Promise<{
  notifications: schema.Notification[];
  total: number;
  unreadCount: number;
}> {
  const db = getDrizzleDb();
  if (!db || !userId) {
    return { notifications: [], total: 0, unreadCount: 0 };
  }

  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 50);
  const offset = Math.max(options?.offset ?? 0, 0);
  const unreadOnly = Boolean(options?.unreadOnly);

  try {
    // Base filter conditions
    const baseConditions = [eq(schema.notifications.userId, userId)];
    if (unreadOnly) {
      baseConditions.push(isNull(schema.notifications.readAt));
    }

    const items = await db
      .select()
      .from(schema.notifications)
      .where(and(...baseConditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await db
      .select({ count: count() })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId));

    const [unreadRow] = await db
      .select({ count: count() })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          isNull(schema.notifications.readAt)
        )
      );

    return {
      notifications: items,
      total: Number(totalRow?.count || 0),
      unreadCount: Number(unreadRow?.count || 0),
    };
  } catch (err) {
    console.error("[Notifications Service] Error loading notifications:", err);
    return { notifications: [], total: 0, unreadCount: 0 };
  }
}

/**
 * Returns the unread notification count for an authenticated user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = getDrizzleDb();
  if (!db || !userId) return 0;

  try {
    const [row] = await db
      .select({ count: count() })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          isNull(schema.notifications.readAt)
        )
      );

    return Number(row?.count || 0);
  } catch (err) {
    console.error("[Notifications Service] Error counting unread notifications:", err);
    return 0;
  }
}

/**
 * Marks a single notification as read, enforcing strict ownership isolation.
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const db = getDrizzleDb();
  if (!db || !userId || !notificationId) return false;

  try {
    const updated = await db
      .update(schema.notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.userId, userId),
          isNull(schema.notifications.readAt)
        )
      )
      .returning({ id: schema.notifications.id });

    return updated.length > 0;
  } catch (err) {
    console.error("[Notifications Service] Error marking notification as read:", err);
    return false;
  }
}

/**
 * Marks all unread notifications as read for the authenticated user.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const db = getDrizzleDb();
  if (!db || !userId) return 0;

  try {
    const updated = await db
      .update(schema.notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(schema.notifications.userId, userId),
          isNull(schema.notifications.readAt)
        )
      )
      .returning({ id: schema.notifications.id });

    return updated.length;
  } catch (err) {
    console.error("[Notifications Service] Error marking all notifications as read:", err);
    return 0;
  }
}
