
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedPassenger() {
    try {
        const email = 'passenger@test.com';
        const password = 'Prospect@2026';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Creating passenger: ${email}`);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'PASSENGER',
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true
            },
            create: {
                email,
                password: hashedPassword,
                role: 'PASSENGER',
                fullName: 'Test Passenger',
                phone: '+254700000002',
                username: 'testpassenger',
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true,
                isIdentityVerified: true
            }
        });

        console.log(`✅ Passenger User Created/Updated: ${user.id}`);

        // Ensure RBAC role for passenger exists and is assigned
        let passengerRole = await prisma.role.findFirst({ where: { type: 'PASSENGER' } });

        if (!passengerRole) {
            console.log('Creating PASSENGER role...');
            passengerRole = await prisma.role.create({
                data: {
                    name: 'role_passenger',
                    displayName: 'Passenger',
                    type: 'PASSENGER',
                    platform: 'MOBILE_APP',
                    permissions: ['RIDE_REQUEST', 'RIDE_CANCEL', 'RIDE_RATE']
                }
            });
        }

        const existingUserRole = await prisma.userRole.findFirst({
            where: {
                userId: user.id,
                roleId: passengerRole.id
            }
        });

        if (!existingUserRole) {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: passengerRole.id,
                    isActive: true
                }
            });
            console.log('✅ Passenger RBAC Role Assigned');
        } else {
            console.log('ℹ️ Passenger RBAC Role already assigned');
        }

        console.log('\nLogin Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPassenger();
