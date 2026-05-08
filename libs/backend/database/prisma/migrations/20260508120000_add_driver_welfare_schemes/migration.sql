-- CreateEnum
CREATE TYPE "WelfareSchemeType" AS ENUM ('PENSION', 'HOUSING');

-- CreateEnum
CREATE TYPE "WelfareDeductionMode" AS ENUM ('PER_TRIP', 'PER_DAY');

-- AlterTable
ALTER TABLE "transaction_ledger" ADD COLUMN     "housingDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "pensionDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phoneOtpExpires" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "welfare_schemes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WelfareSchemeType" NOT NULL,
    "deductionMode" "WelfareDeductionMode" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "minAmount" DECIMAL(10,2),
    "maxAmount" DECIMAL(10,2),
    "description" TEXT,
    "providerName" TEXT,
    "providerAccount" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welfare_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welfare_enrollments" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "customAmount" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unenrolledAt" TIMESTAMP(3),

    CONSTRAINT "welfare_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welfare_deductions" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "tripId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "welfare_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "welfare_enrollments_driverProfileId_idx" ON "welfare_enrollments"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "welfare_enrollments_driverProfileId_schemeId_key" ON "welfare_enrollments"("driverProfileId", "schemeId");

-- CreateIndex
CREATE INDEX "welfare_deductions_driverProfileId_idx" ON "welfare_deductions"("driverProfileId");

-- CreateIndex
CREATE INDEX "welfare_deductions_schemeId_idx" ON "welfare_deductions"("schemeId");

-- CreateIndex
CREATE INDEX "welfare_deductions_createdAt_idx" ON "welfare_deductions"("createdAt");

-- AddForeignKey
ALTER TABLE "welfare_enrollments" ADD CONSTRAINT "welfare_enrollments_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welfare_enrollments" ADD CONSTRAINT "welfare_enrollments_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "welfare_schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welfare_deductions" ADD CONSTRAINT "welfare_deductions_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welfare_deductions" ADD CONSTRAINT "welfare_deductions_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "welfare_schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
