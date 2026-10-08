import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaints/my
 * Dedicated endpoint for retrieving the authenticated student's own complaints.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const complaints = await db
      .select({
        id: schema.campusComplaints.id,
        reference: schema.campusComplaints.reference,
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
      })
      .from(schema.campusComplaints)
      .where(eq(schema.campusComplaints.reporterId, auth.user.id))
      .orderBy(desc(schema.campusComplaints.createdAt));

    return NextResponse.json({
      success: true,
      complaints,
    });
  } catch (err: unknown) {
    console.error("[API Complaints My GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch complaints." }, { status: 500 });
  }
}
