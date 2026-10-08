import { pgTable, text, timestamp, integer, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * ==============================================================================
 * CAMPUSOS DATABASE SCHEMA (Drizzle ORM for PostgreSQL)
 * ==============================================================================
 */

/**
 * 1. Users Table
 * Core persistent identity for City University students, faculty, and staff.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull(),
  role: text("role").notNull().default("STUDENT"), // 'STUDENT' | 'ADMIN'
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 2. Verification / OTP Table
 * Stores salted SHA-256 HMAC hashes of 6-digit OTP codes. Plaintext is never stored.
 */
export const otps = pgTable("otps", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  purpose: text("purpose").notNull(), // 'login' | 'register'
  fullName: text("full_name"),
  studentId: text("student_id"),
  attempts: integer("attempts").notNull().default(0),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 3. Sessions Table
 * Persistent session storage mapped to signed HTTP-only session tokens.
 */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/**
 * 4. Resources Table
 * First Core Module: CampusOS Resource Hub for academic materials, syllabus, lab manuals, and guides.
 */
export const resources = pgTable(
  "resources",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    department: text("department").notNull(),
    courseCode: text("course_code").notNull(),
    fileUrl: text("file_url"),
    fileType: text("file_type").notNull().default("PDF"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"), // 'VERIFIED' | 'PENDING' | 'ARCHIVED'
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    departmentIdx: index("resources_department_idx").on(table.department),
    categoryIdx: index("resources_category_idx").on(table.category),
    courseCodeIdx: index("resources_course_code_idx").on(table.courseCode),
  })
);

/**
 * ==============================================================================
 * STEP 6: REAL CITY UNIVERSITY DATA FOUNDATION TABLES
 * Provenance tracking: sourceUrl, sourceName, verificationStatus, verifiedAt
 * ==============================================================================
 */

/**
 * 5. University Information Table
 * Verified institutional profile, campus address, official portal links, social handles.
 */
export const universityInfo = pgTable("university_info", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  motto: text("motto"),
  overview: text("overview"),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  websiteUrl: text("website_url"),
  portalUrl: text("portal_url"),
  sourceUrl: text("source_url"),
  sourceName: text("source_name"),
  verificationStatus: text("verification_status").notNull().default("VERIFIED"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * 6. Departments Table
 * Academic & Administrative departments of City University.
 */
export const departments = pgTable(
  "departments",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    description: text("description"),
    building: text("building"),
    floor: text("floor"),
    room: text("room"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    shortNameIdx: index("departments_short_name_idx").on(table.shortName),
  })
);

/**
 * 7. Faculty & Staff Table
 * Verified faculty members, academic chairs, deans, and academic advisors.
 */
export const faculty = pgTable(
  "faculty",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    designation: text("designation").notNull(),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    email: text("email"),
    phone: text("phone"),
    profileUrl: text("profile_url"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    deptIdx: index("faculty_department_idx").on(table.departmentId),
  })
);

/**
 * 8. Campus Locations Table
 * Key campus physical points of interest (Library, Labs, Admissions, Cafeteria, Medical Centre).
 */
export const campusLocations = pgTable(
  "campus_locations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(), // 'Academic' | 'Administrative' | 'Library' | 'Laboratory' | 'Student Facility'
    description: text("description"),
    building: text("building"),
    floor: text("floor"),
    room: text("room"),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    mapUrl: text("map_url"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("locations_category_idx").on(table.category),
  })
);

/**
 * 9. Notices Table
 * Official administration bulletins, examination guidelines, and university announcements.
 */
export const notices = pgTable(
  "notices",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(), // 'Academic' | 'Exam' | 'Administrative' | 'Holiday' | 'General'
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("notices_category_idx").on(table.category),
    publishedAtIdx: index("notices_published_at_idx").on(table.publishedAt),
  })
);

