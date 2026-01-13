-- Migration: Add Verification Tables and Update Image Data Types
-- Generated: 2026-01-12
-- Description: Adds document and biometric verification tables, updates image URL fields to TEXT type

-- Step 1: Create new enums
CREATE TYPE "VerificationDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'FAILED', 'EXPIRED');

-- Step 2: Alter existing User table
ALTER TABLE "users" 
  ALTER COLUMN "passportPhotoUrl" TYPE TEXT,
  ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Alter existing Document table
ALTER TABLE "documents"
  ALTER COLUMN "url" TYPE TEXT,
  ALTER COLUMN "rejectionReason" TYPE TEXT,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "fileSize" INTEGER,
  ADD COLUMN "mimeType" TEXT;

-- Step 4: Alter existing Vehicle table
ALTER TABLE "vehicles"
  ALTER COLUMN "insuranceCertificateUrl" TYPE TEXT,
  ALTER COLUMN "inspectionReportUrl" TYPE TEXT,
  ALTER COLUMN "frontPhotoUrl" TYPE TEXT,
  ALTER COLUMN "backPhotoUrl" TYPE TEXT,
  ALTER COLUMN "sidePhotoUrl" TYPE TEXT;

-- Step 5: Alter existing Organization table
ALTER TABLE "organizations"
  ALTER COLUMN "bio" TYPE TEXT,
  ALTER COLUMN "logoUrl" TYPE TEXT,
  ALTER COLUMN "bannerUrl" TYPE TEXT,
  ALTER COLUMN "registrationCertificateUrl" TYPE TEXT;

-- Step 6: Create DocumentVerification table
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

-- Step 7: Create BiometricVerification table
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

-- Step 8: Add foreign key constraints
ALTER TABLE "document_verifications" 
  ADD CONSTRAINT "document_verifications_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "biometric_verifications" 
  ADD CONSTRAINT "biometric_verifications_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "biometric_verifications" 
  ADD CONSTRAINT "biometric_verifications_documentVerificationId_fkey" 
  FOREIGN KEY ("documentVerificationId") REFERENCES "document_verifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Create indexes for performance
CREATE INDEX "idx_document_verifications_userId" ON "document_verifications"("userId");
CREATE INDEX "idx_document_verifications_status" ON "document_verifications"("status");
CREATE INDEX "idx_document_verifications_createdAt" ON "document_verifications"("createdAt");

CREATE INDEX "idx_biometric_verifications_userId" ON "biometric_verifications"("userId");
CREATE INDEX "idx_biometric_verifications_documentVerificationId" ON "biometric_verifications"("documentVerificationId");
CREATE INDEX "idx_biometric_verifications_status" ON "biometric_verifications"("status");

-- Step 10: Add helpful indexes on existing tables
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "idx_users_referralCode" ON "users"("referralCode");
CREATE INDEX IF NOT EXISTS "idx_users_isIdentityVerified" ON "users"("isIdentityVerified");

CREATE INDEX IF NOT EXISTS "idx_driver_profiles_userId" ON "driver_profiles"("userId");
CREATE INDEX IF NOT EXISTS "idx_driver_profiles_organizationId" ON "driver_profiles"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_driver_profiles_isBiometricVerified" ON "driver_profiles"("isBiometricVerified");

-- Step 11: Add comments for documentation
COMMENT ON TABLE "document_verifications" IS 'Stores OCR-based document verification results';
COMMENT ON TABLE "biometric_verifications" IS 'Stores face matching and liveness detection results';
COMMENT ON COLUMN "document_verifications"."extractedData" IS 'JSON object containing OCR extracted fields';
COMMENT ON COLUMN "document_verifications"."confidenceScore" IS 'OCR confidence score between 0 and 1';
COMMENT ON COLUMN "biometric_verifications"."matchScore" IS 'Face match score between 0 and 1';
COMMENT ON COLUMN "biometric_verifications"."livenessScore" IS 'Liveness detection score between 0 and 1';

-- Migration complete
-- Run: SELECT version FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1;
-- to verify migration was applied
