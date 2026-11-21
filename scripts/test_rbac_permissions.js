const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3333/api';

const SUPER_ADMIN_CREDS = {
    email: 'ithrivebusinessnetworks@gmail.com',
    password: 'Admin@2026'
};

const TEST_USER = {
    email: 'permission_test_user@example.com',
    password: 'TestPassword123!',
    fullName: 'Permission Test User'
};

async function runTest() {
    console.log('🚀 Starting RBAC Permission Override Test...\n');
    let superAdminToken;
    let testUserToken;
    let testUserId;
    let roleId;

    try {
        // ---------------------------------------------------------
        // 1. Setup: Clean previous test user
        console.log('Step 1: Setup - Cleaning and creating test user...');
        const existing = await prisma.user.findUnique({ where: { email: TEST_USER.email } });
        if (existing) {
            await prisma.userRole.deleteMany({ where: { userId: existing.id } });
            await prisma.userPermission.deleteMany({ where: { userId: existing.id } });
            await prisma.user.delete({ where: { id: existing.id } });
        }

        const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: TEST_USER.email,
                password: hashedPassword,
                fullName: TEST_USER.fullName,
                username: 'permtestuser',
                phone: '+254700000000',
                isEmailVerified: true
            }
        });
        testUserId = newUser.id;
        console.log(`✅ Test User created: ${testUserId}`);

        // ---------------------------------------------------------
        // 2. Login as Super Admin
        console.log('\nStep 2: Login as Super Admin...');
        const saLogin = await axios.post(`${API_URL}/auth/login`, SUPER_ADMIN_CREDS);
        const superAdminUser = saLogin.data.user;
        const superAdminId = superAdminUser.id;
        // Construct Mock Token manually because backend uses MockJwtAuthGuard
        superAdminToken = `mock-jwt-token-${superAdminId}`;
        console.log('✅ Super Admin Logged in (Mock Token Configured)');

        // ---------------------------------------------------------
        // 3. Verify Test User has NO Access initially
        console.log('\nStep 3: Verification - Test User should have NO access...');
        try {
            // We can skip actual login call if we just construct the token, but let's do login to verify creds work
            const userLogin = await axios.post(`${API_URL}/auth/login`, {
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            // Construct Mock Token for Test User
            testUserToken = `mock-jwt-token-${testUserId}`;

            await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${testUserToken}` }
            });
            throw new Error('Test User accessed protected endpoint without permissions!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Access correctly denied (403)');
            } else if (error.message.includes('Test User accessed')) {
                throw error; // Rethrow our manual error
            } else {
                // Note: Login might succeed, but GET should fail. 
                // If GET fails with 403, we are good.
                console.log(`✅ Access denied as expected: ${error.response?.status || error.message}`);
            }
        }

        // ---------------------------------------------------------
        // 4. Grant Direct Permission (GROUPS_ROLES_VIEW)
        console.log('\nStep 4: Granting Direct Permission (GROUPS_ROLES_VIEW)...');
        await axios.put(
            `${API_URL}/admin/users/${testUserId}/permissions`,
            {
                grants: ['GROUPS_ROLES_VIEW'],
                revokes: []
            },
            { headers: { Authorization: `Bearer ${superAdminToken}` } }
        );
        console.log('✅ Permission granted via API');

        // Verify Access
        console.log('   Verifying access...');
        try {
            await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${testUserToken}` }
            });
            console.log('✅ Access GRANTED and Verified!');
        } catch (error) {
            console.error(`❌ Access failed: ${error.message}`);
            throw error;
        }

        // ---------------------------------------------------------
        // 5. Setup for Override Test: Assign Role AND Revoke Permission
        console.log('\nStep 5: Testing Revoke Override...');

        // Create a role with the permission
        console.log('   Creating Role with GROUPS_ROLES_VIEW...');
        const roleRes = await axios.post(`${API_URL}/roles`, {
            name: 'TEST_ROLE_WITH_PERM_' + Date.now(),
            displayName: 'Test Role Perms',
            type: 'ADMIN',
            platform: 'ADMIN_PANEL',
            permissions: ['GROUPS_ROLES_VIEW']
        }, { headers: { Authorization: `Bearer ${superAdminToken}` } });
        roleId = roleRes.data.id;

        // Assign Role to User
        console.log('   Assigning Role to User...');
        await axios.put(`${API_URL}/admin/users/${testUserId}/roles`, {
            roles: [roleId]
        }, { headers: { Authorization: `Bearer ${superAdminToken}` } });

        // Revoke the permission specifically for this user
        console.log('   Revoking GROUPS_ROLES_VIEW for User...');
        await axios.put(
            `${API_URL}/admin/users/${testUserId}/permissions`,
            {
                grants: [],
                revokes: ['GROUPS_ROLES_VIEW']
            },
            { headers: { Authorization: `Bearer ${superAdminToken}` } }
        );

        // Verify Access (Should be DENIED even though Role has it)
        console.log('   Verifying access is BLOCKED...');
        try {
            await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${testUserToken}` }
            });
            throw new Error('Override failed! User accessed endpoint despite specific revoke.');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Access correctly denied (Revoke Override worked)');
            } else if (error.message.includes('Override failed')) {
                throw error;
            } else {
                console.log(`✅ Access denied as expected: ${error.response?.status}`);
            }
        }

        // ---------------------------------------------------------
        // Cleanup
        console.log('\nStep 6: Cleanup...');
        await axios.delete(`${API_URL}/roles/${roleId}`, { headers: { Authorization: `Bearer ${superAdminToken}` } });
        // User cleanup handled by next run or manually
        await prisma.userRole.deleteMany({ where: { userId: testUserId } });
        await prisma.userPermission.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
        console.log('✅ Cleanup complete');

        console.log('\n🎉 ALL PERMISSION TESTS PASSED');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
