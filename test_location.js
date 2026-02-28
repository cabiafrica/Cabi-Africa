const axios = require('axios');

async function testLocation() {
    const driverId = '29b2646c-6f7a-4e79-bcdf-fcd33a81ed1c';
    const url = `http://localhost:3334/api/dispatch/drivers/${driverId}/location`;

    console.log(`Sending location update for driver ${driverId}...`);
    try {
        const response = await axios.post(url, {
            lat: -1.286389,
            lng: 36.817223
        });
        console.log('Response:', response.data);

        // Check if updated in DB
        console.log('Verifying in DB...');
        // We'll use verify_db.js logic or just check the driver profile
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testLocation();
