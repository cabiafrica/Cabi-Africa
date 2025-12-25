# 9. Database Schema

**Rationale:**
This section translates the conceptual `Data Models` into concrete database schemas using Prisma SDL.

Here are the Prisma schema definitions for the `User`, `DriverProfile`, `DriverGroup`, and new MLM-related models:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ApplicationStatus {
  PROSPECT
  PENDING_DOCUMENTS
  PENDING_APPROVAL
  ACTIVE
  REJECTED
  INACTIVE
}

enum MlmRecipient {
  SPONSOR
  UPLINE
  COMPANY
}

enum MlmRuleType {
  FIXED
  PERCENTAGE
}

model User {
  id            String                  @id @default(uuid())
  email         String                  @unique
  passwordHash  String?
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt

  driverProfile DriverProfile?
  
  sponsored     DriverProfile[]         @relation("Referrals") // Drivers referred by this user
  
  // Ledger entries where this user is the new driver or the recipient of a fee
  newDriverLedgers RegistrationFeeLedger[] @relation("NewDriverEntries")
  recipientLedgers RegistrationFeeLedger[] @relation("RecipientEntries")
  
  @@map("users")
}

model DriverProfile {
  id                String            @id @default(uuid())
  userId            String            @unique
  firstName         String
  lastName          String
  phone             String
  city              String
  applicationStatus ApplicationStatus @default(PROSPECT)
  referralCode      String?           @unique
  referrerId        String?           // ID of the user who is the referrer
  groupId           String?           // ID of the driver's group
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrer   User?        @relation("Referrals", fields: [referrerId], references: [id], onUpdate: NoAction, onDelete: NoAction)
  group      DriverGroup? @relation(fields: [groupId], references: [id])
  
  @@map("driver_profiles")
}

model DriverGroup {
  id          String  @id @default(uuid())
  name        String
  description String?
  
  parentId    String?
  parent      DriverGroup?  @relation("Subgroups", fields: [parentId], references: [id], onUpdate: NoAction, onDelete: NoAction)
  subgroups   DriverGroup[] @relation("Subgroups")

  drivers     DriverProfile[]

  @@map("driver_groups")
}

model MlmFeeFormula {
  id          Int          @id @default(autoincrement())
  recipient   MlmRecipient
  value       Float
  ruleType    MlmRuleType  @map("rule_type")
  uplineLevel Int?         // e.g., 1 for direct sponsor, 2 for sponsor's sponsor (null for company)
  description String?
  createdAt   DateTime     @default(now())

  @@map("mlm_fee_formulas")
}

model RegistrationFeeLedger {
  id                String   @id @default(uuid())
  newDriverId       String   // The ID of the newly registered driver
  recipientId       String   // The ID of the user receiving the fee portion
  amount            Float
  registrationFee   Float    // Total registration fee before distribution
  processedAt       DateTime @default(now())

  newDriver User @relation("NewDriverEntries", fields: [newDriverId], references: [id], onUpdate: NoAction, onDelete: NoAction)
  recipient User @relation("RecipientEntries", fields: [recipientId], references: [id], onUpdate: NoAction, onDelete: NoAction)

  @@map("registration_fee_ledgers")
}
```
