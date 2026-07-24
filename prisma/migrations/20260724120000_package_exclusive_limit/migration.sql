-- AlterTable
ALTER TABLE "Package" ADD COLUMN "exclusiveLimit" INTEGER;

-- Backfill: existing exclusive packages default to 1 purchase available
UPDATE "Package" SET "exclusiveLimit" = 1 WHERE "exclusive" = true AND "exclusiveLimit" IS NULL;
