CREATE TYPE "user_type" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "type" "user_type" DEFAULT 'user'::"user_type" NOT NULL;