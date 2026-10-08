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
    const facultyId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.faculty)
      .where(eq(schema.faculty.id, facultyId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Faculty member not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.faculty.$inferInsert> = {
      updatedAt: now,
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.designation !== undefined) updateData.designation = body.designation.trim();
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.email !== undefined) updateData.email = body.email ? body.email.trim() : null;
    if (body.phone !== undefined) updateData.phone = body.phone ? body.phone.trim() : null;
    if (body.profileUrl !== undefined) updateData.profileUrl = body.profileUrl ? body.profileUrl.trim() : null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl ? body.sourceUrl.trim() : null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName ? body.sourceName.trim() : null;

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus.toUpperCase();
      if (body.verificationStatus.toUpperCase() === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.faculty).set(updateData).where(eq(schema.faculty.id, facultyId));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_FACULTY", "FACULTY", facultyId);

    return NextResponse.json({ success: true, message: "Faculty member updated successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Faculty PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update faculty member." }, { status: 500 });
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
    const facultyId = params.id;
    await db.delete(schema.faculty).where(eq(schema.faculty.id, facultyId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_FACULTY", "FACULTY", facultyId);

    return NextResponse.json({ success: true, message: "Faculty member removed successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Faculty DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete faculty member." }, { status: 500 });
  }
}
