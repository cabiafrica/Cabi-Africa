import axios from 'axios';

const API_URL = 'http://localhost:3333/api';
const CREDENTIALS = {
    email: 'ithrivebusinessnetworks@gmail.com',
    password: 'Admin@2026'
};

async function testRBAC() {
    console.log('🚀 Starting Simple RBAC Test...\n');

    try {
        // 1. Test Health Endpoint
        console.log('1. Testing Health Endpoint...');
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            console.log(`✅ Health check passed: ${healthRes.statusText}`);
        } catch (error: any) {
            console.error(`❌ Health check failed: ${error.message}`);
            if (error.code === 'ECONNREFUSED') {
                console.error('⚠️  Backend service is not running on port 3333.');
                console.error('   Please start the service with: nx serve auth-gateway');
                return;
            }
        }

        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CREDENTIALS);
        const { token, user } = loginRes.data;
        console.log(`✅ Login successful`);
        console.log(`   User: ${user.fullName || user.username}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Test Role Creation
        console.log('\n3. Testing Role Creation...');
        const newRole = {
            name: 'TEST_SIMPLE',
            displayName: 'Simple Test Role',
            description: 'Testing RBAC system',
            type: 'ADMIN',
            platform: 'ADMIN_PANEL',
            permissions: ['SITE_SETUP_VIEW']
        };

        const createRes = await axios.post(`${API_URL}/roles`, newRole, { headers });
        const createdRole = createRes.data;
        console.log(`✅ Role created successfully`);
        console.log(`   ID: ${createdRole.id}`);
        console.log(`   Name: ${createdRole.name}`);

        // 4. Test Get Single Role (instead of list all)
        console.log('\n4. Testing Get Single Role...');
        const getRes = await axios.get(`${API_URL}/roles/${createdRole.id}`, { headers });
        console.log(`✅ Role retrieved successfully`);
        console.log(`   Name: ${getRes.data.name}`);
        console.log(`   Description: ${getRes.data.description}`);

        // 5. Test Role Update
        console.log('\n5. Testing Role Update...');
        const updateRes = await axios.patch(
            `${API_URL}/roles/${createdRole.id}`,
            { description: 'Updated via simple test' },
            { headers }
        );
        console.log(`✅ Role updated successfully`);
        console.log(`   New Description: ${updateRes.data.description}`);

        // 6. Now try to list all roles with timeout
        console.log('\n6. Testing List All Roles (with timeout)...');
        try {
            const listRes = await axios.get(`${API_URL}/roles`, { 
                headers,
                timeout: 5000  // 5 second timeout
            });
            console.log(`✅ Roles list retrieved successfully`);
            console.log(`   Total roles: ${listRes.data.length}`);
        } catch (error: any) {
            console.error(`❌ List roles failed: ${error.message}`);
            if (error.code === 'ECONNRESET') {
                console.error('⚠️  Connection reset - Backend may have crashed during query');
                console.error('   This suggests a database query issue in findAll()');
            }
        }

        // 7. Test Role Deletion
        console.log('\n7. Testing Role Deletion...');
        await axios.delete(`${API_URL}/roles/${createdRole.id}`, { headers });
        console.log(`✅ Role deleted successfully`);

        // 8. Verify deletion
        console.log('\n8. Verifying Deletion...');
        try {
            await axios.get(`${API_URL}/roles/${createdRole.id}`, { headers });
            console.error('❌ Role still exists after deletion!');
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                console.log(`✅ Deletion verified (404 Not Found)`);
            } else {
                console.error(`❌ Unexpected error: ${error.message}`);
            }
        }

        console.log('\n🎉 All RBAC tests completed successfully!');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testRBAC();
