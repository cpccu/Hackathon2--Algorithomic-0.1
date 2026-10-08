import { getDrizzleDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { ilike, or, eq, and, SQL } from "drizzle-orm";

export type SearchCategoryType =
  | "resource"
  | "department"
  | "location"
  | "faq"
  | "club"
  | "university"
  | "event"
  | "notice"
  | "faculty"
  | "lost_found";

export interface UniversalSearchResultItem {
  id: string;
  type: SearchCategoryType;
  title: string;
  description: string | null;
  category: string;
  department: string | null;
  location: string | null;
  url: string;
  metadata?: Record<string, string | null>;
  verificationStatus: string;
}

export interface UniversalSearchParams {
  query: string;
  typeFilter?: string; // e.g. "all", "resource", "department", etc.
  limit?: number;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "in", "on", "at", "to", "a", "an", "of", "is", "are", "was", "were",
  "where", "what", "when", "who", "whom", "whose", "why", "how", "do", "does", "did", "can", "could",
  "would", "should", "will", "shall", "may", "might", "must", "show", "me", "tell", "give", "find",
  "i", "you", "we", "my", "your", "our", "about", "next", "current", "upcoming", "please"
]);

/**
 * Universal Campus Search Query Service
 * Multi-source PostgreSQL search prioritizing exact matches and verified campus data.
 */
