
import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

async function runE2ETest() {
    console.log('🚀 Starting API-Driven E2E Ride Cycle Test...');

    try {
        // 1. Create Passenger
        const passEmail = `pass_${Date.now()}@test.com`;
        console.log(`Creating Passenger: ${passEmail}`);
        await axios.post(`${API_URL}/auth/register`, {
            email: passEmail,
            password: 'Password123!',
            role: 'passenger',
            firstName: 'Test',
            lastName: 'Passenger',
            phone: `+254700${Date.now().toString().slice(-6)}`
        });

        // Login to get token
        const passLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: passEmail,
            password: 'Password123!'
        });
        const passengerToken = passLoginRes.data.token;
        const passengerId = passLoginRes.data.user.id;
        console.log(`✅ Passenger Created & Logged In: ${passengerId}`);

        // 2. Create Driver
        const driverEmail = `driver_${Date.now()}@test.com`;
        console.log(`Creating Driver: ${driverEmail}`);
        await axios.post(`${API_URL}/auth/register`, {
            email: driverEmail,
            password: 'Password123!',
            role: 'driver',
            firstName: 'Test',
            lastName: 'Driver',
            phone: `+254711${Date.now().toString().slice(-6)}`,
            licenseNumber: `LIC${Date.now()}`
        });

        // Login for Driver
        const driverLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: driverEmail,
            password: 'Password123!'
        });
        const driverToken = driverLoginRes.data.token;
        const driverProfileId = driverLoginRes.data.user.driverProfileId; // FIXED PATH
        console.log(`✅ Driver Created & Logged In. Profile ID: ${driverProfileId}`);

        if (!driverProfileId) throw new Error('Driver Profile ID not found in login response');

        // 3. Passenger Requests Ride
        console.log('Requesting Ride...');
        const rideRes = await axios.post(`${API_URL}/rides`, {
            passengerId: passengerId,
            pickup: { lat: -1.2921, lng: 36.8219, address: 'Nairobi CBD' },
            dropoff: { lat: -1.2650, lng: 36.8020, address: 'Westlands' }
        }, {
            headers: { Authorization: `Bearer ${passengerToken}` }
        });

        if (rideRes.data.error) throw new Error(`Ride creation failed: ${JSON.stringify(rideRes.data.error)}`);
        const rideId = rideRes.data.id;
        console.log(`✅ Ride Created. ID: ${rideId}`);

        // 4. Driver Accepts Ride
        console.log('Driver Accepting Ride...');
        const acceptRes = await axios.post(`${API_URL}/rides/${rideId}/accept`, { driverId: driverProfileId }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        if (acceptRes.data.error) throw new Error(`Ride acceptance failed: ${JSON.stringify(acceptRes.data.error)}`);
        console.log('✅ Ride Accepted');

        // 5. Arrived At Pickup
        console.log('Driver Arrived...');
        const arriveRes = await axios.patch(`${API_URL}/rides/${rideId}/status`, { status: 'DRIVER_ARRIVED' }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        if (arriveRes.data.error) throw new Error(`Status update failed: ${JSON.stringify(arriveRes.data.error)}`);

        // 6. Start Trip
        console.log('Starting Trip...');
        const startRes = await axios.patch(`${API_URL}/rides/${rideId}/status`, { status: 'IN_PROGRESS' }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        if (startRes.data.error) throw new Error(`Status update failed: ${JSON.stringify(startRes.data.error)}`);

        // 7. Complete Trip
        console.log('Completing Trip...');
        const completeRes = await axios.patch(`${API_URL}/rides/${rideId}/complete`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        if (completeRes.data.error) throw new Error(`Ride completion failed: ${JSON.stringify(completeRes.data.error)}`);
        console.log('✅ Trip Completed Successfully!');

        // 8. Final Check
        const finalRide = await axios.get(`${API_URL}/rides/${rideId}`, {
            headers: { Authorization: `Bearer ${passengerToken}` }
        });
        console.log('🏁 Final Ride Status:', finalRide.data.status);
        if (finalRide.data.status !== 'COMPLETED') throw new Error('Ride status is not COMPLETED');

        console.log('\n🌟 ALL E2E TEST STEPS PASSED! 🌟');

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ API Error:', error.response?.status, error.response?.data);
        } else {
            console.error('❌ Test Failed:', (error as any).message);
        }
        process.exit(1);
    }
}

runE2ETest();
