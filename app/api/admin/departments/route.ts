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
          ilike(schema.departments.name, `%${q}%`),
          ilike(schema.departments.shortName, `%${q}%`),
          ilike(schema.departments.building, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(schema.departments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.departments.createdAt));

    return NextResponse.json({ success: true, departments: rows });
  } catch (err: unknown) {
    console.error("[API Admin Departments GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load departments." }, { status: 500 });
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
    const shortCode = (body.shortName || body.code)?.trim();
    const {
      name,
      description,
      building,
      floor,
      room,
      email,
      phone,
      website,
      sourceUrl,
      sourceName = "Official University Records",
      verificationStatus = "VERIFIED",
    } = body;

    if (!name || !shortCode) {
      return NextResponse.json(
        { success: false, error: "Department name and short code are required." },
        { status: 400 }
      );
    }

    const deptId = `dept_${shortCode.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const now = new Date();
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.departments).values({
      id: deptId,
      name: name.trim(),
      shortName: shortCode,
      description: description?.trim() || null,
      building: building?.trim() || null,
      floor: floor?.trim() || null,
      room: room?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(auth.user.id, "ADMIN_CREATED_DEPARTMENT", "DEPARTMENT", deptId, `Dept: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Department created successfully.",
      departmentId: deptId,
      department: { id: deptId, name: name.trim(), code: shortCode },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin Departments POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create department." }, { status: 500 });
  }
}
