const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function recreateSuperAdmin() {
    try {
        console.log('Starting Super Admin recreation process...\n');

        // Step 1: Delete existing super admin
        console.log('Step 1: Removing existing super admin user...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'ke.africabi@gmail.com' }
        });

        if (existingUser) {
            // Delete related records first (due to foreign key constraints)
            console.log('  - Deleting user roles...');
            await prisma.userRole.deleteMany({
                where: { userId: existingUser.id }
            });

            console.log('  - Deleting user permissions...');
            await prisma.userPermission.deleteMany({
                where: { userId: existingUser.id }
            });

            console.log('  - Deleting user account...');
            await prisma.user.delete({
                where: { id: existingUser.id }
            });

            console.log('✓ Old super admin removed successfully\n');
        } else {
            console.log('  - No existing super admin found\n');
        }

        // Step 2: Create new super admin
        console.log('Step 2: Creating new super admin...');

        // Get password from command line argument or use default
        const customPassword = process.argv[2] || 'Admin@2026';
        console.log(`  - Using password: ${customPassword.replace(/./g, '*')}`);

        const newUserData = {
            fullName: 'Super Admin',
            email: 'ke.africabi@gmail.com',
            phone: '+254711786722',
            username: 'superadmin',
            password: await bcrypt.hash(customPassword, 10),
            role: 'ADMIN',
            isEmailVerified: false,
            isPhoneVerified: false,
            isIdentityVerified: false
        };

        const newUser = await prisma.user.create({
            data: newUserData
        });

        console.log('✓ New user created successfully');
        console.log(`  User ID: ${newUser.id}\n`);

        // Step 3: Find or create Super Admin role
        console.log('Step 3: Setting up RBAC roles...');

        let superAdminRole = await prisma.role.findFirst({
            where: {
                type: 'SUPER_ADMIN'
            }
        });

        if (!superAdminRole) {
            console.log('  - Creating Super Admin role...');
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
            console.log('✓ Super Admin role created');
        } else {
            console.log('✓ Super Admin role found');
        }

        // Step 4: Assign role to user
        console.log('  - Assigning Super Admin role to user...');
        await prisma.userRole.create({
            data: {
                userId: newUser.id,
                roleId: superAdminRole.id,
                isActive: true
            }
        });

        console.log('✓ Role assigned successfully\n');

        // Step 5: Display summary
        console.log('='.repeat(100));
        console.log('✓ SUPER ADMIN CREATED SUCCESSFULLY');
        console.log('='.repeat(100));
        console.log('\nLogin Credentials:');
        console.log('------------------');
        console.log(`Name:     ${newUserData.fullName}`);
        console.log(`Email:    ${newUserData.email}`);
        console.log(`Phone:    ${newUserData.phone}`);
        console.log(`Username: ${newUserData.username}`);
        console.log(`Password: ${customPassword}`);
        console.log('\nIMPORTANT: Please change the password after first login!');
        console.log('\nUsage: node recreate-super-admin.js [custom-password]');
        console.log('Example: node recreate-super-admin.js MySecurePass123!');
        console.log('='.repeat(100));

    } catch (error) {
        console.error('\n❌ Error during super admin recreation:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

recreateSuperAdmin();
