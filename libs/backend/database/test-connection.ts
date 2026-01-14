import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connection successful\n');

        // Test verification tables
        console.log('📋 Testing Verification Tables:');
        const docVerifications = await prisma.documentVerification.findMany({ take: 1 });
        console.log(`  ✅ DocumentVerification table accessible (${docVerifications.length} records)`);

        const bioVerifications = await prisma.biometricVerification.findMany({ take: 1 });
        console.log(`  ✅ BiometricVerification table accessible (${bioVerifications.length} records)`);

        // Test occurrence book tables
        console.log('\n📋 Testing Occurrence Book Tables:');
        const occurrences = await prisma.occurrence.findMany({ take: 1 });
        console.log(`  ✅ Occurrence table accessible (${occurrences.length} records)`);

        const occurrenceMedia = await prisma.occurrenceMedia.findMany({ take: 1 });
        console.log(`  ✅ OccurrenceMedia table accessible (${occurrenceMedia.length} records)`);

        const occurrenceObjections = await prisma.occurrenceObjection.findMany({ take: 1 });
        console.log(`  ✅ OccurrenceObjection table accessible (${occurrenceObjections.length} records)`);

        const occurrenceAuditLog = await prisma.occurrenceAuditLog.findMany({ take: 1 });
        console.log(`  ✅ OccurrenceAuditLog table accessible (${occurrenceAuditLog.length} records)`);

        // Test existing tables still work
        console.log('\n📋 Testing Existing Tables:');
        const users = await prisma.user.findMany({ take: 1 });
        console.log(`  ✅ User table accessible (${users.length} records)`);

        const drivers = await prisma.driverProfile.findMany({ take: 1 });
        console.log(`  ✅ DriverProfile table accessible (${drivers.length} records)`);

        console.log('\n🎉 All database tables are accessible!');
        console.log('✅ Prisma client is working correctly with the new schema');

    } catch (error) {
        console.error('❌ Database connection test failed:');
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
