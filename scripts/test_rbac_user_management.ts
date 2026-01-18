/**
 * RBAC User Management Integration Test
 * Tests user role assignment and permission overrides
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://localhost:3333/api';
const TEST_EMAIL = 'testuser@cabi.com';
// const TEST_PASSWORD = 'TestUser@2026'; // Removed as user creation no longer takes password directly

// Admin credentials
const ADMIN_EMAIL = 'super@cabi.com';
const ADMIN_PASSWORD = 'simplepassword';

let authToken: string;
let userId: string;
let testRoleId: string;
let testRoleName: string; // Added to store the name of the created role
let testUserId: string;

// Create authenticated API client
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

// Test utilities
function logSuccess(message: string) {
    console.log(`✅ ${message}`);
}

function logError(message: string, error?: any) {
    console.error(`❌ ${message}`);
    if (error?.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, JSON.stringify(error.response.data, null, 2)); // Changed to stringify for better logging
    } else if (error?.message) {
        console.error(`   Error:`, error.message);
    }
}

function logInfo(message: string) {
    console.log(`ℹ️  ${message}`);
}

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test 1: Login as Super Admin
async function testLogin() {
    console.log('\n📝 Test 1: Login as Super Admin');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });

        authToken = response.data.token;
        userId = response.data.user.id;
        logSuccess(`Logged in as ${response.data.user.fullName} (${userId})`);
        return true;
    } catch (error) {
        logError('Login failed', error);
        return false;
    }
}

// Test 2: Create a test role
async function testCreateRole() {
    console.log('\n📝 Test 2: Create Test Role for User Assignment');
    try {
        const roleData = {
            name: 'TEST_USER_MANAGER',
            displayName: 'Test User Manager',
            description: 'Role for testing user assignment',
            platform: 'ADMIN_PANEL',
            permissions: [
                'PEOPLE_VIEW',
                'PEOPLE_EDIT',
                'GROUPS_ROLES_VIEW',
            ],
            isActive: true,
            isSystem: false,
        };

        const response = await apiClient.post('/roles', roleData);
        testRoleId = response.data.id;
        testRoleName = response.data.name; // Store the role name
        logSuccess(
            `Test role created: ${response.data.displayName} (${testRoleId})`
        );
        logInfo(`   Name: ${testRoleName}`); // Log the role name
        logInfo(`   Permissions: ${response.data.permissions.join(', ')}`);
        return true;
    } catch (error) {
        logError('Failed to create test role', error);
        return false;
    }
}

// Test 3: Create a test user via Admin Users endpoint
async function testCreateUser() {
    console.log('\n📝 Test 3: Create Test User via Admin'); // Updated test name
    try {
        // Use the admin/users endpoint
        const userData = {
            email: TEST_EMAIL,
            // password: TEST_PASSWORD, // Removed as user creation no longer takes password directly
            // fullName: 'Test User', // Removed as user creation no longer takes fullName directly
            // phone: '+254700000001', // Removed
            // isActive: true, // Removed
            roles: [testRoleName], // Pass the role name directly
        };

        const response = await apiClient.post('/admin/users', userData); // Updated endpoint
        testUserId = response.data.id;
        logSuccess(`Test user created: ${response.data.email} (${testUserId})`); // Updated log message
        logInfo(`   Roles assigned: ${response.data.roles.join(', ')}`); // Log assigned roles
        return true;
    } catch (error) {
        // If user already exists, try to find them
        const axiosError = error as any;
        if (axiosError.response?.status === 409 || axiosError.response?.status === 400) {
            logInfo('User may already exist, attempting to find...');
            try {
                const usersResponse = await apiClient.get('/admin/users'); // Updated endpoint
                const existingUser = usersResponse.data.find(
                    (u: any) => u.email === TEST_EMAIL
                );
                if (existingUser) {
                    testUserId = existingUser.id;
                    logSuccess(`Found existing test user (${testUserId})`);
                    return true;
                }
            } catch (findError) {
                logError('Failed to find existing user', findError);
            }
        }
        logError('Failed to create test user', error);
        return false;
    }
}

// Test 4: Update user roles (assign additional role)
async function testUpdateUserRoles() {
    console.log('\n📝 Test 4: Update User Roles');
    try {
        // Create another test role
        const roleData2 = {
            name: 'TEST_VIEWER',
            displayName: 'Test Viewer',
            description: 'Additional test role',
            platform: 'ADMIN_PANEL',
            permissions: ['PEOPLE_VIEW'],
            isActive: true,
            isSystem: false,
        };

        const roleResponse = await apiClient.post('/roles', roleData2);
        const secondRoleName = roleResponse.data.name;
        logInfo(`   Created second test role: ${secondRoleName}`);

        // Update user with both roles
        const response = await apiClient.put(`/admin/users/${testUserId}/roles`, {
            roles: [testRoleName, secondRoleName],
        });

        logSuccess('User roles updated successfully');
        logInfo(`   Roles: ${response.data.roles.join(', ')}`);
        return true;
    } catch (error) {
        logError('Failed to update user roles', error);
        return false;
    }
}

// Test 5: Grant and revoke individual permissions
async function testUpdateUserPermissions() {
    console.log('\n📝 Test 5: Update User Permissions (Grants & Revokes)');
    try {
        const response = await apiClient.put(
            `/admin/users/${testUserId}/permissions`,
            {
                grants: ['DISPATCH_DASHBOARD_VIEW', 'DISPATCH_RIDE_ASSIGN'], // Grant these permissions
                revokes: ['PEOPLE_EDIT'], // Revoke this permission
            }
        );

        logSuccess('User permissions updated successfully');
        logInfo(`   Direct Grants: ${response.data.directGrants?.join(', ') || 'None'}`);
        logInfo(`   Direct Revokes: ${response.data.directRevokes?.join(', ') || 'None'}`);
        return true;
    } catch (error) {
        logError('Failed to update user permissions', error);
        return false;
    }
}

// Test 6: Verify complete user profile
async function testVerifyUserProfile() {
    console.log('\n📝 Test 6: Verify Complete User Profile');
    try {
        const usersResponse = await apiClient.get('/admin/users');
        const user = usersResponse.data.find((u: any) => u.id === testUserId);

        if (!user) {
            logError('User not found in users list');
            return false;
        }

        logSuccess('User profile verified');
        logInfo(`   Email: ${user.email}`);
        logInfo(`   Roles: ${user.roles?.join(', ') || 'None'}`);
        logInfo(`   Direct Grants: ${user.directGrants?.join(', ') || 'None'}`);
        logInfo(`   Direct Revokes: ${user.directRevokes?.join(', ') || 'None'}`);

        // Verify expected data
        if (user.roles && user.roles.length >= 2) {
            logSuccess('✓ User has multiple roles assigned');
        } else {
            logError('✗ User does not have multiple roles assigned as expected');
            return false;
        }
        if (user.directGrants && user.directGrants.includes('DISPATCH_DASHBOARD_VIEW')) {
            logSuccess('✓ Direct permission grant verified');
        } else {
            logError('✗ Direct permission DISPATCH_DASHBOARD_VIEW not found as expected');
            return false;
        }
        if (user.directRevokes && user.directRevokes.includes('PEOPLE_EDIT')) {
            logSuccess('✓ Permission revoke verified');
        } else {
            logError('✗ Permission PEOPLE_EDIT not revoked as expected');
            return false;
        }

        return true;
    } catch (error) {
        logError('Failed to verify user profile', error);
        return false;
    }
}

// Test 7: Remove all roles from user
async function testRemoveAllRoles() {
    console.log('\n📝 Test 7: Remove All Roles from User');
    try {
        const response = await apiClient.put(`/admin/users/${testUserId}/roles`, {
            roles: [], // Empty array removes all roles
        });

        logSuccess('All roles removed from user');
        logInfo(`   Remaining roles: ${response.data.roles?.length || 0}`);
        return true;
    } catch (error) {
        logError('Failed to remove roles from user', error);
        return false;
    }
}

// Test 8: Cleanup - Delete test roles and user
async function testCleanup() {
    console.log('\n📝 Test 8: Cleanup Test Data'); // Updated test name
    let success = true;

    try {
        // Get all roles to find our test roles
        const rolesResponse = await apiClient.get('/roles');
        const testRoles = rolesResponse.data.filter(
            (r: any) => r.name.startsWith('TEST_')
        );

        for (const role of testRoles) {
            try {
                await apiClient.delete(`/roles/${role.id}`);
                logSuccess(`Deleted test role: ${role.name}`);
            } catch (error) {
                logError(`Failed to delete role ${role.name}`, error);
                success = false;
            }
        }
    } catch (error) {
        logError('Failed to fetch/delete test roles', error);
        success = false;
    }

    // Note: User deletion endpoint may not exist, so we skip it
    logInfo('Test user cleanup skipped (may not have delete endpoint)');

    return success;
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting RBAC User Management Integration Tests...\n');
    console.log('='.repeat(60));

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
    };

    const tests = [
        { name: 'Login', fn: testLogin },
        { name: 'Create Test Role', fn: testCreateRole },
        { name: 'Create Test User', fn: testCreateUser },
        { name: 'Update User Roles', fn: testUpdateUserRoles },
        { name: 'Update User Permissions', fn: testUpdateUserPermissions },
        { name: 'Verify User Profile', fn: testVerifyUserProfile },
        { name: 'Remove All Roles', fn: testRemoveAllRoles },
        { name: 'Cleanup', fn: testCleanup },
    ];

    for (const test of tests) {
        results.total++;
        const passed = await test.fn();
        if (passed) {
            results.passed++;
        } else {
            results.failed++;
            console.log(`\n⚠️  Test "${test.name}" failed. Continuing...\n`);
        }
        await sleep(500); // Small delay between tests (changed from 100 to 500)
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 All RBAC user management tests passed successfully!');
    } else {
        console.log(
            `\n⚠️  ${results.failed} test(s) failed. Please review the logs above.`
        );
    }

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
});
