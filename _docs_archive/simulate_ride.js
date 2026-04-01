
const axios = require('axios');

async function simulateRideCycle() {
    try {
        // 1. Login Admin (to get passenger ID)
        console.log('1️⃣ Logging in Admin (Passenger)...');
        const adminLogin = await axios.post('http://localhost:3333/api/auth/login', {
            email: 'ithrivebusinessnetworks@gmail.com',
            password: 'Admin@2026'
        });
        const adminId = adminLogin.data.user.id;
        console.log(`Admin ID: ${adminId}`);

        // 2. Create Ride Request
        console.log('2️⃣ Creating Ride Request...');
        const rideRequest = await axios.post('http://localhost:3334/api/rides', {
            passengerId: adminId,
            pickup: { address: 'Westlands, Nairobi', lat: -1.2633, lng: 36.8021 },
            dropoff: { address: 'Kilimani, Nairobi', lat: -1.2921, lng: 36.7826 }
        });
        const rideId = rideRequest.data.id;
        console.log(`Ride Created! ID: ${rideId}`);

        // 3. Login Driver
        console.log('3️⃣ Logging in Driver...');
        const driverEmail = 'driver@test.com';
        const driverLogin = await axios.post('http://localhost:3333/api/auth/login', {
            email: driverEmail,
            password: 'Prospect@2026'
        });
        const driverProfileId = driverLogin.data.user.driverProfileId;
        console.log(`Driver Profile ID: ${driverProfileId}`);

        if (!driverProfileId) {
            throw new Error('Driver Profile ID not found in login response. Ensure driver setup is complete.');
        }

        // 4. Driver Accept Ride
        console.log('4️⃣ Driver Accepting Ride...');
        const acceptRes = await axios.post(`http://localhost:3334/api/rides/${rideId}/accept`, {
            driverId: driverProfileId
        });
        console.log(`Acceptance Response: Status=${acceptRes.data.status}, DriverID=${acceptRes.data.driverId}`);

        // 5. Start Ride
        console.log('5️⃣ Starting Ride...');
        const startRes = await axios.post(`http://localhost:3334/api/rides/${rideId}/start`);
        console.log(`Start Response: Status=${startRes.data.status}`);

        // 6. Complete Ride
        console.log('6️⃣ Completing Ride...');
        const completeRes = await axios.post(`http://localhost:3334/api/rides/${rideId}/complete`);
        console.log(`Complete Response: Status=${completeRes.data.status}, Fare=${completeRes.data.fare}`);

        console.log('\n✅ E2E Ride Cycle Simulation Completed Successfully!');
    } catch (error) {
        if (error.response) {
            console.error('❌ E2E Simulation failed:', error.response.data);
        } else {
            console.error('❌ E2E Simulation failed:', error.message);
        }
    }
}

simulateRideCycle();
