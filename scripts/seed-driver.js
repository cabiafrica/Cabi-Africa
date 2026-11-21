require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding test driver...');

    const email = 'driver@test.com';
    const password = 'Password@2026';
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
        phone: '+254700000000',
        password: hashedPassword,
        fullName: 'Test Driver',
        role: 'DRIVER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        isIdentityVerified: true,
      },
    });

    console.log('✅ User created/updated:', user.email);

    // Create driver profile
    await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {
        isOnline: true,
      },
      create: {
        userId: user.id,
        licenseNumber: 'DL-TEST-123',
        isOnline: true,
        currentLocation: { lat: -1.2633, lng: 36.8021 },
      },
    });
    console.log('✅ Driver profile created/updated.');

    console.log('✨ Seed complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
