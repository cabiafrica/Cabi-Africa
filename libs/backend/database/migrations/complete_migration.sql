-- Incremental Migration: Add Verification and Occurrence Book System
-- Generated: 2026-01-13
-- Description: Adds verification tables, occurrence book system, and updates existing columns

-- ============================================
-- PART 1: CREATE NEW ENUMS
-- ============================================

CREATE TYPE "VerificationDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'FAILED', 'EXPIRED');
CREATE TYPE "OccurrenceCategory" AS ENUM (
  'CRIME', 'TRAFFIC_OFFENSE', 'SAFETY_VIOLATION', 'POLICY_VIOLATION',
  'HARASSMENT', 'FRAUD', 'PROPERTY_DAMAGE', 'MEDICAL_EMERGENCY',
  'DISPUTE', 'SUSPICIOUS_ACTIVITY', 'VEHICLE_ISSUE', 'ENVIRONMENTAL'
);
CREATE TYPE "OccurrenceSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "OccurrenceStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISPUTED');
CREATE TYPE "ObjectionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- ============================================
-- PART 2: ALTER EXISTING TABLES
-- ============================================

-- Update Users table
ALTER TABLE "users" 
  ALTER COLUMN "passportPhotoUrl" TYPE TEXT,
  ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false;

-- Update Documents table
ALTER TABLE "documents"
  ALTER COLUMN "url" TYPE TEXT,
  ALTER COLUMN "rejectionReason" TYPE TEXT,
  ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "mimeType" TEXT;

-- Update Vehicles table
ALTER TABLE "vehicles"
  ALTER COLUMN "insuranceCertificateUrl" TYPE TEXT,
  ALTER COLUMN "inspectionReportUrl" TYPE TEXT,
  ALTER COLUMN "frontPhotoUrl" TYPE TEXT,
  ALTER COLUMN "backPhotoUrl" TYPE TEXT,
  ALTER COLUMN "sidePhotoUrl" TYPE TEXT;

-- Update Organizations table
ALTER TABLE "organizations"
  ALTER COLUMN "bio" TYPE TEXT,
  ALTER COLUMN "logoUrl" TYPE TEXT,
  ALTER COLUMN "bannerUrl" TYPE TEXT,
  ALTER COLUMN "registrationCertificateUrl" TYPE TEXT;

-- ============================================
-- PART 3: CREATE VERIFICATION TABLES
-- ============================================

CREATE TABLE "document_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "VerificationDocumentType" NOT NULL,
    "documentImageUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "extractedData" JSONB,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "validationErrors" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "biometric_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentVerificationId" TEXT NOT NULL,
    "selfieImageUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "matchScore" DOUBLE PRECISION,
    "livenessScore" DOUBLE PRECISION,
    "isMatch" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_verifications_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- PART 4: CREATE OCCURRENCE BOOK TABLES
-- ============================================

