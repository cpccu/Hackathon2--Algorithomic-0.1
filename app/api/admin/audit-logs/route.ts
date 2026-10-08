import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const logs = await db
      .select({
        id: schema.adminAuditLogs.id,
        adminUserId: schema.adminAuditLogs.adminUserId,
        action: schema.adminAuditLogs.action,
        entityType: schema.adminAuditLogs.entityType,
        entityId: schema.adminAuditLogs.entityId,
        details: schema.adminAuditLogs.details,
        createdAt: schema.adminAuditLogs.createdAt,
        adminName: schema.users.name,
        adminEmail: schema.users.email,
      })
      .from(schema.adminAuditLogs)
      .leftJoin(schema.users, eq(schema.adminAuditLogs.adminUserId, schema.users.id))
      .orderBy(desc(schema.adminAuditLogs.createdAt))
      .limit(100);

    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    console.error("[API Admin Audit Logs GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load audit logs." }, { status: 500 });
  }
}
