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
    const deptId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.departments)
      .where(eq(schema.departments.id, deptId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.departments.$inferInsert> = {
      updatedAt: now,
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.shortName !== undefined) updateData.shortName = body.shortName.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.building !== undefined) updateData.building = body.building.trim();
    if (body.floor !== undefined) updateData.floor = body.floor.trim();
    if (body.room !== undefined) updateData.room = body.room.trim();
    if (body.email !== undefined) updateData.email = body.email.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.website !== undefined) updateData.website = body.website.trim();
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl.trim();
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName.trim();

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus.toUpperCase();
      if (body.verificationStatus.toUpperCase() === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.departments).set(updateData).where(eq(schema.departments.id, deptId));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_DEPARTMENT", "DEPARTMENT", deptId);

    return NextResponse.json({ success: true, message: "Department updated successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Departments PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update department." }, { status: 500 });
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
    const deptId = params.id;
    await db.delete(schema.departments).where(eq(schema.departments.id, deptId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_DEPARTMENT", "DEPARTMENT", deptId);

    return NextResponse.json({ success: true, message: "Department deleted successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Departments DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete department." }, { status: 500 });
  }
}
