
const axios = require('axios');

async function testDriverLogin() {
    try {
        const driverEmail = 'driver@test.com';
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
        console.error('❌ Driver login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
            if (error.code) console.error('Error Code:', error.code);
        }
    }
}

testDriverLogin();