/**
 * 10. Events Table
 * Verified university convocations, workshops, hackathons, and seminars.
 */
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // 'Workshop' | 'Seminar' | 'Competition' | 'Cultural' | 'Academic'
    organizer: text("organizer").notNull(),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    venue: text("venue").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    registrationUrl: text("registration_url"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    startAtIdx: index("events_start_at_idx").on(table.startAt),
    categoryIdx: index("events_category_idx").on(table.category),
  })
);

/**
 * 11. Campus FAQ / Knowledge Table
 * Frequently Asked Questions for admissions, credit transfer, fee clearance, and exams.
 */
export const campusFaqs = pgTable(
  "campus_faqs",
  {
    id: text("id").primaryKey(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    category: text("category").notNull(), // 'Admissions' | 'Exams' | 'Fees & Billing' | 'Graduation' | 'Campus Life'
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("faqs_category_idx").on(table.category),
  })
);

/**
 * 12. Clubs & Student Organizations Table
 * Officially recognized student bodies and co-curricular clubs.
 */
export const clubs = pgTable(
  "clubs",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    departmentId: text("department_id").references(() => departments.id, { onDelete: "set null" }),
    contactEmail: text("contact_email"),
    contactUrl: text("contact_url"),
    socialUrl: text("social_url"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    verificationStatus: text("verification_status").notNull().default("VERIFIED"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("clubs_name_idx").on(table.name),
  })
);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Otp = typeof otps.$inferSelect;
export type NewOtp = typeof otps.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type UniversityInfo = typeof universityInfo.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type CampusLocation = typeof campusLocations.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type Event = typeof events.$inferSelect;
export type CampusFaq = typeof campusFaqs.$inferSelect;
export type Club = typeof clubs.$inferSelect;

/**
 * 13. Event Registrations Table
 * Tracks student registrations for university events, ensuring unique participation.
 */
export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("REGISTERED"), // 'REGISTERED' | 'CANCELLED'
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userEventUniqueIdx: uniqueIndex("event_registrations_user_event_idx").on(
      table.eventId,
      table.userId
    ),
    userIdx: index("event_registrations_user_idx").on(table.userId),
    eventIdx: index("event_registrations_event_idx").on(table.eventId),
  })
);

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;

/**
 * 14. Admin Audit Logs Table
 * Tracks all administrative content actions (creation, editing, verification, archiving).
 */
export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // 'ADMIN_CREATED_EVENT' | 'ADMIN_UPDATED_EVENT' | 'ADMIN_VERIFIED_EVENT' | 'ADMIN_ARCHIVED_EVENT' | etc.
    entityType: text("entity_type").notNull(), // 'EVENT' | 'NOTICE' | 'DEPARTMENT' | 'FACULTY' | 'LOCATION' | 'FAQ' | 'CLUB' | 'UNIVERSITY'
    entityId: text("entity_id").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminUserIdx: index("audit_logs_admin_user_idx").on(table.adminUserId),
    entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;

/**
 * ==============================================================================
 * STEP 11: LOST & FOUND + COMPLAINT BOX SCHEMA
 * ==============================================================================
 */

/**
 * 15. Lost & Found Items Table
 * Tracks community reported lost and found personal belongings on campus.
 */
export const lostFoundItems = pgTable(
  "lost_found_items",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'LOST' | 'FOUND'
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // 'Electronics', 'Documents', 'ID / Card', 'Keys', 'Bag', 'Clothing', 'Accessories', 'Books', 'Other'
    location: text("location").notNull(), // Campus area / building / room
    eventId: text("event_id").references(() => events.id, { onDelete: "set null" }),
    dateOccurred: timestamp("date_occurred", { withTimezone: true }).notNull(),
    imageUrl: text("image_url"),
    contactPreference: text("contact_preference").notNull().default("CAMPUSOS_IN_APP"),
    status: text("status").notNull().default("OPEN"), // 'OPEN' | 'CLAIMED' | 'RESOLVED' | 'ARCHIVED'
    verificationStatus: text("verification_status").notNull().default("PENDING"), // 'PENDING' | 'VERIFIED' | 'REJECTED'
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    reporterIdx: index("lost_found_reporter_idx").on(table.reporterId),
    typeIdx: index("lost_found_type_idx").on(table.type),
    categoryIdx: index("lost_found_category_idx").on(table.category),
    statusIdx: index("lost_found_status_idx").on(table.status),
    verificationIdx: index("lost_found_verification_idx").on(table.verificationStatus),
    createdAtIdx: index("lost_found_created_at_idx").on(table.createdAt),
  })
);

