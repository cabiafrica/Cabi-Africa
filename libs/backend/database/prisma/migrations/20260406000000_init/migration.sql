-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PROSPECT', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LICENSE_FRONT', 'LICENSE_BACK', 'ID_FRONT', 'ID_BACK', 'PROFILE_PHOTO', 'VEHICLE_LOGBOOK', 'VEHICLE_INSURANCE', 'VEHICLE_INSPECTION', 'POLICE_CLEARANCE', 'PSV_BADGE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VehicleUsage" AS ENUM ('TAXI', 'COMMERCIAL', 'PRIVATE', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('PSV', 'COMMERCIAL', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LegacyRole" AS ENUM ('PASSENGER', 'DRIVER', 'ADMIN', 'DISPATCHER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('SITE_SETUP_VIEW', 'SITE_SETUP_EDIT', 'FEATURES_INTEGRATIONS_VIEW', 'FEATURES_INTEGRATIONS_EDIT', 'ORG_STRUCTURE_VIEW', 'ORG_STRUCTURE_EDIT', 'GROUPS_ROLES_VIEW', 'GROUPS_ROLES_EDIT', 'LOCATIONS_VIEW', 'LOCATIONS_EDIT', 'PEOPLE_VIEW', 'PEOPLE_EDIT', 'PEOPLE_CREATE', 'PEOPLE_DELETE', 'INVITATIONS_VIEW', 'INVITATIONS_SEND', 'SKILLS_VIEW', 'SKILLS_EDIT', 'METRICS_VIEW', 'METRICS_EDIT', 'PATHWAYS_VIEW', 'PATHWAYS_EDIT', 'LEARNING_BOARDS_VIEW', 'LEARNING_BOARDS_EDIT', 'LIBRARY_CONTENT_VIEW', 'LIBRARY_CONTENT_EDIT', 'LIBRARY_CONTENT_PUBLISH', 'ASSESSMENT_DEFINITIONS_VIEW', 'ASSESSMENT_DEFINITIONS_EDIT', 'THIRD_PARTY_PACKAGES_VIEW', 'THIRD_PARTY_PACKAGES_MANAGE', 'GROUP_TRAINING_VIEW', 'GROUP_TRAINING_EDIT', 'PUBLISHED_CONTENT_VIEW', 'PUBLISHED_CONTENT_MANAGE', 'AUTOMATION_TRIGGERS_VIEW', 'AUTOMATION_TRIGGERS_EDIT', 'NOTIFICATIONS_VIEW', 'NOTIFICATIONS_MANAGE', 'DASHBOARD_PERSONALIZE', 'TASK_VIEW_ACCESS', 'LEARNING_VIEW_ACCESS', 'REPORT_BUILDER_ACCESS', 'PATHWAY_ACTIVITY_VIEW', 'ASSESSMENT_RESULTS_VIEW', 'SKILLS_COMPETENCIES_VIEW', 'AUDIT_ACTIVITY_VIEW', 'REPORT_PUBLISHING_ACCESS', 'DISPATCH_DASHBOARD_VIEW', 'DISPATCH_RIDE_ASSIGN', 'DISPATCH_RIDE_MONITOR', 'DISPATCH_DRIVER_MANAGE', 'DISPATCH_REAL_TIME_MAP', 'DISPATCH_ANALYTICS_VIEW', 'DRIVER_APPLICATIONS_VIEW', 'DRIVER_APPLICATIONS_APPROVE', 'DRIVER_APPLICATIONS_REJECT', 'DRIVER_DOCUMENTS_VIEW', 'DRIVER_DOCUMENTS_VERIFY', 'DRIVER_PROFILE_EDIT', 'DRIVER_SUSPEND', 'DRIVER_ACTIVATE', 'PASSENGER_PROFILES_VIEW', 'PASSENGER_PROFILES_EDIT', 'PASSENGER_SUSPEND', 'PASSENGER_ACTIVATE', 'VEHICLES_VIEW', 'VEHICLES_EDIT', 'VEHICLES_APPROVE', 'VEHICLES_SUSPEND', 'OCCURRENCE_VIEW', 'OCCURRENCE_CREATE', 'OCCURRENCE_EDIT', 'OCCURRENCE_RESOLVE', 'OCCURRENCE_OBJECTION_REVIEW', 'PAYMENTS_VIEW', 'PAYMENTS_PROCESS', 'FARE_MANAGEMENT_VIEW', 'FARE_MANAGEMENT_EDIT', 'COMMISSION_VIEW', 'COMMISSION_EDIT', 'FINANCIAL_REPORTS_VIEW', 'VERIFICATION_DOCUMENTS_VIEW', 'VERIFICATION_DOCUMENTS_APPROVE', 'VERIFICATION_BIOMETRIC_VIEW', 'VERIFICATION_BIOMETRIC_APPROVE', 'ORGANIZATION_VIEW', 'ORGANIZATION_EDIT', 'ORGANIZATION_APPROVE', 'REFERRAL_FORMULA_VIEW', 'REFERRAL_FORMULA_EDIT', 'REFERRAL_TRACKING_VIEW', 'MARKETING_CONTENT_VIEW', 'MARKETING_CONTENT_EDIT', 'MARKETING_ANALYTICS_VIEW', 'BLOG_POSTS_VIEW', 'BLOG_POSTS_EDIT', 'SYSTEM_SETTINGS_VIEW', 'SYSTEM_SETTINGS_EDIT', 'USER_ROLES_ASSIGN', 'AUDIT_LOGS_VIEW', 'SYSTEM_HEALTH_MONITOR');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'USER_MANAGER', 'OPERATIONS_MANAGER', 'FINANCIAL_MANAGER', 'VERIFICATION_OFFICER', 'SUPPORT_AGENT', 'DISPATCHER', 'SENIOR_DISPATCHER', 'DISPATCH_SUPERVISOR', 'DISPATCH_ANALYST', 'MARKETING_ADMIN', 'CONTENT_EDITOR', 'BLOG_WRITER', 'DRIVER', 'PASSENGER', 'ORGANIZATION_ADMIN', 'ORGANIZATION_MEMBER', 'VIEWER', 'AUDITOR', 'GUEST');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ADMIN_PANEL', 'DISPATCH_PANEL', 'USER_PORTAL', 'MOBILE_APP', 'ALL');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('STANDARD', 'PREMIUM', 'XL', 'BODA');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('REQUESTED', 'MATCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'PASSENGER_ID', 'PASSENGER_PASSPORT_PHOTO', 'PASSENGER_SELFIE', 'FINGERPRINT');

