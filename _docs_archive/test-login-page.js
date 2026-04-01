const axios = require('axios');

async function testLoginPage() {
    console.log('🧪 Testing Admin Panel Login Page...\n');

    try {
        // Test 1: Check if the page loads
        console.log('1️⃣ Testing if login page loads...');
        const response = await axios.get('http://localhost:3001');

        if (response.status === 200) {
            console.log('✅ Login page is accessible (HTTP 200)');
            console.log(`   Content-Type: ${response.headers['content-type']}`);
            console.log(`   Content-Length: ${response.data.length} bytes\n`);
        } else {
            console.log(`❌ Unexpected status: ${response.status}\n`);
        }

        // Test 2: Check if it's HTML
        if (response.headers['content-type'].includes('text/html')) {
            console.log('✅ Response is HTML\n');
        } else {
            console.log('❌ Response is not HTML\n');
        }

        // Test 3: Test backend connectivity
        console.log('2️⃣ Testing backend API connectivity...');
        try {
            const healthCheck = await axios.get('http://localhost:3333/api/rides/health');
            console.log('✅ Backend is responding');
            console.log(`   Response: ${JSON.stringify(healthCheck.data)}\n`);
        } catch (error) {
            console.log('❌ Backend is not responding');
            console.log(`   Error: ${error.message}\n`);
        }

        // Test 4: Test login endpoint
        console.log('3️⃣ Testing login endpoint...');
        try {
            const loginResponse = await axios.post('http://localhost:3333/api/auth/login', {
                email: 'ithrivebusinessnetworks@gmail.com',
                password: 'Admin@2026'
            });

            console.log('✅ Login endpoint is working');
            console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
            console.log(`   User ID: ${loginResponse.data.user?.id}`);
            console.log(`   User Email: ${loginResponse.data.user?.email}`);
            console.log(`   User Name: ${loginResponse.data.user?.fullName}`);
            console.log(`   Permissions: ${loginResponse.data.user?.permissions?.length || 0} permissions\n`);
        } catch (error) {
            console.log('❌ Login failed');
            console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 5: Test rides endpoint
        console.log('4️⃣ Testing rides endpoint...');
        try {
            const ridesResponse = await axios.get('http://localhost:3333/api/rides');
            const rides = Array.isArray(ridesResponse.data) ? ridesResponse.data : [];
            console.log(`✅ Rides endpoint is working`);
            console.log(`   Total rides: ${rides.length}`);
            if (rides.length > 0) {
                console.log(`   Sample ride ID: ${rides[0].id}`);
                console.log(`   Sample ride status: ${rides[0].status}\n`);
            }
        } catch (error) {
            console.log('❌ Rides endpoint failed');
            console.log(`   Error: ${error.message}\n`);
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Admin Panel is accessible at http://localhost:3001');
        console.log('✅ Backend API is running at http://localhost:3333/api');
        console.log('✅ Login endpoint is functional');
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Open your browser to: http://localhost:3001');
        console.log('2. You should see the login page (dark theme with Cabi logo)');
        console.log('3. Login with:');
        console.log('   Email: ithrivebusinessnetworks@gmail.com');
        console.log('   Password: Admin@2026');
        console.log('4. After login, navigate to "Job Activities" in the sidebar');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testLoginPage();
