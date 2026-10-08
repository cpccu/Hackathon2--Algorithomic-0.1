import { GoogleGenAI } from "@google/genai";
import { searchCampus, UniversalSearchResultItem } from "@/lib/services/campus-search";

export type CampusIntent =
  | "RESOURCE_SEARCH"
  | "EVENT_SEARCH"
  | "DEPARTMENT_SEARCH"
  | "LOCATION_SEARCH"
  | "CLUB_SEARCH"
  | "FAQ_SEARCH"
  | "GENERAL_CAMPUS_SEARCH"
  | "RECOMMENDATION"
  | "OUT_OF_SCOPE";

export interface SuggestedAction {
  label: string;
  url: string;
  icon?: string;
}

export interface IntelligentSearchResponse {
  intent: CampusIntent;
  confidence: number;
  results: UniversalSearchResultItem[];
  aiSummary: string | null;
  suggestedActions: SuggestedAction[];
  isFallback: boolean;
}

export interface RecommendationParams {
  userId?: string;
  department?: string;
  interestCategory?: string;
}

// Out-of-scope regex patterns
const OUT_OF_SCOPE_PATTERNS = [
  /write\s+(me\s+)?(a\s+)?(python|java|c\+\+|javascript|html|react|unity)\s+(game|snake|script|code|program)/i,
  /write\s+(me\s+)?a\s+(poem|story|song|essay\s+about)/i,
  /how\s+to\s+cook/i,
  /recipe\s+for/i,
  /play\s+a\s+game/i,
  /who\s+is\s+the\s+president\s+of/i,
  /who\s+won\s+the\s+(world\s+cup|super\s+bowl|ipl|champions\s+league)/i,
  /solve\s+my\s+homework/i,
  /weather\s+in/i,
];

/**
 * 1. Intent Detection
 * Fast, deterministic intent classifier that accurately routes user queries.
 */
export function detectQueryIntent(query: string): { intent: CampusIntent; confidence: number } {
  const q = query.trim().toLowerCase();

  if (!q) {
    return { intent: "GENERAL_CAMPUS_SEARCH", confidence: 0.5 };
  }

  // Check out of scope
  if (OUT_OF_SCOPE_PATTERNS.some((pat) => pat.test(q))) {
    return { intent: "OUT_OF_SCOPE", confidence: 0.99 };
  }

  // Recommendation intent
  if (/\b(recommend|recommendation|suggest|suggestions|what\s+should\s+i|popular)\b/i.test(q)) {
    return { intent: "RECOMMENDATION", confidence: 0.95 };
  }

  // Location search intent (e.g. "library", "where is the library", "where is cafeteria", "auditorium")
  if (/\b(where\s+is|location|locations|building|room|floor|campus\s+map|library|central\s+library|auditorium|cafeteria|canteen|lab|hall)\b/i.test(q)) {
    return { intent: "LOCATION_SEARCH", confidence: 0.94 };
  }

  // Event search intent (e.g. "events", "what events are available", "seminars", "workshops")
  if (/\b(event|events|seminar|seminars|workshop|workshops|hackathon|hackathons|competition|upcoming\s+event|next\s+event|what\s+events)\b/i.test(q)) {
    return { intent: "EVENT_SEARCH", confidence: 0.95 };
  }

  // Resource search intent (e.g. "I need CSE resources", "resources", "syllabus", "exam archive")
  if (
    /\b(resource|resources|material|materials|book|books|pdf|syllabus|lab\s+manual|slide|slides|learn\s+sql|learn\s+database|learn\s+python|study\s+material|lecture\s+notes|need\s+.*resources?|find\s+.*resources?)\b/i.test(q)
  ) {
    return { intent: "RESOURCE_SEARCH", confidence: 0.95 };
  }

  // FAQ / policy search intent (e.g. "admission", "tuition", "fees", "how to apply")
  if (/\b(admission|admissions|requirement|requirements|gpa|cgpa|fee|fees|tuition|waiver|scholarship|clearance|credit\s+transfer|exam\s+schedule|grading|how\s+to\s+apply)\b/i.test(q)) {
    return { intent: "FAQ_SEARCH", confidence: 0.94 };
  }

  // Department search intent (e.g. "CSE", "EEE", "BBA", "department", "dept")
  if (/\b(department|dept|faculty\s+of|cse\b|eee\b|bba\b|pharmacy\b|english\b|law\b|civil\b|textile\b|mechanical\b)/i.test(q)) {
    return { intent: "DEPARTMENT_SEARCH", confidence: 0.93 };
  }

  // Club search intent
  if (/\b(club|clubs|programming\s+club|cultural\s+club|sports\s+club|society|societies|student\s+organization)\b/i.test(q)) {
    return { intent: "CLUB_SEARCH", confidence: 0.95 };
  }

  return { intent: "GENERAL_CAMPUS_SEARCH", confidence: 0.75 };
}

