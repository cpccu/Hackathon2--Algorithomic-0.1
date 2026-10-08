import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, or, ilike, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/complaints
 * Admin lists all complaints with reporter details.
 */
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
    const category = searchParams.get("category")?.trim() || "ALL";
    const priority = searchParams.get("priority")?.trim().toUpperCase() || "ALL";
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL";

    const conditions: SQL[] = [];

    if (category !== "ALL") {
      conditions.push(eq(schema.campusComplaints.category, category));
    }

    if (priority !== "ALL") {
      conditions.push(eq(schema.campusComplaints.priority, priority));
    }

    if (status !== "ALL") {
      conditions.push(eq(schema.campusComplaints.status, status));
    }

    if (q) {
      conditions.push(
        or(
          ilike(schema.campusComplaints.subject, `%${q}%`),
          ilike(schema.campusComplaints.description, `%${q}%`),
          ilike(schema.campusComplaints.reference, `%${q}%`),
          ilike(schema.campusComplaints.location, `%${q}%`)
        )!
      );
    }

    const complaints = await db
      .select({
        id: schema.campusComplaints.id,
        reference: schema.campusComplaints.reference,
        reporterId: schema.campusComplaints.reporterId,
        category: schema.campusComplaints.category,
        subject: schema.campusComplaints.subject,
        description: schema.campusComplaints.description,
        location: schema.campusComplaints.location,
        priority: schema.campusComplaints.priority,
        status: schema.campusComplaints.status,
        adminResponse: schema.campusComplaints.adminResponse,
        resolvedAt: schema.campusComplaints.resolvedAt,
        createdAt: schema.campusComplaints.createdAt,
        updatedAt: schema.campusComplaints.updatedAt,
        reporterName: schema.users.name,
        reporterEmail: schema.users.email,
        reporterStudentId: schema.users.studentId,
      })
      .from(schema.campusComplaints)
      .leftJoin(schema.users, eq(schema.campusComplaints.reporterId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.campusComplaints.createdAt));

    return NextResponse.json({
      success: true,
      complaints,
    });
  } catch (err: unknown) {
    console.error("[API Admin Complaints GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load complaints." }, { status: 500 });
  }
}
