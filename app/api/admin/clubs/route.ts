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
          ilike(schema.clubs.name, `%${q}%`),
          ilike(schema.clubs.description, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(schema.clubs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.clubs.createdAt));

    return NextResponse.json({ success: true, clubs: rows });
  } catch (err: unknown) {
    console.error("[API Admin Clubs GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load clubs." }, { status: 500 });
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
      description,
      departmentId,
      contactEmail,
      contactUrl,
      socialUrl,
      sourceUrl,
      sourceName = "Official Student Affairs Registry",
      verificationStatus = "VERIFIED",
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Club name is required." },
        { status: 400 }
      );
    }

    const clubId = `club_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const now = new Date();
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.clubs).values({
      id: clubId,
      name: name.trim(),
      description: description?.trim() || null,
      departmentId: departmentId || null,
      contactEmail: contactEmail?.trim() || null,
      contactUrl: contactUrl?.trim() || null,
      socialUrl: socialUrl?.trim() || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(auth.user.id, "ADMIN_CREATED_CLUB", "CLUB", clubId, `Club: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Club created successfully.",
      clubId,
      club: { id: clubId, name: name.trim() },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin Clubs POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create club." }, { status: 500 });
  }
}
