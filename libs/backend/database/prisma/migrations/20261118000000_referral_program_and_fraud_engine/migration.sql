-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING_REVIEW', 'AVAILABLE', 'DISQUALIFIED', 'CANCELLED', 'FROZEN_FRAUD');

-- CreateEnum
CREATE TYPE "ReferralType" AS ENUM ('DRIVER_TO_DRIVER', 'PASSENGER_TO_PASSENGER', 'PASSENGER_TO_DRIVER');

-- CreateEnum
CREATE TYPE "FraudRule" AS ENUM ('DEVICE_FINGERPRINT_MATCH', 'COLLUSIVE_TRIP_DENSITY', 'CYCLIC_REFERRAL', 'MULTI_ACCOUNT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deviceId" TEXT;
ALTER TABLE "users" ADD COLUMN "imeiHash" TEXT;
ALTER TABLE "users" ADD COLUMN "registrationIp" TEXT;

-- CreateTable
CREATE TABLE "referral_relationships" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "referrerDriverProfileId" TEXT,
    "refereeDriverProfileId" TEXT,
    "type" "ReferralType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isGrandfathered" BOOLEAN NOT NULL DEFAULT false,
    "qualifiedBadgeId" TEXT,
    "firstWeekExpiresAt" TIMESTAMP(3),
    "driverMilestoneTripsRequired" INTEGER NOT NULL DEFAULT 10,
    "driverMilestoneTripsCompleted" INTEGER NOT NULL DEFAULT 0,
    "isMilestoneAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_commission_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverProfileId" TEXT,
    "sourceUserId" TEXT NOT NULL,
    "sourceDriverProfileId" TEXT,
    "relatedTripId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "basisAmount" DECIMAL(10,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "escrowReleaseAt" TIMESTAMP(3) NOT NULL,
    "disqualificationReason" TEXT,
    "isFraudSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_commission_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_fraud_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relatedUserId" TEXT,
    "ruleViolated" "FraudRule" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "evidence" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_fraud_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_relationships_refereeId_key" ON "referral_relationships"("refereeId");
CREATE INDEX "referral_relationships_referrerId_idx" ON "referral_relationships"("referrerId");
CREATE INDEX "referral_relationships_refereeId_idx" ON "referral_relationships"("refereeId");
CREATE INDEX "referral_relationships_type_idx" ON "referral_relationships"("type");

-- CreateIndex
CREATE INDEX "referral_commission_ledger_userId_idx" ON "referral_commission_ledger"("userId");
CREATE INDEX "referral_commission_ledger_driverProfileId_idx" ON "referral_commission_ledger"("driverProfileId");
CREATE INDEX "referral_commission_ledger_sourceUserId_idx" ON "referral_commission_ledger"("sourceUserId");
CREATE INDEX "referral_commission_ledger_status_idx" ON "referral_commission_ledger"("status");
CREATE INDEX "referral_commission_ledger_escrowReleaseAt_idx" ON "referral_commission_ledger"("escrowReleaseAt");
CREATE INDEX "referral_commission_ledger_relatedTripId_idx" ON "referral_commission_ledger"("relatedTripId");

-- CreateIndex
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs"("userId");
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "referral_fraud_alerts_userId_idx" ON "referral_fraud_alerts"("userId");
CREATE INDEX "referral_fraud_alerts_relatedUserId_idx" ON "referral_fraud_alerts"("relatedUserId");
CREATE INDEX "referral_fraud_alerts_isResolved_idx" ON "referral_fraud_alerts"("isResolved");

-- AddForeignKey
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_commission_ledger" ADD CONSTRAINT "referral_commission_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referral_commission_ledger" ADD CONSTRAINT "referral_commission_ledger_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "referral_commission_ledger" ADD CONSTRAINT "referral_commission_ledger_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referral_commission_ledger" ADD CONSTRAINT "referral_commission_ledger_sourceDriverProfileId_fkey" FOREIGN KEY ("sourceDriverProfileId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_fraud_alerts" ADD CONSTRAINT "referral_fraud_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referral_fraud_alerts" ADD CONSTRAINT "referral_fraud_alerts_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
