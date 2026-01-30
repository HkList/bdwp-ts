ALTER TABLE "accounts" DROP CONSTRAINT "accounts_uk_key";--> statement-breakpoint
CREATE UNIQUE INDEX "uk_cid_unique_idx" ON "accounts" ("uk","cid");