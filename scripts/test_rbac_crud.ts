
import axios from 'axios';

const API_URL = 'http://localhost:3333/api';
const CREDENTIALS = {
    email: 'ithrivebusinessnetworks@gmail.com',
    password: 'Admin@2026'
};

async function main() {
    console.log('🚀 Starting RBAC CRUD Test...');

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const { token, user } = loginRes.data;
        console.log(`✅ Login successful. User: ${user.fullName} (${user.id})`);

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create Role
        console.log('2. Creating Test Role...');
        const timestamp = Date.now();
        const newRole = {
            name: `TEST_ROLE_${timestamp}`,
            displayName: 'Automated Test Role',
            description: 'Created by automated test script',
            type: 'ADMIN',
            platform: 'ADMIN_PANEL',
            permissions: ['SITE_SETUP_VIEW']
        };

        const createRes = await axios.post(`${API_URL}/roles`, newRole, { headers });
        const createdRole = createRes.data;
        console.log(`✅ Role created: ${createdRole.id} (${createdRole.name})`);

        // 3. List Roles
        console.log('3. Listing Roles...');
        const listRes = await axios.get(`${API_URL}/roles`, { headers });
        const roles = listRes.data;
        const foundRole = roles.find((r: any) => r.id === createdRole.id);

        if (foundRole) {
            console.log(`✅ Verified role exists in list.`);
        } else {
            console.error('❌ Role NOT found in list!');
            process.exit(1);
        }

        // 4. Update Role
        console.log('4. Updating Role...');
        const updateRes = await axios.patch(`${API_URL}/roles/${createdRole.id}`, {
            description: 'Updated description'
        }, { headers });

        if (updateRes.data.description === 'Updated description') {
            console.log(`✅ Role verified updated.`);
        } else {
            console.error('❌ Role update verification failed.');
        }

        // 5. Delete Role
        console.log('5. Deleting Role...');
        await axios.delete(`${API_URL}/roles/${createdRole.id}`, { headers });
        console.log(`✅ Role deleted.`);

        // 6. Verify Deletion
        console.log('6. Verifying Deletion...');
        try {
            await axios.get(`${API_URL}/roles/${createdRole.id}`, { headers });
            console.error('❌ Role still exists after deletion!');
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                console.log(`✅ Verified role is gone (404 Not Found).`);
            } else {
                console.error(`❌ Unexpected error verification: ${error.message}`);
            }
        }

        console.log('🎉 All RBAC CRUD tests passed successfully!');

    } catch (error: any) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️  Ensure the backend services are running on port 3333.');
        }
    }
}

main();
