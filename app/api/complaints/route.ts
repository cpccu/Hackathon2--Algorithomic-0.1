import { NextRequest, NextResponse } from "next/server";
import { requireAuth, checkRateLimit } from "@/lib/security/auth";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaints
 * Returns ONLY the authenticated student's own complaints.
 * Privacy rule: Students must NEVER see other students' complaints.
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
    console.error("[API Complaints GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch complaints." }, { status: 500 });
  }
}

/**
 * POST /api/complaints
 * Submit a new student complaint.
 * Automatically generates a public tracking reference.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response;

  // Rate Limiting: Max 5 complaints per user per hour
  const rateLimit = await checkRateLimit(auth.user.id, "complaint", 5);
  if (!rateLimit.allowed) return rateLimit.response!;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const category = body.category?.trim();
    const subject = body.subject?.trim();
    const description = body.description?.trim();
    const location = body.location?.trim();
    let priority = (body.priority || "MEDIUM").toUpperCase();

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      priority = "MEDIUM";
    }

    if (!category || !subject || !description || !location) {
      return NextResponse.json(
        { success: false, error: "Category, subject, description, and location are required." },
        { status: 400 }
      );
    }

    if (subject.length > 200 || description.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Subject or description exceeds allowed length." },
        { status: 400 }
      );
    }

    const complaintId = `cmp_${Date.now()}_${crypto.randomUUID().slice(0, 7)}`;
    const reference = `CAMPUSOS-CMP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const now = new Date();

    await db.insert(schema.campusComplaints).values({
      id: complaintId,
      reference,
      reporterId: auth.user.id,
      category,
      subject,
      description,
      location,
      priority,
      status: "SUBMITTED",
      adminResponse: null,
      createdAt: now,
      updatedAt: now,
    });

    // In-App Notification: Notify student that complaint has been submitted
    await createNotification({
      userId: auth.user.id,
      type: "COMPLAINT_SUBMITTED",
      title: "Complaint Submitted",
      message: "Your complaint has been submitted successfully.",
      entityType: "complaint",
      entityId: complaintId,
      actionUrl: `/complaints/${complaintId}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Complaint submitted successfully. Your reference code is " + reference,
        complaintId,
        reference,
        complaint: {
          id: complaintId,
          reference,
          subject,
          category,
          status: "SUBMITTED",
          priority,
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[API Complaints POST] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit complaint." }, { status: 500 });
  }
}