-- CreateEnum
CREATE TYPE "PassengerVerificationLevel" AS ENUM ('NONE', 'BASIC', 'SELFIE', 'BIOMETRIC');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OccurrenceCategory" AS ENUM ('CRIME', 'TRAFFIC_OFFENSE', 'SAFETY_VIOLATION', 'POLICY_VIOLATION', 'HARASSMENT', 'FRAUD', 'PROPERTY_DAMAGE', 'MEDICAL_EMERGENCY', 'DISPUTE', 'SUSPICIOUS_ACTIVITY', 'VEHICLE_ISSUE', 'ENVIRONMENTAL');

-- CreateEnum
CREATE TYPE "OccurrenceSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ObjectionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('ACHIEVEMENT', 'QUALITY', 'LOYALTY', 'SAFETY', 'SOCIAL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ROOKIE', 'STAR_DRIVER', 'ROAD_MASTER', 'ELITE');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('PRIORITY_DISPATCH', 'ZONE_SELECTION', 'COMMISSION_REBATE', 'SACCO_BONUS', 'SACCO_MATCH', 'CREDIT_LIMIT_BOOST', 'LOAN_RATE_REDUCTION', 'PASSENGER_DISCOUNT');

-- CreateEnum
CREATE TYPE "SosPenaltyType" AS ENUM ('FEE', 'REVOKE_BADGE');

