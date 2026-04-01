
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupDriver() {
    try {
        const email = 'pending_driver_1769722821923@test.com';
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('Driver not found');
            return;
        }

        console.log(`Setting up DriverProfile for user ${user.id}...`);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { status: 'ACTIVE' }
            }),
            prisma.driverProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    licenseNumber: `DL-${user.id.substring(0, 8).toUpperCase()}`,
                    isOnline: true,
                    currentLocation: { lat: -1.2633, lng: 36.8021 }
                }
            })
        ]);

        const updated = await prisma.user.findUnique({
            where: { id: user.id },
            include: { driverProfile: true }
        });

        console.log('✅ Driver Setup Complete:', JSON.stringify(updated, null, 2));
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupDriver();
