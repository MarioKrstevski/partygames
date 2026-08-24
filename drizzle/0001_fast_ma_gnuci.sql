ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
CREATE INDEX "account_issuer_account_id_idx" ON "account" USING btree ("issuer","account_id");