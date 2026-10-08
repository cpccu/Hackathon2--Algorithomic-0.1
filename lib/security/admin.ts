import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./crypto";
import { getSession, findUserById, UserRecord, SessionRecord } from "@/lib/db";

export type AdminAuthResult =
  | { authorized: true; user: UserRecord; session: SessionRecord }
  | { authorized: false; response: NextResponse };

/**
 * Server-side Admin Authorization Guard
 * Enforces:
 * 1. Valid HMAC-signed session cookie
 * 2. Active PostgreSQL session record
 * 3. Registered user with role === 'ADMIN' or matching CAMPUSOS_ADMIN_EMAIL
 *
 * Returns 401 if unauthenticated, 403 if authenticated student without admin privileges.
 */
export async function requireAdmin(req: NextRequest): Promise<AdminAuthResult> {
  const sessionCookie = req.cookies.get("campusos_session")?.value;
  if (!sessionCookie) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const payload = verifySessionToken(sessionCookie);
  if (!payload) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      ),
    };
  }

  const session = await getSession(payload.sessionId);
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Session expired." },
        { status: 401 }
      ),
    };
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "User identity not found." },
        { status: 401 }
      ),
    };
  }

  const adminEmail = process.env.CAMPUSOS_ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = user.role === "ADMIN" || (adminEmail && user.email.toLowerCase() === adminEmail);

  if (!isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Access Denied: Administrator role required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { ...user, role: "ADMIN" },
    session,
  };
}
