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
          ilike(schema.faculty.name, `%${q}%`),
          ilike(schema.faculty.designation, `%${q}%`),
          ilike(schema.faculty.email, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select({
        id: schema.faculty.id,
        name: schema.faculty.name,
        designation: schema.faculty.designation,
        departmentId: schema.faculty.departmentId,
        departmentName: schema.departments.name,
        email: schema.faculty.email,
        phone: schema.faculty.phone,
        profileUrl: schema.faculty.profileUrl,
        sourceUrl: schema.faculty.sourceUrl,
        sourceName: schema.faculty.sourceName,
        verificationStatus: schema.faculty.verificationStatus,
        verifiedAt: schema.faculty.verifiedAt,
        createdAt: schema.faculty.createdAt,
      })
      .from(schema.faculty)
      .leftJoin(schema.departments, eq(schema.faculty.departmentId, schema.departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.faculty.createdAt));

    return NextResponse.json({ success: true, faculty: rows });
  } catch (err: unknown) {
    console.error("[API Admin Faculty GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load faculty." }, { status: 500 });
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
      designation,
      departmentId,
      email,
      phone,
      profileUrl,
      sourceUrl,
      sourceName = "Official Department Directory",
      verificationStatus = "VERIFIED",
    } = body;

    if (!name || !designation) {
      return NextResponse.json(
        { success: false, error: "Faculty member name and designation are required." },
        { status: 400 }
      );
    }

    const facId = `fac_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const now = new Date();
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.faculty).values({
      id: facId,
      name: name.trim(),
      designation: designation.trim(),
      departmentId: departmentId || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      profileUrl: profileUrl?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(auth.user.id, "ADMIN_CREATED_FACULTY", "FACULTY", facId, `Faculty: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Faculty member added successfully.",
      facultyId: facId,
      faculty: { id: facId, name: name.trim(), designation: designation.trim() },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin Faculty POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create faculty member." }, { status: 500 });
  }
}
