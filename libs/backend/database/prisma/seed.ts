import { PrismaClient, LegacyRole, RoleType, Platform } from '@prisma/client';
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
