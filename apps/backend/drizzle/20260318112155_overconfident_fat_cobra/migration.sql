CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "share_links_tkbind_list_trgm_idx" ON "share_links" USING gin (("tkbind_list"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "share_links_tkbind_list_jsonb_idx" ON "share_links" USING gin ("tkbind_list");