import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { eq, and, gt, or, ilike, desc, sql } from "drizzle-orm";
import * as schema from "./schema";

/**
 * ==============================================================================
 * CAMPUSOS DATABASE LAYER (PostgreSQL Primary + Drizzle ORM)
 * ==============================================================================
 */

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: "STUDENT" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OtpRecord {
  id: string;
  email: string;
  codeHash: string;
  purpose: "login" | "register";
  fullName?: string;
  studentId?: string;
  attempts: number;
  used: boolean;
  expiresAt: number;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

export interface ResourceRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  courseCode: string;
  fileUrl: string | null;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- POSTGRESQL POOL & DRIZZLE INITIALIZATION -----------------
let pgPool: Pool | null = null;
let drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isMigrated = false;

export function getPostgresPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    return null;
  }
  if (!pgPool) {
    const isSsl =
      process.env.DATABASE_SSL === "true" ||
      connectionString.includes("sslmode=require") ||
      connectionString.includes(".neon.tech") ||
      connectionString.includes("supabase.co");

    pgPool = new Pool({
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: process.env.NODE_ENV === "production" ? 5 : 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });

    pgPool.on("error", (err) => {
      console.warn("[PostgreSQL Pool] Connection warning:", err.message);
    });
  }
  return pgPool;
}

export function getDrizzleDb(): ReturnType<typeof drizzle<typeof schema>> | null {
  const pool = getPostgresPool();
  if (!pool) return null;
  if (!drizzleDb) {
    drizzleDb = drizzle(pool, { schema });
  }
  return drizzleDb;
}

/**
 * Runs Drizzle migrations automatically when connected to PostgreSQL
 */
export async function runMigrations(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDrizzleDb();
    if (!db) {
      return { success: false, error: "DATABASE_URL not configured" };
    }
    const migrationsFolder = path.join(process.cwd(), "lib", "db", "migrations");
    if (fs.existsSync(migrationsFolder)) {
      await migrate(db, { migrationsFolder });
      isMigrated = true;
    }
    return { success: true };
  } catch (err: unknown) {
    console.error("[Database] Migration error:", err);
    return { success: false, error: String(err) };
  }
}

// ----------------- DEVELOPMENT FILE FALLBACK -----------------
interface FileDatabaseSchema {
  users: Record<string, UserRecord>;
  otps: Record<string, OtpRecord>;
  sessions: Record<string, SessionRecord>;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "campusos_auth.json");

let memoryDb: FileDatabaseSchema = {
  users: {},
  otps: {},
  sessions: {},
};

let isFileStoreInitialized = false;

function loadFileStore(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(raw);
      memoryDb = {
        users: parsed.users || {},
        otps: parsed.otps || {},
        sessions: parsed.sessions || {},
      };
      for (const [key, user] of Object.entries(memoryDb.users)) {
        if (!user.name && (user as unknown as { fullName: string }).fullName) {
          user.name = (user as unknown as { fullName: string }).fullName;
        }
        if (user.emailVerified === undefined) {
          user.emailVerified = true;
        }
        if (!user.updatedAt) {
          user.updatedAt = user.createdAt;
        }
        memoryDb.users[key] = user;
      }
    } else {
      saveFileStore();
    }
  } catch (err) {
    console.error("[Database] Error reading fallback file store:", err);
  }
  isFileStoreInitialized = true;
}

function saveFileStore(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf8");
  } catch (err) {
    console.error("[Database] Error writing fallback file store:", err);
  }
}

function ensureFileStore(): void {
  if (!isFileStoreInitialized) {
    loadFileStore();
  }
}

