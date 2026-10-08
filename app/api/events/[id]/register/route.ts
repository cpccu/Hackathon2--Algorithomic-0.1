import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getDrizzleDb, getSession, getUserById } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/[id]/register
 * Register authenticated student for an event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
    }

    // 1. Session Authentication
    const sessionCookie = req.cookies.get("campusos_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const session = await getSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired." }, { status: 401 });
    }

    const db = getDrizzleDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
    }

    // 2. Fetch User Profile
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User identity not found." }, { status: 404 });
    }

    // 3. Verify Event Exists and is VERIFIED
    const [eventRow] = await db
      .select()
      .from(schema.events)
      .where(and(eq(schema.events.id, eventId), eq(schema.events.verificationStatus, "VERIFIED")))
      .limit(1);

    if (!eventRow) {
      return NextResponse.json({ success: false, error: "Event not found or not verified." }, { status: 404 });
    }

    // 4. Check Existing Registration
    const [existingRegistration] = await db
      .select()
      .from(schema.eventRegistrations)
      .where(
        and(
          eq(schema.eventRegistrations.eventId, eventId),
          eq(schema.eventRegistrations.userId, session.userId)
        )
      )
      .limit(1);

    const now = new Date();
    let regRecordId = "";

    if (existingRegistration) {
      if (existingRegistration.status === "REGISTERED") {
        return NextResponse.json(
          {
            success: false,
            error: "Already registered for this event.",
            isRegistered: true,
            registration: existingRegistration,
          },
          { status: 409 }
        );
      }

      // Re-activate previously cancelled registration
      await db
        .update(schema.eventRegistrations)
        .set({
          status: "REGISTERED",
          updatedAt: now,
        })
        .where(eq(schema.eventRegistrations.id, existingRegistration.id));

      regRecordId = existingRegistration.id;
    } else {
      // Create fresh registration
      regRecordId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(schema.eventRegistrations).values({
        id: regRecordId,
        eventId,
        userId: session.userId,
        status: "REGISTERED",
        registeredAt: now,
        updatedAt: now,
      });
    }

    // In-App Notification: Notify student of confirmed registration
    await createNotification({
      userId: session.userId,
      type: "EVENT_REGISTERED",
      title: "Event Registration Confirmed",
      message: `Your registration for "${eventRow.title}" has been confirmed.`,
      entityType: "event",
      entityId: eventId,
      actionUrl: `/events/my`,
    });

    // Generate safe alphanumeric reference ID for check-in / confirmation
    const referenceId = `CAMPUSOS-EVT-${regRecordId.toUpperCase()}`;

    return NextResponse.json({
      success: true,
      message: "Registration confirmed successfully.",
      registration: {
        id: regRecordId,
        eventId,
        userId: session.userId,
        status: "REGISTERED",
        registeredAt: now.toISOString(),
      },
      confirmation: {
        referenceId,
        eventTitle: eventRow.title,
        venue: eventRow.venue,
        startAt: eventRow.startAt.toISOString(),
        userName: user.name,
        studentId: user.studentId,
        userEmail: user.email,
      },
      pass: {
        referenceId,
        eventTitle: eventRow.title,
        venue: eventRow.venue,
        startAt: eventRow.startAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("[API Event Registration] POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to complete event registration." }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id]/register
 * Cancel student's own event registration
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required." }, { status: 400 });
    }

    // 1. Session Authentication
    const sessionCookie = req.cookies.get("campusos_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const session = await getSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired." }, { status: 401 });
    }

    const db = getDrizzleDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
    }

    // 2. Find Existing Active Registration for THIS User Only
    const [existingRegistration] = await db
      .select()
      .from(schema.eventRegistrations)
      .where(
        and(
          eq(schema.eventRegistrations.eventId, eventId),
          eq(schema.eventRegistrations.userId, session.userId),
          eq(schema.eventRegistrations.status, "REGISTERED")
        )
      )
      .limit(1);

    if (!existingRegistration) {
      return NextResponse.json(
        { success: false, error: "No active registration found to cancel." },
        { status: 404 }
      );
    }

    // 3. Mark Registration as CANCELLED (Never deletes event or other users' registrations)
    await db
      .update(schema.eventRegistrations)
      .set({
        status: "CANCELLED",
        updatedAt: new Date(),
      })
      .where(eq(schema.eventRegistrations.id, existingRegistration.id));

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully.",
    });
  } catch (err: unknown) {
    console.error("[API Event Registration] DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to cancel event registration." }, { status: 500 });
  }
}
