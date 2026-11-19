import { PrismaClient, LegacyRole, RoleType, Platform, WealthProgramCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Super Admin User
  const hashedPassword = await bcrypt.hash('Cabi2026!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@cabi.africa' },
    update: {},
    create: {
      email: 'superadmin@cabi.africa',
      phone: '+254700000000',
      password: hashedPassword,
      fullName: 'Cabi Super Admin',
      role: LegacyRole.ADMIN,
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // 1b. Create Guest User for unauthenticated bookings
  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@cabi.africa' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'guest@cabi.africa',
      phone: '+0000000000',
      password: hashedPassword, // Not intended for login
      fullName: 'Guest User',
      role: LegacyRole.PASSENGER,
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Created Guest User:', guestUser.email);

  // 2. Create Core System Roles
  const roles = [
    {
      name: 'Super Admin',
      displayName: 'Platform Super Administrator',
      type: RoleType.SUPER_ADMIN,
      platform: Platform.ALL,
      isSystem: true,
    },
    {
      name: 'Sacco Manager',
      displayName: 'Sacco Operations Manager',
      type: RoleType.OPERATIONS_MANAGER,
      platform: Platform.ADMIN_PANEL,
      isSystem: true,
    },
    {
      name: 'Dispatcher',
      displayName: 'Ride Dispatcher',
      type: RoleType.DISPATCHER,
      platform: Platform.DISPATCH_PANEL,
      isSystem: true,
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        ...roleData,
        updatedAt: new Date(),
      },
    });
    
    // Assign Super Admin role to our user
    if (role.name === 'Super Admin') {
      // Create a global dummy organization if needed, or null
      // In the schema, organizationId is optional but part of unique constraint
      const existingUserRole = await prisma.userRole.findFirst({
        where: { userId: superAdmin.id, roleId: role.id }
      });
      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userId: superAdmin.id,
            roleId: role.id,
            isActive: true,
          }
        });
      }
    }
  }
  console.log('✅ Created System Roles and assigned Super Admin.');

  // 4. Create Test Passenger
  const passengerPassword = await bcrypt.hash('Password123!', 10);
  const testPassenger = await prisma.user.upsert({
    where: { email: 'passenger@test.com' },
    update: {
      password: passengerPassword,
      phone: '+254711111111',
      role: LegacyRole.PASSENGER,
    },
    create: {
      email: 'passenger@test.com',
      phone: '+254711111111',
      password: passengerPassword,
      fullName: 'Test Passenger',
      role: LegacyRole.PASSENGER,
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
    },
  });
  console.log('✅ Created Test Passenger:', testPassenger.email);

  // 5. Create Test Driver
  const driverPassword = await bcrypt.hash('Password123!', 10);
  const testDriver = await prisma.user.upsert({
    where: { email: 'driver@test.com' },
    update: {
      password: driverPassword,
      phone: '+254722222222',
      role: LegacyRole.DRIVER,
    },
    create: {
      email: 'driver@test.com',
      phone: '+254722222222',
      password: driverPassword,
      fullName: 'Test Driver',
      role: LegacyRole.DRIVER,
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      driverProfile: {
        create: {
          licenseNumber: 'DL-TEST-12345',
          isOnline: false,
        },
      },
    },
  });
  console.log('✅ Created Test Driver:', testDriver.email);

  // 6. Seed Canonical Cabi Legacy Programs
  const legacyPrograms = [
    {
      code: 'sacco-capital-stima',
      name: 'Stima DT / Boda PSV Sacco',
      description: 'Cooperative shares earning 11.2% annual dividend. 2% deducted automatically per trip + 3% Cabi match for 6 months (5% total). Mandatory 6-month minimum lock-in. After 6 months, maintain an active Star/Elite badge to keep bonus matching active.',
      category: WealthProgramCategory.SACCO,
      providerName: 'Stima DT Sacco Society Ltd',
      minPct: 0.02,
      maxPct: 0.20,
      defaultPct: 0.02,
      platformBonusPct: 0.03,
      dividendOrYield: '2% Driver + 3% Cabi Match (6 Mo Lock-in)',
      isDriverSelectable: true,
      isActive: true,
    },
    {
      code: 'pension-mandatory-nssf',
      name: 'Mandatory Driver Pension & Retirement Scheme',
      description: 'Statutory Ksh 10 per trip is compulsory on all rides. Configure voluntary percentage top-ups here to compound your retirement nest egg.',
      category: WealthProgramCategory.PENSION,
      providerName: 'Octagon / NSSF Tier 2 Retirement Scheme',
      minPct: 0.0,
      maxPct: 0.15,
      defaultPct: 0.0,
      platformBonusPct: 0.0,
      dividendOrYield: 'Compulsory Ksh 10/Trip + Voluntary %',
      isDriverSelectable: true,
      isActive: true,
    },
    {
      code: 'insurance-cic-medical',
      name: 'CIC / Jubilee PSV & Family Health',
      description: 'Comprehensive outpatient & inpatient medical underwriting covering driver, spouse, and family.',
      category: WealthProgramCategory.INSURANCE_HEALTH,
      providerName: 'CIC General Insurance',
      minPct: 0.02,
      maxPct: 0.10,
      defaultPct: 0.05,
      platformBonusPct: 0.0,
      dividendOrYield: 'KES 500,000 Medical & Accident Cover',
      isDriverSelectable: true,
      isActive: true,
    },
    {
      code: 'mmf-britam-yield',
      name: 'Britam High-Yield Money Market Fund',
      description: 'Liquid wealth preservation with daily compound yields and instant emergency withdrawal.',
      category: WealthProgramCategory.INVESTMENT_MMF,
      providerName: 'Britam Asset Managers (Kenya) Ltd',
      minPct: 0.02,
      maxPct: 0.15,
      defaultPct: 0.05,
      platformBonusPct: 0.0,
      dividendOrYield: '13.5% Daily Compound Yield',
      isDriverSelectable: true,
      isActive: true,
    },
    {
      code: 'asset-equity-vehicle',
      name: 'Driver Vehicle Ownership & Asset Financing Equity',
      description: 'Build verified equity from every trip to transition from rental fleet operator to outright owner in 18-36 months.',
      category: WealthProgramCategory.ASSET_FINANCING,
      providerName: 'Cabi Mobility Asset Pool',
      minPct: 0.05,
      maxPct: 0.20,
      defaultPct: 0.10,
      platformBonusPct: 0.0,
      dividendOrYield: '18-36 Mo Vehicle Ownership Transition',
      isDriverSelectable: true,
      isActive: true,
    },
  ];

  for (const prog of legacyPrograms) {
    await prisma.wealthProgram.upsert({
      where: { code: prog.code },
      update: {
        name: prog.name,
        description: prog.description,
        minPct: prog.minPct,
        maxPct: prog.maxPct,
        defaultPct: prog.defaultPct,
        platformBonusPct: prog.platformBonusPct,
        dividendOrYield: prog.dividendOrYield,
      },
      create: prog,
    });
  }
  console.log('✅ Seeded Canonical Cabi Legacy Programs.');

  // 7. Seed System Settings for Passenger Legacy Impact
  await prisma.setting.upsert({
    where: { key: 'PASSENGER_LEGACY_IMPACT_MESSAGE' },
    update: {},
    create: {
      key: 'PASSENGER_LEGACY_IMPACT_MESSAGE',
      value: '🌱 Cabi Legacy Impact: Your trip helped fund this driver\'s Sacco savings and vehicle equity through our ethical reusable commission.',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'PASSENGER_LEGACY_IMPACT_ENABLED' },
    update: {},
    create: {
      key: 'PASSENGER_LEGACY_IMPACT_ENABLED',
      value: 'true',
    },
  });
  console.log('✅ Seeded Passenger Legacy Impact System Settings.');

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