export async function searchCampus(
  params: UniversalSearchParams
): Promise<UniversalSearchResultItem[]> {
  const db = getDrizzleDb();
  if (!db) return [];

  const rawQuery = params.query?.trim();
  if (!rawQuery) return [];

  // Strip punctuation for accurate tokenization
  const cleanedQuery = rawQuery.replace(/[?!,.:;'"()[\]{}]/g, " ").trim();
  const lowerQuery = cleanedQuery.toLowerCase();
  const limit = params.limit || 20;
  const filter = params.typeFilter?.toLowerCase() || "all";

  // Tokenize query into meaningful keywords (excluding conversational stop words)
  const tokens = lowerQuery
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const results: UniversalSearchResultItem[] = [];

  // Helper to build flexible ILIKE conditions for both exact phrase and meaningful tokens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildConditions = (columns: any[]): SQL => {
    const conditions: SQL[] = [
      ...columns.map((col) => ilike(col, `%${cleanedQuery}%`)),
    ];

    if (tokens.length > 0) {
      for (const token of tokens) {
        for (const col of columns) {
          conditions.push(ilike(col, `%${token}%`));
        }
      }
    }

    return or(...conditions)!;
  };

  try {
    // 1. ACADEMIC RESOURCES
    if (filter === "all" || filter === "resource") {
      const resRows = await db
        .select()
        .from(schema.resources)
        .where(
          and(
            eq(schema.resources.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.resources.title,
              schema.resources.description,
              schema.resources.courseCode,
              schema.resources.department,
              schema.resources.category,
            ])
          )
        )
        .limit(limit);

      for (const r of resRows) {
        results.push({
          id: r.id,
          type: "resource",
          title: r.title,
          description: r.description,
          category: r.category,
          department: r.department,
          location: null,
          url: `/resources?id=${encodeURIComponent(r.id)}`,
          metadata: {
            courseCode: r.courseCode,
            fileType: r.fileType,
          },
          verificationStatus: r.verificationStatus,
        });
      }
    }

    // 2. ACADEMIC DEPARTMENTS
    if (filter === "all" || filter === "department") {
      const deptRows = await db
        .select()
        .from(schema.departments)
        .where(
          and(
            eq(schema.departments.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.departments.name,
              schema.departments.shortName,
              schema.departments.description,
              schema.departments.building,
            ])
          )
        )
        .limit(limit);

      for (const d of deptRows) {
        results.push({
          id: d.id,
          type: "department",
          title: d.name,
          description: d.description,
          category: "Academic Department",
          department: d.shortName,
          location: [d.building, d.floor, d.room].filter(Boolean).join(", ") || null,
          url: d.website || d.sourceUrl || `/search?id=${d.id}`,
          metadata: {
            shortName: d.shortName,
            email: d.email,
          },
          verificationStatus: d.verificationStatus,
        });
      }
    }

    // 3. CAMPUS LOCATIONS & FACILITIES
    if (filter === "all" || filter === "location") {
      const locRows = await db
        .select()
        .from(schema.campusLocations)
        .where(
          and(
            eq(schema.campusLocations.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.campusLocations.name,
              schema.campusLocations.description,
              schema.campusLocations.category,
              schema.campusLocations.building,
            ])
          )
        )
        .limit(limit);

      for (const l of locRows) {
        results.push({
          id: l.id,
          type: "location",
          title: l.name,
          description: l.description,
          category: l.category,
          department: null,
          location: [l.building, l.floor, l.room].filter(Boolean).join(", ") || null,
          url: l.mapUrl || l.sourceUrl || `/search?id=${l.id}`,
          metadata: {
            building: l.building,
            floor: l.floor,
          },
          verificationStatus: l.verificationStatus,
        });
      }
    }

    // 4. CAMPUS FAQS & POLICIES
    if (filter === "all" || filter === "faq") {
      const faqRows = await db
        .select()
        .from(schema.campusFaqs)
        .where(
          and(
            eq(schema.campusFaqs.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.campusFaqs.question,
              schema.campusFaqs.answer,
              schema.campusFaqs.category,
            ])
          )
        )
        .limit(limit);

      for (const f of faqRows) {
        results.push({
          id: f.id,
          type: "faq",
          title: f.question,
          description: f.answer,
          category: f.category,
          department: null,
          location: null,
          url: f.sourceUrl || `/search?id=${f.id}`,
          metadata: {
            category: f.category,
          },
          verificationStatus: f.verificationStatus,
        });
      }
    }

    // 5. STUDENT CLUBS & SOCIETIES
    if (filter === "all" || filter === "club") {
      const clubRows = await db
        .select()
        .from(schema.clubs)
        .where(
          and(
            eq(schema.clubs.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.clubs.name,
              schema.clubs.description,
            ])
          )
        )
        .limit(limit);

      for (const c of clubRows) {
        results.push({
          id: c.id,
          type: "club",
          title: c.name,
          description: c.description,
          category: "Student Club",
          department: null,
          location: null,
          url: c.contactUrl || c.sourceUrl || `/search?id=${c.id}`,
          metadata: {
            contactEmail: c.contactEmail,
          },
          verificationStatus: c.verificationStatus,
        });
      }
    }

    // 6. UNIVERSITY INFORMATION
    if (filter === "all" || filter === "university") {
      const univRows = await db
        .select()
        .from(schema.universityInfo)
        .where(
          and(
            eq(schema.universityInfo.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.universityInfo.name,
              schema.universityInfo.overview,
              schema.universityInfo.motto,
              schema.universityInfo.address,
            ])
          )
        )
        .limit(limit);

      for (const u of univRows) {
        results.push({
          id: u.id,
          type: "university",
          title: u.name,
          description: u.overview || u.motto,
          category: "Institutional Info",
          department: null,
          location: u.address,
          url: u.websiteUrl || u.portalUrl || "https://www.cityuniversity.edu.bd",
          metadata: {
            portalUrl: u.portalUrl,
            contactEmail: u.contactEmail,
          },
          verificationStatus: u.verificationStatus,
        });
      }
    }

    // 7. EVENTS (Only verified records)
    if (filter === "all" || filter === "event") {
      const eventRows = await db
        .select()
        .from(schema.events)
        .where(
          and(
            eq(schema.events.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.events.title,
              schema.events.description,
              schema.events.venue,
            ])
          )
        )
        .limit(limit);

      for (const e of eventRows) {
        results.push({
          id: e.id,
          type: "event",
          title: e.title,
          description: e.description,
          category: e.category,
          department: null,
          location: e.venue,
          url: `/events?id=${encodeURIComponent(e.id)}`,
          metadata: {
            venue: e.venue,
          },
          verificationStatus: e.verificationStatus,
        });
      }
    }

    // 8. NOTICES (Only verified records)
    if (filter === "all" || filter === "notice") {
      const noticeRows = await db
        .select()
        .from(schema.notices)
        .where(
          and(
            eq(schema.notices.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.notices.title,
              schema.notices.content,
              schema.notices.category,
            ])
          )
        )
        .limit(limit);

      for (const n of noticeRows) {
        results.push({
          id: n.id,
          type: "notice",
          title: n.title,
          description: n.content,
          category: n.category,
          department: null,
          location: null,
          url: n.sourceUrl || `/search?id=${n.id}`,
          metadata: {
            publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
          },
          verificationStatus: n.verificationStatus,
        });
      }
    }

    // 9. FACULTY (Only verified records)
    if (filter === "all" || filter === "faculty") {
      const facultyRows = await db
        .select()
        .from(schema.faculty)
        .where(
          and(
            eq(schema.faculty.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.faculty.name,
              schema.faculty.designation,
              schema.faculty.email,
            ])
          )
        )
        .limit(limit);

      for (const f of facultyRows) {
        results.push({
          id: f.id,
          type: "faculty",
          title: f.name,
          description: f.designation,
          category: "Faculty Directory",
          department: null,
          location: null,
          url: f.profileUrl || `/search?id=${f.id}`,
          metadata: {
            designation: f.designation,
            email: f.email,
          },
          verificationStatus: f.verificationStatus,
        });
      }
    }

    // 10. LOST & FOUND (Only verified, non-archived items, no private student data)
    if (filter === "all" || filter === "lost_found") {
      const lostFoundRows = await db
        .select()
        .from(schema.lostFoundItems)
        .where(
          and(
            eq(schema.lostFoundItems.verificationStatus, "VERIFIED"),
            buildConditions([
              schema.lostFoundItems.title,
              schema.lostFoundItems.description,
              schema.lostFoundItems.category,
              schema.lostFoundItems.location,
            ])
          )
        )
        .limit(limit);

      for (const item of lostFoundRows) {
        if (item.status === "ARCHIVED") continue;
        results.push({
          id: item.id,
          type: "lost_found",
          title: item.title,
          description: item.description,
          category: `Lost & Found (${item.type})`,
          department: null,
          location: item.location,
          url: `/lost-found?id=${item.id}`,
          metadata: {
            itemType: item.type,
            status: item.status,
            dateOccurred: item.dateOccurred ? item.dateOccurred.toISOString() : null,
          },
          verificationStatus: item.verificationStatus,
        });
      }
    }

    // Relevance scoring & sorting:
    const calculateScore = (item: UniversalSearchResultItem): number => {
      const titleLower = item.title.toLowerCase();
      let score = 0;

      // 1. Exact phrase match
      if (titleLower === lowerQuery) score += 100;
      else if (titleLower.startsWith(lowerQuery)) score += 60;
      else if (titleLower.includes(lowerQuery)) score += 40;

      // 2. Department / shortName match
      if (item.department?.toLowerCase() === lowerQuery) score += 80;
      else if (item.department?.toLowerCase().includes(lowerQuery)) score += 40;

      // 3. Course code match
      if (item.metadata?.courseCode?.toLowerCase().includes(lowerQuery)) score += 45;

      // 4. Token matches (for multi-word queries like "CSE resources")
      let matchedTokens = 0;
      for (const token of tokens) {
        if (STOP_WORDS.has(token)) continue;
        let tokenMatched = false;

        if (titleLower.includes(token)) {
          score += 25;
          tokenMatched = true;
        }
        if (item.department?.toLowerCase().includes(token)) {
          score += 30;
          tokenMatched = true;
        }
        if (item.category.toLowerCase().includes(token)) {
          score += 25;
          tokenMatched = true;
        }
        if (item.type.toLowerCase().includes(token)) {
          score += 25;
          tokenMatched = true;
        }
        if (item.description?.toLowerCase().includes(token)) {
          score += 10;
          tokenMatched = true;
        }

        if (tokenMatched) matchedTokens++;
      }

      // Bonus if multiple query tokens were found
      if (tokens.length > 1 && matchedTokens >= 2) {
        score += 40;
      }

      return score;
    }

    return results.sort((a, b) => calculateScore(b) - calculateScore(a));
  } catch (err) {
    console.warn("[Campus Search Service] Query error:", err);
    return [];
  }
}
