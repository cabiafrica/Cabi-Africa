
const axios = require('axios');

async function testPassengerLogin() {
    try {
        const passengerEmail = 'passenger@test.com';
        const password = 'Prospect@2026';

        console.log(`Attempting login for passenger: ${passengerEmail}`);
        const loginRes = await axios.post('http://localhost:3333/api/auth/login', {
            email: passengerEmail,
            password: password
        });

        console.log('Login successful! Passenger authenticated.');
        console.log('User Data:', JSON.stringify(loginRes.data.user, null, 2));

        return loginRes.data;
    } catch (error) {
        console.error('❌ Passenger login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
            if (error.code) console.error('Error Code:', error.code);
        }
    }
}

testPassengerLogin();
