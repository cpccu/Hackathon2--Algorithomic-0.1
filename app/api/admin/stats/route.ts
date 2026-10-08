import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 503 });
  }

  try {
    const result = await db.execute(sql`
      SELECT
        (SELECT count(*) FROM ${schema.events})::int AS "eventsTotal",
        (SELECT count(*) FROM ${schema.events} WHERE ${schema.events.verificationStatus} = 'VERIFIED')::int AS "eventsVerified",
        (SELECT count(*) FROM ${schema.events} WHERE ${schema.events.verificationStatus} = 'PENDING')::int AS "eventsPending",
        (SELECT count(*) FROM ${schema.notices})::int AS "noticesTotal",
        (SELECT count(*) FROM ${schema.departments})::int AS "departmentsTotal",
        (SELECT count(*) FROM ${schema.faculty})::int AS "facultyTotal",
        (SELECT count(*) FROM ${schema.campusLocations})::int AS "locationsTotal",
        (SELECT count(*) FROM ${schema.campusFaqs})::int AS "faqsTotal",
        (SELECT count(*) FROM ${schema.clubs})::int AS "clubsTotal",
        (SELECT count(*) FROM ${schema.eventRegistrations})::int AS "registrationsTotal",
        (SELECT count(*) FROM ${schema.lostFoundItems})::int AS "lostFoundTotal",
        (SELECT count(*) FROM ${schema.lostFoundItems} WHERE ${schema.lostFoundItems.verificationStatus} = 'PENDING')::int AS "lostFoundPending",
        (SELECT count(*) FROM ${schema.campusComplaints})::int AS "complaintsTotal",
        (SELECT count(*) FROM ${schema.campusComplaints} WHERE ${schema.campusComplaints.status} = 'SUBMITTED')::int AS "complaintsPending"
    `);

    const row = ((result.rows?.[0] || {}) as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      stats: {
        events: {
          total: Number(row.eventsTotal || 0),
          verified: Number(row.eventsVerified || 0),
          pending: Number(row.eventsPending || 0),
        },
        notices: Number(row.noticesTotal || 0),
        departments: Number(row.departmentsTotal || 0),
        faculty: Number(row.facultyTotal || 0),
        locations: Number(row.locationsTotal || 0),
        faqs: Number(row.faqsTotal || 0),
        clubs: Number(row.clubsTotal || 0),
        registrations: Number(row.registrationsTotal || 0),
        lostFound: {
          total: Number(row.lostFoundTotal || 0),
          pending: Number(row.lostFoundPending || 0),
        },
        complaints: {
          total: Number(row.complaintsTotal || 0),
          pending: Number(row.complaintsPending || 0),
        },
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[API Admin Stats] Database query error:", errorMsg);
    return NextResponse.json(
      { success: false, error: "Failed to load admin stats." },
      { status: 500 }
    );
  }
}
