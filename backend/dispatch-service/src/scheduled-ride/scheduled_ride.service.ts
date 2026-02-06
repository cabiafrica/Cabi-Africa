import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

interface ScheduledRide {
    id: string;
    passengerId: string;
    driverId?: string;
    scheduledTime: Date;
    status: 'pending' | 'assigned' | 'cancelled';
}

@Injectable()
export class ScheduledRideService {
    // In a real app, this would use a database
    private rides: Map<string, ScheduledRide> = new Map();

    getAssignedRides(driverId: string): ScheduledRide[] {
        return Array.from(this.rides.values()).filter(
            (ride) => ride.driverId === driverId && ride.status === 'assigned'
        );
    }

    async cancelScheduledRide(rideId: string, passengerId: string): Promise<void> {
        const ride = this.rides.get(rideId);

        if (!ride) {
            throw new NotFoundException(`Ride with ID ${rideId} not found`);
        }

        if (ride.passengerId !== passengerId) {
            throw new ForbiddenException('You are not authorized to cancel this ride');
        }

        if (ride.status === 'cancelled') {
            throw new ForbiddenException('This ride has already been cancelled');
        }

        ride.status = 'cancelled';
        this.rides.set(rideId, ride);
    }

    async cancelByDriver(rideId: string, driverId: string): Promise<void> {
        const ride = this.rides.get(rideId);

        if (!ride) {
            throw new NotFoundException(`Ride with ID ${rideId} not found`);
        }

        if (ride.driverId !== driverId) {
            throw new ForbiddenException('You are not authorized to cancel this ride');
        }

        if (ride.status === 'cancelled') {
            throw new ForbiddenException('This ride has already been cancelled');
        }

        // Check if cancellation window has passed (e.g., within 30 minutes of scheduled time)
        const now = new Date();
        const timeDiff = ride.scheduledTime.getTime() - now.getTime();
        const minutesUntilRide = timeDiff / (1000 * 60);

        if (minutesUntilRide < 30) {
            throw new ForbiddenException('Cannot cancel ride within 30 minutes of scheduled time');
        }

        ride.status = 'cancelled';
        this.rides.set(rideId, ride);
    }
}