export type LostFoundItem = typeof lostFoundItems.$inferSelect;
export type NewLostFoundItem = typeof lostFoundItems.$inferInsert;

/**
 * 16. Lost & Found Claims Table
 * Manages student claims and verification requests for found items.
 */
export const lostFoundClaims = pgTable(
  "lost_found_claims",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => lostFoundItems.id, { onDelete: "cascade" }),
    claimantId: text("claimant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    contactInfo: text("contact_info"),
    status: text("status").notNull().default("PENDING"), // 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    itemIdx: index("lost_found_claims_item_idx").on(table.itemId),
    claimantIdx: index("lost_found_claims_claimant_idx").on(table.claimantId),
    statusIdx: index("lost_found_claims_status_idx").on(table.status),
    itemClaimantIdx: index("lost_found_claims_item_claimant_idx").on(table.itemId, table.claimantId),
  })
);

export type LostFoundClaim = typeof lostFoundClaims.$inferSelect;
export type NewLostFoundClaim = typeof lostFoundClaims.$inferInsert;

/**
 * 17. Campus Complaints Table
 * Private student grievances and facility reports with administrative resolution tracking.
 */
export const campusComplaints = pgTable(
  "campus_complaints",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(), // e.g. CAMPUSOS-CMP-1728374-ABCD
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(), // 'Academic', 'Facilities', 'IT', 'Transport', 'Library', 'Security', 'Cleanliness', 'Student Services', 'Other'
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    location: text("location").notNull(),
    priority: text("priority").notNull().default("MEDIUM"), // 'LOW' | 'MEDIUM' | 'HIGH'
    status: text("status").notNull().default("SUBMITTED"), // 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    adminResponse: text("admin_response"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    reporterIdx: index("campus_complaints_reporter_idx").on(table.reporterId),
    categoryIdx: index("campus_complaints_category_idx").on(table.category),
    priorityIdx: index("campus_complaints_priority_idx").on(table.priority),
    statusIdx: index("campus_complaints_status_idx").on(table.status),
    createdAtIdx: index("campus_complaints_created_at_idx").on(table.createdAt),
  })
);

export type CampusComplaint = typeof campusComplaints.$inferSelect;
export type NewCampusComplaint = typeof campusComplaints.$inferInsert;

/**
 * 18. Notifications Table
 * In-App real-time database-backed notifications for student activities, updates, and resolutions.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'EVENT_REGISTERED' | 'EVENT_UPDATED' | 'EVENT_CANCELLED' | 'LOST_FOUND_VERIFIED' | 'LOST_FOUND_CLAIM_SUBMITTED' | 'LOST_FOUND_CLAIM_APPROVED' | 'LOST_FOUND_CLAIM_REJECTED' | 'LOST_FOUND_RESOLVED' | 'COMPLAINT_SUBMITTED' | 'COMPLAINT_STATUS_UPDATED' | 'COMPLAINT_RESPONSE' | 'SYSTEM'
    title: text("title").notNull(),
    message: text("message").notNull(),
    entityType: text("entity_type"), // 'event' | 'lost_found' | 'complaint' | 'system'
    entityId: text("entity_id"),
    actionUrl: text("action_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    userReadIdx: index("notifications_user_read_idx").on(table.userId, table.readAt),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

