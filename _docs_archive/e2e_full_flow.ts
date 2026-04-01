
import axios from 'axios';
import { randomBytes } from 'crypto';

const AUTH_URL = 'http://localhost:3333/api';
const DISPATCH_URL = 'http://localhost:3334/api';

async function runE2ETest() {
    console.log('🚀 Starting Full Lifecycle E2E Test...');

    try {
        const randomNum = () => Math.floor(100000 + Math.random() * 900000).toString();
        const randomStr = () => randomBytes(4).toString('hex');
        const passEmail = `pass_${randomStr()}@test.com`;
        const driverEmail = `driver_${randomStr()}@test.com`;
        const password = 'Password123!';

        // 1. Create & Login Passenger
        console.log(`\n👤 Creating Passenger: ${passEmail}`);
        await axios.post(`${AUTH_URL}/auth/register`, {
            email: passEmail, password, role: 'passenger', firstName: 'Test', lastName: 'Passenger', phone: `+254700${randomNum()}`
        });
        const passLogin = await axios.post(`${AUTH_URL}/auth/login`, { email: passEmail, password });
        const passToken = passLogin.data.token;
        const passengerId = passLogin.data.user.id;
        console.log(`✅ Passenger ID: ${passengerId}`);

        // 2. Create & Login Driver
        console.log(`\n🚗 Creating Driver: ${driverEmail}`);
        await axios.post(`${AUTH_URL}/auth/register`, {
            email: driverEmail, password, role: 'driver', firstName: 'Test', lastName: 'Driver', phone: `+254711${randomNum()}`, licenseNumber: `LIC${randomStr()}`
        });
        const driverLogin = await axios.post(`${AUTH_URL}/auth/login`, { email: driverEmail, password });
        const driverToken = driverLogin.data.token;
        const driverProfileId = driverLogin.data.user.driverProfileId;
        console.log(`✅ Driver Profile ID: ${driverProfileId}`);

        // Set Driver Online
        await axios.post(`${DISPATCH_URL}/dispatch/drivers/${driverProfileId}/toggle-status`, { isOnline: true });
        await axios.post(`${DISPATCH_URL}/dispatch/drivers/${driverProfileId}/location`, { lat: -1.2921, lng: 36.8219 }); // CBD
        console.log('✅ Driver is Online and Located');

        // 3. Passenger Requests Ride
        console.log('\n📍 Requesting Ride...');
        const rideRes = await axios.post(`${DISPATCH_URL}/rides`, {
            passengerId: passengerId,
            pickup: { lat: -1.2921, lng: 36.8219, address: 'Nairobi CBD' }, // Same as driver
            dropoff: { lat: -1.2650, lng: 36.8020, address: 'Westlands' }
        }, { headers: { Authorization: `Bearer ${passToken}` } });

        const rideId = rideRes.data.id;
        console.log(`✅ Ride Created: ${rideId} (Status: ${rideRes.data.status})`);

        // 4. Driver Accepts Ride (Using RideController endpoint)
        console.log('\n👍 Driver Accepting Ride...');
        const acceptRes = await axios.post(`${DISPATCH_URL}/rides/${rideId}/accept`, { driverId: driverProfileId }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log(`✅ Ride Accepted. Status: ${acceptRes.data.status}`);

        // 5. Driver Starts Trip
        console.log('\n▶️ Driver Starting Trip...');
        const startRes = await axios.post(`${DISPATCH_URL}/rides/${rideId}/start`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log(`✅ Trip Started. Status: ${startRes.data.status}`);

        // 6. Driver Completes Trip
        console.log('\n🏁 Driver Completing Trip...');
        const completeRes = await axios.post(`${DISPATCH_URL}/rides/${rideId}/complete`, {}, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        console.log(`✅ Trip Completed. Status: ${completeRes.data.status}, Fare: ${completeRes.data.fare}`);

        console.log('\n🎉 FULL E2E TEST PASSED! The app flow is verified.');

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('❌ API Error:', error.response?.status, error.response?.data);
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

runE2ETest();
