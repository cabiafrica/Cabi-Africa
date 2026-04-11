import { RideRequest, Driver, DispatchMetrics, SurgeZone, TripAnalytics, Passenger, TripHistory, DriverHistory } from './types';

export const mockRideRequests: RideRequest[] = [];

export const mockDrivers: Driver[] = [];

export const mockMetrics: DispatchMetrics = {
    activeRides: 0,
    pendingRequests: 0,
    onlineDrivers: 0,
    completedToday: 0,
    averageWaitTime: 0,
    averageMatchTime: 0,
    peakDemandZones: [],
    surgeAreas: 0,
};

export const mockSurgeZones: SurgeZone[] = [];

export const mockTripAnalytics: TripAnalytics = {
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    completionRate: 0,
    cancellationsByPassenger: 0,
    cancellationsByDriver: 0,
    cancellationsBySystem: 0,
    cancellationReasons: [],
    recentCancellations: [],
};

export const mockPassengers: Passenger[] = [];

export const mockTripHistory: TripHistory[] = [];

export const mockDriverHistory: DriverHistory[] = [];
