CREATE TABLE "campus_complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"reporter_id" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"status" text DEFAULT 'SUBMITTED' NOT NULL,
	"admin_response" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campus_complaints_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "lost_found_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"claimant_id" text NOT NULL,
	"message" text NOT NULL,
	"contact_info" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lost_found_items" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"event_id" text,
	"date_occurred" timestamp with time zone NOT NULL,
	"image_url" text,
	"contact_preference" text DEFAULT 'CAMPUSOS_IN_APP' NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"verification_status" text DEFAULT 'PENDING' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campus_complaints" ADD CONSTRAINT "campus_complaints_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_found_claims" ADD CONSTRAINT "lost_found_claims_item_id_lost_found_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."lost_found_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_found_claims" ADD CONSTRAINT "lost_found_claims_claimant_id_users_id_fk" FOREIGN KEY ("claimant_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campus_complaints_reporter_idx" ON "campus_complaints" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "campus_complaints_category_idx" ON "campus_complaints" USING btree ("category");--> statement-breakpoint
CREATE INDEX "campus_complaints_priority_idx" ON "campus_complaints" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "campus_complaints_status_idx" ON "campus_complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campus_complaints_created_at_idx" ON "campus_complaints" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lost_found_claims_item_idx" ON "lost_found_claims" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "lost_found_claims_claimant_idx" ON "lost_found_claims" USING btree ("claimant_id");--> statement-breakpoint
CREATE INDEX "lost_found_claims_status_idx" ON "lost_found_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lost_found_claims_item_claimant_idx" ON "lost_found_claims" USING btree ("item_id","claimant_id");--> statement-breakpoint
CREATE INDEX "lost_found_reporter_idx" ON "lost_found_items" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "lost_found_type_idx" ON "lost_found_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lost_found_category_idx" ON "lost_found_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "lost_found_status_idx" ON "lost_found_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lost_found_verification_idx" ON "lost_found_items" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "lost_found_created_at_idx" ON "lost_found_items" USING btree ("created_at");