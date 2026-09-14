-- Migration: add_sacco_partner_integration
-- Created: 2026-09-10
-- Description: Adds external Sacco partner table and enrollment fields to driver_profiles.
--              Replaces the old internal SACCO concept with a single external partner integration.

-- ─── ConnectorType enum ────────────────────────────────────────────────────────

CREATE TYPE "ConnectorType" AS ENUM ('REST_API', 'WEBHOOK', 'LEDGER_EXPORT');

-- ─── SaccoPartner table ────────────────────────────────────────────────────────

CREATE TABLE "sacco_partners" (
    "id"            TEXT         NOT NULL,
    "name"          TEXT         NOT NULL,
    "contactEmail"  TEXT         NOT NULL,
    "apiBaseUrl"    TEXT,
    "apiKey"        TEXT,
    "connectorType" "ConnectorType" NOT NULL DEFAULT 'REST_API',
    "isActive"      BOOLEAN      NOT NULL DEFAULT false,
    "testMode"      BOOLEAN      NOT NULL DEFAULT true,
    "logoUrl"       TEXT,
    "description"   TEXT,
    "website"       TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sacco_partners_pkey" PRIMARY KEY ("id")
);

-- ─── Add Sacco enrollment fields to driver_profiles ───────────────────────────

ALTER TABLE "driver_profiles"
    ADD COLUMN "saccoEnrolled"   BOOLEAN      NOT NULL DEFAULT false,
    ADD COLUMN "saccoPartnerId"  TEXT,
    ADD COLUMN "saccoEnrolledAt" TIMESTAMP(3);

-- ─── Foreign key: driver_profiles.saccoPartnerId → sacco_partners.id ──────────

ALTER TABLE "driver_profiles"
    ADD CONSTRAINT "driver_profiles_saccoPartnerId_fkey"
    FOREIGN KEY ("saccoPartnerId")
    REFERENCES "sacco_partners"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX "driver_profiles_saccoPartnerId_idx"
    ON "driver_profiles"("saccoPartnerId");

CREATE INDEX "driver_profiles_saccoEnrolled_idx"
    ON "driver_profiles"("saccoEnrolled");
