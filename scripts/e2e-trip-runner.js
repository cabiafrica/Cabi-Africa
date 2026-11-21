const axios = require('axios');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const http = require('http');
const prisma = new PrismaClient();
const BASE_URL = process.env.API_URL || 'http://192.168.100.35:3334/api';
axios.defaults.timeout = 15000;
axios.defaults.httpAgent = new http.Agent({ keepAlive: false });
const ADB_PATH = 'D:\\IBN\\MAD\\android\\Sdk\\platform-tools\\adb.exe';
let EMULATOR_ID = 'emulator-5554';
try {
  const devOut = execSync(`"${ADB_PATH}" devices`, { encoding: 'utf8' });
  const m = devOut.match(/(emulator-\d+)\s+device/);
  if (m) EMULATOR_ID = m[1];
} catch (e) {}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function captureScreenshot(filename) {
  try {
    const remotePath = `/data/local/tmp/${filename}`;
    const localDir = path.join(__dirname, '..', 'docs', 'screenshots');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(localDir, filename);

    execSync(`"${ADB_PATH}" -s ${EMULATOR_ID} shell screencap -p ${remotePath}`, { stdio: 'ignore', timeout: 6000 });
    execSync(`"${ADB_PATH}" -s ${EMULATOR_ID} pull ${remotePath} "${localPath}"`, { stdio: 'ignore', timeout: 6000 });
    console.log(`  📸 Screenshot saved: docs/screenshots/${filename}`);
  } catch (err) {
    console.warn(`  ⚠️ Screenshot capture warning for ${filename}:`, err.message);
  }
}

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

