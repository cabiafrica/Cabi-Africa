import { Injectable } from '@nestjs/common';

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface Driver {
    id: string;
    name: string;
    rating: number; // 1-5
    acceptanceRate: number; // 0-1
    location: GeoLocation;
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    vehicleType: string;
}

export interface Ride {
    id: string;
    pickupLocation: GeoLocation;
    dropoffLocation: GeoLocation;
    status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SCHEDULED';
    scheduledTime?: Date;
    passengerId: string;
    assignedDriverId?: string;
    rejectedDriverIds: string[];
}

@Injectable()
export class DispatchService {
    private airportQueues = new Map<string, string[]>(); // zoneId -> driverId[]
    private drivers: Driver[] = []; // Mock DB
    private rides: Ride[] = []; // Mock DB

    // Story 50.5: Surge Pricing (Simple Grid Mock)
    private surgeZones = new Map<string, number>(); // zoneId -> multiplier

    constructor() {
        // Start Cron for Scheduled Rides (50.3)
        setInterval(() => this.processScheduledRides(), 60000);
    }

    // Story 50.1: Driver Scoring
    private calculateScore(driver: Driver, ride: Ride): number {
        const distance = Math.sqrt(Math.pow(driver.location.lat - ride.pickupLocation.lat, 2) + Math.pow(driver.location.lng - ride.pickupLocation.lng, 2));

        // Weights
        const wRating = 10;
        const wAcceptance = 5;
        const wDistance = -20; // Lower distance is better

        return (driver.rating * wRating) + (driver.acceptanceRate * wAcceptance) + (distance * wDistance);
    }

    async findBestDriver(ride: Ride): Promise<Driver | null> {
        // 1. Check Airport Queue (50.4)
        const airportZoneId = this.getAirportZone(ride.pickupLocation);
        if (airportZoneId) {
            const queue = this.airportQueues.get(airportZoneId) || [];
            if (queue.length > 0) {
                const driverId = queue[0];
                return this.drivers.find(d => d.id === driverId) || null;
            }
        }

        // 2. Standard Scoring (50.1)
        const candidates = this.drivers.filter(d =>
            d.status === 'AVAILABLE' &&
            !ride.rejectedDriverIds.includes(d.id)
        );

        if (candidates.length === 0) return null;

        return candidates.sort((a, b) => this.calculateScore(b, ride) - this.calculateScore(a, ride))[0]; // Descending score
    }

    // Story 50.2: Rejection Cascade
    async dispatchRide(rideId: string) {
        const ride = this.rides.find(r => r.id === rideId);
        if (!ride) return;

        const bestDriver = await this.findBestDriver(ride);
        if (bestDriver) {
            console.log(`[Dispatch] Offering ride ${ride.id} to driver ${bestDriver.name} (Score: ${this.calculateScore(bestDriver, ride).toFixed(2)})`);
            // In real app: NotificationService.sendOffer(bestDriver.id, ride);

            // Simulate timeout/rejection after 10s for demo
            // setTimeout(() => this.handleRejection(ride.id, bestDriver.id), 10000);
        } else {
            console.log(`[Dispatch] No drivers available for ride ${ride.id}`);
            // Notify passenger
        }
    }

    async handleRejection(rideId: string, driverId: string) {
        const ride = this.rides.find(r => r.id === rideId);
        if (!ride) return;

        console.log(`[Dispatch] Driver ${driverId} rejected ride ${rideId}. Cascading...`);
        ride.rejectedDriverIds.push(driverId);

        // Airport Queue Logic: Move to back
        const airportZone = this.getAirportZone(ride.pickupLocation);
        if (airportZone) {
            const queue = this.airportQueues.get(airportZone) || [];
            const idx = queue.indexOf(driverId);
            if (idx !== -1) {
                queue.splice(idx, 1);
                queue.push(driverId); // Move to back
            }
        }

        this.dispatchRide(rideId);
    }

    // Story 50.3: Scheduled Rides
    async processScheduledRides() {
        const now = new Date();
        const window = 20 * 60 * 1000; // 20 mins

        const dueRides = this.rides.filter(r =>
            r.status === 'SCHEDULED' &&
            r.scheduledTime &&
            (r.scheduledTime.getTime() - now.getTime()) <= window &&
            (r.scheduledTime.getTime() - now.getTime()) > 0
        );

        dueRides.forEach(r => {
            console.log(`[Dispatch] Processing scheduled ride ${r.id}`);
            r.status = 'REQUESTED'; // Start dispatching
            this.dispatchRide(r.id);
        });
    }

    // Story 50.4: Airport Queue Management
    async enterAirportQueue(driverId: string, zoneId: string) {
        if (!this.airportQueues.has(zoneId)) this.airportQueues.set(zoneId, []);
        const queue = this.airportQueues.get(zoneId)!;
        if (!queue.includes(driverId)) {
            queue.push(driverId);
            console.log(`[Dispatch] Driver ${driverId} joined queue ${zoneId} at position ${queue.length}`);
        }
    }

    async leaveAirportQueue(driverId: string, zoneId: string) {
        const queue = this.airportQueues.get(zoneId);
        if (queue) {
            const index = queue.indexOf(driverId);
            if (index > -1) queue.splice(index, 1);
        }
    }

    private getAirportZone(loc: GeoLocation): string | null {
        // Mock Geofence check
        if (loc.lat > 0.05 && loc.lat < 0.06) return 'JFK_Terminal_4';
        return null;
    }

    // Story 50.5: Surge Pricing
    async getSurgeMultiplier(location: GeoLocation): Promise<number> {
        // Check if location inside any surge zone
        // Mock:
        if (location.lat > 0 && location.lat < 0.02) return this.surgeZones.get('downtown') || 1.0;
        return 1.0;
    }
}
