-- ⚡ Cabi Africa — Production Database Optimizations
-- Description: Adds missing foreign key indexes for high-performance scale

BEGIN;

-- Core Business Logic Indexes
CREATE INDEX IF NOT EXISTS "idx_rides_userId" ON "rides"("userId");
CREATE INDEX IF NOT EXISTS "idx_rides_driverId" ON "rides"("driverId");
CREATE INDEX IF NOT EXISTS "idx_rides_vehicleId" ON "rides"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_rides_organizationId" ON "rides"("organizationId");

-- Authentication & Auditing Indexes
CREATE INDEX IF NOT EXISTS "idx_login_history_userId" ON "login_history"("userId");
CREATE INDEX IF NOT EXISTS "idx_occurrence_audit_log_actor_id" ON "occurrence_audit_log"("actor_id");
CREATE INDEX IF NOT EXISTS "idx_occurrence_audit_log_occurrence_id" ON "occurrence_audit_log"("occurrence_id");

-- Verification Performance
CREATE INDEX IF NOT EXISTS "idx_documents_driverProfileId" ON "documents"("driverProfileId");
CREATE INDEX IF NOT EXISTS "idx_document_verifications_userId" ON "document_verifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_biometric_verifications_userId" ON "biometric_verifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_biometric_verifications_docVerifId" ON "biometric_verifications"("documentVerificationId");

-- Ledger & Transactions (Financial Safety)
CREATE INDEX IF NOT EXISTS "idx_transaction_ledger_driverId" ON "transaction_ledger"("driverId");
CREATE INDEX IF NOT EXISTS "idx_transaction_ledger_organizationId" ON "transaction_ledger"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_commission_ledger_driverId" ON "commission_ledger"("driverId");
CREATE INDEX IF NOT EXISTS "idx_sacco_ledger_driverId" ON "sacco_ledger"("driverId");

-- Referral System
CREATE INDEX IF NOT EXISTS "idx_users_referredById" ON "users"("referredById");
CREATE INDEX IF NOT EXISTS "idx_invitations_organizationId" ON "invitations"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_invitations_driverId" ON "invitations"("driverId");

-- Occurrence Book System
CREATE INDEX IF NOT EXISTS "idx_occurrences_registered_by" ON "occurrences"("registered_by");
CREATE INDEX IF NOT EXISTS "idx_occurrences_driver_id" ON "occurrences"("driver_id");
CREATE INDEX IF NOT EXISTS "idx_occurrences_passenger_id" ON "occurrences"("passenger_id");
CREATE INDEX IF NOT EXISTS "idx_occurrence_media_occurrence_id" ON "occurrence_media"("occurrence_id");
CREATE INDEX IF NOT EXISTS "idx_occurrence_objections_occurrence_id" ON "occurrence_objections"("occurrence_id");

-- Organization & Roles
CREATE INDEX IF NOT EXISTS "idx_organization_members_organizationId" ON "organization_members"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_organization_members_userId" ON "organization_members"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_roles_roleId" ON "user_roles"("roleId");
CREATE INDEX IF NOT EXISTS "idx_user_roles_userId" ON "user_roles"("userId");

COMMIT;