-- CreateEnum
CREATE TYPE "RequiredVerificationMethod" AS ENUM ('NONE', 'ID_ONLY', 'ID_AND_SELFIE', 'ID_SELFIE_FINGERPRINT');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nickname" TEXT,
    "privacySettings" JSONB DEFAULT '{}',
    "referralCode" TEXT,
    "referredById" TEXT,
    "username" TEXT,
    "idNumber" TEXT,
    "middleName" TEXT,
    "passportPhotoUrl" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "LegacyRole" NOT NULL DEFAULT 'PASSENGER',
    "city" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PROSPECT',
    "forgotEmailOtp" TEXT,
    "forgotEmailOtpExpires" TIMESTAMP(3),
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" TIMESTAMP(3),
    "recoveryCodes" TEXT[],
    "twoFactorSecret" TEXT,
    "averageRating" DOUBLE PRECISION,
    "totalRidesAsPassenger" INTEGER NOT NULL DEFAULT 0,
    "fingerprintDataUrl" TEXT,
    "isVerifiedPassenger" BOOLEAN NOT NULL DEFAULT false,
    "lastVerificationAt" TIMESTAMP(3),
    "maxFreeTrips" INTEGER NOT NULL DEFAULT 1,
    "passengerTripCount" INTEGER NOT NULL DEFAULT 0,
    "verificationLevel" "PassengerVerificationLevel" NOT NULL DEFAULT 'BASIC',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "location" TEXT,
    "reportedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "currentLocation" JSONB,
    "isBiometricVerified" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "acceptanceRate" DOUBLE PRECISION,
    "averageRating" DOUBLE PRECISION,
    "totalRidesCompleted" INTEGER NOT NULL DEFAULT 0,
    "driverGroupId" TEXT,
    "referrerId" TEXT,

    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'STANDARD',
    "backPhotoUrl" TEXT,
    "color" TEXT,
    "frontPhotoUrl" TEXT,
    "inspectionReportUrl" TEXT,
    "insuranceCertificateUrl" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "insurancePolicyNumber" TEXT,
    "logbookNumber" TEXT,
    "sidePhotoUrl" TEXT,
    "insuranceType" "InsuranceType",
    "usage" "VehicleUsage" NOT NULL DEFAULT 'TAXI',
    "logbookImageUrl" TEXT,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "capacity" DOUBLE PRECISION,
    "capacityUnit" TEXT,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "driverId" TEXT,
    "status" "RideStatus" NOT NULL DEFAULT 'REQUESTED',
    "pickupLocation" JSONB NOT NULL,
    "dropoffLocation" JSONB NOT NULL,
    "fare" DECIMAL(10,2),
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "baseFare" DECIMAL(10,2),
    "matchingCompletedAt" TIMESTAMP(3),
    "matchingDurationMs" INTEGER,
    "matchingStartedAt" TIMESTAMP(3),
    "requestedVehicleType" "VehicleType",
    "surgeMultiplier" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "type" "RoleType" NOT NULL,
    "platform" "Platform" NOT NULL,
    "permissions" "Permission"[],
    "parentRoleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "organizationId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "hunterId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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
    "occurrence_time" TIME(6) NOT NULL,
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" "BadgeCategory" NOT NULL,
    "tier" "BadgeTier" NOT NULL DEFAULT 'BRONZE',
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER,
    "driverProfileId" TEXT,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "value" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_reward_mappings" (
    "id" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_reward_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_badge_status" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "badgeTier" "BadgeTier" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastValidatedAt" TIMESTAMP(3),
    "metricsSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_badge_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_savings_preferences" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "personalSavingRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isAutoSavingsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "preferredZoneIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_savings_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_ledger" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "driverProfileId" TEXT NOT NULL,
    "baseFare" DECIMAL(10,2) NOT NULL,
    "platformCommission" DECIMAL(10,2) NOT NULL,
    "platformNet" DECIMAL(10,2) NOT NULL,
    "saccoAdminFee" DECIMAL(10,2) NOT NULL,
    "badgeBonusActive" BOOLEAN NOT NULL DEFAULT false,
    "badgeBonusAmount" DECIMAL(10,2) NOT NULL,
    "personalSavingsAmount" DECIMAL(10,2) NOT NULL,
    "driverShare" DECIMAL(10,2) NOT NULL,
    "driverNetTakeHome" DECIMAL(10,2) NOT NULL,
    "totalSaccoDeposit" DECIMAL(10,2) NOT NULL,
    "commissionRebate" DECIMAL(10,2) NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredVehicleTypes" "VehicleType"[],
    "maxWaitMinutes" INTEGER NOT NULL DEFAULT 10,
    "maxDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "quietRide" BOOLEAN NOT NULL DEFAULT false,
    "musicAllowed" BOOLEAN NOT NULL DEFAULT true,
    "acPreferred" BOOLEAN NOT NULL DEFAULT false,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "favoriteDriverIds" TEXT[],
    "blockedDriverIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ride_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_config" (
    "id" TEXT NOT NULL,
    "type" "SosPenaltyType" NOT NULL DEFAULT 'FEE',
    "feeAmount" DECIMAL(10,2),
    "badgeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sos_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_verification_config" (
    "id" TEXT NOT NULL,
    "requireNationalId" BOOLEAN NOT NULL DEFAULT true,
    "requirePassengerPhoto" BOOLEAN NOT NULL DEFAULT true,
    "requireSelfieVerification" BOOLEAN NOT NULL DEFAULT true,
    "requireFingerprint" BOOLEAN NOT NULL DEFAULT false,
    "selfieReverificationDays" INTEGER NOT NULL DEFAULT 30,
    "fingerprintReverificationDays" INTEGER NOT NULL DEFAULT 90,
    "maxTripsBeforeVerification" INTEGER NOT NULL DEFAULT 1,
    "maxTripsWithUnverified" INTEGER NOT NULL DEFAULT 1,
    "verifiedPassengerPrivileges" JSONB NOT NULL DEFAULT '{}',
    "autoVerifyOnDocumentUpload" BOOLEAN NOT NULL DEFAULT true,
    "requireAdminApproval" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passenger_verification_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_ledger" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "transactionType" TEXT NOT NULL,
    "reason" TEXT,
    "sourceDriverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sacco_ledger" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "relatedTripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sacco_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "duties" TEXT,
    "isBiometricVerified" BOOLEAN NOT NULL DEFAULT false,
    "canHunt" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "registrationCertificateUrl" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "founderName" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_idNumber_key" ON "users"("idNumber");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_lastActiveAt_idx" ON "users"("lastActiveAt");

-- CreateIndex
CREATE INDEX "users_isTwoFactorEnabled_idx" ON "users"("isTwoFactorEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_userId_key" ON "driver_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_licenseNumber_key" ON "driver_profiles"("licenseNumber");

-- CreateIndex
CREATE INDEX "driver_profiles_isOnline_idx" ON "driver_profiles"("isOnline");

-- CreateIndex
CREATE INDEX "driver_profiles_referrerId_idx" ON "driver_profiles"("referrerId");

-- CreateIndex
CREATE INDEX "driver_profiles_driverGroupId_idx" ON "driver_profiles"("driverGroupId");

-- CreateIndex
CREATE INDEX "driver_profiles_organizationId_idx" ON "driver_profiles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driverProfileId_key" ON "vehicles"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_logbookNumber_key" ON "vehicles"("logbookNumber");

-- CreateIndex
CREATE INDEX "rides_passengerId_idx" ON "rides"("passengerId");

-- CreateIndex
CREATE INDEX "rides_driverId_idx" ON "rides"("driverId");

-- CreateIndex
CREATE INDEX "rides_status_idx" ON "rides"("status");

-- CreateIndex
CREATE INDEX "rides_createdAt_idx" ON "rides"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_organizationId_key" ON "user_roles"("userId", "roleId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permission_key" ON "user_permissions"("userId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "occurrences_ob_number_key" ON "occurrences"("ob_number");

-- CreateIndex
CREATE INDEX "occurrences_status_idx" ON "occurrences"("status");

-- CreateIndex
CREATE INDEX "occurrences_severity_idx" ON "occurrences"("severity");

-- CreateIndex
CREATE INDEX "occurrences_category_idx" ON "occurrences"("category");

-- CreateIndex
CREATE INDEX "occurrences_occurrence_date_idx" ON "occurrences"("occurrence_date");

-- CreateIndex
CREATE INDEX "occurrences_driver_id_idx" ON "occurrences"("driver_id");

-- CreateIndex
CREATE INDEX "occurrences_passenger_id_idx" ON "occurrences"("passenger_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_code_key" ON "rewards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "badge_reward_mappings_badgeId_rewardId_key" ON "badge_reward_mappings"("badgeId", "rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_badge_status_driverProfileId_badgeTier_key" ON "driver_badge_status"("driverProfileId", "badgeTier");

-- CreateIndex
CREATE UNIQUE INDEX "driver_savings_preferences_driverProfileId_key" ON "driver_savings_preferences"("driverProfileId");

-- CreateIndex
CREATE INDEX "transaction_ledger_driverProfileId_idx" ON "transaction_ledger"("driverProfileId");

-- CreateIndex
CREATE INDEX "transaction_ledger_tripId_idx" ON "transaction_ledger"("tripId");

-- CreateIndex
CREATE INDEX "transaction_ledger_createdAt_idx" ON "transaction_ledger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ride_preferences_userId_key" ON "ride_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "commission_ledger_driverId_idx" ON "commission_ledger"("driverId");

-- CreateIndex
CREATE INDEX "commission_ledger_createdAt_idx" ON "commission_ledger"("createdAt");

-- CreateIndex
CREATE INDEX "sacco_ledger_driverId_idx" ON "sacco_ledger"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_key" ON "organization_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_registrationNumber_key" ON "organizations"("registrationNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_driverGroupId_fkey" FOREIGN KEY ("driverGroupId") REFERENCES "driver_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_hunterId_fkey" FOREIGN KEY ("hunterId") REFERENCES "organization_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_verifications" ADD CONSTRAINT "document_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_verifications" ADD CONSTRAINT "biometric_verifications_documentVerificationId_fkey" FOREIGN KEY ("documentVerificationId") REFERENCES "document_verifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_verifications" ADD CONSTRAINT "biometric_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_media" ADD CONSTRAINT "occurrence_media_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_media" ADD CONSTRAINT "occurrence_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_objections" ADD CONSTRAINT "occurrence_objections_objector_id_fkey" FOREIGN KEY ("objector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_objections" ADD CONSTRAINT "occurrence_objections_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_objections" ADD CONSTRAINT "occurrence_objections_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_audit_log" ADD CONSTRAINT "occurrence_audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrence_audit_log" ADD CONSTRAINT "occurrence_audit_log_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_reward_mappings" ADD CONSTRAINT "badge_reward_mappings_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_reward_mappings" ADD CONSTRAINT "badge_reward_mappings_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_badge_status" ADD CONSTRAINT "driver_badge_status_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_savings_preferences" ADD CONSTRAINT "driver_savings_preferences_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_ledger" ADD CONSTRAINT "transaction_ledger_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_preferences" ADD CONSTRAINT "ride_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_config" ADD CONSTRAINT "sos_config_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_sourceDriverId_fkey" FOREIGN KEY ("sourceDriverId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sacco_ledger" ADD CONSTRAINT "sacco_ledger_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_groups" ADD CONSTRAINT "driver_groups_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "driver_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
