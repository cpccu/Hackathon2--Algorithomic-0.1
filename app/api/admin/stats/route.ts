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
    const [eventsTotal] = await db.select({ value: count() }).from(schema.events);
    const [eventsVerified] = await db
      .select({ value: count() })
      .from(schema.events)
      .where(eq(schema.events.verificationStatus, "VERIFIED"));
    const [eventsPending] = await db
      .select({ value: count() })
      .from(schema.events)
      .where(eq(schema.events.verificationStatus, "PENDING"));

    const [noticesTotal] = await db.select({ value: count() }).from(schema.notices);
    const [departmentsTotal] = await db.select({ value: count() }).from(schema.departments);
    const [facultyTotal] = await db.select({ value: count() }).from(schema.faculty);
    const [locationsTotal] = await db.select({ value: count() }).from(schema.campusLocations);
    const [faqsTotal] = await db.select({ value: count() }).from(schema.campusFaqs);
    const [clubsTotal] = await db.select({ value: count() }).from(schema.clubs);
    const [registrationsTotal] = await db.select({ value: count() }).from(schema.eventRegistrations);
    const [lostFoundTotal] = await db.select({ value: count() }).from(schema.lostFoundItems);
    const [lostFoundPending] = await db
      .select({ value: count() })
      .from(schema.lostFoundItems)
      .where(eq(schema.lostFoundItems.verificationStatus, "PENDING"));
    const [complaintsTotal] = await db.select({ value: count() }).from(schema.campusComplaints);
    const [complaintsPending] = await db
      .select({ value: count() })
      .from(schema.campusComplaints)
      .where(eq(schema.campusComplaints.status, "SUBMITTED"));

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
