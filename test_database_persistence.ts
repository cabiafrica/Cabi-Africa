import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabasePersistence() {
    console.log('='.repeat(60));
    console.log('DATABASE PERSISTENCE TEST');
    console.log('='.repeat(60));

    try {
        // Connect to database
        await prisma.$connect();
        console.log('\n✅ Database connection successful');

        // Query for recent users
        console.log('\n📊 Fetching recent driver registrations...');
        const recentUsers = await prisma.user.findMany({
            where: {
                role: 'DRIVER',
                status: {
                    in: ['PROSPECT', 'PENDING', 'ACTIVE']
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                createdAt: true
            }
        });

        console.log(`\n📝 Found ${recentUsers.length} recent driver registration(s):\n`);

        if (recentUsers.length === 0) {
            console.log('⚠️  No driver registrations found in database');
            console.log('This could mean:');
            console.log('  1. Database is not being updated (using mock storage)');
            console.log('  2. No registrations have been completed yet');
            console.log('  3. Backend is using in-memory storage for development');
        } else {
            recentUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.fullName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phone}`);
                console.log(`   Status: ${user.status}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('');
            });
        }

        // Disconnect
        await prisma.$disconnect();
        console.log('✅ Database test completed');

        return { success: true, count: recentUsers.length };
    } catch (error) {
        console.error('\n❌ Database test failed:', error);
        await prisma.$disconnect();
        return { success: false, error };
    }
}

// Run the test
checkDatabasePersistence().then(result => {
    console.log('\n' + '='.repeat(60));
    process.exit(result.success ? 0 : 1);
});
