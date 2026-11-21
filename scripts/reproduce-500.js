
const axios = require('axios');

async function testNearbyDrivers() {
    try {
        console.log('Testing nearby-drivers with vehicleType=LITE...');
        const response = await axios.get('http://localhost:3334/api/rides/nearby-drivers', {
            params: {
                pickupLat: -1.286389,
                pickupLng: 36.817223,
                vehicleType: 'LITE'
            },
            timeout: 5000
        });
        console.log('Response LITE:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response LITE:', error.response.status, error.response.data);
        } else {
            console.error('Error LITE:', error.message);
        }
    }

    try {
        console.log('\nTesting nearby-drivers with vehicleType=STANDARD...');
        const response = await axios.get('http://localhost:3334/api/rides/nearby-drivers', {
            params: {
                pickupLat: -1.286389,
                pickupLng: 36.817223,
                vehicleType: 'STANDARD'
            },
            timeout: 5000
        });
        console.log('Response STANDARD:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response STANDARD:', error.response.status, error.response.data);
        } else {
            console.error('Error STANDARD:', error.message);
        }
    }
}

testNearbyDrivers();
