/**
 * Test script for Enhanced Ride Matching & Badge System
 * 
 * This script tests:
 * 1. Nearby drivers query with geospatial matching
 * 2. Vehicle type validation
 * 3. Automatic driver assignment
 * 4. Badge awarding on ride completion
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3334/api';
// Optional: Install socket.io-client to enable WebSocket testing
// npm install socket.io-client
let io;
try {
    io = require('socket.io-client');
} catch (e) {
    console.log('⚠️ socket.io-client not found. skipping WebSocket tests.');
}

// Test user IDs (replace with actual IDs from your database)
const PASSENGER_ID = 'test-passenger-id';
const DRIVER_ID = 'test-driver-id';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testNearbyDrivers() {
    console.log('\n🔍 Test 1: Nearby Drivers Query');
    console.log('================================');

    try {
        const response = await axios.get(`${BASE_URL}/dispatch/rides/nearby-drivers`, {
            params: {
                pickupLat: -1.286389,
                pickupLng: 36.817223,
                maxDistanceKm: 5.0,
                vehicleType: 'STANDARD'
            }
        });

        console.log('✅ Nearby drivers found:', response.data.data.length);
        response.data.data.forEach((driver, index) => {
            console.log(`   ${index + 1}. Driver ${driver.driverId} - ${driver.distance}km away (${driver.estimatedArrivalMinutes} min)`);
        });
    } catch (error) {
        console.error('❌ Error details:', error.code, error.message);
        if (error.response) console.error('   Response:', error.response.status, error.response.data);
    }
}

async function testRideCreationWithMatching() {
    console.log('\n🚗 Test 2: Ride Creation with Automatic Matching');
    console.log('================================================');

    try {
        const response = await axios.post(`${BASE_URL}/dispatch/rides`, {
            passengerId: PASSENGER_ID,
            pickupLocation: {
                lat: -1.286389,
                lng: 36.817223,
                address: 'Westlands, Nairobi'
            },
            dropoffLocation: {
                lat: -1.292066,
                lng: 36.821945,
                address: 'Parklands, Nairobi'
            },
            vehicleType: 'STANDARD'
        });

        console.log('✅ Ride created:', response.data.id);
        console.log('   Status:', response.data.status);
        console.log('   Matching started at:', response.data.matchingStartedAt);

        // Wait for matching to complete
        console.log('   Waiting for driver assignment...');
        await delay(3000);

        // Check ride status
        const rideStatus = await axios.get(`${BASE_URL}/dispatch/rides/${response.data.id}`);
        console.log('   Final status:', rideStatus.data.status);
        if (rideStatus.data.driverId) {
            console.log('   Assigned driver:', rideStatus.data.driverId);
            console.log('   Matching duration:', rideStatus.data.matchingDurationMs, 'ms');
        }

        return response.data.id;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testVehicleTypeValidation() {
    console.log('\n🔒 Test 3: Vehicle Type Validation');
    console.log('===================================');

    try {
        // Create ride requesting XL vehicle
        const rideResponse = await axios.post(`${BASE_URL}/dispatch/rides`, {
            passengerId: PASSENGER_ID,
            pickupLocation: { lat: -1.286389, lng: 36.817223, address: 'Westlands' },
            dropoffLocation: { lat: -1.292066, lng: 36.821945, address: 'Parklands' },
            vehicleType: 'XL'
        });

        console.log('✅ Ride created requesting XL vehicle');

        // Try to accept with STANDARD vehicle driver
        try {
            await axios.post(`${BASE_URL}/dispatch/rides/${rideResponse.data.id}/accept`, {
                driverId: DRIVER_ID // Assuming this driver has STANDARD vehicle
            });
            console.log('❌ Vehicle type validation failed - should have rejected');
        } catch (error) {
            if (error.response?.data?.message?.includes('Vehicle type mismatch')) {
                console.log('✅ Vehicle type validation working correctly');
                console.log('   Error:', error.response.data.message);
            } else {
                console.error('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testBadgeSeeding() {
    console.log('\n🏆 Test 4: Badge Seeding');
    console.log('========================');

    try {
        const response = await axios.get(`${BASE_URL}/badges/seed`);
        console.log('✅ Badges seeded successfully');
        console.log('   Message:', response.data.message);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testBadgeRetrieval() {
    console.log('\n📊 Test 5: Badge Retrieval');
    console.log('==========================');

    try {
        const response = await axios.get(`${BASE_URL}/badges/users/${PASSENGER_ID}`);
        console.log('✅ User badges retrieved');

        const earnedBadges = response.data.data.filter(b => b.isEarned);
        const inProgressBadges = response.data.data.filter(b => !b.isEarned && b.progress > 0);

        console.log(`   Earned: ${earnedBadges.length} badges`);
        earnedBadges.forEach(badge => {
            console.log(`      - ${badge.badge.name} (${badge.badge.tier})`);
        });

        console.log(`   In Progress: ${inProgressBadges.length} badges`);
        inProgressBadges.forEach(badge => {
            console.log(`      - ${badge.badge.name}: ${badge.progress}%`);
        });
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testWebSocketBroadcast(driverId) {
    if (!io) return;

    console.log('\n📡 Test 6: WebSocket Broadcast');
    console.log('=============================');

    return new Promise((resolve) => {
        const socket = io('http://localhost:3334/trip-tracking');

        socket.on('connect', () => {
            console.log('✅ Driver connected to WebSocket');
            // 1. Join driver room
            socket.emit('driverJoinRoom', driverId);

            // 2. Set driver online and update location to match pickup
            // This ensures this driver is the best match
            socket.emit('driverGoOnline', driverId);
            socket.emit('updateDriverLocation', {
                driverId: driverId,
                lat: -1.286389, // Same as pickup
                lng: 36.817223
            });
            console.log('   Driver set to ONLINE at pickup location');
        });

        socket.on('newRideRequest', (ride) => {
            console.log('✅ Received new ride request via WebSocket!');
            console.log('   Ride ID:', ride.id);
            socket.disconnect();
            resolve();
        });

        // Timeout if no event received
        setTimeout(() => {
            console.log('⚠️ WebSocket test timed out (no event received)');
            socket.disconnect();
            resolve();
        }, 5000);
    });
}

async function runAllTests() {
    console.log('🧪 Enhanced Ride Matching & Badge System Tests');
    console.log('==============================================\n');
    console.log('Make sure auth-gateway and dispatch-service are running!\n');

    // Start WebSocket listener first if available
    const wsPromise = testWebSocketBroadcast(DRIVER_ID);

    await testNearbyDrivers();
    await delay(1000);

    await testRideCreationWithMatching();
    await delay(1000);

    await testVehicleTypeValidation();
    await delay(1000);

    await testBadgeSeeding();
    await delay(1000);

    await testBadgeRetrieval();

    if (wsPromise) {
        console.log('   Waiting for WebSocket event...');
        await wsPromise;
    }

    console.log('\n✨ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
