
const fetch = require('node-fetch');

async function test() {
    const response = await fetch('http://localhost:3000/api/driver-leads/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe' + Date.now() + '@example.com',
            phone: '+254700000000',
            city: 'Nairobi',
            vehicleType: 'car',
            nationalId: '12345678',
            agreeToTerms: true,
            recaptchaToken: 'mock-token-for-development'
        }),
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Result:', result);
}

test();
