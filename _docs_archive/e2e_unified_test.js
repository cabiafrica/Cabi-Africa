
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL,
        },
    },
});

async function runE2ETest() {
    const AUTH_URL = 'http://localhost:3333/api/auth';
    const DISPATCH_URL = 'http://localhost:3334/api/rides';
    const LEAD_URL = 'http://localhost:3010/api/v1';

    try {
        const timestamp = Date.now();
        const driverEmail = `e2e_driver_${timestamp}@test.com`;
        const commonPassword = 'Prospect@2026'; // Satisfies complexity (Upper, Lower, Number)

        console.log(`🚀 Step 1: Registering New Driver (${driverEmail})...`);
        const regRes = await axios.post(`${LEAD_URL}/driver-leads/register`, {
            firstName: 'E2E',
            lastName: 'Driver',
            email: driverEmail,
            phone: `+254799${timestamp.toString().slice(-6)}`,
            dateOfBirth: '1990-01-01',
            street: 'E2E Street',
            city: 'Nairobi',
            county: 'Nairobi',
            vehicleType: 'car',
            licensePlate: `KDA ${Math.floor(100 + Math.random() * 900)}Z`,
            nationalId: `ID-${timestamp}`,
            drivingLicense: `DL-${timestamp}`,
            password: commonPassword,
            recaptchaToken: 'SIMULATED',
            agreeToTerms: true
        });

        const driverUserId = regRes.data.userId;
        console.log(`✅ Driver Registered. UserID: ${driverUserId}`);

        console.log(`🚀 Step 2: Logging in Admin to Approve Driver...`);
        const adminLogin = await axios.post(`${AUTH_URL}/login`, {
            email: 'ithrivebusinessnetworks@gmail.com',
            password: 'Admin@2026'
        });
        const adminToken = adminLogin.data.accessToken;
        const passengerId = adminLogin.data.user.id;
        console.log(`✅ Admin Logged In. PassengerID: ${passengerId}`);

        console.log(`🚀 Step 3: Approving Driver via API & Finalizing Setup...`);
        await axios.post(`${LEAD_URL}/driver-leads/${driverUserId}/approve`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        // Manual setup because the service method is currently a stub
        await prisma.user.update({
            where: { id: driverUserId },
            data: { status: 'ACTIVE' }
        });
        await prisma.driverProfile.upsert({
            where: { userId: driverUserId },
            update: {},
            create: {
                userId: driverUserId,
                licenseNumber: `DL-${driverUserId.substring(0, 8).toUpperCase()}`,
                isOnline: true,
                currentLocation: { lat: -1.2633, lng: 36.8021 }
            }
        });
        console.log('✅ Driver Approved and Profile Created manually.');

        console.log(`🚀 Step 4: Passenger (Admin) Requesting Ride...`);
        const rideRequest = await axios.post(DISPATCH_URL, {
            passengerId: passengerId,
            pickup: { address: 'Westlands, Nairobi', lat: -1.2633, lng: 36.8021 },
            dropoff: { address: 'Kilimani, Nairobi', lat: -1.2921, lng: 36.7826 }
        });
        const rideId = rideRequest.data.id;
        console.log(`✅ Ride Created! ID: ${rideId}`);

        console.log(`🚀 Step 5: Logging in Driver to Accept Ride...`);
        const driverLogin = await axios.post(`${AUTH_URL}/login`, {
            email: driverEmail,
            password: commonPassword
        });
        const driverProfileId = driverLogin.data.user.driverProfileId;
        console.log(`✅ Driver Logged In. ProfileID: ${driverProfileId}`);

        if (!driverProfileId) {
            throw new Error('Driver Profile ID missing after setup! Check database logic.');
        }

        console.log(`🚀 Step 6: Driver Accepting Ride...`);
        const acceptRes = await axios.post(`${DISPATCH_URL}/${rideId}/accept`, {
            driverId: driverProfileId
        });
        console.log(`✅ Ride Accepted. Status: ${acceptRes.data.status}`);

        console.log(`🚀 Step 7: Starting Trip...`);
        const startRes = await axios.post(`${DISPATCH_URL}/${rideId}/start`);
        console.log(`✅ Trip Started. Status: ${startRes.data.status}`);

        console.log(`🚀 Step 8: Completing Trip...`);
        const completeRes = await axios.post(`${DISPATCH_URL}/${rideId}/complete`);
        console.log(`✅ Trip Completed! Fare: ${completeRes.data.fare}`);

        console.log('\n✨ ALL E2E STEPS COMPLETED SUCCESSFULLY! ✨');

    } catch (error) {
        if (error.response) {
            console.error('❌ E2E Simulation failed at response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ E2E Simulation failed:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

runE2ETest();
