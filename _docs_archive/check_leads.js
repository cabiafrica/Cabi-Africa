
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL,
        },
    },
});

async function checkLeads() {
    try {
        console.log('Connecting to database...');

        // Find users with status PENDING or PROSPECT
        const users = await prisma.user.findMany({
            where: {
                status: { in: ['PENDING', 'PROSPECT'] }
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
        console.log('Recent Pending/Prospect Users:', users.map(u => ({ id: u.id, email: u.email, status: u.status, role: u.role })));

        const admin = await prisma.user.findFirst({
            where: { email: 'ke.africabi@gmail.com' }
        });
        console.log('Admin User Found:', admin ? admin.email : 'NOT FOUND');

        // Check for any DriverProfile
        const profiles = await prisma.driverProfile.findMany({ take: 5 });
        console.log('Driver Profiles count:', profiles.length);

    } catch (err) {
        console.error('Error executing query:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeads();
