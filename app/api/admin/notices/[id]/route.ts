import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const noticeId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.notices)
      .where(eq(schema.notices.id, noticeId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Notice not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.notices.$inferInsert> = {
      updatedAt: now,
    };

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl || null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName || null;

    if (body.verificationStatus !== undefined || body.status !== undefined) {
      const newStatus = (body.verificationStatus || body.status).toUpperCase();
      updateData.verificationStatus = newStatus;
      if (newStatus === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.notices).set(updateData).where(eq(schema.notices.id, noticeId));

    const finalStatus = updateData.verificationStatus || existing.verificationStatus;
    let auditAction = "ADMIN_UPDATED_NOTICE";
    if (finalStatus === "VERIFIED") auditAction = "ADMIN_VERIFIED_NOTICE";
    else if (finalStatus === "ARCHIVED") auditAction = "ADMIN_ARCHIVED_NOTICE";

    await createAuditLog(auth.user.id, auditAction, "NOTICE", noticeId);

    return NextResponse.json({
      success: true,
      message: "Notice updated successfully.",
      notice: {
        id: noticeId,
        status: finalStatus,
        verificationStatus: finalStatus,
      },
    });
  } catch (err: unknown) {
    console.error("[API Admin Notices PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update notice." }, { status: 500 });
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
    const noticeId = params.id;
    await db.delete(schema.notices).where(eq(schema.notices.id, noticeId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_NOTICE", "NOTICE", noticeId);

    return NextResponse.json({ success: true, message: "Notice deleted successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Notices DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete notice." }, { status: 500 });
  }
}
