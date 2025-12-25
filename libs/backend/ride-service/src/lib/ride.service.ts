import { Injectable } from '@nestjs/common';

@Injectable()
export class RideService {

    private rides: Ride[] = [];

    async createRide(rideData: any) {
        const newRide: Ride = {
            id: `ride_${Date.now()}`,
            status: 'REQUESTED',
            ...rideData,
        };
        this.rides.push(newRide);

        if (newRide.type === 'DELIVERY' && newRide.deliveryDetails) {
            console.log(`[RideService] 📦 Delivery created for ${newRide.deliveryDetails.recipientName}`);
            // In real app: NotificationService.notifyRecipient(...)
        }

        return newRide;
    }

    private airportQueues = new Map<string, string[]>(); // airportId -> driverIds[]

    // Story 85.6: Driver joins airport queue
    async enterAirportQueue(airportId: string, driverId: string) {
        if (!this.airportQueues.has(airportId)) {
            this.airportQueues.set(airportId, []);
        }
        const queue = this.airportQueues.get(airportId);
        if (!queue.includes(driverId)) {
            queue.push(driverId);
            console.log(`[RideService] ✈️ Driver ${driverId} added to queue for ${airportId}. Position: ${queue.length}`);
        }
        return { position: queue.indexOf(driverId) + 1, totalInQueue: queue.length };
    }

    async getQueuePosition(airportId: string, driverId: string) {
        const queue = this.airportQueues.get(airportId);
        if (!queue || !queue.includes(driverId)) return null;
        return { position: queue.indexOf(driverId) + 1, totalInQueue: queue.length };
    }

    async dispatchFromQueue(airportId: string) {
        const queue = this.airportQueues.get(airportId);
        if (queue && queue.length > 0) {
            const driverId = queue.shift(); // FIFO
            console.log(`[RideService] ✈️ Dispatching driver ${driverId} from ${airportId} queue`);
            return driverId;
        }
        return null;
    }

    async leaveAirportQueue(airportId: string, driverId: string) {
        const queue = this.airportQueues.get(airportId);
        if (queue) {
            const index = queue.indexOf(driverId);
            if (index > -1) {
                queue.splice(index, 1);
                console.log(`[RideService] ✈️ Driver ${driverId} removed from ${airportId} queue`);
            }
        }
    }

    // Story 85.9: High-Priority Airport Rematch
    async priorityRematch(rideId: string, airportId: string) {
        console.log(`[RideService] 🚨 Priority rematch triggered for airport ride ${rideId}`);

        // Bypass queue for fastest available driver
        // In real app: findNearestDriver(airportGeofence)

        // Mock: just grab first from queue but label as PRIORITY dispatch
        const nextDriver = await this.dispatchFromQueue(airportId);

        if (nextDriver) {
            console.log(`[RideService] ⚡ Rematched ${rideId} to driver ${nextDriver} (PRIORITY)`);
            // In real app: NotificationService.notifyPassenger(passengerId, 'We found a new driver!')
            return { success: true, newDriverId: nextDriver, isPriority: true };
        } else {
            console.log(`[RideService] ⚠️ No drivers available for priority rematch`);
            return { success: false };
        }
    }

    // Story 13.1: Destination Mode
    async setDestinationMode(driverId: string, destination: { lat: number, lng: number, address: string }, arrivalTime?: Date) {
        console.log(`[RideService] 🎯 Driver ${driverId} set destination mode to ${destination.address}`);
        // In real app: dispatch engine filters trips towards this destination
        return { success: true, mode: 'DESTINATION_FILTER_ACTIVE' };
    }

    // Story 13.2: In-App Navigation Route
    async getRoute(pickup: { lat: number, lng: number }, dropoff: { lat: number, lng: number }) {
        // Mock polyline (London example)
        const mockPolyline = 'gcpvH|z_L@?@??@?@?@?@??@?@?@?@??@?@?@?@??@?';
        return {
            polyline: mockPolyline,
            distance: '5.2 km',
            duration: '15 mins',
            waypoints: [pickup, dropoff]
        };
    }

    // Story 50.5: Surge Pricing Calculation
    private isInSurgeZone(lat: number, lng: number): { inZone: boolean, multiplier: number } {
        // Mock check - in a real app this uses a geospatial library like turf.js
        // For now, assume if lat > 40.75, it's a surge zone (e.g. downtown)
        if (lat > 40.75) {
            return { inZone: true, multiplier: 1.5 }; // 1.5x surge
        }
        return { inZone: false, multiplier: 1.0 };
    }

