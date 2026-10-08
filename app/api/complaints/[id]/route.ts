import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaints/[id]
 * Retrieve single complaint details.
 * STRICT PRIVACY: Accessible ONLY to the complaint's creator or an administrator.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    // Query by id OR reference
    const [complaint] = await db
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
      })
      .from(schema.campusComplaints)
      .where(
        or(
          eq(schema.campusComplaints.id, params.id),
          eq(schema.campusComplaints.reference, params.id)
        )
      )
      .limit(1);

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found." }, { status: 404 });
    }

    const isReporter = complaint.reporterId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";

    if (!isReporter && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view this complaint." },
        { status: 403 }
      );
    }

    const { reporterId, ...safeComplaint } = complaint;

    return NextResponse.json({
      success: true,
      complaint: safeComplaint,
      isReporter,
    });
  } catch (err: unknown) {
    console.error("[API Complaint Detail GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch complaint." }, { status: 500 });
  }
}
