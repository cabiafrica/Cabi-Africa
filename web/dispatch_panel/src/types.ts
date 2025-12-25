export interface RideRequest {
    id: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    pickupLocation: {
        lat: number;
        lng: number;
        address: string;
    };
    dropoffLocation: {
        lat: number;
        lng: number;
        address: string;
    };
    requestedAt: string;
    status: 'pending' | 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
    assignedDriverId?: string;
    estimatedFare: number;
    distance: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    rating: number;
    status: 'online' | 'offline' | 'busy' | 'on-break';
    currentLocation: {
        lat: number;
        lng: number;
    };
    activeRideId?: string;
    completedRides: number;
    acceptanceRate: number;
    score: number;
}

export interface DispatchMetrics {
    activeRides: number;
    pendingRequests: number;
    onlineDrivers: number;
    completedToday: number;
    averageWaitTime: number;
    averageMatchTime: number;
    peakDemandZones: string[];
    surgeAreas: number;
}

export interface SurgeZone {
    id: string;
    name: string;
    multiplier: number;
    activeRides: number;
    availableDrivers: number;
    coordinates: Array<{ lat: number; lng: number }>;
}

export interface CancellationReason {
    reason: string;
    count: number;
    percentage: number;
    cancelledBy?: 'passenger' | 'driver' | 'system';
}

export interface CancellationData {
    id: string;
    rideId: string;
    cancelledBy: 'passenger' | 'driver' | 'system';
    reason: string;
    timestamp: string;
    passengerName?: string;
    driverName?: string;
}

export interface TripAnalytics {
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    completionRate: number;
    cancellationsByPassenger: number;
    cancellationsByDriver: number;
    cancellationsBySystem: number;
    cancellationReasons: CancellationReason[];
    recentCancellations: CancellationData[];
}