    async calculateFareWithSurge(origin: { lat: number, lng: number }, baseFare: number) {
        const surge = this.isInSurgeZone(origin.lat, origin.lng);
        const finalFare = baseFare * surge.multiplier;
        console.log(`[RideService] 💰 Fare calc: Base $${baseFare} x Surge ${surge.multiplier} = $${finalFare}`);
        return { finalFare, surgeMultiplier: surge.multiplier };
    }

    // Story 50.7: Proactive Heatmap Dispatch
    async analyzeHeatmapAndDispatch() {
        // identifying cold spots (high demand, low supply)
        console.log('[RideService] 🌡️ Analyzing heatmap for cold spots...');
        // Mock finding a cold spot
        const coldSpot = { lat: 40.75, lng: -73.98, radius: 1000 };

        // Find idle drivers nearby (simulated)
        const idleDrivers = ['driver_5', 'driver_8'];

        idleDrivers.forEach(driverId => {
            console.log(`[RideService] 📢 Suggesting driver ${driverId} to move to cold spot`);
            // NotificationService.sendPush(driverId, "High demand nearby! Head to Downtown for more rides.");
        });
        return { processed: true, driversNotified: idleDrivers.length };
    }

    // Story 13.3: Back-to-Back Trips
    async offerBackToBackTrip(driverId: string, currentRideId: string) {
        console.log(`[RideService] 🔄 Finding back-to-back trip for driver ${driverId} on ride ${currentRideId}`);
        // Logic to find trip starting near currentRide's dropoff

        // Mock offer logic
        const nextTrip = {
            id: `ride_${Date.now()}`,
            pickup: '123 Next St',
            etaToPickup: '3 mins'
        };

        console.log(`[RideService] 📲 Offering trip ${nextTrip.id} to driver ${driverId}`);
        return { success: true, offer: nextTrip };
    }

    // Story 50.6: Airport Rematch
    async updateAirportQueue(driverId: string, airportId: string, action: 'CANCELLED_BY_PASSENGER' | 'CANCELLED_BY_DRIVER') {
        const queue = this.airportQueues.get(airportId) || [];

        if (action === 'CANCELLED_BY_PASSENGER') {
            console.log(`[RideService] ✈️ Priority Re-queue: Driver ${driverId} to FRONT of ${airportId}`);
            queue.unshift(driverId); // Add to front
        } else {
            console.log(`[RideService] ✈️ Penalty: Driver ${driverId} to BACK of ${airportId}`);
            queue.push(driverId); // Add to back
        }

        this.airportQueues.set(airportId, queue);
        return { success: true, position: queue.indexOf(driverId) + 1 };
    }

    // Story 34.4: Corporate Policy Check
    async checkCorporatePolicy(userId: string, fare: number, vehicleType: string): Promise<boolean> {
        // Mock Policy Check - would call UserService
        const policies = {
            maxMonthlySpend: 5000,
            allowedTypes: ['Standard', 'Premium'], // No XL for business by default?
        };

        if (fare > 2000) {
            console.warn(`Policy Violation: Fare ${fare} exceeds single trip limit`);
            return false;
        }
        if (!policies.allowedTypes.includes(vehicleType)) {
            console.warn(`Policy Violation: Vehicle type ${vehicleType} not allowed`);
            return false;
        }
        return true;
    }
    // In real implementation:
    // 1. Check if driver is online/available.
    // 2. Send notification to driver.
    // 3. Create Ride record with status 'PENDING_DRIVER_APPROVAL'.
    // 4. Set generic timeout (e.g. 60s).


    async driverArrived(rideId: string) {
        // Story 30.2: Start wait time timer
        console.log(`Driver arrived for ride ${rideId}. Timer started.`);
        // Save 'arrivalTime' to DB
        return { rideId, status: 'DRIVER_ARRIVED', arrivalTime: new Date() };
    }

    async startRide(rideId: string) {
        // Stop wait time timer
        console.log(`Starting ride ${rideId}.`);
        // Calculate wait duration: Now - ArrivalTime
        // const actualWaitTimeMinutes = (now - arrivalTime) / 60000;
        return { rideId, status: 'IN_PROGRESS', actualWaitTimeMinutes: 5 }; // Mock 5 mins
    }
}
