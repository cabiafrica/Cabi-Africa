const axios = require('axios');

const AUTH_URL = 'http://localhost:3333/api';
const DRIVER_LEAD_URL = 'http://localhost:3010/api/v1';

async function simulateDriverApprovalFlow() {
    console.log('='.repeat(60));
    console.log('DRIVER APPROVAL WORKFLOW SIMULATION');
    console.log('='.repeat(60));

    const driverEmail = 'test_driver_1771018942569@test.com';
    const driverUserId = 'e24f9933-f065-41de-a059-a5699e2e8629';

    try {
        // Step 1: Admin Login
        console.log('\n📋 Step 1: Admin Login');
        const adminLogin = await axios.post(`${AUTH_URL}/auth/login`, {
            email: 'ke.africabi@gmail.com',
            password: 'Admin@2026'
        });
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin logged in successfully');

        // Step 2: Get pending driver applications
        console.log('\n📋 Step 2: Fetching pending driver applications');
        const pendingDrivers = await axios.get(`${DRIVER_LEAD_URL}/driver-leads/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Found ${pendingDrivers.data.data?.length || 0} pending driver(s)`);
        if (pendingDrivers.data.data?.length > 0) {
            console.log('Latest pending driver:', JSON.stringify(pendingDrivers.data.data[0], null, 2));
        }

        // Step 3: Approve the driver
        console.log('\n📋 Step 3: Approving driver');
        const approvalResponse = await axios.post(
            `${DRIVER_LEAD_URL}/driver-leads/${driverUserId}/approve`,
            {},
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ Driver approved successfully');
        console.log('Approval Response:', JSON.stringify(approvalResponse.data, null, 2));

        // Step 4: Driver Login (should now work)
        console.log('\n📋 Step 4: Testing driver login after approval');
        const driverLogin = await axios.post(`${AUTH_URL}/auth/login`, {
            email: driverEmail,
            password: 'Password123!'
        });
        console.log('✅ Driver login successful!');
        console.log('Driver Profile:', JSON.stringify(driverLogin.data.user, null, 2));

        console.log('\n🎉 COMPLETE WORKFLOW VERIFIED!');
        return { success: true };

    } catch (error) {
        console.log('\n❌ WORKFLOW FAILED!');
        if (axios.isAxiosError(error)) {
            console.log('Status:', error.response?.status);
            console.log('Error:', JSON.stringify(error.response?.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        return { success: false, error };
    }
}

simulateDriverApprovalFlow().then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('SIMULATION COMPLETED');
    console.log('='.repeat(60));
    process.exit(result.success ? 0 : 1);
});