// ==============================================================================
// 1. USER REPOSITORY
// ==============================================================================

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const db = getDrizzleDb();

  if (db) {
    try {
      const result = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalized))
        .limit(1);

      if (!result || result.length === 0) return null;
      const u = result[0];
      const adminEmail = process.env.CAMPUSOS_ADMIN_EMAIL?.trim().toLowerCase();
      let role: "STUDENT" | "ADMIN" = (u.role as "STUDENT" | "ADMIN") || "STUDENT";
      if (adminEmail && normalized === adminEmail && role !== "ADMIN") {
        role = "ADMIN";
        await db.update(schema.users).set({ role: "ADMIN" }).where(eq(schema.users.id, u.id)).catch(() => {});
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        studentId: u.studentId,
        role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] User lookup falling back to file store:", err);
    }
  }

  ensureFileStore();
  const fileUser = memoryDb.users[normalized];
  if (fileUser) {
    if (!fileUser.role) fileUser.role = "STUDENT";
    return fileUser;
  }
  return null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = getDrizzleDb();

  if (db) {
    try {
      const result = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (!result || result.length === 0) return null;
      const u = result[0];
      const adminEmail = process.env.CAMPUSOS_ADMIN_EMAIL?.trim().toLowerCase();
      let role: "STUDENT" | "ADMIN" = (u.role as "STUDENT" | "ADMIN") || "STUDENT";
      if (adminEmail && u.email.toLowerCase() === adminEmail && role !== "ADMIN") {
        role = "ADMIN";
        await db.update(schema.users).set({ role: "ADMIN" }).where(eq(schema.users.id, u.id)).catch(() => {});
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        studentId: u.studentId,
        role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] User by ID lookup falling back to file store:", err);
    }
  }

  ensureFileStore();
  const found = Object.values(memoryDb.users).find((u) => u.id === id);
  if (found) {
    if (!found.role) found.role = "STUDENT";
    return found;
  }
  return null;
}

export const getUserById = findUserById;

