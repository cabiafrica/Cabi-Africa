-- CreateTable: dispute_claims
CREATE TABLE IF NOT EXISTS "dispute_claims" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripCode" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "passengerPhone" TEXT,
    "driverId" TEXT,
    "driverPhone" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalFare" DOUBLE PRECISION NOT NULL,
    "optimalFare" DOUBLE PRECISION NOT NULL,
    "detourPercent" DOUBLE PRECISION NOT NULL,
    "claimedAmount" DOUBLE PRECISION NOT NULL,
    "awardedVoucherAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucherCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "driverAppealWindowExpiresAt" TIMESTAMP(3) NOT NULL,
    "driverAppealed" BOOLEAN NOT NULL DEFAULT false,
    "driverAppealNotes" TEXT,
    "trafficProofUrl" TEXT,
    "driverAppealSubmittedAt" TIMESTAMP(3),
    "adjudicatorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispute_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable: lost_item_incidents
CREATE TABLE IF NOT EXISTS "lost_item_incidents" (
    "id" TEXT NOT NULL,
    "obNumber" TEXT NOT NULL,
    "occurrenceId" TEXT,
    "tripId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT,
    "driverId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "itemPhotoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "returnMethod" TEXT NOT NULL DEFAULT 'DIRECT_HANDOVER',
    "handoverPin" TEXT NOT NULL,
    "handoverPhotoUrl" TEXT,
    "standardReturnFee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "voluntaryRewardEscrow" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "disbursedAmount" DOUBLE PRECISION,
    "droppedAtOffice" BOOLEAN NOT NULL DEFAULT false,
    "officeLocation" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lost_item_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: corporate_accounts
CREATE TABLE IF NOT EXISTS "corporate_accounts" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "kraPin" TEXT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 500000,
    "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "graceBufferPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "paymentTerms" TEXT NOT NULL DEFAULT 'NET_30',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: corporate_cost_centers
CREATE TABLE IF NOT EXISTS "corporate_cost_centers" (
    "id" TEXT NOT NULL,
    "corporateAccountId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyBudget" DOUBLE PRECISION NOT NULL,
    "currentSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "managerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: corporate_employees
CREATE TABLE IF NOT EXISTS "corporate_employees" (
    "id" TEXT NOT NULL,
    "corporateAccountId" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "monthlyAllowance" DOUBLE PRECISION NOT NULL DEFAULT 25000,
    "currentMonthSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiresApprovalAbove" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "allowAfterHours" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable: corporate_invoices
CREATE TABLE IF NOT EXISTS "corporate_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "corporateAccountId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "kraPin" TEXT NOT NULL,
    "billingMonth" TEXT NOT NULL,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "vatRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 16,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "costCenterBreakdown" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "paymentRef" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: dispute_claims
CREATE UNIQUE INDEX IF NOT EXISTS "dispute_claims_voucherCode_key" ON "dispute_claims"("voucherCode");
CREATE INDEX IF NOT EXISTS "dispute_claims_tripId_idx" ON "dispute_claims"("tripId");
CREATE INDEX IF NOT EXISTS "dispute_claims_passengerId_createdAt_idx" ON "dispute_claims"("passengerId", "createdAt");
CREATE INDEX IF NOT EXISTS "dispute_claims_driverId_status_idx" ON "dispute_claims"("driverId", "status");
CREATE INDEX IF NOT EXISTS "dispute_claims_status_idx" ON "dispute_claims"("status");

-- CreateIndex: lost_item_incidents
CREATE UNIQUE INDEX IF NOT EXISTS "lost_item_incidents_obNumber_key" ON "lost_item_incidents"("obNumber");
CREATE INDEX IF NOT EXISTS "lost_item_incidents_tripId_idx" ON "lost_item_incidents"("tripId");
CREATE INDEX IF NOT EXISTS "lost_item_incidents_passengerId_idx" ON "lost_item_incidents"("passengerId");
CREATE INDEX IF NOT EXISTS "lost_item_incidents_driverId_status_idx" ON "lost_item_incidents"("driverId", "status");
CREATE INDEX IF NOT EXISTS "lost_item_incidents_occurrenceId_idx" ON "lost_item_incidents"("occurrenceId");

-- CreateIndex: corporate_accounts
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_accounts_kraPin_key" ON "corporate_accounts"("kraPin");
CREATE INDEX IF NOT EXISTS "corporate_accounts_status_idx" ON "corporate_accounts"("status");

-- CreateIndex: corporate_cost_centers
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_cost_centers_corporateAccountId_code_key" ON "corporate_cost_centers"("corporateAccountId", "code");
CREATE INDEX IF NOT EXISTS "corporate_cost_centers_corporateAccountId_idx" ON "corporate_cost_centers"("corporateAccountId");
CREATE INDEX IF NOT EXISTS "corporate_cost_centers_managerUserId_idx" ON "corporate_cost_centers"("managerUserId");

-- CreateIndex: corporate_employees
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_employees_corporateAccountId_userId_key" ON "corporate_employees"("corporateAccountId", "userId");
CREATE INDEX IF NOT EXISTS "corporate_employees_userId_status_idx" ON "corporate_employees"("userId", "status");
CREATE INDEX IF NOT EXISTS "corporate_employees_costCenterId_idx" ON "corporate_employees"("costCenterId");
CREATE INDEX IF NOT EXISTS "corporate_employees_employeeId_idx" ON "corporate_employees"("employeeId");

-- CreateIndex: corporate_invoices
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_invoices_invoiceNumber_key" ON "corporate_invoices"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "corporate_invoices_corporateAccountId_billingMonth_idx" ON "corporate_invoices"("corporateAccountId", "billingMonth");
CREATE INDEX IF NOT EXISTS "corporate_invoices_status_idx" ON "corporate_invoices"("status");

-- AddForeignKey (idempotent guards)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_cost_centers_corporateAccountId_fkey') THEN
        ALTER TABLE "corporate_cost_centers"
            ADD CONSTRAINT "corporate_cost_centers_corporateAccountId_fkey"
            FOREIGN KEY ("corporateAccountId") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_employees_corporateAccountId_fkey') THEN
        ALTER TABLE "corporate_employees"
            ADD CONSTRAINT "corporate_employees_corporateAccountId_fkey"
            FOREIGN KEY ("corporateAccountId") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_employees_costCenterId_fkey') THEN
        ALTER TABLE "corporate_employees"
            ADD CONSTRAINT "corporate_employees_costCenterId_fkey"
            FOREIGN KEY ("costCenterId") REFERENCES "corporate_cost_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corporate_invoices_corporateAccountId_fkey') THEN
        ALTER TABLE "corporate_invoices"
            ADD CONSTRAINT "corporate_invoices_corporateAccountId_fkey"
            FOREIGN KEY ("corporateAccountId") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