/**
 * 2. Query Expansion
 * Expands technical or conversational campus queries into synonyms to enhance candidate retrieval.
 * Strict principle: Expansion terms are solely used to query the verified database.
 */
export function expandQueryTerms(query: string, intent: CampusIntent): string[] {
  const terms: string[] = [query.trim()];
  const q = query.toLowerCase();

  if (intent === "RESOURCE_SEARCH" || q.includes("sql") || q.includes("database")) {
    if (q.includes("sql")) terms.push("database", "database systems", "dbms", "cse");
    if (q.includes("database")) terms.push("sql", "database systems", "cse");
    if (q.includes("python")) terms.push("programming", "cse", "computer science");
    if (q.includes("algorithm")) terms.push("data structures", "cse", "algorithms");
    if (q.includes("network")) terms.push("computer networks", "data communication");
  }

  if (intent === "EVENT_SEARCH" || q.includes("event")) {
    if (q.includes("cse")) terms.push("hackathon", "workshop", "competition", "tech");
    if (q.includes("programming")) terms.push("coding", "hackathon", "competition");
  }

  if (intent === "LOCATION_SEARCH" || q.includes("library")) {
    if (q.includes("library")) terms.push("central library", "library building", "reading room");
    if (q.includes("cse")) terms.push("academic building 1", "cse department");
    if (q.includes("auditorium")) terms.push("main auditorium", "academic building");
  }

  if (intent === "CLUB_SEARCH" || q.includes("programming club")) {
    if (q.includes("programming") || q.includes("cse") || q.includes("tech")) {
      terms.push("computer club", "programming club", "robotics", "cse");
    }
  }

  if (intent === "FAQ_SEARCH" || q.includes("admission")) {
    if (q.includes("admission")) terms.push("undergraduate admission", "admission criteria", "eligibility", "fees");
  }

  return Array.from(new Set(terms));
}

/**
 * 3. Suggested Actions Generator
 * Generates verified internal deep links for actions the student can take.
 * Crucial safety guarantee: Never trusts Gemini for URLs; URLs are constructed strictly from database IDs and known routes.
 */
export function generateSuggestedActions(
  intent: CampusIntent,
  results: UniversalSearchResultItem[]
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  switch (intent) {
    case "RESOURCE_SEARCH":
      if (results.length > 0 && results[0].type === "resource") {
        actions.push({
          label: `Open "${results[0].title}"`,
          url: results[0].url,
        });
      }
      actions.push({
        label: "Browse All Resources",
        url: "/resources",
      });
      break;

    case "EVENT_SEARCH":
      if (results.length > 0 && results[0].type === "event") {
        actions.push({
          label: `View Event: ${results[0].title}`,
          url: "/events",
        });
      }
      actions.push({
        label: "Open Event Engine",
        url: "/events",
      });
      break;

    case "LOCATION_SEARCH":
      if (results.length > 0) {
        actions.push({
          label: `Locate: ${results[0].title}`,
          url: results[0].url || `/search?q=${encodeURIComponent(results[0].title)}`,
        });
      }
      actions.push({
        label: "Campus Map & Directory",
        url: "/search?type=location",
      });
      break;

    case "DEPARTMENT_SEARCH":
      if (results.length > 0) {
        actions.push({
          label: `Search ${results[0].title} Resources`,
          url: `/resources?search=${encodeURIComponent(results[0].title)}`,
        });
      }
      break;

    case "CLUB_SEARCH":
      actions.push({
        label: "Explore Student Clubs",
        url: "/search?type=club",
      });
      break;

    case "FAQ_SEARCH":
      actions.push({
        label: "View Campus FAQs",
        url: "/search?type=faq",
      });
      break;

    default:
      if (results.length > 0) {
        actions.push({
          label: `Explore "${results[0].title}"`,
          url: results[0].url || `/search?q=${encodeURIComponent(results[0].title)}`,
        });
      }
  }

  return actions.slice(0, 3);
}

/**
 * 4. Deterministic Relevance Ranking
 * Hybrid ranking layer weighting exact token matches, course code, department matches, and query intent.
 */
