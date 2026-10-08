import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getSession } from "@/lib/db";
import { askHelpdesk, ChatMessage } from "@/lib/services/campus-ai";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: identifier -> timestamp array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(identifier) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(identifier, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(identifier, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
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

    // 2. Rate Limiting Protection
    const rateLimitKey = session.userId || req.ip || "global-client";
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment before sending another question.",
        },
        { status: 429 }
      );
    }

    // 3. Request Body Validation
    const body = await req.json();
    const message = body?.message;
    const conversation: ChatMessage[] = Array.isArray(body?.conversation) ? body.conversation : [];

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Message is too long (maximum 1000 characters)." },
        { status: 400 }
      );
    }

    // 4. Grounded AI Helpdesk Processing
    const result = await askHelpdesk(message.trim(), conversation);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      status: result.status,
      intent: result.intent,
      suggestedActions: result.suggestedActions,
    });
  } catch (err: unknown) {
    console.error("[API Helpdesk] Request handling error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "CampusOS AI is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}
