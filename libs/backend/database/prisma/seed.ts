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
      await prisma.userRole.upsert({
        where: {
          userId_roleId_organizationId: {
            userId: superAdmin.id,
            roleId: role.id,
            organizationId: null as any, 
          }
        },
        update: {},
        create: {
          userId: superAdmin.id,
          roleId: role.id,
          isActive: true,
        }
      });
    }
  }
  console.log('✅ Created System Roles and assigned Super Admin.');

  // 3. Create Settings
  await prisma.setting.upsert({
    where: { key: 'PLATFORM_NAME' },
    update: {},
    create: {
      key: 'PLATFORM_NAME',
      value: { name: 'Cabi Africa' }
    }
  });

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
