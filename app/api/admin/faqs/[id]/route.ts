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
    const faqId = params.id;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(schema.campusFaqs)
      .where(eq(schema.campusFaqs.id, faqId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "FAQ not found." }, { status: 404 });
    }

    const now = new Date();
    const updateData: Partial<typeof schema.campusFaqs.$inferInsert> = {
      updatedAt: now,
    };

    if (body.question !== undefined) updateData.question = body.question.trim();
    if (body.answer !== undefined) updateData.answer = body.answer.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl ? body.sourceUrl.trim() : null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName ? body.sourceName.trim() : null;

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus.toUpperCase();
      if (body.verificationStatus.toUpperCase() === "VERIFIED") {
        updateData.verifiedAt = now;
      }
    }

    await db.update(schema.campusFaqs).set(updateData).where(eq(schema.campusFaqs.id, faqId));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_FAQ", "FAQ", faqId);

    return NextResponse.json({ success: true, message: "FAQ updated successfully." });
  } catch (err: unknown) {
    console.error("[API Admin FAQs PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update FAQ." }, { status: 500 });
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
    const faqId = params.id;
    await db.delete(schema.campusFaqs).where(eq(schema.campusFaqs.id, faqId));
    await createAuditLog(auth.user.id, "ADMIN_DELETED_FAQ", "FAQ", faqId);

    return NextResponse.json({ success: true, message: "FAQ deleted successfully." });
  } catch (err: unknown) {
    console.error("[API Admin FAQs DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ." }, { status: 500 });
  }
}