async function runEndToEndSimulation() {
  console.log('================================================================');
  console.log('🚀 CABI AFRICA — FULL END-TO-END TRIP SIMULATION WITH SCREENSHOTS');
  console.log('================================================================\n');

  try {
    // Phase 1: Authentication
    console.log('─── Phase 1: Authentication & Setup ───');
    console.log('👤 Logging in Passenger (passenger@test.com)...');
    const passLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'passenger@test.com',
      password: 'Password123!',
    });
    const passToken = passLogin.data.token;
    const passengerId = passLogin.data.user.id;
    console.log(`   ✅ Passenger Token obtained. User ID: ${passengerId}`);

    console.log('🚗 Logging in Driver (driver@test.com)...');
    const driverLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'driver@test.com',
      password: 'Password123!',
    });
    const driverToken = driverLogin.data.token;
    const driverProfile = driverLogin.data.user?.driverProfile;
    if (!driverProfile) {
      throw new Error('No driverProfile found for driver@test.com');
    }
    const driverProfileId = driverProfile.id;
    console.log(`   ✅ Driver Token obtained. DriverProfile ID: ${driverProfileId}`);

    // Clear stale rides
    console.log('\n🧹 Clearing any unfinished active rides...');
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
    console.log('   ✅ Previous rides reset to CANCELLED.');

    // Phase 2: Online Driver & Location Setup
    console.log('\n─── Phase 2: Driver Presence & Position ───');
    console.log(`📡 Positioning driver at ${WAYPOINTS[0].name}...`);
    await axios.post(`${BASE_URL}/dispatch/drivers/${driverProfileId}/toggle-status`, {
      isOnline: true,
    });
    await axios.post(`${BASE_URL}/dispatch/drivers/${driverProfileId}/location`, {
      lat: WAYPOINTS[0].lat,
      lng: WAYPOINTS[0].lng,
    });
    console.log('   ✅ Driver is ONLINE and active in Nairobi CBD.');
    await sleep(1500);
    captureScreenshot('30_driver_online_ready.png');

    // Phase 3: Create Ride Request (Passenger CBD -> JKIA)
    console.log('\n─── Phase 3: Passenger Creates Ride Request ───');
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
    const estimatedFare = 1850.0;

    console.log(`📍 Requesting Standard Ride: ${pickupLoc.address} -> ${dropoffLoc.address}`);
    const rideRes = await axios.post(
      `${BASE_URL}/rides`,
      {
        passengerId,
        pickupLocation: pickupLoc,
        dropoffLocation: dropoffLoc,
        vehicleType: 'STANDARD',
        fare: estimatedFare,
        isVerifiedPassenger: true,
      },
      { headers: { Authorization: `Bearer ${passToken}` } }
    );
    const rideId = rideRes.data.id;
    console.log(`   ✅ Ride Created! Ride ID: ${rideId}, Status: ${rideRes.data.status}`);
    await sleep(2500);
    captureScreenshot('31_driver_incoming_offer.png');

    // Phase 4: Driver Accepts Ride
    console.log('\n─── Phase 4: Driver Acceptance ───');
    console.log(`👍 Driver accepting Ride ID: ${rideId}...`);
    const acceptRes = await axios.post(
      `${BASE_URL}/rides/${rideId}/accept`,
      { driverId: driverProfileId },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`   ✅ Ride Accepted! Status: ${acceptRes.data.status}`);
    await sleep(2500);
    captureScreenshot('32_driver_accepted_navigation.png');

    // Phase 5: Driver Arrives at Pickup Location
    console.log('\n─── Phase 5: Driver Arrival at Pickup ───');
    console.log('📍 Driver arrives at Kenyatta Avenue...');
    const arriveRes = await axios.post(
      `${BASE_URL}/rides/${rideId}/arrive`,
      {},
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`   ✅ Driver Arrived! Status: ${arriveRes.data.status}`);
    await sleep(2500);
    captureScreenshot('33_driver_arrived_hud.png');

    // Phase 6: Start Trip
    console.log('\n─── Phase 6: Trip Start ───');
    console.log('🚦 Passenger boarded, starting trip towards JKIA...');
    const startRes = await axios.post(
      `${BASE_URL}/rides/${rideId}/start`,
      {},
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`   ✅ Trip Started! Status: ${startRes.data.status}`);
    await sleep(2500);
    captureScreenshot('34_trip_started_live.png');

    // Phase 7: GPS Waypoint Telemetry Simulation
    console.log('\n─── Phase 7: Live GPS Telemetry Along Expressway ───');
    for (let i = 1; i < WAYPOINTS.length; i++) {
      const wp = WAYPOINTS[i];
      console.log(`   🛣️  Waypoint ${i}/${WAYPOINTS.length - 1}: Passing ${wp.name} (${wp.lat}, ${wp.lng})...`);
      
      await axios.post(`${BASE_URL}/dispatch/drivers/${driverProfileId}/location`, {
        lat: wp.lat,
        lng: wp.lng,
      });

      await prisma.driverProfile.update({
        where: { id: driverProfileId },
        data: { currentLocation: { lat: wp.lat, lng: wp.lng } },
      });

      // Capture screenshot halfway through trip (Panari Sky Centre)
      if (i === 4) {
        console.log('   📸 Capturing mid-route Expressway HUD snapshot...');
        await sleep(1500);
        captureScreenshot('35_trip_expressway_telemetry.png');
      }
      await sleep(1500);
    }

    // Phase 8: Arrive at JKIA & Complete Trip
    console.log('\n─── Phase 8: Arrival at JKIA & Trip Completion ───');
    console.log('🏁 Arrived at JKIA Terminal 1A! Completing trip...');
    const completeRes = await axios.post(
      `${BASE_URL}/rides/${rideId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log(`   ✅ Trip COMPLETED! Status: ${completeRes.data.status}, Final Fare: KES ${completeRes.data.fare}`);
    await sleep(2500);
    captureScreenshot('36_trip_completed_fare_summary.png');

    // Phase 9: Payment Settlement
    console.log('\n─── Phase 9: Payment Settlement ───');
    console.log(`💵 Confirming Cash / M-Pesa payment of KES ${estimatedFare}...`);
    await axios.post(
      `${BASE_URL}/rides/${rideId}/confirm-cash`,
      { amount: estimatedFare },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log('   ✅ Payment settled and confirmed.');
    await sleep(2000);
    captureScreenshot('37_payment_receipt_settled.png');

    // Phase 10: Ratings & Reviews
    console.log('\n─── Phase 10: Ratings & Feedback ───');
    console.log('⭐ Submitting 5-star passenger rating with review...');
    await axios.post(
      `${BASE_URL}/rides/${rideId}/rate`,
      { rating: 5, comment: 'Punctual passenger, very pleasant airport commute!' },
      { headers: { Authorization: `Bearer ${driverToken}` } }
    );
    console.log('   ✅ 5-Star Rating successfully recorded.');
    await sleep(2000);
    captureScreenshot('38_trip_rated_final.png');

    console.log('\n================================================================');
    console.log('🎉 FULL END-TO-END TRIP SIMULATION EXECUTED WITH 100% SUCCESS!');
    console.log('================================================================');

  } catch (error) {
    if (error.response) {
      console.error('\n❌ API Error during simulation:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('\n❌ Error during simulation:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndSimulation();
