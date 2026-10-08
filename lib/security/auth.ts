import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./crypto";
import { getSession, findUserById, UserRecord, SessionRecord, getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, count } from "drizzle-orm";

export type AuthResult =
  | { authorized: true; user: UserRecord; session: SessionRecord }
  | { authorized: false; response: NextResponse };

/**
 * Server-side Student & General Session Guard
 * Enforces valid HMAC-signed session cookie and active DB session.
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
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
        { success: false, error: "Invalid or expired session token." },
        { status: 401 }
      ),
    };
  }

  const session = await getSession(payload.sessionId);
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Session has expired. Please sign in again." },
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

  return { authorized: true, user, session };
}

/**
 * Rate Limiter for user submissions (5 per hour)
 * Grounded in PostgreSQL timestamp analysis.
 */
export async function checkRateLimit(
  userId: string,
  type: "lost_found" | "complaint" | "claim",
  limit = 5
): Promise<{ allowed: boolean; count: number; response?: NextResponse }> {
  const db = getDrizzleDb();
  if (!db) return { allowed: true, count: 0 };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    let recentCount = 0;
    if (type === "lost_found") {
      const res = await db
        .select({ count: count() })
        .from(schema.lostFoundItems)
        .where(
          and(
            eq(schema.lostFoundItems.reporterId, userId),
            gte(schema.lostFoundItems.createdAt, oneHourAgo)
          )
        );
      recentCount = Number(res[0]?.count || 0);
    } else if (type === "complaint") {
      const res = await db
        .select({ count: count() })
        .from(schema.campusComplaints)
        .where(
          and(
            eq(schema.campusComplaints.reporterId, userId),
            gte(schema.campusComplaints.createdAt, oneHourAgo)
          )
        );
      recentCount = Number(res[0]?.count || 0);
    } else if (type === "claim") {
      const res = await db
        .select({ count: count() })
        .from(schema.lostFoundClaims)
        .where(
          and(
            eq(schema.lostFoundClaims.claimantId, userId),
            gte(schema.lostFoundClaims.createdAt, oneHourAgo)
          )
        );
      recentCount = Number(res[0]?.count || 0);
    }

    if (recentCount >= limit) {
      return {
        allowed: false,
        count: recentCount,
        response: NextResponse.json(
          {
            success: false,
            error: "Too Many Requests: Rate limit exceeded. Maximum 5 submissions per hour.",
          },
          { status: 429 }
        ),
      };
    }

    return { allowed: true, count: recentCount };
  } catch (err) {
    console.warn("[RateLimiter] Fallback allowed on error:", err);
    return { allowed: true, count: 0 };
  }
}
