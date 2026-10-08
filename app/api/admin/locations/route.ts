import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, ilike, or, and, SQL } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    const conditions: SQL[] = [];
    if (q) {
      conditions.push(
        or(
          ilike(schema.campusLocations.name, `%${q}%`),
          ilike(schema.campusLocations.building, `%${q}%`),
          ilike(schema.campusLocations.description, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(schema.campusLocations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.campusLocations.createdAt));

    return NextResponse.json({ success: true, locations: rows });
  } catch (err: unknown) {
    console.error("[API Admin Locations GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load locations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      name,
      category = "Campus Facility",
      description,
      building,
      floor,
      room,
      departmentId,
      mapUrl,
      sourceUrl,
      sourceName = "Campus Infrastructure Map",
      verificationStatus = "VERIFIED",
    } = body;

    if (!name || !building) {
      return NextResponse.json(
        { success: false, error: "Location name and building are required." },
        { status: 400 }
      );
    }

    const locId = `loc_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const now = new Date();
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.campusLocations).values({
      id: locId,
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      building: building.trim(),
      floor: floor?.trim() || null,
      room: room?.trim() || null,
      departmentId: departmentId || null,
      mapUrl: mapUrl?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(auth.user.id, "ADMIN_CREATED_LOCATION", "LOCATION", locId, `Location: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Campus location added successfully.",
      locationId: locId,
      location: { id: locId, name: name.trim(), category: category.trim() },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin Locations POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create location." }, { status: 500 });
  }
}
