const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const AUTH_URL = 'http://localhost:3333/api';
const DISPATCH_URL = 'http://localhost:3334/api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WAYPOINTS = [
  { name: 'Kenyatta Avenue (Pickup - CBD)', lat: -1.286389, lng: 36.817223 },
  { name: 'Haile Selassie / Uhuru Highway Roundabout', lat: -1.2915, lng: 36.8245 },
  { name: 'Nyayo National Stadium', lat: -1.3032, lng: 36.8347 },
  { name: 'Mombasa Road / Belle Vue (South C)', lat: -1.3204, lng: 36.8538 },
  { name: 'Panari Sky Centre (Mombasa Road)', lat: -1.3325, lng: 36.8711 },
  { name: 'SGR Syokimau / JKIA Junction', lat: -1.3412, lng: 36.8920 },
  { name: 'JKIA Airport Expressway Toll Plaza', lat: -1.3355, lng: 36.9125 },
  { name: 'Jomo Kenyatta International Airport (JKIA) Terminal 1A', lat: -1.3192, lng: 36.9275 },
];

async function simulateJkiaTrip() {
  console.log('====================================================');
  console.log('✈️  CABI AFRICA - LIVE TRIP SIMULATION TO JKIA');
  console.log('====================================================\n');

  try {
    // 1. Authenticate Passenger
    console.log('[1/8] 👤 Logging in Passenger (passenger@test.com)...');
    const passLogin = await axios.post(`${AUTH_URL}/auth/login`, {
      email: 'passenger@test.com',
      password: 'Password123!',
    });
    const passToken = passLogin.data.token;
    const passengerId = passLogin.data.user.id;
    console.log(`  [OK] Authenticated Passenger ID: ${passengerId}`);

    // 2. Authenticate Driver
    console.log('\n[2/8] 🚗 Logging in Driver (driver@test.com)...');
    const driverLogin = await axios.post(`${AUTH_URL}/auth/login`, {
      email: 'driver@test.com',
      password: 'Password123!',
    });
    const driverToken = driverLogin.data.token;
    const driverUser = driverLogin.data.user;
    const driverProfile = driverUser.driverProfile;

    if (!driverProfile) {
      throw new Error('Driver profile not found for driver@test.com');
    }
    const driverProfileId = driverProfile.id;
    console.log(`  [OK] Authenticated Driver Profile ID: ${driverProfileId}`);

    // 3. Clear any existing active rides
    console.log('\n[3/8] 🧹 Clearing previous active rides...');
    await prisma.ride.updateMany({
      where: {
        OR: [
          { driverId: driverProfileId },
          { passengerId: passengerId }
        ],
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      },
      data: { status: 'CANCELLED' }
    });
    console.log('  [OK] Stale rides reset.');

    // 4. Set Driver Online & Initial Position in CBD
    console.log('\n[4/8] 📡 Setting Driver Online & setting position in Nairobi CBD...');
    await axios.post(`${DISPATCH_URL}/dispatch/drivers/${driverProfileId}/toggle-status`, {
      isOnline: true,
    });
    await axios.post(`${DISPATCH_URL}/dispatch/drivers/${driverProfileId}/location`, {
      lat: WAYPOINTS[0].lat,
      lng: WAYPOINTS[0].lng,
    });
    console.log(`  [OK] Driver is ONLINE at ${WAYPOINTS[0].name}`);

    // 5. Create Ride Request from CBD to JKIA
    console.log('\n[5/8] 📍 Passenger requesting trip to JKIA Terminal 1A...');
    const pickupLoc = {
      lat: WAYPOINTS[0].lat,
      lng: WAYPOINTS[0].lng,
      address: 'Kenyatta Avenue, Nairobi CBD',
    };
    const dropoffLoc = {
      lat: WAYPOINTS[WAYPOINTS.length - 1].lat,
      lng: WAYPOINTS[WAYPOINTS.length - 1].lng,
      address: 'Jomo Kenyatta International Airport (JKIA), Terminal 1A',
    };
    const fare = 1850.0;

    const rideRes = await axios.post(
      `${DISPATCH_URL}/rides`,
      {
        passengerId,
        pickupLocation: pickupLoc,
        dropoffLocation: dropoffLoc,
        vehicleType: 'STANDARD',
        fare,
      },
      { headers: { Authorization: `Bearer ${passToken}` } }
    );

    const rideId = rideRes.data.id;
    console.log(`  [OK] Ride Created! Ride ID: ${rideId} (Status: ${rideRes.data.status})`);
    console.log(`  [INFO] Route: ${pickupLoc.address} -> ${dropoffLoc.address}`);
    console.log(`  [INFO] Estimated Fare: KES ${fare.toLocaleString()}`);

    // 6. Driver Accepts Ride
    console.log('\n[6/8] 👍 Driver accepting trip...');
    await sleep(1500);
    const acceptRes = await axios.post(
      `${DISPATCH_URL}/rides/${rideId}/accept`,
      { driverId: driverProfileId },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`  [OK] Ride Accepted! Status: ${acceptRes.data.status}`);

    // 7. Driver Starts Trip
    console.log('\n[7/8] 🚦 Starting trip from Nairobi CBD to JKIA...');
    await sleep(1500);
    const startRes = await axios.post(
      `${DISPATCH_URL}/rides/${rideId}/start`,
      {},
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`  [OK] Trip IN_PROGRESS! Status: ${startRes.data.status}`);

    // 8. Progressively Simulate Movement along Mombasa Road to JKIA
    console.log('\n🛣️  Simulating GPS telemetry along Mombasa Road / Expressway:');
    for (let i = 1; i < WAYPOINTS.length; i++) {
      const wp = WAYPOINTS[i];
      console.log(`   🚗 Step ${i}/${WAYPOINTS.length - 1}: Approaching ${wp.name}...`);
      await axios.post(`${DISPATCH_URL}/dispatch/drivers/${driverProfileId}/location`, {
        lat: wp.lat,
        lng: wp.lng,
      });
      // Also update ride's current coordinates in DB for live tracking
      await prisma.driverProfile.update({
        where: { id: driverProfileId },
        data: { currentLocation: { lat: wp.lat, lng: wp.lng } }
      });
      await sleep(2000);
    }

    // 9. Arrive at JKIA & Complete Trip
    console.log('\n[8/8] 🏁 Arrived at JKIA Terminal 1A! Completing trip...');
    const completeRes = await axios.post(
      `${DISPATCH_URL}/rides/${rideId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`  [OK] Trip COMPLETED! Status: ${completeRes.data.status}, Final Fare: KES ${completeRes.data.fare}`);

    // 10. Confirm Cash Payment
    console.log('\n💵 Confirming Cash / M-Pesa settlement for KES 1,850...');
    await axios.post(
      `${DISPATCH_URL}/rides/${rideId}/confirm-cash`,
      { amount: fare },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log('  [OK] Payment confirmed.');

    // 11. Rate Passenger
    console.log('\n⭐ Submitting 5-star passenger rating...');
    await axios.post(
      `${DISPATCH_URL}/rides/${rideId}/rate`,
      { rating: 5, comment: 'Punctual passenger, smooth airport run!' },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log('  [OK] Rating saved.');

    console.log('\n====================================================');
    console.log('🎉 JKIA TRIP SIMULATION COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error) {
    if (error.response) {
      console.error('\n❌ API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('\n❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

simulateJkiaTrip();
