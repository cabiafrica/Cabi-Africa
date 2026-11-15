const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
    try {
        console.log('='.repeat(80));
        console.log('TESTING ADMIN USER LOGIN');
        console.log('='.repeat(80));
        console.log();

        const testCredentials = {
            email: 'ke.africabi@gmail.com',
            password: 'Admin@2026'
        };

        console.log('Step 1: Fetching user from database...');
        console.log(`Email: ${testCredentials.email}`);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: testCredentials.email },
                    { phone: testCredentials.email }
                ]
            },
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
            console.error('❌ FAILED: User not found in database');
            return;
        }

        console.log('✓ User found in database');
        console.log(`  User ID: ${user.id}`);
        console.log(`  Full Name: ${user.fullName}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role (Legacy): ${user.role}`);
        console.log();

        console.log('Step 2: Verifying password...');
        const isPasswordValid = await bcrypt.compare(testCredentials.password, user.password);

        if (!isPasswordValid) {
            console.error('❌ FAILED: Password does not match');
            console.log('  Stored hash:', user.password.substring(0, 20) + '...');
            return;
        }

        console.log('✓ Password is valid');
        console.log();

        console.log('Step 3: Checking assigned roles...');
        if (user.userRoles.length === 0) {
            console.warn('⚠️  WARNING: User has no assigned roles');
        } else {
            console.log(`✓ User has ${user.userRoles.length} role(s):`);
            user.userRoles.forEach((ur, index) => {
                console.log(`  ${index + 1}. ${ur.role.displayName} (${ur.role.name})`);
                console.log(`     Type: ${ur.role.type}`);
                console.log(`     Platform: ${ur.role.platform}`);
                console.log(`     Active: ${ur.isActive && ur.role.isActive ? 'Yes' : 'No'}`);
                console.log(`     Permissions: ${ur.role.permissions.length}`);
            });
        }
        console.log();

        console.log('Step 4: Checking direct permissions...');
        if (user.userPermissions.length === 0) {
            console.log('  No direct permissions (using role-based permissions only)');
        } else {
            console.log(`  User has ${user.userPermissions.length} direct permission(s):`);
            user.userPermissions.forEach((up) => {
                console.log(`    - ${up.permission}: ${up.isGranted ? 'GRANTED' : 'REVOKED'}`);
            });
        }
        console.log();

        console.log('Step 5: Aggregating final permissions...');
        const permissions = new Set();

        // Add permissions from assigned roles
        user.userRoles.forEach((ur) => {
            if (ur.isActive && ur.role.isActive) {
                ur.role.permissions.forEach((p) => permissions.add(p));
            }
        });

        // Apply direct overrides
        user.userPermissions.forEach((up) => {
            if (up.isGranted) {
                permissions.add(up.permission);
            } else {
                permissions.delete(up.permission);
            }
        });

        // Fallback for Legacy Role
        if (permissions.size === 0 && user.role === 'ADMIN') {
            console.log('  Applying legacy ADMIN fallback permissions...');
            permissions.add('DISPATCH_DASHBOARD_VIEW');
            permissions.add('DISPATCH_RIDE_MONITOR');
        }

        console.log(`✓ Total effective permissions: ${permissions.size}`);
        if (permissions.size > 0) {
            console.log('  Sample permissions:');
            const samplePerms = Array.from(permissions).slice(0, 10);
            samplePerms.forEach(p => console.log(`    - ${p}`));
            if (permissions.size > 10) {
                console.log(`    ... and ${permissions.size - 10} more`);
            }
        }
        console.log();

        console.log('='.repeat(80));
        console.log('✅ LOGIN TEST SUCCESSFUL');
        console.log('='.repeat(80));
        console.log();
        console.log('Summary:');
        console.log(`  User: ${user.fullName} (${user.email})`);
        console.log(`  Roles: ${user.userRoles.length}`);
        console.log(`  Permissions: ${permissions.size}`);
        console.log(`  Mock Token: mock-jwt-token-${user.id}`);
        console.log();
        console.log('You can use these credentials to log into the admin panel:');
        console.log(`  Email: ${testCredentials.email}`);
        console.log(`  Password: ${testCredentials.password}`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ ERROR during login test:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testAdminLogin();
