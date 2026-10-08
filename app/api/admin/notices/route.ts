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
    const status = searchParams.get("status")?.trim() || "ALL";

    const conditions: SQL[] = [];
    if (status !== "ALL") {
      conditions.push(eq(schema.notices.verificationStatus, status.toUpperCase()));
    }
    if (q) {
      conditions.push(
        or(
          ilike(schema.notices.title, `%${q}%`),
          ilike(schema.notices.content, `%${q}%`),
          ilike(schema.notices.category, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(schema.notices)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.notices.publishedAt));

    return NextResponse.json({ success: true, notices: rows });
  } catch (err: unknown) {
    console.error("[API Admin Notices GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load notices." }, { status: 500 });
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
      title,
      content,
      category = "General",
      departmentId,
      sourceUrl,
      sourceName = "Official University Bulletin",
      verificationStatus = "PENDING",
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required." },
        { status: 400 }
      );
    }

    const now = new Date();
    const noticeId = `not_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.notices).values({
      id: noticeId,
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      departmentId: departmentId || null,
      publishedAt: now,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(
      auth.user.id,
      isVerified ? "ADMIN_CREATED_AND_VERIFIED_NOTICE" : "ADMIN_CREATED_NOTICE",
      "NOTICE",
      noticeId,
      `Notice: ${title}`
    );

    return NextResponse.json({
      success: true,
      message: isVerified ? "Notice published and verified." : "Notice saved as pending draft.",
      noticeId,
      notice: {
        id: noticeId,
        title,
        status: isVerified ? "VERIFIED" : "PENDING",
        verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin Notices POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create notice." }, { status: 500 });
  }
}
