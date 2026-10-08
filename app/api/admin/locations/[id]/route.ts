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
    const locId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.campusLocations)
      .where(eq(schema.campusLocations.id, locId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Location not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.campusLocations.$inferInsert> = {
      updatedAt: now,
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
    if (body.building !== undefined) updateData.building = body.building.trim();
    if (body.floor !== undefined) updateData.floor = body.floor ? body.floor.trim() : null;
    if (body.room !== undefined) updateData.room = body.room ? body.room.trim() : null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.mapUrl !== undefined) updateData.mapUrl = body.mapUrl ? body.mapUrl.trim() : null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl ? body.sourceUrl.trim() : null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName ? body.sourceName.trim() : null;

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus.toUpperCase();
      if (body.verificationStatus.toUpperCase() === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.campusLocations).set(updateData).where(eq(schema.campusLocations.id, locId));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_LOCATION", "LOCATION", locId);

    return NextResponse.json({ success: true, message: "Location updated successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Locations PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update location." }, { status: 500 });
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
    const locId = params.id;
    await db.delete(schema.campusLocations).where(eq(schema.campusLocations.id, locId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_LOCATION", "LOCATION", locId);

    return NextResponse.json({ success: true, message: "Location deleted successfully." });
  } catch (err: unknown) {
    console.error("[API Admin Locations DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete location." }, { status: 500 });
  }
}
