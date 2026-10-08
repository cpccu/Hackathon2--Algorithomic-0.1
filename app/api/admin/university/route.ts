import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/admin";
import { getDrizzleDb, createAuditLog } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const rows = await db.select().from(schema.universityInfo).limit(1);
    const info = rows[0] || {
      id: "univ_city_university",
      name: "City University",
      shortName: "CU",
      motto: "A Center of Excellence",
      overview: "City University is a premier private university in Bangladesh.",
      campusAddress: "Birulia, Savar, Dhaka-1216",
      address: "Birulia, Savar, Dhaka-1216",
      city: "Dhaka",
      country: "Bangladesh",
      primaryEmail: "info@cityuniversity.edu.bd",
      contactEmail: "info@cityuniversity.edu.bd",
      admissionEmail: "admission@cityuniversity.edu.bd",
      primaryPhone: "+880-2-9020142",
      contactPhone: "+880-2-9020142",
      admissionPhone: "+880-1819818266",
      emergencyPhone: "+880-1819818267",
      websiteUrl: "https://cityuniversity.edu.bd",
      portalUrl: "https://portal.cityuniversity.edu.bd",
      verificationStatus: "VERIFIED",
      status: "VERIFIED",
    };

    return NextResponse.json({ success: true, profile: info, universityInfo: info });
  } catch (err: unknown) {
    console.error("[API Admin University GET] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to load university info." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const db = getDrizzleDb();
  if (!db) {
    return NextResponse.json({ success: false, error: "Database unavailable." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const rows = await db.select().from(schema.universityInfo).limit(1);
    const now = new Date();

    if (rows.length === 0) {
      // Initialize single institution record
      const id = "univ_city_university";
      await db.insert(schema.universityInfo).values({
        id,
        name: body.name?.trim() || "City University",
        shortName: body.shortName?.trim() || "CU",
        motto: body.motto?.trim() || null,
        overview: body.overview?.trim() || null,
        address: body.address?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        websiteUrl: body.websiteUrl?.trim() || null,
        portalUrl: body.portalUrl?.trim() || null,
        sourceUrl: body.sourceUrl?.trim() || null,
        sourceName: body.sourceName?.trim() || "University Administration",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await createAuditLog(auth.user.id, "ADMIN_INITIALIZED_UNIVERSITY_INFO", "UNIVERSITY", id);
      return NextResponse.json({ success: true, message: "University profile initialized." });
    }

    const current = rows[0];
    const updateData: Partial<typeof schema.universityInfo.$inferInsert> = {
      updatedAt: now,
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.shortName !== undefined) updateData.shortName = body.shortName.trim();
    if (body.motto !== undefined) updateData.motto = body.motto ? body.motto.trim() : null;
    if (body.overview !== undefined) updateData.overview = body.overview ? body.overview.trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail ? body.contactEmail.trim() : null;
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone ? body.contactPhone.trim() : null;
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl ? body.websiteUrl.trim() : null;
    if (body.portalUrl !== undefined) updateData.portalUrl = body.portalUrl ? body.portalUrl.trim() : null;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl ? body.sourceUrl.trim() : null;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName ? body.sourceName.trim() : null;

    await db.update(schema.universityInfo).set(updateData).where(eq(schema.universityInfo.id, current.id));
    await createAuditLog(auth.user.id, "ADMIN_UPDATED_UNIVERSITY_INFO", "UNIVERSITY", current.id);

    return NextResponse.json({ success: true, message: "University profile updated." });
  } catch (err: unknown) {
    console.error("[API Admin University PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to update university info." }, { status: 500 });
  }
}
