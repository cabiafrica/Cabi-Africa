const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fix() {
    console.log('🔄 Syncing test credentials...');
    
    const users = [
        {
            email: 'passenger@test.com',
            phone: '+254711111111',
            password: 'Password123!',
            fullName: 'Test Passenger',
            role: 'PASSENGER'
        },
        {
            email: 'driver@test.com',
            phone: '+254722222222',
            password: 'Password123!',
            fullName: 'Test Driver',
            role: 'DRIVER'
        },
        {
            email: 'superadmin@cabi.africa',
            phone: '+254700999000',
            password: 'Password123!',
            fullName: 'Super Administrator',
            role: 'ADMIN'
        },
        {
            email: 'ke.africabi@gmail.com',
            phone: '+254711786722',
            password: 'Password123!',
            fullName: 'Cabi Executive Admin',
            role: 'ADMIN'
        },
        {
            email: 'dispatcher@cabi.africa',
            phone: '+254700999001',
            password: 'Password123!',
            fullName: 'Head Dispatcher',
            role: 'ADMIN'
        }
    ];

    for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.upsert({
            where: { email: u.email },
            update: { 
                password: hashed,
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true,
                isIdentityVerified: true
            },
            create: {
                email: u.email,
                phone: u.phone,
                password: hashed,
                fullName: u.fullName,
                role: u.role,
                status: 'ACTIVE',
                isEmailVerified: true,
                isPhoneVerified: true,
                isIdentityVerified: true
            }
        });
        console.log(`✅ Synced: ${u.email} -> ${u.password}`);
    }

    console.log('\n✨ All test credentials are now synced to Password123!');
    await prisma.$disconnect();
}

fix().catch(console.error);
