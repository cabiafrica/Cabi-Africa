
const axios = require('axios');

async function testDriverLogin() {
    try {
        const driverEmail = 'pending_driver_1769722821923@test.com';
        const password = 'Prospect@2026';

        console.log(`Attempting login for driver: ${driverEmail}`);
        const loginRes = await axios.post('http://localhost:3333/api/auth/login', {
            email: driverEmail,
            password: password
        });

        console.log('Login successful! Driver authenticated.');
        console.log('User Data:', JSON.stringify(loginRes.data.user, null, 2));

        return loginRes.data;
    } catch (error) {
        console.error('❌ Driver login failed:', error.response?.data || error.message);
    }
}

testDriverLogin();
