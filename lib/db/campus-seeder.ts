import fs from "fs";
import path from "path";
import { getPostgresPool } from "@/lib/db";

/**
 * Idempotent seeder that imports verified City University data files from data/campus/
 * into Neon PostgreSQL without destroying or resetting existing user, session, or resource data.
 */
export async function seedVerifiedCampusData(): Promise<{ success: boolean; imported: Record<string, number>; error?: string }> {
  const pool = getPostgresPool();
  if (!pool) {
    return { success: false, imported: {}, error: "PostgreSQL pool is not connected" };
  }

  const campusDir = path.join(process.cwd(), "data", "campus");
  if (!fs.existsSync(campusDir)) {
    return { success: false, imported: {}, error: "data/campus directory does not exist" };
  }

  const results: Record<string, number> = {};

  try {
    // 1. University Info (UPSERT)
    const univFile = path.join(campusDir, "university.json");
    if (fs.existsSync(univFile)) {
      const parsed = JSON.parse(fs.readFileSync(univFile, "utf8"));
      let count = 0;
      for (const item of parsed.data || []) {
        await pool.query(
          `INSERT INTO university_info (
            id, name, short_name, motto, overview, address, contact_email, contact_phone,
            website_url, portal_url, source_url, source_name, verification_status, verified_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            short_name = EXCLUDED.short_name,
            motto = EXCLUDED.motto,
            overview = EXCLUDED.overview,
            address = EXCLUDED.address,
            contact_email = EXCLUDED.contact_email,
            contact_phone = EXCLUDED.contact_phone,
            website_url = EXCLUDED.website_url,
            portal_url = EXCLUDED.portal_url,
            source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            verification_status = EXCLUDED.verification_status,
            updated_at = NOW()`,
          [
            item.id,
            item.name,
            item.shortName || null,
            item.motto || null,
            item.overview || null,
            item.address || null,
            item.contactEmail || null,
            item.contactPhone || null,
            item.websiteUrl || null,
            item.portalUrl || null,
            item.sourceUrl || null,
            item.sourceName || null,
            item.verificationStatus || "VERIFIED",
          ]
        );
        count++;
      }
      results.universityInfo = count;
    }

    // 2. Departments (UPSERT)
    const deptFile = path.join(campusDir, "departments.json");
    if (fs.existsSync(deptFile)) {
      const parsed = JSON.parse(fs.readFileSync(deptFile, "utf8"));
      let count = 0;
      for (const item of parsed.data || []) {
        await pool.query(
          `INSERT INTO departments (
            id, name, short_name, description, building, floor, room, email, phone, website,
            source_url, source_name, verification_status, verified_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            short_name = EXCLUDED.short_name,
            description = EXCLUDED.description,
            building = EXCLUDED.building,
            floor = EXCLUDED.floor,
            room = EXCLUDED.room,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            verification_status = EXCLUDED.verification_status,
            updated_at = NOW()`,
          [
            item.id,
            item.name,
            item.shortName,
            item.description || null,
            item.building || null,
            item.floor || null,
            item.room || null,
            item.email || null,
            item.phone || null,
            item.website || null,
            item.sourceUrl || null,
            item.sourceName || null,
            item.verificationStatus || "VERIFIED",
          ]
        );
        count++;
      }
      results.departments = count;
    }

    // 3. Campus Locations (UPSERT)
    const locFile = path.join(campusDir, "locations.json");
    if (fs.existsSync(locFile)) {
      const parsed = JSON.parse(fs.readFileSync(locFile, "utf8"));
      let count = 0;
      for (const item of parsed.data || []) {
        await pool.query(
          `INSERT INTO campus_locations (
            id, name, category, description, building, floor, room, department_id, map_url,
            source_url, source_name, verification_status, verified_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            building = EXCLUDED.building,
            floor = EXCLUDED.floor,
            room = EXCLUDED.room,
            department_id = EXCLUDED.department_id,
            map_url = EXCLUDED.map_url,
            source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            verification_status = EXCLUDED.verification_status,
            updated_at = NOW()`,
          [
            item.id,
            item.name,
            item.category,
            item.description || null,
            item.building || null,
            item.floor || null,
            item.room || null,
            item.departmentId || null,
            item.mapUrl || null,
            item.sourceUrl || null,
            item.sourceName || null,
            item.verificationStatus || "VERIFIED",
          ]
        );
        count++;
      }
      results.locations = count;
    }

    // 4. Campus FAQs (UPSERT)
    const faqFile = path.join(campusDir, "faqs.json");
    if (fs.existsSync(faqFile)) {
      const parsed = JSON.parse(fs.readFileSync(faqFile, "utf8"));
      let count = 0;
      for (const item of parsed.data || []) {
        await pool.query(
          `INSERT INTO campus_faqs (
            id, question, answer, category, department_id,
            source_url, source_name, verification_status, verified_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            question = EXCLUDED.question,
            answer = EXCLUDED.answer,
            category = EXCLUDED.category,
            department_id = EXCLUDED.department_id,
            source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            verification_status = EXCLUDED.verification_status,
            updated_at = NOW()`,
          [
            item.id,
            item.question,
            item.answer,
            item.category,
            item.departmentId || null,
            item.sourceUrl || null,
            item.sourceName || null,
            item.verificationStatus || "VERIFIED",
          ]
        );
        count++;
      }
      results.faqs = count;
    }

    // 5. Clubs (UPSERT)
    const clubFile = path.join(campusDir, "clubs.json");
    if (fs.existsSync(clubFile)) {
      const parsed = JSON.parse(fs.readFileSync(clubFile, "utf8"));
      let count = 0;
      for (const item of parsed.data || []) {
        await pool.query(
          `INSERT INTO clubs (
            id, name, description, department_id, contact_email, contact_url, social_url,
            source_url, source_name, verification_status, verified_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            department_id = EXCLUDED.department_id,
            contact_email = EXCLUDED.contact_email,
            contact_url = EXCLUDED.contact_url,
            social_url = EXCLUDED.social_url,
            source_url = EXCLUDED.source_url,
            source_name = EXCLUDED.source_name,
            verification_status = EXCLUDED.verification_status,
            updated_at = NOW()`,
          [
            item.id,
            item.name,
            item.description || null,
            item.departmentId || null,
            item.contactEmail || null,
            item.contactUrl || null,
            item.socialUrl || null,
            item.sourceUrl || null,
            item.sourceName || null,
            item.verificationStatus || "VERIFIED",
          ]
        );
        count++;
      }
      results.clubs = count;
    }

    return { success: true, imported: results };
  } catch (err: unknown) {
    console.error("[Campus Seeder] Ingestion error:", err);
    return { success: false, imported: results, error: String(err) };
  }
}