export function rankCandidates(
  query: string,
  candidates: UniversalSearchResultItem[],
  intent: CampusIntent
): UniversalSearchResultItem[] {
  const lowerQuery = query.toLowerCase().trim();
  const tokens = lowerQuery.split(/\s+/).filter((t) => t.length > 1);

  return [...candidates].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Intent-type affinity bonus
    if (intent === "RESOURCE_SEARCH") {
      if (a.type === "resource") scoreA += 50;
      if (b.type === "resource") scoreB += 50;
    } else if (intent === "EVENT_SEARCH") {
      if (a.type === "event") scoreA += 50;
      if (b.type === "event") scoreB += 50;
    } else if (intent === "LOCATION_SEARCH") {
      if (a.type === "location") scoreA += 50;
      if (b.type === "location") scoreB += 50;
    } else if (intent === "DEPARTMENT_SEARCH") {
      if (a.type === "department") scoreA += 50;
      if (b.type === "department") scoreB += 50;
    } else if (intent === "CLUB_SEARCH") {
      if (a.type === "club") scoreA += 50;
      if (b.type === "club") scoreB += 50;
    } else if (intent === "FAQ_SEARCH") {
      if (a.type === "faq") scoreA += 50;
      if (b.type === "faq") scoreB += 50;
    }

    // Title exact & prefix match
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    if (aTitle === lowerQuery) scoreA += 100;
    if (bTitle === lowerQuery) scoreB += 100;

    if (aTitle.includes(lowerQuery)) scoreA += 40;
    if (bTitle.includes(lowerQuery)) scoreB += 40;

    // Tokens match
    for (const t of tokens) {
      if (aTitle.includes(t)) scoreA += 15;
      if (bTitle.includes(t)) scoreB += 15;
      if (a.department?.toLowerCase().includes(t)) scoreA += 20;
      if (b.department?.toLowerCase().includes(t)) scoreB += 20;
      if (a.category.toLowerCase().includes(t)) scoreA += 15;
      if (b.category.toLowerCase().includes(t)) scoreB += 15;
    }

    return scoreB - scoreA;
  });
}

/**
 * 5. Gemini Structured Reranker
 * Sends a candidate pool (max 10) to Gemini to evaluate relevance.
 * Enforces strict verification: Discards any record ID that wasn't retrieved from PostgreSQL!
 */
