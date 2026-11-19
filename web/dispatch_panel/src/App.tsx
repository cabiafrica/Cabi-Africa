import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
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
import apiClient from './lib/apiClient';

function App() {
    const { isAuthenticated, logout, user, hasPermission } = useAuth();
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

    // SOS Emergency Socket Listener
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://auth-gateway-746659778850.us-central1.run.app';
        const sosSocket = io(`${socketUrl}/sos`);

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
    }, [user]);

    // Initial fetch of active open SOS alerts
    useEffect(() => {
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
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://auth-gateway-746659778850.us-central1.run.app';
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

        return () => {
            socket.disconnect();
        };
    }, []);

    // Poll for updates
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Metrics
                const metricsRes = await apiClient.get('/dispatch/metrics');
                setMetrics(prev => ({ ...prev, ...metricsRes.data }));

                // Fetch Rides
                const ridesRes = await apiClient.get('/dispatch/rides');
                const mappedRides = ridesRes.data.map((r: any) => ({
                    id: r.id,
                    passengerId: r.passengerId,
                    passengerName: r.passenger?.fullName || 'Unknown',
                    passengerPhone: r.passenger?.phone || '',
                    pickupLocation: typeof r.pickupLocation === 'string' ? JSON.parse(r.pickupLocation) : r.pickupLocation,
                    dropoffLocation: typeof r.dropoffLocation === 'string' ? JSON.parse(r.dropoffLocation) : r.dropoffLocation,
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
                const mappedDrivers = driversRes.data.map((d: any) => ({
                    id: d.id,
                    name: d.user?.fullName || 'Unknown Driver',
                    phone: d.user?.phone || '',
                    vehicleType: d.vehicle?.type || 'Standard',
                    vehiclePlate: d.vehicle?.plateNumber || '',
                    rating: 5.0,
                    status: d.isOnline ? 'online' : 'offline',
                    currentLocation: typeof d.currentLocation === 'string' ? JSON.parse(d.currentLocation) : d.currentLocation || { lat: -1.286389, lng: 36.817223 },
                    completedRides: 0,
                    acceptanceRate: 100,
                    score: 100
                }));
                setDrivers(mappedDrivers);
            } catch (error) {
                console.error("Failed to fetch dispatch data", error);
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5000); // Poll every 5s

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
            vehicleModel: driver.vehicleType || 'Sedan',
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
        <div className="flex h-screen bg-gradient-to-br from-brand-black via-surface-dark to-brand-black text-white selection:bg-brand-yellow selection:text-black">
            {/* Sidebar */}
            <aside className="w-72 bg-surface-dark/90 backdrop-blur-xl border-r border-white/10 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <img
                            src="/cabi-logo-dark.png"
                            alt="Cabi Africa"
                            className="h-9 w-auto object-contain"
                        />
                        <div>
                            <p className="text-xs font-semibold text-amber-400 tracking-wide uppercase">Dispatch Control</p>
                        </div>
                    </div>
                </div>

                {/* Live Status */}
                <div className="px-6 py-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                        <span className="text-sm font-medium text-green-400">System Online</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">All services operational</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Main Views
                    </div>
                    {MENU_ITEMS.filter(i => !i.group && hasPermission(i.permission)).map(item => (
                        <button
                            key={item.view}
                            onClick={() => setActiveView(item.view)}
                            className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === item.view
                                ? 'bg-gradient-to-r from-brand-yellow/20 to-executive-gold/10 border-l-4 border-brand-yellow text-brand-yellow'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                            {/* Badges */}
                            {item.view === 'rides' && metrics.pendingRequests > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {metrics.pendingRequests}
                                </span>
                            )}
                            {item.view === 'drivers' && (
                                <span className="ml-auto text-xs text-green-400 font-semibold">
                                    {drivers.filter(d => d.status === 'online').length} online
                                </span>
                            )}
                            {item.view === 'surge' && metrics.surgeAreas > 0 && (
                                <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {metrics.surgeAreas}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="px-4 mb-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Management
                    </div>
                    {MENU_ITEMS.filter(i => i.group === 'management' && hasPermission(i.permission)).map(item => (
                        <button
                            key={item.view}
                            onClick={() => setActiveView(item.view)}
                            className={`w-full text-left px-6 py-3 transition-all duration-200 flex items-center gap-3 group ${activeView === item.view
                                ? 'bg-gradient-to-r from-brand-yellow/20 to-executive-gold/10 border-l-4 border-brand-yellow text-brand-yellow'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                {/* System Access Buttons - Persistent Footer */}
                {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('ADMIN_PANEL_VIEW') || hasPermission('view_dashboard')) && (
                    <div className="p-4 border-t border-slate-800/50 space-y-2 bg-slate-800/10">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
                            System Access
                        </div>
                        {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('ADMIN_PANEL_VIEW')) && (
                            <button
                                onClick={() => {
                                    const url = import.meta.env.VITE_ADMIN_PANEL_URL || 
                                        (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                                            ? 'https://admin.cabi.africa' 
                                            : 'http://localhost:3001');
                                    window.location.href = url;
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-white hover:text-black rounded-lg transition-all duration-300 group border border-white/5"
                                title="Launch Admin Management Panel"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
                                <span>Admin Panel</span>
                                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">MANAGE ↗️</span>
                            </button>
                        )}
                        {((user?.role as string)?.toUpperCase() === 'SUPER_ADMIN' || (user?.role as string)?.toUpperCase() === 'ADMIN' || hasPermission('view_dashboard')) && (
                            <button
                                onClick={() => {
                                     const url = import.meta.env.VITE_USER_PORTAL_URL || 
                                        (window.location.hostname.includes('cabi.africa') || window.location.hostname.includes('vercel.app') 
                                            ? 'https://app.cabi.africa' 
                                            : 'http://localhost:3000');
                                    window.location.href = url;
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:bg-white hover:text-black rounded-lg transition-all duration-300 group border border-white/5"
                                title="View User Portal"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">👤</span>
                                <span>User Portal</span>
                                <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">VIEW ↗️</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-yellow to-executive-gold flex items-center justify-center text-black text-sm font-bold">
                            OP
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-slate-500">{user?.role || 'Dispatch Team'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Log Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <header className="bg-surface-dark/80 backdrop-blur-xl border-b border-white/10 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white capitalize">
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
                            <p className="text-sm text-slate-400 mt-1">
                                {activeView === 'analytics' && 'Comprehensive trip performance and cancellation analysis'}
                                {activeView === 'trips' && 'View and manage all trip history with advanced filtering'}
                                {activeView === 'driver-history' && 'Manage drivers, view performance metrics and earnings'}
                                {activeView === 'passengers' && 'Manage passengers, view ride history and spending'}
                                {!['analytics', 'trips', 'driver-history', 'passengers'].includes(activeView) && 'Real-time dispatch operations and monitoring'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isTripAnalyticsUndocked && (
                                <button
                                    onClick={() => setActiveView('analytics')}
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/20 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                                    title="Trip Monitoring is currently undocked on Screen 2. Click to view controls."
                                >
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Screen 2: Trip Monitoring Active</span>
                                </button>
                            )}
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Last Updated</p>
                                <p className="text-sm font-medium text-white">
                                    {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
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
                                    <div className="mb-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-red-950/30 border border-red-400/40 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl animate-bounce">🚨</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-black/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider text-red-200">
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
                                                className="bg-white hover:bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition"
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
                                                className="bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
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
                                    <TripHistoryPage trips={tripHistory} />
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
