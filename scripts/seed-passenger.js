require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding test passenger...');

    const email = 'passenger@test.com';
    const password = 'Driver@2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      create: {
        email,
        phone: '+254711111111',
        password: hashedPassword,
        fullName: 'Test Passenger',
        role: 'PASSENGER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        isIdentityVerified: true,
      },
    });

    console.log('✅ User created/updated:', user.email);

    const passengerRole = await prisma.role.findFirst({
      where: { name: 'PASSENGER' }
    });

    if (passengerRole) {
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          roleId: passengerRole.id,
          organizationId: null
        }
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: passengerRole.id,
            isActive: true,
          }
        });
        console.log('✅ PASSENGER role assigned.');
      } else {
        console.log('ℹ️ PASSENGER role already assigned.');
      }
    } else {
      console.warn('⚠️ PASSENGER role not found in Role table.');
    }

    console.log('✨ Seed complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