export async function createUser(userData: {
  name: string;
  email: string;
  studentId: string;
  role?: "STUDENT" | "ADMIN";
}): Promise<UserRecord> {
  const normalized = userData.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const adminEmail = process.env.CAMPUSOS_ADMIN_EMAIL?.trim().toLowerCase();
  const role: "STUDENT" | "ADMIN" =
    userData.role || (adminEmail && normalized === adminEmail ? "ADMIN" : "STUDENT");

  const db = getDrizzleDb();
  if (db) {
    try {
      // Prevent duplicate creation
      const existing = await findUserByEmail(normalized);
      if (existing) {
        return existing;
      }

      const inserted = await db
        .insert(schema.users)
        .values({
          id: newId,
          name: userData.name.trim(),
          email: normalized,
          studentId: userData.studentId.trim(),
          role,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const u = inserted[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        studentId: u.studentId,
        role: (u.role as "STUDENT" | "ADMIN") || role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] User creation falling back to file store:", err);
    }
  }

  ensureFileStore();
  if (memoryDb.users[normalized]) {
    return memoryDb.users[normalized];
  }

  const user: UserRecord = {
    id: newId,
    name: userData.name.trim(),
    email: normalized,
    studentId: userData.studentId.trim(),
    role,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  };

  memoryDb.users[normalized] = user;
  saveFileStore();
  return user;
}

export async function createAuditLog(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: string
): Promise<void> {
  const db = getDrizzleDb();
  if (!db) return;
  try {
    await db.insert(schema.adminAuditLogs).values({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      adminUserId,
      action,
      entityType,
      entityId,
      details: details || null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.warn("[Audit Log] Failed to insert audit log:", err);
  }
}

// ==============================================================================
// 2. OTP / VERIFICATION REPOSITORY
// ==============================================================================

export async function saveOtp(record: {
  email: string;
  codeHash: string;
  purpose: "login" | "register";
  fullName?: string;
  studentId?: string;
  expiresAt: number;
}): Promise<void> {
  const normalized = record.email.trim().toLowerCase();
  const otpId = `otp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const db = getDrizzleDb();

  if (db) {
    try {
      // Invalidate previous active OTPs for this email
      await db
        .update(schema.otps)
        .set({ used: true })
        .where(and(eq(schema.otps.email, normalized), eq(schema.otps.used, false)));

      await db.insert(schema.otps).values({
        id: otpId,
        email: normalized,
        codeHash: record.codeHash,
        purpose: record.purpose,
        fullName: record.fullName,
        studentId: record.studentId,
        attempts: 0,
        used: false,
        expiresAt: new Date(record.expiresAt),
        createdAt: new Date(),
      });
      return;
    } catch (err) {
      console.warn("[PostgreSQL] OTP save falling back to file store:", err);
    }
  }

  ensureFileStore();
  memoryDb.otps[normalized] = {
    id: otpId,
    email: normalized,
    codeHash: record.codeHash,
    purpose: record.purpose,
    fullName: record.fullName,
    studentId: record.studentId,
    attempts: 0,
    used: false,
    expiresAt: record.expiresAt,
    createdAt: Date.now(),
  };
  saveFileStore();
}

export async function getOtp(email: string): Promise<OtpRecord | null> {
  const normalized = email.trim().toLowerCase();
  const db = getDrizzleDb();

  if (db) {
    try {
      const result = await db
        .select()
        .from(schema.otps)
        .where(
          and(
            eq(schema.otps.email, normalized),
            eq(schema.otps.used, false),
            gt(schema.otps.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!result || result.length === 0) return null;
      const row = result[0];
      return {
        id: row.id,
        email: row.email,
        codeHash: row.codeHash,
        purpose: row.purpose as "login" | "register",
        fullName: row.fullName || undefined,
        studentId: row.studentId || undefined,
        attempts: row.attempts,
        used: row.used,
        expiresAt: row.expiresAt.getTime(),
        createdAt: row.createdAt.getTime(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] OTP retrieval falling back to file store:", err);
    }
  }

  ensureFileStore();
  const record = memoryDb.otps[normalized];
  if (!record || record.used) return null;

  if (Date.now() > record.expiresAt) {
    delete memoryDb.otps[normalized];
    saveFileStore();
    return null;
  }

  return record;
}

export async function incrementOtpAttempts(email: string): Promise<number> {
  const normalized = email.trim().toLowerCase();
  const db = getDrizzleDb();

  if (db) {
    try {
      const active = await getOtp(normalized);
      if (!active) return 0;
      const newAttempts = active.attempts + 1;
      await db
        .update(schema.otps)
        .set({ attempts: newAttempts })
        .where(eq(schema.otps.id, active.id));
      return newAttempts;
    } catch (err) {
      console.warn("[PostgreSQL] OTP increment falling back to file store:", err);
    }
  }

  ensureFileStore();
  const record = memoryDb.otps[normalized];
  if (!record) return 0;

  record.attempts += 1;
  saveFileStore();
  return record.attempts;
}

export async function markOtpUsed(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const db = getDrizzleDb();

  if (db) {
    try {
      await db
        .update(schema.otps)
        .set({ used: true })
        .where(and(eq(schema.otps.email, normalized), eq(schema.otps.used, false)));
      return;
    } catch (err) {
      console.warn("[PostgreSQL] OTP mark used falling back to file store:", err);
    }
  }

  ensureFileStore();
  if (memoryDb.otps[normalized]) {
    memoryDb.otps[normalized].used = true;
    saveFileStore();
  }
}

export async function deleteOtp(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const db = getDrizzleDb();

  if (db) {
    try {
      await db
        .update(schema.otps)
        .set({ used: true })
        .where(eq(schema.otps.email, normalized));
      return;
    } catch (err) {
      console.warn("[PostgreSQL] OTP delete falling back to file store:", err);
    }
  }

  ensureFileStore();
  if (memoryDb.otps[normalized]) {
    delete memoryDb.otps[normalized];
    saveFileStore();
  }
}

// ==============================================================================
// 3. SESSION REPOSITORY
// ==============================================================================

export async function createSession(userId: string, email: string): Promise<SessionRecord> {
  const normalized = email.trim().toLowerCase();
  const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days session
  const db = getDrizzleDb();

  if (db) {
    try {
      await db.insert(schema.sessions).values({
        id: sessionId,
        userId,
        email: normalized,
        createdAt: new Date(now),
        expiresAt: new Date(expiresAt),
      });
      return {
        id: sessionId,
        userId,
        email: normalized,
        createdAt: now,
        expiresAt,
      };
    } catch (err) {
      console.warn("[PostgreSQL] Session create falling back to file store:", err);
    }
  }

  ensureFileStore();
  const session: SessionRecord = {
    id: sessionId,
    userId,
    email: normalized,
    createdAt: now,
    expiresAt,
  };

  memoryDb.sessions[sessionId] = session;
  saveFileStore();
  return session;
}

export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  const db = getDrizzleDb();

  if (db) {
    try {
      const result = await db
        .select()
        .from(schema.sessions)
        .where(and(eq(schema.sessions.id, sessionId), gt(schema.sessions.expiresAt, new Date())))
        .limit(1);

      if (!result || result.length === 0) return null;
      const row = result[0];
      return {
        id: row.id,
        userId: row.userId,
        email: row.email,
        createdAt: row.createdAt.getTime(),
        expiresAt: row.expiresAt.getTime(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] Session lookup falling back to file store:", err);
    }
  }

  ensureFileStore();
  const session = memoryDb.sessions[sessionId];
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    delete memoryDb.sessions[sessionId];
    saveFileStore();
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDrizzleDb();

  if (db) {
    try {
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
      return;
    } catch (err) {
      console.warn("[PostgreSQL] Session delete falling back to file store:", err);
    }
  }

  ensureFileStore();
  if (memoryDb.sessions[sessionId]) {
    delete memoryDb.sessions[sessionId];
    saveFileStore();
  }
}

// ==============================================================================
// 4. RESOURCE HUB REPOSITORY
// ==============================================================================

export interface GetResourcesFilter {
  query?: string;
  category?: string;
  department?: string;
  courseCode?: string;
}

export async function getResources(filter: GetResourcesFilter = {}): Promise<ResourceRecord[]> {
  const db = getDrizzleDb();
  if (db) {
    try {
      const conditions = [];

      if (filter.query && filter.query.trim()) {
        const q = `%${filter.query.trim()}%`;
        conditions.push(
          or(
            ilike(schema.resources.title, q),
            ilike(schema.resources.description, q),
            ilike(schema.resources.courseCode, q),
            ilike(schema.resources.department, q),
            ilike(schema.resources.category, q)
          )
        );
      }

      if (filter.category && filter.category.trim() && filter.category !== "all") {
        conditions.push(eq(schema.resources.category, filter.category.trim()));
      }

      if (filter.department && filter.department.trim() && filter.department !== "all") {
        conditions.push(eq(schema.resources.department, filter.department.trim()));
      }

      if (filter.courseCode && filter.courseCode.trim() && filter.courseCode !== "all") {
        conditions.push(eq(schema.resources.courseCode, filter.courseCode.trim()));
      }

      let qb = db.select().from(schema.resources);
      const rows = conditions.length > 0
        ? await qb.where(and(...conditions)).orderBy(desc(schema.resources.createdAt))
        : await qb.orderBy(desc(schema.resources.createdAt));

      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        department: r.department,
        courseCode: r.courseCode,
        fileUrl: r.fileUrl,
        fileType: r.fileType,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("[PostgreSQL] Resource query failed:", err);
      return [];
    }
  }

  return [];
}

export async function getResourceById(id: string): Promise<ResourceRecord | null> {
  const db = getDrizzleDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.resources)
        .where(eq(schema.resources.id, id))
        .limit(1);

      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        department: r.department,
        courseCode: r.courseCode,
        fileUrl: r.fileUrl,
        fileType: r.fileType,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[PostgreSQL] Resource by ID query failed:", err);
      return null;
    }
  }
  return null;
}

export async function createResource(data: {
  title: string;
  description: string;
  category: string;
  department: string;
  courseCode: string;
  fileUrl?: string | null;
  fileType?: string;
}): Promise<ResourceRecord | null> {
  const db = getDrizzleDb();
  if (!db) return null;

  const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const inserted = await db
    .insert(schema.resources)
    .values({
      id: newId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      department: data.department.trim(),
      courseCode: data.courseCode.trim(),
      fileUrl: data.fileUrl || null,
      fileType: data.fileType || "PDF",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const r = inserted[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    department: r.department,
    courseCode: r.courseCode,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
