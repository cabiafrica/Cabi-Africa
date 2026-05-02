const axios = require('axios');

async function testLogin() {
    const data = {
        email: 'passenger@test.com',
        password: 'Password123!'
    };

    console.log('Testing login for passenger@test.com...');
    try {
        const response = await axios.post('http://localhost:3333/api/auth/login', data);
        console.log('--- LOGIN SUCCESS ---');
        console.log('Status Code:', response.status);
        if (response.data.accessToken || response.data.token) {
            console.log('Auth Token Received: YES');
        }
        console.log('User Profile:', JSON.stringify(response.data.user || response.data.profile || 'Profile data missing', null, 2));
    } catch (error) {
        console.error('--- LOGIN FAILED ---');
        if (error.response) {
            console.error('Error Code:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

testLogin();
