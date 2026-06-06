-- Fix NULL batteryOptions before making it NOT NULL
UPDATE "CalculatorConfig" SET "batteryOptions" = '[]'::jsonb WHERE "batteryOptions" IS NULL;

-- AlterTable: remove old columns and add new ones
ALTER TABLE "CalculatorConfig"
  DROP COLUMN IF EXISTS "annualDegradation",
  DROP COLUMN IF EXISTS "averageSunHoursPerDay",
  DROP COLUMN IF EXISTS "batteryPricePerKwh",
  DROP COLUMN IF EXISTS "co2PerKwh",
  DROP COLUMN IF EXISTS "inverterEfficiency",
  DROP COLUMN IF EXISTS "inverterPriceBase",
  DROP COLUMN IF EXISTS "panelPriceIls",
  DROP COLUMN IF EXISTS "pricePerWattInstalled",
  DROP COLUMN IF EXISTS "systemLifeYears",
  DROP COLUMN IF EXISTS "systemLoss",
  DROP COLUMN IF EXISTS "systemPricing",
  ADD COLUMN IF NOT EXISTS "contactEmail"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactMessage"  TEXT NOT NULL DEFAULT 'نظامك يحتاج دراسة خاصة، تواصل معنا مباشرة وسيقوم فريقنا بمساعدتك',
  ADD COLUMN IF NOT EXISTS "contactPhone"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "contactWhatsapp" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "maxBillIls"      INTEGER NOT NULL DEFAULT 3000,
  ADD COLUMN IF NOT EXISTS "maxSystemKw"     INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "minBillIls"      INTEGER NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS "sunHoursPerDay"  DOUBLE PRECISION NOT NULL DEFAULT 5.5,
  ADD COLUMN IF NOT EXISTS "systemContent"   JSONB,
  ADD COLUMN IF NOT EXISTS "systemSizes"     JSONB NOT NULL DEFAULT '[]',
  ALTER COLUMN "panelWatts" SET DEFAULT 620,
  ALTER COLUMN "batteryOptions" SET NOT NULL,
  ALTER COLUMN "batteryOptions" SET DEFAULT '[]';

-- Drop Media table if exists (was removed from schema)
DROP TABLE IF EXISTS "Media";
