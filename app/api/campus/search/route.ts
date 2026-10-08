import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security/crypto";
import { getSession } from "@/lib/db";
import { executeIntelligentSearch } from "@/lib/services/campus-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    // 2. Query execution
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const typeFilter = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
      });
    }

    const searchResponse = await executeIntelligentSearch(query, {
      limit,
      typeFilter: typeFilter === "all" ? undefined : typeFilter,
    });

    return NextResponse.json({
      success: true,
      results: searchResponse.results,
      total: searchResponse.results.length,
      intent: searchResponse.intent,
      confidence: searchResponse.confidence,
      aiSummary: searchResponse.aiSummary,
      suggestedActions: searchResponse.suggestedActions,
      isFallback: searchResponse.isFallback,
    });
  } catch (err: unknown) {
    console.error("[API search] Search execution error:", err);
    return NextResponse.json({ success: false, error: "Search failed." }, { status: 500 });
  }
}
