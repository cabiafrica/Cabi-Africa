
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedDriver() {
    try {
        const email = 'driver@test.com';
        const password = 'Prospect@2026';

        console.log(`Creating driver: ${email}`);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'DRIVER',
                status: 'ACTIVE'
            },
            create: {
                email,
                password: hashedPassword,
                role: 'DRIVER',
                fullName: 'Test Driver',
                phone: '+254700000001',
                username: 'testdriver',
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true,
                isIdentityVerified: true
            }
        });

        console.log(`User created/updated with ID: ${user.id}`);

        const profile = await prisma.driverProfile.upsert({
            where: { userId: user.id },
            update: {
                isOnline: true
            },
            create: {
                userId: user.id,
                licenseNumber: 'DL-TEST-001',
                isOnline: true,
                currentLocation: { lat: -1.2633, lng: 36.8021 }
            }
        });

        console.log('✅ Driver Profile Created:', profile.id);

        // Ensure RBAC role for driver exists and is assigned
        let driverRole = await prisma.role.findFirst({ where: { type: 'DRIVER' } });
        if (!driverRole) {
            driverRole = await prisma.role.create({
                data: {
                    name: 'role_driver',
                    displayName: 'Driver',
                    type: 'DRIVER',
                    platform: 'MOBILE_APP',
                    permissions: ['RIDE_ACCEPT', 'RIDE_START', 'RIDE_COMPLETE']
                }
            });
        }

        const existingUserRole = await prisma.userRole.findFirst({
            where: {
                userId: user.id,
                roleId: driverRole.id,
                organizationId: null
            }
        });

        if (!existingUserRole) {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: driverRole.id,
                    organizationId: null,
                    isActive: true
                }
            });
        } else {
            await prisma.userRole.update({
                where: { id: existingUserRole.id },
                data: { isActive: true }
            });
        }

        console.log('✅ Driver RBAC Role Assigned');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDriver();
