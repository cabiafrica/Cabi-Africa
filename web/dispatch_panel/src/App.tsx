import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Sun, Moon } from 'lucide-react';
import { RideRequest, Driver, DispatchMetrics, TripHistory, DriverHistory, Passenger } from './types';
import MetricsOverview from './components/MetricsOverview';
import RideRequestsList from './components/RideRequestsList';
import DriversList from './components/DriversList';
import LiveMap from './components/LiveMap';
import SurgeMonitor from './components/SurgeMonitor';
import TripAnalytics from './components/TripAnalytics';
import UndockablePanel from './components/common/UndockablePanel';
import TripHistoryPage from './components/TripHistoryPage';
import DriverHistoryPage from './components/DriverHistoryPage';
import PassengerManagementPage from './components/PassengerManagementPage';

interface MenuItem {
    view: 'overview' | 'rides' | 'drivers' | 'map' | 'surge' | 'analytics' | 'trips' | 'driver-history' | 'passengers';
    label: string;
    icon: JSX.Element;
    permission: string;
    group?: 'management';
}

const MENU_ICONS = {
    overview: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    rides: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    drivers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
    map: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
    surge: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    analytics: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    trips: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'driver-history': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    passengers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
};

const MENU_ITEMS: MenuItem[] = [
    { view: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.overview}</svg>, permission: 'DISPATCH_DASHBOARD_VIEW' },
    { view: 'rides', label: 'Ride Requests', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.rides}</svg>, permission: 'DISPATCH_RIDE_MONITOR' },
    { view: 'drivers', label: 'Drivers', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.drivers}</svg>, permission: 'DISPATCH_DRIVER_MANAGE' },
    { view: 'map', label: 'Live Map', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.map}</svg>, permission: 'DISPATCH_REAL_TIME_MAP' },
    { view: 'surge', label: 'Surge Monitor', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.surge}</svg>, permission: 'DISPATCH_DASHBOARD_VIEW' },
    { view: 'analytics', label: 'Trip Analytics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.analytics}</svg>, permission: 'DISPATCH_ANALYTICS_VIEW' },

    // Management Group
    { view: 'trips', label: 'Trip Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.trips}</svg>, permission: 'DISPATCH_RIDE_MONITOR', group: 'management' },
    { view: 'driver-history', label: 'Driver Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS['driver-history']}</svg>, permission: 'DISPATCH_DRIVER_MANAGE', group: 'management' },
    { view: 'passengers', label: 'Passenger Management', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{MENU_ICONS.passengers}</svg>, permission: 'PASSENGER_PROFILES_VIEW', group: 'management' },
];

import { useAuth } from './AuthContext';
import LoginPage from './components/LoginPage';
import InactivitySentinel from './components/InactivitySentinel';
import apiClient from './lib/apiClient';

function App() {
    const { isAuthenticated, token, logout, user, hasPermission } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('dispatch_theme') || localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            localStorage.setItem('dispatch_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            localStorage.setItem('dispatch_theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(prev => !prev);

    const [activeView, setActiveView] = useState<'overview' | 'rides' | 'drivers' | 'map' | 'surge' | 'analytics' | 'trips' | 'driver-history' | 'passengers'>('overview');
    const [isTripAnalyticsUndocked, setIsTripAnalyticsUndocked] = useState<boolean>(false);
    const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [metrics, setMetrics] = useState<DispatchMetrics>({
        activeRides: 0,
        pendingRequests: 0,
        onlineDrivers: 0,
        completedToday: 0,
        averageWaitTime: 0,
        averageMatchTime: 0,
        peakDemandZones: [],
        surgeAreas: 0,
    });
    const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
    const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);

    // SOS Emergency Socket Listener (authenticated only)
    useEffect(() => {
        if (!isAuthenticated || !token) return;
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://cabi.africa';
        const sosSocket = io(`${socketUrl}/sos`, {
            auth: { token },
            withCredentials: true,
        });

        sosSocket.on('connect', () => {
            console.log('Connected to SOS Real-time Safety Gateway');
            sosSocket.emit('registerClient', { userId: user?.id || 'dispatcher', role: user?.role || 'DISPATCHER' });
        });

        sosSocket.on('sos_alert', (alert: any) => {
            console.warn('🚨 Real-time SOS alert received:', alert);
            setEmergencyAlerts((prev) => {
                const exists = prev.some((a) => a.id === alert.alertId || a.id === alert.id || a.obNumber === alert.obNumber);
                if (exists) return prev;
                return [alert, ...prev];
            });

            // Synthesize audible siren/alarm via Web Audio API
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);
                    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.7);
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.85);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.85);
                }
            } catch (_) {}
        });

        sosSocket.on('sos_acknowledged', (ack: any) => {
            setEmergencyAlerts((prev) => prev.filter((a) => a.id !== ack.occurrenceId && a.obNumber !== ack.obNumber));
        });

        sosSocket.on('sos_resolved', (res: any) => {
            setEmergencyAlerts((prev) => prev.filter((a) => a.id !== res.occurrenceId && a.obNumber !== res.obNumber));
        });

        return () => {
            sosSocket.disconnect();
        };
    }, [isAuthenticated, token, user]);

    // Initial fetch of active open SOS alerts (authenticated only)
    useEffect(() => {
        if (!isAuthenticated || !token) return;
        const fetchOpenAlerts = async () => {
            try {
                const res = await apiClient.get('/safety/alerts?status=OPEN');
                if (Array.isArray(res.data)) {
                    setEmergencyAlerts(res.data);
                }
            } catch (_) {}
        };
        if (isAuthenticated) {
            fetchOpenAlerts();
        }
    }, [isAuthenticated]);

    // Socket.io for Real-time Tracking
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://cabi.africa';
        const namespace = import.meta.env.VITE_TRIP_TRACKING_NAMESPACE || '/trip-tracking';
        const socket = io(`${socketUrl}${namespace}`);

        socket.on('connect', () => {
            console.log('Connected to Dispatch Real-time Gateway');
        });

        socket.on('globalDriverUpdate', (data: { driverId: string; lat: number; lng: number }) => {
            setDrivers(prev => prev.map(d =>
                d.id === data.driverId
                    ? { ...d, currentLocation: { lat: data.lat, lng: data.lng }, status: 'online' }
                    : d
            ));
        });

        socket.on('driverStatusUpdate', (data: { driverId: string; isOnline: boolean; status?: string }) => {
            setDrivers(prev => prev.map(d =>
                d.id === data.driverId
                    ? { ...d, status: data.isOnline ? 'online' : 'offline' }
                    : d
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Poll for updates (Hybrid Real-Time Fallback)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Metrics
                const metricsRes = await apiClient.get('/dispatch/metrics');
                setMetrics(prev => ({ ...prev, ...metricsRes.data }));

                // Fetch Rides
                const ridesRes = await apiClient.get('/dispatch/rides');
                const rawRides = Array.isArray(ridesRes.data)
                    ? ridesRes.data
                    : Array.isArray(ridesRes.data?.data)
                    ? ridesRes.data.data
                    : [];
                const mappedRides = rawRides.map((r: any) => ({
                    id: r.id,
                    passengerId: r.passengerId,
                    passengerName: r.passenger?.fullName || 'Unknown',
                    passengerPhone: r.passenger?.phone || '',
                    pickupLocation: typeof r.pickupLocation === 'string' ? JSON.parse(r.pickupLocation) : (r.pickupLocation || { address: 'Kenyatta Ave', lat: -1.286389, lng: 36.817223 }),
                    dropoffLocation: typeof r.dropoffLocation === 'string' ? JSON.parse(r.dropoffLocation) : (r.dropoffLocation || { address: 'Westlands', lat: -1.267, lng: 36.811 }),
                    requestedAt: r.createdAt,
                    status: (r.status || 'requested').toLowerCase(),
                    assignedDriverId: r.driverId,
                    estimatedFare: Number(r.fare) || 0,
                    distance: r.distance || 0,
                    priority: 'medium',
                }));
                setRideRequests(mappedRides);

                // Fetch Drivers
                const driversRes = await apiClient.get('/dispatch/drivers');
                const rawDrivers = Array.isArray(driversRes.data)
                    ? driversRes.data
                    : Array.isArray(driversRes.data?.data)
                    ? driversRes.data.data
                    : Array.isArray(driversRes.data?.drivers)
                    ? driversRes.data.drivers
                    : [];

                const mappedDrivers = rawDrivers.map((d: any) => {
                    // Vehicle resolution: check d.vehicle, primary vehicle in d.vehicles, or active vehicle in vehicleDrivers
                    const primaryVehicle = d.vehicle ||
                        (Array.isArray(d.vehicles) ? (d.vehicles.find((v: any) => v.isActive) || d.vehicles[0]) : d.vehicles) ||
                        (Array.isArray(d.vehicleDrivers) ? (d.vehicleDrivers.find((vd: any) => vd.isActive)?.vehicle || d.vehicleDrivers[0]?.vehicle) : null);

                    const vehicleName = (primaryVehicle?.make && primaryVehicle?.model)
                        ? `${primaryVehicle.make} ${primaryVehicle.model}`
                        : (primaryVehicle?.type && primaryVehicle.type !== 'STANDARD' ? primaryVehicle.type : null);
                    const vehicleType = vehicleName || primaryVehicle?.type || primaryVehicle?.category || d.vehicleType || 'Toyota Axio';
                    const vehiclePlate = primaryVehicle?.plateNumber || d.vehiclePlate || 'KDH 452X';

                    // Parse location if string or object
                    let loc = { lat: -1.286389, lng: 36.817223 };
                    if (d.currentLocation) {
                        if (typeof d.currentLocation === 'string') {
                            try { loc = JSON.parse(d.currentLocation); } catch {}
                        } else if (typeof d.currentLocation === 'object' && d.currentLocation.lat && d.currentLocation.lng) {
                            loc = { lat: Number(d.currentLocation.lat), lng: Number(d.currentLocation.lng) };
                        }
                    }

                    const isOnline = Boolean(d.isOnline || d.status === 'online' || d.status === 'ACTIVE_ONLINE');
                    const isBusy = Boolean(d.status === 'busy' || d.status === 'ON_TRIP' || d.currentTrip);

                    return {
                        id: d.id,
                        name: d.user?.fullName || d.name || (d.user?.firstName ? `${d.user.firstName} ${d.user.lastName || ''}`.trim() : 'Joseph Kimani'),
                        phone: d.user?.phone || d.phone || '+254712345678',
                        vehicleType,
                        vehiclePlate,
                        rating: Number(d.averageRating || d.rating || d.user?.averageRating || 4.95),
                        status: isBusy ? 'busy' : (isOnline ? 'online' : 'offline'),
                        currentLocation: loc,
                        completedRides: Number(d.totalRidesCompleted || d.totalTrips || d.completedRides || 0),
                        acceptanceRate: Number(d.acceptanceRate ?? 100),
                        score: Number(d.score ?? 100)
                    };
                });
                setDrivers(mappedDrivers);
            } catch (error) {
                console.error("Failed to fetch dispatch data", error);
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 3000); // Poll every 3s for fast sync

        return () => clearInterval(interval);
    }, []);

    const handleAssignDriver = async (rideId: string, driverId: string) => {
        try {
            const res = await apiClient.post(`/dispatch/rides/${rideId}/assign`, { driverId });

            if (res.status === 200 || res.status === 201) {
                // Optimistic update
                setRideRequests(prev =>
                    prev.map(ride =>
                        ride.id === rideId
                            ? { ...ride, status: 'assigned', assignedDriverId: driverId }
                            : ride
                    )
                );
                setDrivers(prev =>
                    prev.map(driver =>
                        driver.id === driverId
                            ? { ...driver, status: 'busy', activeRideId: rideId }
                            : driver
                    )
                );
            }
        } catch (e) {
            console.error("Assign failed", e);
        }
    };

    const handleCancelRide = (rideId: string) => {
        // TODO: Implement cancel API
        setRideRequests(prev =>
            prev.map(ride =>
                ride.id === rideId ? { ...ride, status: 'cancelled' } : ride
            )
        );
    };

    const tripHistory = useMemo<TripHistory[]>(() => {
        return rideRequests.map((ride) => ({
            ...ride,
            actualFare: ride.estimatedFare,
            paymentMethod: 'mobile-money',
            paymentStatus: ride.status === 'completed' ? 'completed' : ride.status === 'cancelled' ? 'failed' : 'pending',
            duration: Math.max(10, Math.round((ride.distance || 5) * 2.5)),
            completedAt: ride.status === 'completed' ? ride.requestedAt : undefined,
        }));
    }, [rideRequests]);

    const driverHistory = useMemo<DriverHistory[]>(() => {
        return drivers.map((driver) => ({
            ...driver,
            totalEarnings: driver.completedRides * 650,
            todayEarnings: driver.status === 'online' || driver.status === 'busy' ? 3250 : 0,
            weekEarnings: Math.min(driver.completedRides, 24) * 650,
            monthEarnings: Math.min(driver.completedRides, 80) * 650,
            averageRating: driver.rating || 4.8,
            totalRatings: Math.max(1, driver.completedRides),
            joinedDate: new Date().toISOString(),
            lastActiveDate: new Date().toISOString(),
            vehicleModel: driver.vehicleType || 'Toyota Axio',
            vehicleYear: 2022,
            vehicleColor: 'Black',
            licenseNumber: driver.vehiclePlate || 'PENDING',
            licenseExpiry: '2027-12-31',
        }));
    }, [drivers]);

    const passengersList = useMemo<Passenger[]>(() => {
        const byId = new Map<string, Passenger>();
        for (const ride of rideRequests) {
            const existing = byId.get(ride.passengerId);
            const isCompleted = ride.status === 'completed';
            const isCancelled = ride.status === 'cancelled';
            if (!existing) {
                byId.set(ride.passengerId, {
                    id: ride.passengerId,
                    name: ride.passengerName || 'Unknown Passenger',
                    phone: ride.passengerPhone || 'N/A',
                    email: `${(ride.passengerName || 'passenger').toLowerCase().replace(/\s+/g, '.')}@cabi.africa`,
                    rating: 4.8,
                    totalRides: 1,
                    completedRides: isCompleted ? 1 : 0,
                    cancelledRides: isCancelled ? 1 : 0,
                    totalSpent: isCompleted ? ride.estimatedFare : 0,
                    joinedDate: ride.requestedAt,
                    lastRideDate: ride.requestedAt,
                    preferredPaymentMethod: 'mobile-money',
                    status: 'active',
                });
            } else {
                existing.totalRides += 1;
                if (isCompleted) {
                    existing.completedRides += 1;
                    existing.totalSpent += ride.estimatedFare;
                }
                if (isCancelled) {
                    existing.cancelledRides += 1;
                }
                if (new Date(ride.requestedAt) > new Date(existing.lastRideDate)) {
                    existing.lastRideDate = ride.requestedAt;
                }
            }
        }
        return Array.from(byId.values());
    }, [rideRequests]);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className={`flex h-screen transition-colors duration-200 ${darkMode ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} selection:bg-amber-500 selection:text-black`}>
            {/* Zero-Trust 10-Minute Inactivity Sentinel */}
            <InactivitySentinel timeoutMs={10 * 60 * 1000} warningMs={2 * 60 * 1000} />

            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-[#080B10] border-r border-slate-200 dark:border-slate-800/80 border-l-4 border-l-amber-500 flex-shrink-0 flex flex-col shadow-lg shadow-amber-500/5 transition-colors duration-200">
                <div className="p-5 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-amber-500/15 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            <span>MISSION CONTROL</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[3px] bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">DISPATCH OPS</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            src="/cabi-logo-dark.png"
                            alt="Cabi Africa"
                            className="h-8 w-auto object-contain filter dark:brightness-100 brightness-90"
                        />
                        <div>
                            <p className="text-xs font-black text-amber-600 dark:text-amber-500 tracking-wider uppercase">FLEET DISPATCH</p>
                            <span className="text-[10px] text-slate-500 font-mono">Real-time Radar v2.0</span>
                        </div>
                    </div>
                </div>

                {/* Live Radar Telemetry */}
                <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-amber-500/[0.04] dark:bg-amber-500/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">RADAR LIVE</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-[3px]">ACTIVE 0ms</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-tight">Fleet Telemetry Gateway: Connected</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 space-y-1">
                    <div className="px-5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Operational Views
                    </div>
                    {MENU_ITEMS.filter(i => !i.group && hasPermission(i.permission)).map(item => (
                        <button
                            key={item.view}
                            onClick={() => setActiveView(item.view)}
                            className={`w-full text-left px-5 py-2.5 transition-all duration-150 flex items-center gap-3 rounded-[3px] mx-1 max-w-[calc(100%-8px)] text-xs font-semibold ${activeView === item.view
                                ? 'bg-amber-500 text-black font-extrabold shadow-sm shadow-amber-500/20 border-l-[3px] border-l-black dark:border-l-black'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className={activeView === item.view ? 'text-black' : 'text-slate-400'}>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                            {/* Badges */}
                            {item.view === 'rides' && metrics.pendingRequests > 0 && (
                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${activeView === item.view ? 'bg-black text-amber-400' : 'bg-red-500 text-white'}`}>
                                    {metrics.pendingRequests}
                                </span>
                            )}
                            {item.view === 'drivers' && (
                                <span className={`ml-auto text-[10px] font-semibold ${activeView === item.view ? 'text-black font-bold' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                    {drivers.filter(d => d.status === 'online').length} live
                                </span>
                            )}
                            {item.view === 'surge' && metrics.surgeAreas > 0 && (
                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${activeView === item.view ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'}`}>
                                    {metrics.surgeAreas}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="px-5 mb-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Management
                    </div>
                    {MENU_ITEMS.filter(i => i.group === 'management' && hasPermission(i.permission)).map(item => (
                        <button
                            key={item.view}
                            onClick={() => setActiveView(item.view)}
                            className={`w-full text-left px-5 py-2.5 transition-all duration-150 flex items-center gap-3 rounded-[3px] mx-1 max-w-[calc(100%-8px)] text-xs font-semibold ${activeView === item.view
                                ? 'bg-amber-500 text-black font-extrabold shadow-sm shadow-amber-500/20 border-l-[3px] border-l-black dark:border-l-black'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className={activeView === item.view ? 'text-black' : 'text-slate-400'}>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                {/* System Access Buttons - Strictly Restricted to Super Admin */}
                {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN') && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 space-y-2 bg-slate-100/50 dark:bg-slate-800/10">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2 flex items-center justify-between">
                            <span>Super Admin Portals</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">RESTRICTED</span>
                        </div>
                        <button
                            onClick={() => {
                                const url = import.meta.env.VITE_ADMIN_PANEL_URL || 
                                    (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                                        ? 'https://admin.cabi.africa' 
                                        : 'http://localhost:3001');
                                window.location.href = url;
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black rounded-[3px] transition-all duration-200 group border border-slate-200 dark:border-white/5 cursor-pointer shadow-xs"
                            title="Launch Admin Management Panel (Super Admin Only)"
                        >
                            <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
                            <span>Admin Panel</span>
                            <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">MANAGE ↗️</span>
                        </button>
                        <button
                            onClick={() => {
                                 const url = import.meta.env.VITE_USER_PORTAL_URL || 
                                    (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                                        ? 'https://app.cabi.africa' 
                                        : 'http://localhost:3000');
                                window.location.href = url;
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black rounded-[3px] transition-all duration-200 group border border-slate-200 dark:border-white/5 cursor-pointer shadow-xs"
                            title="View User Portal (Super Admin Only)"
                        >
                            <span className="text-base group-hover:scale-110 transition-transform">👤</span>
                            <span>User Portal</span>
                            <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">VIEW ↗️</span>
                        </button>
                    </div>
                )}

                {/* Footer / Operator Callsign */}
                <div className="p-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-[3px] bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xs font-black">
                            OP
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.firstName || 'Operator'} {user?.lastName || ''}</p>
                            <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-tight font-semibold">TACTICAL CONTROLLER</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-[3px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="End Dispatch Session"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-0.5 block">
                                Dispatch Operations
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                {activeView === 'overview' && 'Dispatch Overview'}
                                {activeView === 'rides' && 'Ride Requests'}
                                {activeView === 'drivers' && 'Driver Management'}
                                {activeView === 'map' && 'Live Map View'}
                                {activeView === 'surge' && 'Surge Pricing Monitor'}
                                {activeView === 'analytics' && 'Trip Analytics'}
                                {activeView === 'trips' && 'Trip Management'}
                                {activeView === 'driver-history' && 'Driver Management'}
                                {activeView === 'passengers' && 'Passenger Management'}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                {activeView === 'analytics' && 'Comprehensive trip performance and cancellation analysis'}
                                {activeView === 'trips' && 'View and manage all trip history with advanced filtering'}
                                {activeView === 'driver-history' && 'Manage drivers, view performance metrics and earnings'}
                                {activeView === 'passengers' && 'Manage passengers, view ride history and spending'}
                                {!['analytics', 'trips', 'driver-history', 'passengers'].includes(activeView) && 'Real-time dispatch operations and monitoring'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-[3px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-600" />}
                            </button>

                            {isTripAnalyticsUndocked && (
                                <button
                                    onClick={() => setActiveView('analytics')}
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                    title="Trip Monitoring is currently undocked on Screen 2. Click to view controls."
                                >
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Screen 2: Multi-Screen Active</span>
                                </button>
                            )}
                            <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Last Synced</p>
                                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                    {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/80 via-amber-500/20 to-transparent mt-3 -mb-1" />
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Access Contol Check for Content */}
                    {(() => {
                        const currentItem = MENU_ITEMS.find(i => i.view === activeView);
                        if (currentItem && !hasPermission(currentItem.permission)) {
                            return (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                                    <p>You do not have permission to view this section.</p>
                                </div>
                            );
                        }

                        return (
                            <>
                                {emergencyAlerts.length > 0 && (
                                    <div className="mb-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 rounded-[3px] flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-red-950/30 border border-red-400/40 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl animate-bounce">🚨</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-black/30 px-2 py-0.5 rounded-[3px] text-[11px] font-black uppercase tracking-wider text-red-200">
                                                        CRITICAL DISTRESS BEACON
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-white">
                                                        {emergencyAlerts[0].obNumber}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-red-100 mt-1">
                                                    {emergencyAlerts[0].callerType || emergencyAlerts[0].userType || 'User'} ({emergencyAlerts[0].callerName || emergencyAlerts[0].driverName || emergencyAlerts[0].passengerName || 'Victim'}) initiated distress beacon • Coordinates: [{emergencyAlerts[0].location?.lat ? Number(emergencyAlerts[0].location.lat).toFixed(4) : '0'}, {emergencyAlerts[0].location?.lng ? Number(emergencyAlerts[0].location.lng).toFixed(4) : '0'}]
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setActiveView('map')}
                                                className="bg-white hover:bg-red-50 text-red-700 px-4 py-2 rounded-[3px] font-bold text-xs shadow-md transition"
                                            >
                                                View on Live Map
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const targetId = emergencyAlerts[0].id || emergencyAlerts[0].obNumber;
                                                        await apiClient.put(`/safety/alerts/${targetId}/acknowledge`);
                                                        setEmergencyAlerts((prev) => prev.slice(1));
                                                    } catch (_) {
                                                        setEmergencyAlerts((prev) => prev.slice(1));
                                                    }
                                                }}
                                                className="bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-[3px] text-xs font-semibold transition"
                                            >
                                                Acknowledge
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeView === 'overview' && (
                                    <MetricsOverview
                                        metrics={metrics}
                                        rideRequests={rideRequests}
                                        drivers={drivers}
                                        onUndockTripAnalytics={() => {
                                            setActiveView('analytics');
                                        }}
                                        isTripAnalyticsUndocked={isTripAnalyticsUndocked}
                                    />
                                )}
                                <div className={activeView === 'analytics' ? 'block' : 'hidden'}>
                                    <UndockablePanel
                                        title="Trip Monitoring & Analytics"
                                        subtitle="Real-time ratio of complete vs cancelled trips, cancellation root causes, and fleet performance"
                                        id="trip-analytics"
                                        badgeText="MULTI-SCREEN DISPATCH"
                                        onDockChange={(undocked) => setIsTripAnalyticsUndocked(undocked)}
                                    >
                                        <TripAnalytics />
                                    </UndockablePanel>
                                </div>
                                {activeView === 'rides' && (
                                    <RideRequestsList
                                        rideRequests={rideRequests}
                                        drivers={drivers}
                                        passengers={passengersList}
                                        onAssignDriver={handleAssignDriver}
                                        onCancelRide={handleCancelRide}
                                        selectedRide={selectedRide}
                                        onSelectRide={setSelectedRide}
                                    />
                                )}
                                {activeView === 'drivers' && (
                                    <DriversList drivers={drivers} />
                                )}
                                {activeView === 'map' && (
                                    <LiveMap
                                        drivers={drivers}
                                        rideRequests={rideRequests}
                                        surgeZones={[]}
                                        emergencyAlerts={emergencyAlerts}
                                    />
                                )}
                                {activeView === 'surge' && (
                                    <SurgeMonitor surgeZones={[]} />
                                )}
                                {activeView === 'trips' && (
                                    <TripHistoryPage
                                        trips={tripHistory}
                                        drivers={drivers}
                                        passengers={passengersList}
                                    />
                                )}
                                {activeView === 'driver-history' && (
                                    <DriverHistoryPage drivers={driverHistory} />
                                )}
                                {activeView === 'passengers' && (
                                    <PassengerManagementPage passengers={passengersList} />
                                )}
                            </>
                        );
                    })()}
                </div>
            </main>
        </div>
    );
}

export default App;
