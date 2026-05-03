'use client';

import { useState, useEffect, useRef } from 'react';
import { FaLocationArrow, FaMapMarkerAlt, FaCar, FaSearch, FaFingerprint, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

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
    const { user, isAuthenticated } = useAuth();
    const [showVerification, setShowVerification] = useState(false);
    const [verificationType, setVerificationType] = useState<'NONE' | 'FACE' | 'OTP'>('NONE');
    const [verificationLoading, setVerificationLoading] = useState(false);

    const [tripStatus, setTripStatus] = useState<'IDLE' | 'SEARCHING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>('IDLE');
    const [progressStep, setProgressStep] = useState(0);
    const [activeRideId, setActiveRideId] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getCurrentLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentCoords({ lat: latitude, lng: longitude });
                    setPickup('Current Location (Detected)');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    };

    // Initial check for active ride
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            checkActiveRide(user.id);
        }

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [isAuthenticated, user?.id]);

    // Listen for tactical booking events
    useEffect(() => {
        const handleTacticalBooking = (e: any) => {
            if (e.detail) {
                setPickup(e.detail.pickup || '');
                setDestination(e.detail.destination || '');
                setExpanded(true);
            }
        };

        // Check for URL parameters on mount
        const params = new URLSearchParams(window.location.search);
        const p = params.get('pickup');
        const d = params.get('destination');
        if (p || d) {
            setPickup(p || '');
            setDestination(d || '');
            setExpanded(true);
        }

        window.addEventListener('tactical-booking', handleTacticalBooking);
        return () => window.removeEventListener('tactical-booking', handleTacticalBooking);
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

        const GUEST_ID = '00000000-0000-0000-0000-000000000000';
        const passengerId = user?.id || GUEST_ID;

        // Skip verification for guests
        if (passengerId !== GUEST_ID) {
            const settingsRes = await fetch('/api/settings/system/RIDE_VERIFICATION_ENABLED');
            if (settingsRes.ok) {
                const { value } = await settingsRes.json();
                if (value === true && !showVerification) {
                    const types: ('FACE' | 'OTP')[] = ['FACE', 'OTP'];
                    setVerificationType(types[Math.floor(Math.random() * types.length)]);
                    setShowVerification(true);
                    return;
                }
            }
        }

        setLoading(true);

        try {
            const response = await fetch('/api/rides/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickupLocation: { 
                        address: pickup, 
                        lat: currentCoords?.lat || -1.286389, 
                        lng: currentCoords?.lng || 36.817223 
                    },
                    dropoffLocation: { 
                        address: destination, 
                        lat: -1.2921, 
                        lng: 36.8219 
                    },
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

    const handleVerifyAndBook = async () => {
        setVerificationLoading(true);
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerificationLoading(false);
        setShowVerification(false);
        handleBookRide();
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

    if (!mounted) return null;

    return (
        <section id="booking-section" className="relative z-20 -mt-20 lg:-mt-32 px-4 lg:px-6 mb-24 pointer-events-none">
            <div className="container mx-auto">
                <div className="glass-premium rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 pointer-events-auto transform transition-all duration-700 hover:shadow-[0_0_100px_rgba(250,204,21,0.1)] outline outline-1 outline-white/10">

                    {/* Header */}
                    {!expanded && !bookingConfirmed && (
                        <div className="flex items-center gap-4 mb-10 animate-reveal">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
                                <FaSearch className="text-brand-yellow lg:text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tighter">Instant Logistics.</h2>
                                <p className="text-white/40 text-[10px] lg:text-sm font-bold uppercase tracking-[0.2em]">Neural Deployment Unit</p>
                            </div>
                        </div>
                    )}

                    {bookingConfirmed ? (
                        <div className="text-center py-12 animate-reveal relative overflow-hidden">
                            {/* Ambient Glows */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-yellow/10 blur-[80px] rounded-full" />
                            
                            {/* Status Icon */}
                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative border border-white/10 shadow-2xl">
                                {tripStatus === 'CONFIRMED' && <span className="text-4xl animate-pulse">📡</span>}
                                {tripStatus === 'DRIVER_ASSIGNED' && <span className="text-4xl animate-bounce-short">🚖</span>}
                                {tripStatus === 'ARRIVED' && <span className="text-4xl">📍</span>}
                                {tripStatus === 'IN_PROGRESS' && <span className="text-4xl animate-spin-slow">🛣️</span>}
                                {tripStatus === 'COMPLETED' && <span className="text-4xl">✅</span>}

                                <div className="absolute -inset-4 border border-brand-yellow/20 rounded-full animate-ping-slow" />
                                <div className="absolute -inset-8 border border-brand-accent/10 rounded-full animate-ping-slow animation-delay-400" />
                            </div>

                            <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase underline decoration-brand-yellow decoration-4 underline-offset-8">
                                {tripStatus === 'CONFIRMED' && 'Detecting Units...'}
                                {tripStatus === 'DRIVER_ASSIGNED' && 'Unit Deployed'}
                                {tripStatus === 'ARRIVED' && 'Unit at Sector'}
                                {tripStatus === 'IN_PROGRESS' && 'Transit Protocol'}
                                {tripStatus === 'COMPLETED' && 'Mission Complete'}
                            </h3>

                            <p className="text-white/60 text-lg max-w-md mx-auto mb-10 font-medium">
                                {tripStatus === 'CONFIRMED' && 'Identifying the most efficient terminal for your trajectory.'}
                                {tripStatus === 'DRIVER_ASSIGNED' && (driverInfo ? `Pilot ${driverInfo.name} (${driverInfo.plate}) is initiating intercept.` : 'Your pilot is initiating intercept.')}
                                {tripStatus === 'ARRIVED' && 'Primary unit has reached the extraction point.'}
                                {tripStatus === 'IN_PROGRESS' && `Stabilizing velocity toward ${destination}.`}
                                {tripStatus === 'COMPLETED' && 'Successful extraction to target coordinates.'}
                            </p>

                            <div className="max-w-xl mx-auto">
                                {renderProgressBar()}
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
                                {tripStatus !== 'COMPLETED' && (
                                    <button className="px-8 py-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95 shadow-lg">
                                        Abort Mission
                                    </button>
                                )}
                                {tripStatus === 'COMPLETED' && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-10 py-4 rounded-2xl bg-brand-yellow text-black text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all active:scale-95"
                                    >
                                        Initiate New Protocol
                                    </button>
                                )}
                                <button className="px-8 py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs font-black uppercase tracking-widest border border-white/10 transition-all">
                                    Admin Link
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            {/* Inputs */}
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Extraction Source</label>
                                        <button 
                                            onClick={getCurrentLocation}
                                            className="text-brand-yellow hover:text-white transition-colors flex items-center gap-1 group/loc"
                                            title="Use my current location"
                                        >
                                            <span className="text-[8px] font-bold uppercase tracking-wider opacity-0 group-hover/loc:opacity-100 transition-opacity">Auto-Detect</span>
                                            <FaLocationArrow className="text-xs animate-pulse" />
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Enter pickup point"
                                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-yellow focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-yellow/10 outline-none text-white font-bold placeholder-white/20 transition-all duration-500"
                                            value={pickup}
                                            onChange={(e) => setPickup(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Target Coordinates</label>
                                        <FaMapMarkerAlt className="text-brand-accent text-xs animate-pulse" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Enter destination"
                                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-accent focus:bg-white/[0.08] focus:ring-4 focus:ring-brand-accent/10 outline-none text-white font-bold placeholder-white/20 transition-all duration-500"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full lg:w-auto pt-6 lg:pt-0">
                                <button
                                    onClick={handleGetEstimates}
                                    disabled={loading || !pickup || !destination}
                                    className={`relative w-full lg:w-64 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden group active:scale-95 ${loading || !pickup || !destination
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                        : 'text-black shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(250,204,21,0.5)]'
                                        }`}
                                >
                                    <span className="absolute inset-0 bg-brand-yellow group-hover:bg-amber-400 transition-colors duration-500" />
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>Compute Trajectory</>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Expansion */}
                    {expanded && !bookingConfirmed && vehicleOptions.length > 0 && (
                        <div className="mt-12 pt-12 border-t border-white/10 animate-reveal text-left">
                            {/* ... (existing vehicle options code) */}
                            <h3 className="text-white text-xl font-black mb-8 tracking-tight uppercase flex items-center gap-3">
                                <span className="w-8 h-px bg-brand-yellow"></span>
                                Available Fleet Modules
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                                {vehicleOptions.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVehicle(v.id)}
                                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group relative overflow-hidden ${selectedVehicle === v.id
                                            ? 'bg-brand-yellow text-black border-brand-yellow shadow-[0_0_40px_rgba(250,204,21,0.3)]'
                                            : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-500">{v.icon}</span>
                                            <span className="font-black text-lg block uppercase tracking-tighter">{v.name}</span>
                                            <div className="flex items-center gap-2 mt-2 opacity-60">
                                                <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                                                <span className="text-xs font-bold uppercase tracking-widest">{v.eta}m ETA</span>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-current/10">
                                                <span className="text-[10px] uppercase font-black opacity-60">Base Fare</span>
                                                <span className="font-black text-2xl block tracking-tighter">KES {v.price.toFixed(0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <p className="text-white/40 text-[10px] lg:text-xs font-medium max-w-sm text-center lg:text-left">Prices are inclusive of neural network surge fees and system processing mandates.</p>
                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
                                    <button
                                        onClick={() => setExpanded(false)}
                                        className="px-8 py-4 text-white/40 hover:text-white uppercase font-black tracking-widest text-xs transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleBookRide}
                                        disabled={!selectedVehicle}
                                        className={`px-12 py-5 lg:py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-500 active:scale-95 ${selectedVehicle 
                                            ? 'bg-brand-accent text-black shadow-[0_15px_30px_-10px_rgba(34,211,238,0.5)] hover:bg-cyan-300' 
                                            : 'bg-white/5 text-white/20 border border-white/5'
                                            }`}
                                    >
                                        Confirm Protocol
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Modal */}
            {showVerification && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => setShowVerification(false)}></div>
                    <div className="relative glass-premium p-8 rounded-[2.5rem] max-w-md w-full border border-brand-yellow/30 shadow-2xl animate-reveal">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                {verificationType === 'FACE' ? (
                                    <FaShieldAlt className="text-4xl text-brand-yellow animate-pulse" />
                                ) : (
                                    <FaFingerprint className="text-4xl text-brand-yellow animate-pulse" />
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Identity Check</h3>
                            <p className="text-white/40 mb-8 font-medium">
                                {verificationType === 'FACE' 
                                    ? "Please look at the camera for facial recognition protocol." 
                                    : "Please confirm your identity via secondary verification."}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVerifyAndBook}
                                    disabled={verificationLoading}
                                    className="w-full py-4 rounded-2xl bg-brand-yellow text-black font-black uppercase tracking-widest hover:bg-brand-yellowHover transition-all shadow-lg flex items-center justify-center gap-3"
                                >
                                    {verificationLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        "Authenticate Now"
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
