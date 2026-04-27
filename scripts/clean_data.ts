
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting Data Cleanup...');

    try {
        console.log('1. Cleaning Content & Configs...');
        await prisma.blogPost.deleteMany({});
        await prisma.sosConfig.deleteMany({});
        await prisma.setting.deleteMany({});
        await prisma.passengerVerificationConfig.deleteMany({});
        console.log('✅ Content & Configs cleaned.');

        console.log('2. Cleaning Financial Data...');
        await prisma.commissionLedger.deleteMany({});
        await prisma.saccoLedger.deleteMany({});
        await prisma.transactionLedger.deleteMany({});
        console.log('✅ Financial Data cleaned.');

        console.log('3. Cleaning Badges & Rewards...');
        await prisma.badgeRewardMapping.deleteMany({});
        await prisma.reward.deleteMany({});
        await prisma.userBadge.deleteMany({});
        await prisma.driverBadgeStatus.deleteMany({});
        await prisma.badge.deleteMany({});
        console.log('✅ Badges & Rewards cleaned.');

        console.log('4. Cleaning Occurrence System...');
        await prisma.occurrenceAuditLog.deleteMany({});
        await prisma.occurrenceObjection.deleteMany({});
        await prisma.occurrenceMedia.deleteMany({});
        await prisma.occurrence.deleteMany({});
        console.log('✅ Occurrence System cleaned.');

        console.log('5. Cleaning Rides and Bookings...');
        await prisma.ride.deleteMany({});
        console.log('✅ Rides cleaned.');

        console.log('6. Cleaning Verifications & Preferences...');
        await prisma.biometricVerification.deleteMany({});
        await prisma.documentVerification.deleteMany({});
        await prisma.ridePreference.deleteMany({});
        await prisma.loginHistory.deleteMany({});
        console.log('✅ Verifications & Preferences cleaned.');

        console.log('7. Cleaning Driver & Vehicle Data...');
        await prisma.invitation.deleteMany({});
        await prisma.vehicle.deleteMany({});
        await prisma.document.deleteMany({});
        await prisma.driverSavingsPreference.deleteMany({});
        await prisma.driverProfile.deleteMany({});
        await prisma.driver_groups.deleteMany({});
        console.log('✅ Driver & Vehicle Data cleaned.');

        console.log('8. Cleaning Organizations...');
        await prisma.organization_members.deleteMany({});
        await prisma.organizations.updateMany({
            data: { parentId: null }
        });
        await prisma.organizations.deleteMany({});
        console.log('✅ Organizations cleaned.');

        console.log('9. Cleaning User Roles & Permissions...');
        await prisma.userRole.deleteMany({});
        await prisma.userPermission.deleteMany({});
        await prisma.role.deleteMany({});
        console.log('✅ User Roles & Permissions cleaned.');

        console.log('10. Cleaning Users...');
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
