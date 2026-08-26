-- Added by hand: the generated version was a bare NOT NULL add, which fails
-- against existing decks. Backfill first, then tighten the column.
ALTER TABLE "deck" ADD COLUMN "share_token" text;--> statement-breakpoint
UPDATE "deck" SET "share_token" = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10) WHERE "share_token" IS NULL;--> statement-breakpoint
ALTER TABLE "deck" ALTER COLUMN "share_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deck" ADD CONSTRAINT "deck_share_token_unique" UNIQUE("share_token");
