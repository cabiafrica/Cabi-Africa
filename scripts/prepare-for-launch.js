const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function prepareForLaunch() {
    try {
        console.log('🚀 PREPARING PROJECT FOR LAUNCH');
        console.log('='.repeat(100));
        console.log('This script will:');
        console.log('1. Remove all test/demo data');
        console.log('2. Clean all user accounts except Super Admin');
        console.log('3. Reset all rides, bookings, and occurrences');
        console.log('4. Preserve RBAC roles and permissions');
        console.log('5. Recreate Super Admin with fresh credentials');
        console.log('='.repeat(100));
        console.log('\n');

        // Step 1: List current users before cleanup
        console.log('📊 Step 1: Checking current database state...');
        const currentUsers = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
        console.log(`   Found ${currentUsers.length} users in database`);
        currentUsers.forEach(user => {
            const roles = user.userRoles.map(ur => ur.role.displayName).join(', ');
            console.log(`   - ${user.email} (${user.role}) ${roles ? `[${roles}]` : ''}`);
        });
        console.log('');

        // Step 2: Clean Occurrence System
        console.log('🧹 Step 2: Cleaning Occurrence System...');
        const occurrenceAuditCount = await prisma.occurrenceAuditLog.deleteMany({});
        const occurrenceObjectionCount = await prisma.occurrenceObjection.deleteMany({});
        const occurrenceMediaCount = await prisma.occurrenceMedia.deleteMany({});
        const occurrenceCount = await prisma.occurrence.deleteMany({});
        console.log(`   ✓ Deleted ${occurrenceCount.count} occurrences`);
        console.log(`   ✓ Deleted ${occurrenceObjectionCount.count} objections`);
        console.log(`   ✓ Deleted ${occurrenceMediaCount.count} media files`);
        console.log(`   ✓ Deleted ${occurrenceAuditCount.count} audit logs`);
        console.log('');

        // Step 3: Clean Rides and Bookings
        console.log('🧹 Step 3: Cleaning Rides and Bookings...');
        const rideCount = await prisma.ride.deleteMany({});
        console.log(`   ✓ Deleted ${rideCount.count} rides`);
        console.log('');

        // Step 4: Clean Verifications
        console.log('🧹 Step 4: Cleaning Verification Records...');
        const biometricCount = await prisma.biometricVerification.deleteMany({});
        const documentCount = await prisma.documentVerification.deleteMany({});
        console.log(`   ✓ Deleted ${biometricCount.count} biometric verifications`);
        console.log(`   ✓ Deleted ${documentCount.count} document verifications`);
        console.log('');

        // Step 5: Clean Driver & Vehicle Data
        console.log('🧹 Step 5: Cleaning Driver & Vehicle Data...');
        await prisma.driverWealthEnrollment?.deleteMany({}).catch(() => {});
        await prisma.welfareDeduction?.deleteMany({}).catch(() => {});
        await prisma.welfareEnrollment?.deleteMany({}).catch(() => {});
        await prisma.commissionLedger?.deleteMany({}).catch(() => {});
        await prisma.saccoLedger?.deleteMany({}).catch(() => {});
        await prisma.transactionLedger?.deleteMany({}).catch(() => {});
        await prisma.userBadge?.deleteMany({}).catch(() => {});
        await prisma.vehicleShift?.deleteMany({}).catch(() => {});
        await prisma.vehicleDriver?.deleteMany({}).catch(() => {});
        await prisma.vehicleBenefitClaim?.deleteMany({}).catch(() => {});
        await prisma.driverFinancialConsent?.deleteMany({}).catch(() => {});
        const invitationCount = await prisma.invitation.deleteMany({});
        const vehicleCount = await prisma.vehicle.deleteMany({});
        const documentFileCount = await prisma.document.deleteMany({});
        const driverProfileCount = await prisma.driverProfile.deleteMany({});
        console.log(`   ✓ Deleted ${driverProfileCount.count} driver profiles`);
        console.log(`   ✓ Deleted ${vehicleCount.count} vehicles`);
        console.log(`   ✓ Deleted ${documentFileCount.count} documents`);
        console.log(`   ✓ Deleted ${invitationCount.count} invitations`);
        console.log('');

        // Step 6: Clean Organizations
        console.log('🧹 Step 6: Cleaning Organizations...');
        const orgMemberModel = prisma.organization_members || prisma.organizationMember;
        const orgModel = prisma.organizations || prisma.organization;

        if (orgMemberModel) {
            await orgMemberModel.deleteMany({}).catch(() => {});
        }
        if (orgModel) {
            await orgModel.updateMany({
                data: { parentId: null }
            }).catch(() => {});
            await orgModel.deleteMany({}).catch(() => {});
        }
        console.log(`   ✓ Cleaned organizations and memberships`);
        console.log('');

        // Step 7: Clean User Permissions & Roles (except Super Admin)
        console.log('🧹 Step 7: Cleaning User Permissions & Roles...');
        const userPermissionCount = await prisma.userPermission.deleteMany({});
        const userRoleCount = await prisma.userRole.deleteMany({});
        console.log(`   ✓ Deleted ${userRoleCount.count} user role assignments`);
        console.log(`   ✓ Deleted ${userPermissionCount.count} user permissions`);
        console.log('');

        // Step 8: Delete all users
        console.log('🧹 Step 8: Removing all users...');
        const deletedUserCount = await prisma.user.deleteMany({});
        console.log(`   ✓ Deleted ${deletedUserCount.count} users`);
        console.log('');

        // Step 9: Recreate Super Admin
        console.log('👤 Step 9: Creating Super Admin user...');

        const superAdminPassword = process.argv[2] || 'Admin@2026';
        console.log(`   Using password: ${superAdminPassword.replace(/./g, '*')}`);

        const superAdminData = {
            fullName: 'Cabi Super Administrator',
            email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@cabi.africa',
            phone: process.env.SUPER_ADMIN_PHONE || '+254711786722',
            username: 'superadmin',
            password: await bcrypt.hash(superAdminPassword, 10),
            role: 'ADMIN',
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdentityVerified: true
        };

        const superAdmin = await prisma.user.create({
            data: superAdminData
        });

        console.log(`   ✓ Super Admin created with ID: ${superAdmin.id}`);
        console.log('');

        // Step 10: Assign Super Admin Role
        console.log('🔐 Step 10: Assigning Super Admin RBAC role...');

        let superAdminRole = await prisma.role.findFirst({
            where: {
                type: 'SUPER_ADMIN'
            }
        });

        if (!superAdminRole) {
            console.log('   Creating Super Admin role...');
            superAdminRole = await prisma.role.create({
                data: {
                    name: 'super_admin',
                    displayName: 'Super Administrator',
                    description: 'Full system access with all permissions across all platforms',
                    type: 'SUPER_ADMIN',
                    platform: 'ALL',
                    isSystem: true,
                    isActive: true,
                    permissions: [
                        // Site Management
                        'SITE_SETUP_VIEW', 'SITE_SETUP_EDIT',
                        'FEATURES_INTEGRATIONS_VIEW', 'FEATURES_INTEGRATIONS_EDIT',
                        'ORG_STRUCTURE_VIEW', 'ORG_STRUCTURE_EDIT',

                        // User Management
                        'GROUPS_ROLES_VIEW', 'GROUPS_ROLES_EDIT',
                        'LOCATIONS_VIEW', 'LOCATIONS_EDIT',
                        'PEOPLE_VIEW', 'PEOPLE_EDIT', 'PEOPLE_CREATE', 'PEOPLE_DELETE',
                        'INVITATIONS_VIEW', 'INVITATIONS_SEND',

                        // Content Management
                        'SKILLS_VIEW', 'SKILLS_EDIT',
                        'METRICS_VIEW', 'METRICS_EDIT',
                        'PATHWAYS_VIEW', 'PATHWAYS_EDIT',
                        'LEARNING_BOARDS_VIEW', 'LEARNING_BOARDS_EDIT',
                        'LIBRARY_CONTENT_VIEW', 'LIBRARY_CONTENT_EDIT', 'LIBRARY_CONTENT_PUBLISH',

                        // Assessment
                        'ASSESSMENT_DEFINITIONS_VIEW', 'ASSESSMENT_DEFINITIONS_EDIT',
                        'THIRD_PARTY_PACKAGES_VIEW', 'THIRD_PARTY_PACKAGES_MANAGE',

                        // Training
                        'GROUP_TRAINING_VIEW', 'GROUP_TRAINING_EDIT',
                        'PUBLISHED_CONTENT_VIEW', 'PUBLISHED_CONTENT_MANAGE',
                        'AUTOMATION_TRIGGERS_VIEW', 'AUTOMATION_TRIGGERS_EDIT',

                        // Dashboard & Notifications
                        'NOTIFICATIONS_VIEW', 'NOTIFICATIONS_MANAGE',
                        'DASHBOARD_PERSONALIZE',
                        'TASK_VIEW_ACCESS', 'LEARNING_VIEW_ACCESS',

                        // Operations & Reporting
                        'REPORT_BUILDER_ACCESS',
                        'PATHWAY_ACTIVITY_VIEW',
                        'ASSESSMENT_RESULTS_VIEW',
                        'SKILLS_COMPETENCIES_VIEW',
                        'AUDIT_ACTIVITY_VIEW',
                        'REPORT_PUBLISHING_ACCESS',

                        // Ride Operations
                        'DISPATCH_DASHBOARD_VIEW', 'DISPATCH_RIDE_ASSIGN',
                        'DISPATCH_RIDE_MONITOR', 'DISPATCH_DRIVER_MANAGE',
                        'DISPATCH_REAL_TIME_MAP', 'DISPATCH_ANALYTICS_VIEW',

                        // Driver Management
                        'DRIVER_APPLICATIONS_VIEW', 'DRIVER_APPLICATIONS_APPROVE', 'DRIVER_APPLICATIONS_REJECT',
                        'DRIVER_DOCUMENTS_VIEW', 'DRIVER_DOCUMENTS_VERIFY',
                        'DRIVER_PROFILE_EDIT', 'DRIVER_SUSPEND', 'DRIVER_ACTIVATE',

                        // Passenger Management
                        'PASSENGER_PROFILES_VIEW', 'PASSENGER_PROFILES_EDIT',
                        'PASSENGER_SUSPEND', 'PASSENGER_ACTIVATE',

                        // Vehicle Management
                        'VEHICLES_VIEW', 'VEHICLES_EDIT', 'VEHICLES_APPROVE', 'VEHICLES_SUSPEND',

                        // Occurrence Book
                        'OCCURRENCE_VIEW', 'OCCURRENCE_CREATE', 'OCCURRENCE_EDIT',
                        'OCCURRENCE_RESOLVE', 'OCCURRENCE_OBJECTION_REVIEW',

                        // Financial
                        'PAYMENTS_VIEW', 'PAYMENTS_PROCESS',
                        'FARE_MANAGEMENT_VIEW', 'FARE_MANAGEMENT_EDIT',
                        'COMMISSION_VIEW', 'COMMISSION_EDIT',
                        'FINANCIAL_REPORTS_VIEW',

                        // Verification
                        'VERIFICATION_DOCUMENTS_VIEW', 'VERIFICATION_DOCUMENTS_APPROVE',
                        'VERIFICATION_BIOMETRIC_VIEW', 'VERIFICATION_BIOMETRIC_APPROVE',

                        // Organization & Referral Program
                        'ORGANIZATION_VIEW', 'ORGANIZATION_EDIT', 'ORGANIZATION_APPROVE',
                        'REFERRAL_FORMULA_VIEW', 'REFERRAL_FORMULA_EDIT',
                        'REFERRAL_TRACKING_VIEW',

                        // Marketing
                        'MARKETING_CONTENT_VIEW', 'MARKETING_CONTENT_EDIT',
                        'MARKETING_ANALYTICS_VIEW',
                        'BLOG_POSTS_VIEW', 'BLOG_POSTS_EDIT',

                        // System Administration
                        'SYSTEM_SETTINGS_VIEW', 'SYSTEM_SETTINGS_EDIT',
                        'USER_ROLES_ASSIGN',
                        'AUDIT_LOGS_VIEW',
                        'SYSTEM_HEALTH_MONITOR'
                    ]
                }
            });
        }

        await prisma.userRole.create({
            data: {
                userId: superAdmin.id,
                roleId: superAdminRole.id,
                isActive: true
            }
        });

        console.log(`   ✓ Super Admin role assigned`);
        console.log(`   ✓ ${superAdminRole.permissions.length} permissions granted`);
        console.log('');

        // Step 11: Verify final state
        console.log('✅ Step 11: Verifying final state...');
        const finalUserCount = await prisma.user.count();
        const finalRoleCount = await prisma.role.count();
        const finalRideCount = await prisma.ride.count();
        const finalOccurrenceCount = await prisma.occurrence.count();

        console.log(`   Users:       ${finalUserCount} (Should be 1)`);
        console.log(`   Roles:       ${finalRoleCount} (System roles preserved)`);
        console.log(`   Rides:       ${finalRideCount} (Should be 0)`);
        console.log(`   Occurrences: ${finalOccurrenceCount} (Should be 0)`);
        console.log('');

        // Final Summary
        console.log('='.repeat(100));
        console.log('🎉 PROJECT SUCCESSFULLY PREPARED FOR LAUNCH!');
        console.log('='.repeat(100));
        console.log('');
        console.log('📋 LAUNCH CREDENTIALS');
        console.log('-'.repeat(100));
        console.log(`Email:    ${superAdminData.email}`);
        console.log(`Password: ${superAdminPassword}`);
        console.log(`Username: ${superAdminData.username}`);
        console.log('-'.repeat(100));
        console.log('');
        console.log('⚠️  IMPORTANT NEXT STEPS:');
        console.log('1. Change the Super Admin password after first login');
        console.log('2. Set up production environment variables');
        console.log('3. Configure email service for user notifications');
        console.log('4. Set up backup and monitoring systems');
        console.log('5. Review and update security settings');
        console.log('');
        console.log('📚 DOCUMENTATION:');
        console.log('- Admin Login: ADMIN_LOGIN_REFERENCE.md');
        console.log('- Deployment: DEPLOYMENT_GUIDE.md');
        console.log('- RBAC Setup: RBAC_DEPLOYMENT_READY.md');
        console.log('');
        console.log('='.repeat(100));

    } catch (error) {
        console.error('\n❌ ERROR during launch preparation:', error);
        console.error('\nThe database may be in an inconsistent state.');
        console.error('Please review the error and run the script again if needed.');
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the preparation
prepareForLaunch()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