CREATE TABLE "occurrences" (
    "id" TEXT NOT NULL,
    "ob_number" TEXT NOT NULL,
    "category" "OccurrenceCategory" NOT NULL,
    "severity" "OccurrenceSeverity" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "driver_id" TEXT,
    "passenger_id" TEXT,
    "vehicle_id" TEXT,
    "ride_id" TEXT,
    "occurrence_date" DATE NOT NULL,
    "occurrence_time" TIME NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(11,8),
    "location_address" TEXT,
    "location_place_name" VARCHAR(255),
    "location_city" VARCHAR(100),
    "location_country" VARCHAR(100) NOT NULL DEFAULT 'Kenya',
    "location_details" JSONB,
    "source" TEXT NOT NULL,
    "source_reference_id" TEXT,
    "registered_by" TEXT NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolution_notes" TEXT,
    "tags" TEXT[],
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "occurrence_media" (
    "id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "duration" INTEGER,
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "metadata" JSONB,

    CONSTRAINT "occurrence_media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "occurrence_objections" (
    "id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "objector_id" TEXT NOT NULL,
    "objection_text" TEXT NOT NULL,
    "supporting_evidence" JSONB,
    "status" "ObjectionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "outcome" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occurrence_objections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "occurrence_audit_log" (
    "id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "actor_id" TEXT,
    "changes" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "occurrence_audit_log_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- PART 5: CREATE UNIQUE CONSTRAINTS
-- ============================================

CREATE UNIQUE INDEX "occurrences_ob_number_key" ON "occurrences"("ob_number");

-- ============================================
-- PART 6: ADD FOREIGN KEY CONSTRAINTS
-- ============================================

-- Verification foreign keys
ALTER TABLE "document_verifications" 
  ADD CONSTRAINT "document_verifications_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "biometric_verifications" 
  ADD CONSTRAINT "biometric_verifications_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "biometric_verifications" 
  ADD CONSTRAINT "biometric_verifications_documentVerificationId_fkey" 
  FOREIGN KEY ("documentVerificationId") REFERENCES "document_verifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Occurrence foreign keys
ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_driver_id_fkey" 
  FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_passenger_id_fkey" 
  FOREIGN KEY ("passenger_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_vehicle_id_fkey" 
  FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_ride_id_fkey" 
  FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_registered_by_fkey" 
  FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "occurrences" 
  ADD CONSTRAINT "occurrences_resolved_by_fkey" 
  FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Occurrence media foreign keys
ALTER TABLE "occurrence_media" 
  ADD CONSTRAINT "occurrence_media_occurrence_id_fkey" 
  FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "occurrence_media" 
  ADD CONSTRAINT "occurrence_media_uploaded_by_fkey" 
  FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Occurrence objection foreign keys
ALTER TABLE "occurrence_objections" 
  ADD CONSTRAINT "occurrence_objections_occurrence_id_fkey" 
  FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "occurrence_objections" 
  ADD CONSTRAINT "occurrence_objections_objector_id_fkey" 
  FOREIGN KEY ("objector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "occurrence_objections" 
  ADD CONSTRAINT "occurrence_objections_reviewed_by_fkey" 
  FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Occurrence audit log foreign keys
ALTER TABLE "occurrence_audit_log" 
  ADD CONSTRAINT "occurrence_audit_log_occurrence_id_fkey" 
  FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "occurrence_audit_log" 
  ADD CONSTRAINT "occurrence_audit_log_actor_id_fkey" 
  FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- PART 7: CREATE PERFORMANCE INDEXES
-- ============================================

-- Verification indexes
CREATE INDEX "idx_document_verifications_userId" ON "document_verifications"("userId");
CREATE INDEX "idx_document_verifications_status" ON "document_verifications"("status");
CREATE INDEX "idx_document_verifications_createdAt" ON "document_verifications"("createdAt");

CREATE INDEX "idx_biometric_verifications_userId" ON "biometric_verifications"("userId");
CREATE INDEX "idx_biometric_verifications_documentVerificationId" ON "biometric_verifications"("documentVerificationId");
CREATE INDEX "idx_biometric_verifications_status" ON "biometric_verifications"("status");

-- Occurrence indexes
CREATE INDEX "idx_occurrences_driver_id" ON "occurrences"("driver_id");
CREATE INDEX "idx_occurrences_passenger_id" ON "occurrences"("passenger_id");
CREATE INDEX "idx_occurrences_vehicle_id" ON "occurrences"("vehicle_id");
CREATE INDEX "idx_occurrences_ride_id" ON "occurrences"("ride_id");
CREATE INDEX "idx_occurrences_status" ON "occurrences"("status");
CREATE INDEX "idx_occurrences_category" ON "occurrences"("category");
CREATE INDEX "idx_occurrences_severity" ON "occurrences"("severity");
CREATE INDEX "idx_occurrences_occurred_at" ON "occurrences"("occurred_at");
CREATE INDEX "idx_occurrences_registered_by" ON "occurrences"("registered_by");

-- Existing table indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "idx_users_referralCode" ON "users"("referralCode");
CREATE INDEX IF NOT EXISTS "idx_users_isIdentityVerified" ON "users"("isIdentityVerified");

CREATE INDEX IF NOT EXISTS "idx_driver_profiles_userId" ON "driver_profiles"("userId");
CREATE INDEX IF NOT EXISTS "idx_driver_profiles_organizationId" ON "driver_profiles"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_driver_profiles_isBiometricVerified" ON "driver_profiles"("isBiometricVerified");

-- ============================================
-- PART 8: ADD TABLE COMMENTS
-- ============================================

COMMENT ON TABLE "document_verifications" IS 'Stores OCR-based document verification results';
COMMENT ON TABLE "biometric_verifications" IS 'Stores face matching and liveness detection results';
COMMENT ON TABLE "occurrences" IS 'Digital occurrence book for tracking incidents and violations';
COMMENT ON TABLE "occurrence_media" IS 'Media attachments (photos, videos, audio) for occurrences';
COMMENT ON TABLE "occurrence_objections" IS 'Objections filed against occurrence entries';
COMMENT ON TABLE "occurrence_audit_log" IS 'Audit trail for all occurrence modifications';

-- Migration complete!
-- Verify with: SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
