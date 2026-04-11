
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting Data Cleanup...');

    try {
        console.log('1. Cleaning Occurrence System...');
        // Cascade deletions should handle related tables for Occurrence
        // but let's be safe for some.
        await prisma.occurrenceAuditLog.deleteMany({});
        await prisma.occurrenceObjection.deleteMany({});
        await prisma.occurrenceMedia.deleteMany({});
        await prisma.occurrence.deleteMany({});
        console.log('✅ Occurrence System cleaned.');

        console.log('2. Cleaning Rides and Bookings...');
        await prisma.ride.deleteMany({});
        console.log('✅ Rides cleaned.');

        console.log('3. Cleaning Verifications...');
        await prisma.biometricVerification.deleteMany({});
        await prisma.documentVerification.deleteMany({});
        console.log('✅ Verifications cleaned.');

        console.log('4. Cleaning Driver & Vehicle Data...');
        await prisma.invitation.deleteMany({});
        await prisma.vehicle.deleteMany({});
        await prisma.document.deleteMany({});
        await prisma.driverProfile.deleteMany({});
        console.log('✅ Driver & Vehicle Data cleaned.');

        console.log('5. Cleaning Organizations...');
        // Correcting model names based on Prisma schema hints
        await prisma.organization_members.deleteMany({});
        await prisma.organizations.updateMany({
            data: { parentId: null }
        });
        await prisma.organizations.deleteMany({});
        console.log('✅ Organizations cleaned.');

        console.log('6. Cleaning User Permissions & Roles...');
        await prisma.userPermission.deleteMany({});
        await prisma.userRole.deleteMany({});
        console.log('✅ User Permissions & Roles cleaned.');

        console.log('7. Cleaning Users...');
        await prisma.user.deleteMany({});
        console.log('✅ All Users deleted.');

        console.log('🎉 Data cleanup completed successfully! All example data removed.');
        console.log('ℹ️  Run "npx ts-node scripts/recreate-super-admin.js" to restore access.');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
