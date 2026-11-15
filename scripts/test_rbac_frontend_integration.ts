/**
 * RBAC Frontend Integration Test
 * 
 * This script simulates frontend behavior by testing the API endpoints
 * that the admin panel uses for role management.
 * 
 * Run: npx ts-node scripts/test_rbac_frontend_integration.ts
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://localhost:3333/api';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    section: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
    data: (label: string, data: any) => console.log(`  ${colors.yellow}${label}:${colors.reset}`, JSON.stringify(data, null, 2)),
};

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}

class FrontendIntegrationTest {
    private apiClient: AxiosInstance;
    private authToken: string = '';
    private userId: string = '';
    private testResults: TestResult[] = [];
    private createdRoleId: string = '';

    constructor() {
        // Create axios instance similar to frontend roleService
        this.apiClient = axios.create({
            baseURL: API_URL,
            timeout: 10000,
        });

        // Add request interceptor for auth token (like frontend)
        this.apiClient.interceptors.request.use((config) => {
            if (this.authToken) {
                config.headers.Authorization = `Bearer ${this.authToken}`;
            }
            return config;
        });
    }

    private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
        const startTime = Date.now();
        try {
            log.info(`Running: ${name}`);
            await testFn();
            const duration = Date.now() - startTime;
            this.testResults.push({ name, passed: true, duration });
            log.success(`${name} (${duration}ms)`);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            const errorMsg = error.response?.data?.message || error.message;
            this.testResults.push({ name, passed: false, error: errorMsg, duration });
            log.error(`${name}: ${errorMsg}`);
            throw error; // Re-throw to stop subsequent tests if needed
        }
    }

    async testLogin(): Promise<void> {
        await this.runTest('Login with Super Admin credentials', async () => {
            const response = await this.apiClient.post('/auth/login', {
                email: 'ke.africabi@gmail.com',
                password: 'Admin@2026',
            });

            this.authToken = response.data.token;
            this.userId = response.data.user.id;

            if (!this.authToken) {
                throw new Error('No token received from login');
            }

            log.data('Token', this.authToken);
            log.data('User ID', this.userId);
            log.data('User Name', response.data.user.fullName);
        });
    }

    async testGetAllRoles(): Promise<void> {
        await this.runTest('GET /api/roles - List all roles', async () => {
            const response = await this.apiClient.get('/roles');
            const roles = response.data;

            if (!Array.isArray(roles)) {
                throw new Error('Expected array of roles');
            }

            if (roles.length === 0) {
                throw new Error('No roles found in database');
            }

            log.data('Total Roles', roles.length);
            log.data('Sample Role', {
                name: roles[0].name,
                displayName: roles[0].displayName,
                platform: roles[0].platform,
                permissions: roles[0].permissions.length,
            });
        });
    }

    async testCreateRole(): Promise<void> {
        await this.runTest('POST /api/roles - Create new role', async () => {
            const timestamp = Date.now();
            const newRole = {
                name: `FRONTEND_TEST_${timestamp}`,
                displayName: `Frontend Test Role ${timestamp}`,
                description: 'Created by frontend integration test',
                type: 'ADMIN',
                platform: 'ADMIN_PANEL',
                permissions: [
                    'GROUPS_ROLES_VIEW',
                    'GROUPS_ROLES_EDIT',
                    'PEOPLE_VIEW',
                    'PEOPLE_EDIT',
                    'DASHBOARD_PERSONALIZE',
                ],
                isActive: true,
            };

            const response = await this.apiClient.post('/roles', newRole);
            const createdRole = response.data;

            this.createdRoleId = createdRole.id;

            if (!createdRole.id) {
                throw new Error('No ID returned for created role');
            }

            if (createdRole.name !== newRole.name) {
                throw new Error('Role name mismatch');
            }

            if (createdRole.permissions.length !== newRole.permissions.length) {
                throw new Error('Permissions count mismatch');
            }

            log.data('Created Role ID', createdRole.id);
            log.data('Role Name', createdRole.name);
            log.data('Permissions', createdRole.permissions);
        });
    }

    async testGetSingleRole(): Promise<void> {
        await this.runTest('GET /api/roles/:id - Get single role', async () => {
            if (!this.createdRoleId) {
                throw new Error('No role ID available from create test');
            }

            const response = await this.apiClient.get(`/roles/${this.createdRoleId}`);
            const role = response.data;

            if (role.id !== this.createdRoleId) {
                throw new Error('Role ID mismatch');
            }

            log.data('Retrieved Role', {
                id: role.id,
                name: role.name,
                displayName: role.displayName,
            });
        });
    }

    async testUpdateRole(): Promise<void> {
        await this.runTest('PATCH /api/roles/:id - Update role', async () => {
            if (!this.createdRoleId) {
                throw new Error('No role ID available');
            }

            const updates = {
                description: 'Updated by frontend integration test',
                permissions: [
                    'GROUPS_ROLES_VIEW',
                    'GROUPS_ROLES_EDIT',
                    'PEOPLE_VIEW',
                    'AUDIT_LOGS_VIEW', // Added new permission
                ],
            };

            const response = await this.apiClient.patch(`/roles/${this.createdRoleId}`, updates);
            const updatedRole = response.data;

            if (updatedRole.description !== updates.description) {
                throw new Error('Description not updated');
            }

            if (updatedRole.permissions.length !== updates.permissions.length) {
                throw new Error('Permissions not updated correctly');
            }

            log.data('Updated Description', updatedRole.description);
            log.data('Updated Permissions Count', updatedRole.permissions.length);
        });
    }

    async testSearchAndFilter(): Promise<void> {
        await this.runTest('Test frontend search/filter logic', async () => {
            const response = await this.apiClient.get('/roles');
            const allRoles = response.data;

            // Simulate frontend search filtering
            const searchTerm = 'test';
            const filteredRoles = allRoles.filter((role: any) =>
                role.name.toLowerCase().includes(searchTerm) ||
                role.displayName.toLowerCase().includes(searchTerm)
            );

            log.data('Total Roles', allRoles.length);
            log.data('Filtered Roles (search: "test")', filteredRoles.length);

            if (filteredRoles.length === 0) {
                throw new Error('Search filter should have found test role');
            }
        });
    }

    async testPermissionValidation(): Promise<void> {
        await this.runTest('Validate permission structure', async () => {
            if (!this.createdRoleId) {
                throw new Error('No role ID available');
            }

            const response = await this.apiClient.get(`/roles/${this.createdRoleId}`);
            const role = response.data;

            // Validate permissions are strings
            if (!Array.isArray(role.permissions)) {
                throw new Error('Permissions should be an array');
            }

            for (const perm of role.permissions) {
                if (typeof perm !== 'string') {
                    throw new Error('Each permission should be a string');
                }
                if (!perm.includes('_')) {
                    throw new Error('Permissions should follow CATEGORY_ACTION format');
                }
            }

            log.data('Permission Validation', 'All permissions valid');
        });
    }

    async testPlatformFiltering(): Promise<void> {
        await this.runTest('Test platform-specific filtering', async () => {
            const response = await this.apiClient.get('/roles');
            const allRoles = response.data;

            // Group by platform (frontend would do this for display)
            const byPlatform = allRoles.reduce((acc: any, role: any) => {
                acc[role.platform] = (acc[role.platform] || 0) + 1;
                return acc;
            }, {});

            log.data('Roles by Platform', byPlatform);

            if (!byPlatform['ADMIN_PANEL']) {
                throw new Error('Should have at least one ADMIN_PANEL role');
            }
        });
    }

    async testDeleteRole(): Promise<void> {
        await this.runTest('DELETE /api/roles/:id - Delete role', async () => {
            if (!this.createdRoleId) {
                throw new Error('No role ID available');
            }

            await this.apiClient.delete(`/roles/${this.createdRoleId}`);

            // Verify deletion by trying to fetch
            try {
                await this.apiClient.get(`/roles/${this.createdRoleId}`);
                throw new Error('Role should have been deleted but still exists');
            } catch (error: any) {
                if (error.response?.status === 404) {
                    log.success('Role successfully deleted and returns 404');
                } else {
                    throw error;
                }
            }
        });
    }

    async testRolePersistence(): Promise<void> {
        await this.runTest('Test role persistence across requests', async () => {
            // Create a temporary role
            const timestamp = Date.now();
            const tempRole = {
                name: `PERSIST_TEST_${timestamp}`,
                displayName: 'Persistence Test',
                description: 'Testing data persistence',
                type: 'ADMIN',
                platform: 'ADMIN_PANEL',
                permissions: ['GROUPS_ROLES_VIEW'],
                isActive: true,
            };

            const createResponse = await this.apiClient.post('/roles', tempRole);
            const roleId = createResponse.data.id;

            // Fetch it back
            const getResponse = await this.apiClient.get(`/roles/${roleId}`);

            if (getResponse.data.name !== tempRole.name) {
                throw new Error('Persistence check failed: name mismatch');
            }

            // Clean up
            await this.apiClient.delete(`/roles/${roleId}`);

            log.data('Persistence Check', 'Data persists correctly across requests');
        });
    }

    async testErrorHandling(): Promise<void> {
        await this.runTest('Test error handling for invalid requests', async () => {
            // Try to create duplicate role name
            try {
                await this.apiClient.post('/roles', {
                    name: 'SUPER_ADMIN', // This already exists
                    displayName: 'Duplicate Test',
                    type: 'ADMIN',
                    platform: 'ADMIN_PANEL',
                    permissions: [],
                    isActive: true,
                });
                throw new Error('Should have failed with duplicate name');
            } catch (error: any) {
                // Accept 400, 409, or 500 (different systems may return different codes)
                if (error.response?.status === 409 || error.response?.status === 400 || error.response?.status === 500) {
                    log.success('Correctly rejected duplicate role name');
                } else {
                    throw error;
                }
            }

            // Try to access non-existent role
            try {
                await this.apiClient.get('/roles/non-existent-id-12345');
                throw new Error('Should have failed with 404');
            } catch (error: any) {
                if (error.response?.status === 404) {
                    log.success('Correctly returned 404 for non-existent role');
                } else {
                    throw error;
                }
            }
        });
    }

    printSummary(): void {
        log.section('═══════════════════════════════════════════════════════════');
        log.section('                    TEST SUMMARY                           ');
        log.section('═══════════════════════════════════════════════════════════');

        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;
        const totalTime = this.testResults.reduce((sum, r) => sum + r.duration, 0);

        console.log('');
        this.testResults.forEach(result => {
            const icon = result.passed ? colors.green + '✓' : colors.red + '✗';
            const time = `${result.duration}ms`;
            console.log(`  ${icon} ${result.name}${colors.reset} ${colors.yellow}(${time})${colors.reset}`);
            if (result.error) {
                console.log(`    ${colors.red}Error: ${result.error}${colors.reset}`);
            }
        });

        console.log('');
        log.section('Results:');
        console.log(`  Total Tests: ${total}`);
        console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
        console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
        console.log(`  ${colors.yellow}Total Time: ${totalTime}ms${colors.reset}`);
        console.log(`  ${colors.cyan}Success Rate: ${((passed / total) * 100).toFixed(1)}%${colors.reset}`);
        console.log('');

        if (failed === 0) {
            log.section('🎉 ALL TESTS PASSED! Frontend integration is working correctly.');
        } else {
            log.section('❌ SOME TESTS FAILED! Please review the errors above.');
        }

        log.section('═══════════════════════════════════════════════════════════');
    }

    async run(): Promise<void> {
        log.section('═══════════════════════════════════════════════════════════');
        log.section('    RBAC Frontend Integration Test Suite                  ');
        log.section('═══════════════════════════════════════════════════════════');
        log.info('Testing API endpoints from frontend perspective');
        log.info(`Base URL: ${API_URL}`);
        console.log('');

        try {
            // Authentication
            log.section('1. Authentication');
            await this.testLogin();

            // Read Operations
            log.section('2. Read Operations');
            await this.testGetAllRoles();
            await this.testSearchAndFilter();
            await this.testPlatformFiltering();

            // Create Operations
            log.section('3. Create Operations');
            await this.testCreateRole();
            await this.testGetSingleRole();
            await this.testPermissionValidation();

            // Update Operations
            log.section('4. Update Operations');
            await this.testUpdateRole();

            // Persistence
            log.section('5. Data Persistence');
            await this.testRolePersistence();

            // Error Handling
            log.section('6. Error Handling');
            await this.testErrorHandling();

            // Delete Operations
            log.section('7. Delete Operations');
            await this.testDeleteRole();

        } catch (error: any) {
            log.error('Test suite aborted due to error');
            if (error.response) {
                log.data('HTTP Status', error.response.status);
                log.data('Response Data', error.response.data);
            }
        } finally {
            this.printSummary();
        }
    }
}

// Run the tests
const test = new FrontendIntegrationTest();
test.run().catch(console.error);
