'use client';

import { useState, useEffect, useRef } from 'react';
import { FaLocationArrow, FaMapMarkerAlt, FaCar, FaSearch } from 'react-icons/fa';

interface VehicleOption {
    id: string;
    name: string;
    price: number;
    eta: number;
    icon: string;
}

export default function BookingSection() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const [tripStatus, setTripStatus] = useState<'IDLE' | 'SEARCHING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>('IDLE');
    const [progressStep, setProgressStep] = useState(0);
    const [activeRideId, setActiveRideId] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Initial check for active ride
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const passengerId = user.userId || user.id;
                if (passengerId) {
                    checkActiveRide(passengerId);
                }
            } catch (e) { }
        }

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const checkActiveRide = async (passengerId: string) => {
        try {
            const response = await fetch(`/api/rides/status?passengerId=${passengerId}`);
            if (response.ok) {
                const ride = await response.json();
                handleRideUpdate(ride);
                startPolling(passengerId);
            }
        } catch (error) {
            console.error('Failed to check active ride', error);
        }
    };

    const startPolling = (passengerId: string) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = setInterval(() => {
            pollRideStatus(passengerId);
        }, 5000);
    };

    const pollRideStatus = async (passengerId: string) => {
        try {
            const response = await fetch(`/api/rides/status?passengerId=${passengerId}`);
            if (response.ok) {
                const ride = await response.json();
                handleRideUpdate(ride);
            } else if (response.status === 404) {
                // If ride is gone (completed/cancelled), stop polling
                if (tripStatus !== 'IDLE' && tripStatus !== 'COMPLETED') {
                    setTripStatus('COMPLETED');
                    setProgressStep(5);
                }
                if (pollingInterval.current) clearInterval(pollingInterval.current);
            }
        } catch (error) {
            console.error('Polling error', error);
        }
    };

    const handleRideUpdate = (ride: any) => {
        setActiveRideId(ride.id);
        setPickup(ride.pickupLocation);
        setDestination(ride.dropoffLocation);
        setBookingConfirmed(true);

        const status = ride.status;
        if (status === 'REQUESTED') {
            setTripStatus('CONFIRMED');
            setProgressStep(1);
        } else if (status === 'DRIVER_ASSIGNED') {
            setTripStatus('DRIVER_ASSIGNED');
            setProgressStep(2);
            if (ride.driver?.user) {
                setDriverInfo({
                    name: ride.driver.user.fullName,
                    plate: ride.driver.licenseNumber || 'KBA 123A'
                });
            }
        } else if (status === 'IN_PROGRESS') {
            setTripStatus('IN_PROGRESS');
            setProgressStep(4);
        } else if (status === 'COMPLETED') {
            setTripStatus('COMPLETED');
            setProgressStep(5);
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
    };

    const handleGetEstimates = async () => {
        if (!pickup || !destination) return;

        setLoading(true);
        setTripStatus('SEARCHING');

        try {
            const response = await fetch('/api/rides/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pickup, destination }),
            });

            if (response.ok) {
                const data = await response.json();
                setVehicleOptions(data);
                setExpanded(true);
            }
        } catch (error) {
            console.error('Failed to get estimates', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookRide = async () => {
        if (!selectedVehicle) return;

        const vehicle = vehicleOptions.find(v => v.id === selectedVehicle);
        if (!vehicle) return;

        let passengerId = 'guest';
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    passengerId = user.userId || user.id || 'guest';
                } catch (e) { }
            }
        }

        setLoading(true);
        try {
            const response = await fetch('/api/rides/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup,
                    destination,
                    vehicleType: vehicle.name,
                    fare: vehicle.price,
                    passengerId: passengerId,
                }),
            });

            if (response.ok) {
                const ride = await response.json();
                setBookingConfirmed(true);
                setTripStatus('CONFIRMED');
                setProgressStep(1);
                setActiveRideId(ride.id);
                startPolling(passengerId);
            }
        } catch (error) {
            console.error('Failed to book ride', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = () => {
        const steps = ['Confirmed', 'Driver Assigned', 'Arrived', 'In Progress'];
        return (
            <div className="w-full mt-6">
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <div key={index} className={`text-xs font-bold ${index + 1 <= progressStep ? 'text-brand-yellow' : 'text-gray-600'}`}>
                            {step}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-yellow transition-all duration-1000 ease-out"
                        style={{ width: `${(progressStep / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <section className="relative z-20 -mt-24 px-6 mb-20 pointer-events-none">
            <div className="container mx-auto">
                <div className="bg-brand-black/90 backdrop-blur-xl border-2 border-brand-yellow/50 rounded-3xl shadow-2xl p-6 md:p-10 pointer-events-auto transform transition-all duration-300 hover:shadow-brand-yellow/20 hover:border-brand-yellow">

                    {/* Header */}
                    {!expanded && !bookingConfirmed && (
                        <h2 className="text-2xl font-bold text-white mb-6 md:hidden">Where to?</h2>
                    )}

                    {bookingConfirmed ? (
                        <div className="text-center py-8 animate-fade-in relative overflow-hidden">
                            {/* Status Icon */}
                            <div className="w-20 h-20 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                {tripStatus === 'CONFIRMED' && <span className="text-3xl animate-pulse">📡</span>}
                                {tripStatus === 'DRIVER_ASSIGNED' && <span className="text-3xl animate-bounce-short">🚖</span>}
                                {tripStatus === 'ARRIVED' && <span className="text-3xl">📍</span>}
                                {tripStatus === 'IN_PROGRESS' && <span className="text-3xl animate-spin-slow">🛣️</span>}
                                {tripStatus === 'COMPLETED' && <span className="text-3xl">✅</span>}

                                <div className="absolute inset-0 border-2 border-brand-yellow/50 rounded-full animate-ping-slow" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">
                                {tripStatus === 'CONFIRMED' && 'Looking for drivers...'}
                                {tripStatus === 'DRIVER_ASSIGNED' && 'Driver is coming!'}
                                {tripStatus === 'ARRIVED' && 'Driver has arrived!'}
                                {tripStatus === 'IN_PROGRESS' && 'Trip in progress'}
                                {tripStatus === 'COMPLETED' && 'Trip Completed'}
                            </h3>

                            <p className="text-gray-400 max-w-md mx-auto">
                                {tripStatus === 'CONFIRMED' && 'We are connecting you to the nearest available driver.'}
                                {tripStatus === 'DRIVER_ASSIGNED' && (driverInfo ? `Your driver ${driverInfo.name} (${driverInfo.plate}) is on the way.` : 'Your driver is coming.')}
                                {tripStatus === 'ARRIVED' && 'Meet your driver at the pickup point.'}
                                {tripStatus === 'IN_PROGRESS' && `Heading to ${destination}...`}
                                {tripStatus === 'COMPLETED' && 'You have arrived at your destination.'}
                            </p>

                            {renderProgressBar()}

                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-4">
                                {tripStatus !== 'COMPLETED' && (
                                    <button className="px-6 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-bold border border-red-500/50 transition-colors">
                                        Cancel Ride
                                    </button>
                                )}
                                {tripStatus === 'COMPLETED' && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm font-bold border border-green-500/50 transition-colors"
                                    >
                                        Book Another Ride
                                    </button>
                                )}
                                <button className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 text-sm font-bold transition-colors">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {/* Inputs */}
                            <div className="flex-1 w-full grid md:grid-cols-2 gap-4">
                                <div className="relative group w-full">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow text-lg">
                                        <FaLocationArrow />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter pickup location"
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none text-white placeholder-gray-500 transition-all"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                    />
                                </div>
                                <div className="relative group w-full">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent text-lg">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter destination"
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none text-white placeholder-gray-500 transition-all"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full md:w-auto">
                                <button
                                    onClick={handleGetEstimates}
                                    disabled={loading || !pickup || !destination}
                                    className={`w-full md:w-48 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${loading || !pickup || !destination
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-brand-yellow to-brand-accent text-black hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {loading ? 'Calculating...' : <><FaSearch /> Choose Service</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Expansion */}
                    {expanded && !bookingConfirmed && vehicleOptions.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in text-left">
                            <h3 className="text-white font-bold mb-4">Select a Ride</h3>
                            <div className="grid md:grid-cols-4 gap-4 mb-6">
                                {vehicleOptions.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVehicle(v.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${selectedVehicle === v.id
                                            ? 'bg-brand-yellow text-black border-brand-yellow scale-105'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-3xl mb-2">{v.icon}</span>
                                        <span className="font-bold block">{v.name}</span>
                                        <span className="text-sm opacity-80">{v.eta} min</span>
                                        <span className="font-bold text-lg mt-1">KES {v.price.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="px-6 py-3 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookRide}
                                    disabled={!selectedVehicle}
                                    className={`px-8 py-3 rounded-xl font-bold text-black transition-all ${selectedVehicle ? 'bg-brand-accent hover:bg-cyan-300' : 'bg-gray-800 text-gray-500'
                                        }`}
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
