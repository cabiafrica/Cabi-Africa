
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDriver() {
    const email = 'driver@test.com';
    const password = 'Password@2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'DRIVER',
                fullName: 'Test Driver',
            },
            create: {
                email,
                password: hashedPassword,
                fullName: 'Test Driver',
                role: 'DRIVER',
                phone: '+254700000000',
                status: 'ACTIVE',
            },
        });

        console.log('User created/updated:', user.email);

        const driverProfile = await prisma.driverProfile.upsert({
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

        console.log('Driver profile created/updated for:', user.email);
    } catch (error) {
        console.error('Error creating driver:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDriver();
