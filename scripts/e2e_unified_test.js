const axios = require('axios');
const { randomBytes } = require('crypto');

const AUTH_URL = 'http://localhost:3335/api';
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
        const passRegRes = await axios.post(`${AUTH_URL}/auth/register`, {
            email: passEmail, password, role: 'passenger', firstName: 'Test', lastName: 'Passenger', phone: `+254700${randomNum()}`
        });
        const passengerId = passRegRes.data.id || passRegRes.data.userId || (passRegRes.data.user && passRegRes.data.user.id);
        
        const passLogin = await axios.post(`${AUTH_URL}/auth/login`, { email: passEmail, password });
        const passToken = passLogin.data.token;
        console.log(`✅ Passenger ID: ${passengerId}`);

        // 2. Create & Login Driver
        console.log(`\n🚗 Creating Driver: ${driverEmail}`);
        const driverRegRes = await axios.post(`${AUTH_URL}/auth/register`, {
            email: driverEmail, password, role: 'driver', firstName: 'Test', lastName: 'Driver', phone: `+254711${randomNum()}`, licenseNumber: `LIC${randomStr()}`
        });
        const driverId = driverRegRes.data.id || driverRegRes.data.userId || (driverRegRes.data.user && driverRegRes.data.user.id);
        const driverProfileId = driverRegRes.data.driverProfileId || (driverRegRes.data.user && driverRegRes.data.user.driverProfileId) || (driverRegRes.data.driver && driverRegRes.data.driver.id);

        const driverLogin = await axios.post(`${AUTH_URL}/auth/login`, { email: driverEmail, password });
        console.log('DEBUG: Driver Login Response:', JSON.stringify(driverLogin.data, null, 2));
        const driverToken = driverLogin.data.token;
        const resolvedDriverProfileId = driverProfileId || (driverLogin.data.user && driverLogin.data.user.driverProfile && driverLogin.data.user.driverProfile.id);
        console.log(`✅ Driver Profile ID: ${resolvedDriverProfileId}`);

        if (!resolvedDriverProfileId) {
            console.error('❌ Failed to resolve Driver Profile ID');
            process.exit(1);
        }

        // Verify Driver (Internal DB update to bypass safety check)
        const { execSync } = require('child_process');
        console.log(`\n🛡️ Verifying Driver: ${resolvedDriverProfileId}`);
        execSync(`node scripts/verify-driver.js ${resolvedDriverProfileId}`, { stdio: 'inherit' });
        console.log('✅ Driver Biometricly Verified');

        // Set Driver Online
        console.log(`\n📡 Setting Driver Online: ${resolvedDriverProfileId}`);
        await axios.post(`${DISPATCH_URL}/dispatch/drivers/${resolvedDriverProfileId}/toggle-status`, { isOnline: true });
        console.log('✅ Driver Status Toggled');
        await axios.post(`${DISPATCH_URL}/dispatch/drivers/${resolvedDriverProfileId}/location`, { lat: -1.2921, lng: 36.8219 });
        console.log('✅ Driver Location Updated');

        // 3. Passenger Requests Ride
        console.log('\n📍 Requesting Ride...');
        const rideRes = await axios.post(`${DISPATCH_URL}/rides`, {
            passengerId: passengerId,
            pickupLocation: { lat: -1.2921, lng: 36.8219, address: 'Nairobi CBD' },
            dropoffLocation: { lat: -1.2650, lng: 36.8020, address: 'Westlands' },
            vehicleType: "STANDARD",
            fare: 500.0
        }, { headers: { Authorization: `Bearer ${passToken}` } });

        const rideId = rideRes.data.id;
        console.log(`✅ Ride Created: ${rideId} (Status: ${rideRes.data.status})`);

        // 4. Driver Accepts Ride
        console.log('\n👍 Driver Accepting Ride...');
        const acceptRes = await axios.post(`${DISPATCH_URL}/rides/${rideId}/accept`, { driverId: resolvedDriverProfileId }, {
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

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

runE2ETest();
