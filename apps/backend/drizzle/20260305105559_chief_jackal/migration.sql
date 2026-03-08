ALTER TABLE "share_links" ADD COLUMN "use_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "share_links" ADD COLUMN "total_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "share_links" ADD COLUMN "tkbind_list" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "share_links" DROP COLUMN "share_info";