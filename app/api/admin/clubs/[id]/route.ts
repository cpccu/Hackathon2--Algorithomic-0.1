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
    const clubId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.clubs)
      .where(eq(schema.clubs.id, clubId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Club not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.clubs.$inferInsert> = {
      updatedAt: now,
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail ? body.contactEmail.trim() : null;
    if (body.contactUrl !== undefined) updateData.contactUrl = body.contactUrl ? body.contactUrl.trim() : null;
    if (body.socialUrl !== undefined) updateData.socialUrl = body.socialUrl ? body.socialUrl.trim() : null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl ? body.sourceUrl.trim() : null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName ? body.sourceName.trim() : null;

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus.toUpperCase();
      if (body.verificationStatus.toUpperCase() === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.clubs).set(updateData).where(eq(schema.clubs.id, clubId));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_CLUB", "CLUB", clubId);

    return NextResponse.json({ success: true, message: "Club updated successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Clubs PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update club." }, { status: 500 });
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
    const clubId = params.id;
    await db.delete(schema.clubs).where(eq(schema.clubs.id, clubId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_CLUB", "CLUB", clubId);

    return NextResponse.json({ success: true, message: "Club deleted successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Clubs DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete club." }, { status: 500 });
  }
}