export async function rerankWithGemini(
  query: string,
  candidates: UniversalSearchResultItem[],
  apiKey: string
): Promise<UniversalSearchResultItem[]> {
  if (candidates.length <= 1) return candidates;

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const topCandidates = candidates.slice(0, 10);

  const candidateSummary = topCandidates.map((c) => ({
    id: c.id,
    type: c.type,
    title: c.title,
    category: c.category,
    department: c.department || "N/A",
    description: c.description ? c.description.slice(0, 120) : "N/A",
  }));

  const prompt = `You are the CampusOS Relevance Reranker for City University.
Given a user query and a list of candidates from the university database, rank the candidates from most relevant to least relevant.

USER QUERY: "${query}"

CANDIDATES:
${JSON.stringify(candidateSummary, null, 2)}

Instructions:
1. Return ONLY a valid JSON object matching this schema:
{
  "rankedIds": ["<id1>", "<id2>", ...]
}
2. Include ONLY IDs from the candidate list above. NEVER invent IDs.
3. If no candidate is relevant, return an empty array for rankedIds.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const generatePromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini AI rerank timed out after 5000ms")), 5000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text?.trim() || "";
    if (!text) return candidates;

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.rankedIds)) return candidates;

    const reranked: UniversalSearchResultItem[] = [];
    const seen = new Set<string>();

    for (const id of parsed.rankedIds) {
      if (typeof id === "string" && candidateMap.has(id) && !seen.has(id)) {
        reranked.push(candidateMap.get(id)!);
        seen.add(id);
      }
    }

    // Append any remaining candidates that Gemini didn't mention
    for (const c of candidates) {
      if (!seen.has(c.id)) {
        reranked.push(c);
      }
    }

    return reranked;
  } catch (err) {
    console.warn("[Campus Intelligence] Gemini reranking failed, falling back to deterministic ranking:", err);
    return candidates;
  }
}

/**
 * 6. Execute Complete Intelligent Campus Search
 * Follows the mandatory pipeline:
 * USER QUERY -> INTENT -> EXPANSION -> DB RETRIEVAL -> RELEVANCE RANKING -> (GEMINI RERANK) -> ACTIONS
 */
export async function executeIntelligentSearch(
  query: string,
  options?: { limit?: number; typeFilter?: string }
): Promise<IntelligentSearchResponse> {
  const trimmed = query.trim();

  // Step 1: Detect Intent
  const { intent, confidence } = detectQueryIntent(trimmed);

  if (intent === "OUT_OF_SCOPE") {
    return {
      intent,
      confidence,
      results: [],
      aiSummary:
        "I'm CampusOS, the City University campus assistant. I can help with verified campus information, events, resources, departments, facilities, clubs, policies, and student services.",
      suggestedActions: [
        { label: "Search Campus Resources", url: "/resources" },
        { label: "View Upcoming Events", url: "/events" },
        { label: "Ask Smart Helpdesk", url: "/helpdesk" },
      ],
      isFallback: false,
    };
  }

  // Step 2: Query Expansion
  const expandedQueries = expandQueryTerms(trimmed, intent);

  // Step 3: Verified PostgreSQL Database Retrieval
  const rawCandidateMap = new Map<string, UniversalSearchResultItem>();

  for (const qTerm of expandedQueries) {
    try {
      const records = await searchCampus({
        query: qTerm,
        typeFilter: options?.typeFilter || "all",
        limit: options?.limit || 15,
      });

      for (const rec of records) {
        // Enforce strict zero-fabrication: only VERIFIED items appear
        if (rec.verificationStatus === "VERIFIED" && !rawCandidateMap.has(rec.id)) {
          rawCandidateMap.set(rec.id, rec);
        }
      }
    } catch (err) {
      console.warn("[Campus Intelligence] DB retrieval error for term:", qTerm, err);
    }
  }

  let candidates = Array.from(rawCandidateMap.values());

  // Step 4: Deterministic Ranking
  candidates = rankCandidates(trimmed, candidates, intent);

  // Step 5: Optional Gemini Reranker if API key is present
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let isFallback = true;

  if (apiKey && candidates.length > 0) {
    try {
      candidates = await rerankWithGemini(trimmed, candidates, apiKey);
      isFallback = false;
    } catch {
      isFallback = true;
    }
  }

  const finalResults = candidates.slice(0, options?.limit || 10);

  // Step 6: Generate Safe Internal Actions
  const suggestedActions = generateSuggestedActions(intent, finalResults);

  // Step 7: Natural language summary
  let aiSummary: string | null = null;
  if (finalResults.length > 0) {
    const top = finalResults[0];
    if (top.type === "location") {
      aiSummary = `Located at ${top.location || "City University Main Campus"}${top.description ? ` — ${top.description}` : ""}.`;
    } else if (top.type === "department") {
      aiSummary = `${top.title} is located in ${top.location || "Academic Building 1"}.`;
    } else if (top.type === "resource") {
      aiSummary = `Found verified study materials for ${top.metadata?.courseCode || top.title} in the Resource Hub.`;
    } else if (top.type === "event") {
      aiSummary = `Verified campus event scheduled for ${top.location || "City University"} (${top.category}).`;
    } else if (top.type === "club") {
      aiSummary = `Verified student organization: ${top.title}.`;
    } else if (top.type === "faq") {
      aiSummary = top.description ? `${top.description.slice(0, 160)}...` : `Verified information available from City University FAQs.`;
    }
  } else {
    if (intent === "EVENT_SEARCH") {
      aiSummary = "There's no verified upcoming event information matching your search.";
    } else if (intent === "RESOURCE_SEARCH") {
      aiSummary = "No verified study materials matching this query were found in the Resource Hub.";
    } else {
      aiSummary = "Information is not available in the verified CampusOS data.";
    }
  }

  return {
    intent,
    confidence,
    results: finalResults,
    aiSummary,
    suggestedActions,
    isFallback,
  };
}

/**
 * 7. Personalized Recommendations
 * Recommends verified resources, events, and clubs based on real database records.
 * Never creates recommendations from imaginary data.
 */
export async function getCampusRecommendations(
  params?: RecommendationParams
): Promise<{
  resources: UniversalSearchResultItem[];
  events: UniversalSearchResultItem[];
  clubs: UniversalSearchResultItem[];
  message: string;
}> {
  try {
    // 1. Fetch verified resources
    const resources = await searchCampus({
      query: params?.department || "CSE",
      typeFilter: "resource",
      limit: 3,
    });

    // 2. Fetch verified events
    const events = await searchCampus({
      query: params?.department || "Campus",
      typeFilter: "event",
      limit: 3,
    });

    // 3. Fetch verified clubs
    const clubs = await searchCampus({
      query: "Club",
      typeFilter: "club",
      limit: 3,
    });

    const hasAny = resources.length > 0 || events.length > 0 || clubs.length > 0;

    return {
      resources: resources.filter((r) => r.verificationStatus === "VERIFIED"),
      events: events.filter((e) => e.verificationStatus === "VERIFIED"),
      clubs: clubs.filter((c) => c.verificationStatus === "VERIFIED"),
      message: hasAny
        ? "Personalized recommendations grounded in verified City University data."
        : "No verified recommendations are currently available.",
    };
  } catch (err) {
    console.error("[Campus Intelligence] Recommendations error:", err);
    return {
      resources: [],
      events: [],
      clubs: [],
      message: "No verified recommendations are currently available.",
    };
  }
}
