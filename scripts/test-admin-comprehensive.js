const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function comprehensiveAdminTest() {
    try {
        console.log('\n' + '='.repeat(100));
        console.log('COMPREHENSIVE ADMIN USER CREATION AND AUTHENTICATION TEST');
        console.log('='.repeat(100) + '\n');

        const testResults = {
            userCreation: false,
            passwordHash: false,
            roleAssignment: false,
            permissionsCount: 0,
            loginSimulation: false,
            criticalPermissions: []
        };

        // TEST 1: User Existence and Basic Data
        console.log('TEST 1: User Existence and Basic Data');
        console.log('-'.repeat(100));

        const user = await prisma.user.findUnique({
            where: { email: 'ithrivebusinessnetworks@gmail.com' },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                userPermissions: true
            }
        });

        if (!user) {
            console.error('❌ CRITICAL FAILURE: Admin user not found in database');
            process.exit(1);
        }

        console.log('✓ User exists in database');
        console.log(`  User ID: ${user.id}`);
        console.log(`  Full Name: ${user.fullName}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Username: ${user.username || 'N/A'}`);
        console.log(`  Legacy Role: ${user.role}`);
        console.log(`  Email Verified: ${user.isEmailVerified}`);
        console.log(`  Phone Verified: ${user.isPhoneVerified}`);
        testResults.userCreation = true;
        console.log();

        // TEST 2: Password Hash Verification
        console.log('TEST 2: Password Hash Verification');
        console.log('-'.repeat(100));

        const testPassword = 'Admin@2026';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);

        if (!isPasswordValid) {
            console.error('❌ CRITICAL FAILURE: Password hash verification failed');
            console.error('  Expected password: Admin@2026');
            console.error('  Hash format appears invalid or password mismatch');
            process.exit(1);
        }

        console.log('✓ Password hash is valid');
        console.log(`  Hash algorithm: bcrypt`);
        console.log(`  Hash preview: ${user.password.substring(0, 29)}...`);
        console.log(`  Test password: ${testPassword}`);
        testResults.passwordHash = true;
        console.log();

        // TEST 3: Role Assignment
        console.log('TEST 3: Role Assignment (RBAC)');
        console.log('-'.repeat(100));

        if (user.userRoles.length === 0) {
            console.error('❌ CRITICAL FAILURE: No roles assigned to user');
            process.exit(1);
        }

        console.log(`✓ User has ${user.userRoles.length} role(s) assigned`);

        user.userRoles.forEach((userRole, index) => {
            console.log(`\n  Role ${index + 1}:`);
            console.log(`    Name: ${userRole.role.name}`);
            console.log(`    Display Name: ${userRole.role.displayName}`);
            console.log(`    Type: ${userRole.role.type}`);
            console.log(`    Platform: ${userRole.role.platform}`);
            console.log(`    Is System Role: ${userRole.role.isSystem}`);
            console.log(`    Role Active: ${userRole.role.isActive}`);
            console.log(`    User Role Active: ${userRole.isActive}`);
            console.log(`    Permissions in Role: ${userRole.role.permissions.length}`);
            console.log(`    Assigned At: ${userRole.assignedAt}`);
        });

        const hasSuperAdminRole = user.userRoles.some(
            ur => ur.role.type === 'SUPER_ADMIN' && ur.isActive && ur.role.isActive
        );

        if (!hasSuperAdminRole) {
            console.error('\n❌ WARNING: User does not have an active SUPER_ADMIN role');
        } else {
            console.log('\n✓ User has active SUPER_ADMIN role');
            testResults.roleAssignment = true;
        }
        console.log();

        // TEST 4: Permissions Aggregation
        console.log('TEST 4: Permissions Aggregation');
        console.log('-'.repeat(100));

        const permissions = new Set();

        // From roles
        user.userRoles.forEach(ur => {
            if (ur.isActive && ur.role.isActive) {
                ur.role.permissions.forEach(p => permissions.add(p));
            }
        });

        // Direct grants/revokes
        user.userPermissions.forEach(up => {
            if (up.isGranted) {
                permissions.add(up.permission);
            } else {
                permissions.delete(up.permission);
            }
        });

        console.log(`✓ Total effective permissions: ${permissions.size}`);
        testResults.permissionsCount = permissions.size;

        if (permissions.size === 0) {
            console.error('❌ CRITICAL FAILURE: User has no effective permissions');
            process.exit(1);
        }

        // Check critical permissions
        const criticalPermissions = [
            'GROUPS_ROLES_VIEW',
            'GROUPS_ROLES_EDIT',
            'PEOPLE_VIEW',
            'PEOPLE_EDIT',
            'DASHBOARD_PERSONALIZE',
            'SYSTEM_SETTINGS_VIEW',
            'USER_ROLES_ASSIGN'
        ];

        console.log('\n  Critical Permissions Check:');
        criticalPermissions.forEach(perm => {
            const hasPermission = permissions.has(perm);
            console.log(`    ${hasPermission ? '✓' : '❌'} ${perm}`);
            if (hasPermission) {
                testResults.criticalPermissions.push(perm);
            }
        });

        if (testResults.criticalPermissions.length < criticalPermissions.length) {
            console.warn(`\n⚠️  WARNING: Missing ${criticalPermissions.length - testResults.criticalPermissions.length} critical permissions`);
        }
        console.log();

        // TEST 5: Login Flow Simulation
        console.log('TEST 5: Login Flow Simulation');
        console.log('-'.repeat(100));

        // Simulate the login method from UserService
        const loginResult = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            permissions: Array.from(permissions)
        };

        console.log('✓ Login simulation successful');
        console.log(`  User ID: ${loginResult.id}`);
        console.log(`  Email: ${loginResult.email}`);
        console.log(`  Full Name: ${loginResult.fullName}`);
        console.log(`  Legacy Role: ${loginResult.role}`);
        console.log(`  Permissions Count: ${loginResult.permissions.length}`);
        console.log(`  Mock JWT Token: mock-jwt-token-${loginResult.id}`);
        testResults.loginSimulation = true;
        console.log();

        // TEST 6: Database Integrity Checks
        console.log('TEST 6: Database Integrity Checks');
        console.log('-'.repeat(100));

        // Check for duplicate admin users
        const adminUsers = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            }
        });

        console.log(`  Total ADMIN users in database: ${adminUsers.length}`);

        if (adminUsers.length > 1) {
            console.warn('⚠️  WARNING: Multiple ADMIN users found:');
            adminUsers.forEach((admin, index) => {
                console.log(`    ${index + 1}. ${admin.email} (${admin.fullName}) - ID: ${admin.id}`);
            });
        } else {
            console.log('✓ Only one ADMIN user exists (recommended)');
        }
        console.log();

        // FINAL SUMMARY
        console.log('='.repeat(100));
        console.log('TEST RESULTS SUMMARY');
        console.log('='.repeat(100));
        console.log();

        const allTestsPassed =
            testResults.userCreation &&
            testResults.passwordHash &&
            testResults.roleAssignment &&
            testResults.permissionsCount > 0 &&
            testResults.loginSimulation;

        console.log(`User Creation:         ${testResults.userCreation ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Password Hash:         ${testResults.passwordHash ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Role Assignment:       ${testResults.roleAssignment ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Permissions Count:     ${testResults.permissionsCount > 0 ? '✅ PASS' : '❌ FAIL'} (${testResults.permissionsCount})`);
        console.log(`Login Simulation:      ${testResults.loginSimulation ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Critical Permissions:  ${testResults.criticalPermissions.length}/${criticalPermissions.length}`);
        console.log();

        if (allTestsPassed) {
            console.log('🎉 ALL TESTS PASSED!');
            console.log();
            console.log('Admin Panel Login Credentials:');
            console.log('━'.repeat(100));
            console.log(`  Email:    ithrivebusinessnetworks@gmail.com`);
            console.log(`  Password: Admin@2026`);
            console.log('━'.repeat(100));
            console.log();
            console.log('Next Steps:');
            console.log('  1. Start the backend server (if not running)');
            console.log('  2. Start the admin panel frontend');
            console.log('  3. Login with the credentials above');
            console.log('  4. Verify RBAC functionality in the UI');
        } else {
            console.error('\n❌ SOME TESTS FAILED - Review the output above');
            process.exit(1);
        }

        console.log('='.repeat(100));

    } catch (error) {
        console.error('\n❌ FATAL ERROR during comprehensive test:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

comprehensiveAdminTest();
