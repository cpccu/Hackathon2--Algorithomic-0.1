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
          ilike(schema.campusFaqs.question, `%${q}%`),
          ilike(schema.campusFaqs.answer, `%${q}%`),
          ilike(schema.campusFaqs.category, `%${q}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(schema.campusFaqs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.campusFaqs.createdAt));

    return NextResponse.json({ success: true, faqs: rows });
  } catch (err: unknown) {
    console.error("[API Admin FAQs GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load FAQs." }, { status: 500 });
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
      question,
      answer,
      category = "Campus Life",
      departmentId,
      sourceUrl,
      sourceName = "Official University FAQ Portal",
      verificationStatus = "VERIFIED",
    } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Question and answer are required." },
        { status: 400 }
      );
    }

    const faqId = `faq_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    const now = new Date();
    const isVerified = verificationStatus === "VERIFIED";

    await db.insert(schema.campusFaqs).values({
      id: faqId,
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      departmentId: departmentId || null,
      sourceUrl: sourceUrl?.trim() || null,
      sourceName: sourceName?.trim() || null,
      verificationStatus: isVerified ? "VERIFIED" : "PENDING",
      verifiedAt: isVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    await createAuditLog(auth.user.id, "ADMIN_CREATED_FAQ", "FAQ", faqId, `Question: ${question}`);

    return NextResponse.json({
      success: true,
      message: "FAQ created successfully.",
      faqId,
      faq: { id: faqId, question: question.trim() },
    }, { status: 201 });
  } catch (err: unknown) {
    console.error("[API Admin FAQs POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to create FAQ." }, { status: 500 });
  }
}
