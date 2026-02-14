
const axios = require('axios');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRideFlow() {
    try {
        console.log('🚀 Starting Ride Flow Test...');

        // 1. Login Driver
        console.log('\n🔐 Logging in Driver...');
        const driverEmail = 'driver@test.com';
        const driverPassword = 'Prospect@2026';
        let driverAuth;
        try {
            const driverRes = await axios.post('http://localhost:3333/api/auth/login', {
                email: driverEmail,
                password: driverPassword
            });
            driverAuth = driverRes.data.user;
            console.log(`✅ Driver Logged In: ${driverAuth.fullName} (Profile ID: ${driverAuth.driverProfileId})`);
        } catch (e) {
            console.error('❌ Driver Login Failed:', e.message);
            return;
        }

        // 2. Login Passenger
        console.log('\n🔐 Logging in Passenger...');
        const passengerEmail = 'passenger@test.com';
        const passengerPassword = 'Prospect@2026';
        let passengerAuth;
        try {
            const passengerRes = await axios.post('http://localhost:3333/api/auth/login', {
                email: passengerEmail,
                password: passengerPassword
            });
            passengerAuth = passengerRes.data.user;
            console.log(`✅ Passenger Logged In: ${passengerAuth.fullName} (ID: ${passengerAuth.id})`);
        } catch (e) {
            console.error('❌ Passenger Login Failed:', e.message);
            return;
        }

        // 3. Create Ride (Passenger)
        console.log('\n🚖 Passenger Requesting Ride...');
        let rideId;
        try {
            const rideRes = await axios.post('http://localhost:3333/api/rides', {
                passengerId: passengerAuth.id,
                pickup: { lat: -1.2921, lng: 36.8219, address: "Kenyatta Ave, Nairobi" },
                dropoff: { lat: -1.2646, lng: 36.8048, address: "Westlands, Nairobi" },
                vehicleType: "Standard" // Assuming 'Standard' is a valid type, or remove if optional/unknown
            });
            rideId = rideRes.data.id;
            console.log(`✅ Ride Created! ID: ${rideId}`);
            console.log(`Current Status: ${rideRes.data.status}`);
        } catch (e) {
            console.error('❌ Create Ride Failed:');
            if (e.response) console.error(e.response.data);
            else console.error(e.message);
            return;
        }

        // Wait a moment for any async matching
        await delay(2000);

        // 4. Accept Ride (Driver)
        // We need to handle the case where it might have been auto-assigned OR successfully requested
        console.log('\n🤝 Driver Accepting Ride...');
        try {
            const acceptRes = await axios.post(`http://localhost:3333/api/rides/${rideId}/accept`, {
                driverId: driverAuth.driverProfileId
            });
            console.log(`✅ Ride Accepted! Status: ${acceptRes.data.status}`);
        } catch (e) {
            // If it failed, check if it's because it's already assigned
            if (e.response && e.response.status === 500 && e.response.data.message === 'Ride is not available') {
                console.log('⚠️ Accept failed (Ride not available). Checking if already assigned...');
                // Refresh ride
                try {
                    const currentRideRes = await axios.get(`http://localhost:3333/api/rides/current?userId=${passengerAuth.id}&role=PASSENGER`);
                    if (currentRideRes.data && currentRideRes.data.id === rideId) {
                        if (currentRideRes.data.driverId === driverAuth.driverProfileId) {
                            console.log('✅ Ride was auto-assigned to our driver!');
                        } else {
                            console.log(`❌ Ride assigned to DIFFERENT driver: ${currentRideRes.data.driverId}`);
                            return;
                        }
                    } else {
                        console.error('❌ Could not fetch current ride to verify assignment.');
                        return;
                    }
                } catch (err) {
                    console.error('❌ Failed to check ride status:', err.message);
                    return;
                }
            } else {
                console.error('❌ Accept Ride Failed:');
                if (e.response) console.error(e.response.data);
                else console.error(e.message);

                // Try to get ride details to debug
                try {
                    const debugRide = await axios.get(`http://localhost:3333/api/rides/current?userId=${passengerAuth.id}&role=PASSENGER`);
                    console.log('Debug Ride Info:', JSON.stringify(debugRide.data, null, 2));
                } catch (debugErr) { }

                return;
            }
        }

        // 5. Start Ride
        console.log('\n▶️ Driver Starting Ride...');
        try {
            // Using PATCH /rides/:id/status with status='IN_PROGRESS'
            const startRes = await axios.patch(`http://localhost:3333/api/rides/${rideId}/status`, {
                status: 'IN_PROGRESS'
            });
            console.log(`✅ Ride Started! Status: ${startRes.data.status}`);
        } catch (e) {
            console.error('❌ Start Ride Failed:');
            if (e.response) console.error(e.response.data);
            else console.error(e.message);
            return;
        }

        await delay(2000);

        // 6. Complete Ride
        console.log('\n🏁 Driver Completing Ride...');
        try {
            // Using PATCH /rides/:id/complete
            const completeRes = await axios.patch(`http://localhost:3333/api/rides/${rideId}/complete`);
            console.log(`✅ Ride Completed! Status: ${completeRes.data.status}`);
            // Note: Current simplified service might not return fare in the same way, let's check
            if (completeRes.data.fare) console.log(`💰 Fare: ${completeRes.data.fare}`);
        } catch (e) {
            console.error('❌ Complete Ride Failed:');
            if (e.response) console.error(e.response.data);
            else console.error(e.message);
            return;
        }

        console.log('\n✨ Ride Flow Test Completed Successfully! ✨');

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

testRideFlow();
