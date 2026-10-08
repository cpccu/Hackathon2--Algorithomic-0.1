import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const [
      [eventsTotal],
      [eventsVerified],
      [eventsPending],
      [noticesTotal],
      [departmentsTotal],
      [facultyTotal],
      [locationsTotal],
      [faqsTotal],
      [clubsTotal],
      [registrationsTotal],
      [lostFoundTotal],
      [lostFoundPending],
      [complaintsTotal],
      [complaintsPending],
    ] = await Promise.all([
      db.select({ value: count() }).from(schema.events),
      db
        .select({ value: count() })
        .from(schema.events)
        .where(eq(schema.events.verificationStatus, "VERIFIED")),
      db
        .select({ value: count() })
        .from(schema.events)
        .where(eq(schema.events.verificationStatus, "PENDING")),
      db.select({ value: count() }).from(schema.notices),
      db.select({ value: count() }).from(schema.departments),
      db.select({ value: count() }).from(schema.faculty),
      db.select({ value: count() }).from(schema.campusLocations),
      db.select({ value: count() }).from(schema.campusFaqs),
      db.select({ value: count() }).from(schema.clubs),
      db.select({ value: count() }).from(schema.eventRegistrations),
      db.select({ value: count() }).from(schema.lostFoundItems),
      db
        .select({ value: count() })
        .from(schema.lostFoundItems)
        .where(eq(schema.lostFoundItems.verificationStatus, "PENDING")),
      db.select({ value: count() }).from(schema.campusComplaints),
      db
        .select({ value: count() })
        .from(schema.campusComplaints)
        .where(eq(schema.campusComplaints.status, "SUBMITTED")),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        events: {
          total: Number(eventsTotal?.value || 0),
          verified: Number(eventsVerified?.value || 0),
          pending: Number(eventsPending?.value || 0),
        },
        notices: Number(noticesTotal?.value || 0),
        departments: Number(departmentsTotal?.value || 0),
        faculty: Number(facultyTotal?.value || 0),
        locations: Number(locationsTotal?.value || 0),
        faqs: Number(faqsTotal?.value || 0),
        clubs: Number(clubsTotal?.value || 0),
        registrations: Number(registrationsTotal?.value || 0),
        lostFound: {
          total: Number(lostFoundTotal?.value || 0),
          pending: Number(lostFoundPending?.value || 0),
        },
        complaints: {
          total: Number(complaintsTotal?.value || 0),
          pending: Number(complaintsPending?.value || 0),
        },
      },
    });
  } catch (err: unknown) {
    console.error("[API Admin Stats] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load admin stats." }, { status: 500 });
  }
}
