const axios = require('axios');

async function main() {
    // 1. Register Passenger
    console.log('Registering Passenger...');
    const passengerData = {
        firstName: 'EndToEnd',
        lastName: 'TestUser',
        email: `e2e.test.${Date.now()}@cabi.com`,
        phone: '+2547' + Math.floor(10000000 + Math.random() * 90000000),
        password: 'Password123!',
        role: 'passenger'
    };

    try {
        const regResponse = await axios.post('http://localhost:3335/api/auth/register', passengerData);
        const userId = regResponse.data.id || (regResponse.data.user && regResponse.data.user.id) || regResponse.data.userId;

        if (!userId) {
            console.error("Failed to get User ID from registration response:", regResponse.data);
            process.exit(1);
        }

        console.log('Passenger Created:', userId);

        // 2. Create Ride Request
        console.log('Creating Ride Request...');
        const rideData = {
            passengerId: userId,
            pickup: { lat: -1.2921, lng: 36.8219, address: "Nairobi West" },
            dropoff: { lat: -1.2864, lng: 36.8172, address: "City Hall" },
            vehicleType: "STANDARD",
            fare: 450.0
        };

        const rideResponse = await axios.post('http://localhost:3334/api/rides', rideData);
        console.log('Ride Request Created:', rideResponse.data.id || rideResponse.data);
        console.log('SUCCESS: End-to-End Test (Passenger side) passed.');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 404) {
            console.error("Endpoint not found. Check URLs.");
        }
        process.exit(1);
    }
}

main();
