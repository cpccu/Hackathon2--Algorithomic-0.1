CREATE TABLE "campus_faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text NOT NULL,
	"department_id" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campus_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"building" text,
	"floor" text,
	"room" text,
	"department_id" text,
	"map_url" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"department_id" text,
	"contact_email" text,
	"contact_url" text,
	"social_url" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"description" text,
	"building" text,
	"floor" text,
	"room" text,
	"email" text,
	"phone" text,
	"website" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"organizer" text NOT NULL,
	"department_id" text,
	"venue" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"registration_url" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"department_id" text,
	"email" text,
	"phone" text,
	"profile_url" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"department_id" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "university_info" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"motto" text,
	"overview" text,
	"address" text,
	"contact_email" text,
	"contact_phone" text,
	"website_url" text,
	"portal_url" text,
	"source_url" text,
	"source_name" text,
	"verification_status" text DEFAULT 'VERIFIED' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "source_name" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "verification_status" text DEFAULT 'VERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campus_faqs" ADD CONSTRAINT "campus_faqs_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_locations" ADD CONSTRAINT "campus_locations_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "faqs_category_idx" ON "campus_faqs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "locations_category_idx" ON "campus_locations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "clubs_name_idx" ON "clubs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "departments_short_name_idx" ON "departments" USING btree ("short_name");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "faculty_department_idx" ON "faculty" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "notices_category_idx" ON "notices" USING btree ("category");--> statement-breakpoint
CREATE INDEX "notices_published_at_idx" ON "notices" USING btree ("published_at");