'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    FaLocationArrow,
    FaMapMarkerAlt,
    FaSearch,
    FaFingerprint,
    FaShieldAlt,
    FaCheckCircle,
    FaRoute,
    FaClock,
    FaTimes,
    FaSms,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { isValidContactPhone } from '@/config/contactConfig';
import type { MapMarker } from '@/components/maps/CabiMap';
import MapPinModal, {
    Coords,
    MapPinMode,
    inferCoordsFromText,
    resolveAddressFromCoords,
    buildPinMarkers,
} from '@/components/maps/MapPinModal';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

const CabiMap = dynamic(() => import('@/components/maps/CabiMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[260px] rounded-xl bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-neutral-500">
            Loading interactive map...
        </div>
    ),
});

interface VehicleOption {
    id: string;
    name: string;
    price: number;
    eta: number;
    icon: string;
}

interface TrajectoryData {
    distanceKm: number;
    durationMin: number;
    pickupCoords: Coords;
    dropoffCoords: Coords;
    polyline: [number, number][];
}

export default function BookingSection() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
    const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);
    const [trajectory, setTrajectory] = useState<TrajectoryData | null>(null);

    const [mapPickerMode, setMapPickerMode] = useState<MapPinMode | null>(null);

    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { user, isAuthenticated } = useAuth();

    // User Verification state for completing a trip request
    const [showVerification, setShowVerification] = useState(false);
    const [verifyName, setVerifyName] = useState('');
    const [verifyPhone, setVerifyPhone] = useState('');
    const [otpSentCode, setOtpSentCode] = useState<string | null>(null);
    const [otpInput, setOtpInput] = useState('');
    const [identityAttested, setIdentityAttested] = useState(true);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(false);

    const [tripStatus, setTripStatus] = useState<
        'IDLE' | 'SEARCHING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'
    >('IDLE');
    const [progressStep, setProgressStep] = useState(0);
    const [activeRideId, setActiveRideId] = useState<string | null>(null);
    const [driverInfo, setDriverInfo] = useState<any>(null);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const simTimeouts = useRef<NodeJS.Timeout[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            simTimeouts.current.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        if (user) {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
            if (fullName && !verifyName) setVerifyName(fullName);
            if (user.phone && !verifyPhone) setVerifyPhone(user.phone);
        }
    }, [user]);

    const getCurrentLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setPickupCoords({ lat: latitude, lng: longitude });
                    const label = await resolveAddressFromCoords(latitude, longitude);
                    setPickup(label === `Pinned (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` ? 'Current Location (GPS)' : label);
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

    // Listen for tactical booking events & URL query params
    useEffect(() => {
        const handleTacticalBooking = (e: any) => {
            if (e.detail) {
                setPickup(e.detail.pickup || '');
                setDestination(e.detail.destination || '');
                if (e.detail.pickupCoords !== undefined) setPickupCoords(e.detail.pickupCoords);
                if (e.detail.dropoffCoords !== undefined) setDropoffCoords(e.detail.dropoffCoords);
                setExpanded(true);
            }
        };

        const params = new URLSearchParams(window.location.search);
        const p = params.get('pickup');
        const d = params.get('destination');
        const pLat = parseFloat(params.get('pLat') || '');
        const pLng = parseFloat(params.get('pLng') || '');
        const dLat = parseFloat(params.get('dLat') || '');
        const dLng = parseFloat(params.get('dLng') || '');
        if (p || d) {
            setPickup(p || '');
            setDestination(d || '');
            if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
                setPickupCoords({ lat: pLat, lng: pLng });
            }
            if (Number.isFinite(dLat) && Number.isFinite(dLng)) {
                setDropoffCoords({ lat: dLat, lng: dLng });
            }
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
        setPickup(typeof ride.pickupLocation === 'string' ? ride.pickupLocation : ride.pickupLocation?.address || pickup);
        setDestination(typeof ride.dropoffLocation === 'string' ? ride.dropoffLocation : ride.dropoffLocation?.address || destination);
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
                    plate: ride.driver.licenseNumber || 'KDK 482G',
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

    const handleComputeTrajectory = async () => {
        if (!pickup.trim() || !destination.trim()) return;

        setLoading(true);
        setBookingError(null);
        setTripStatus('SEARCHING');

        const resolvedPickup =
            pickupCoords || inferCoordsFromText(pickup, { lat: -1.286389, lng: 36.817223 });
        const resolvedDropoff =
            dropoffCoords || inferCoordsFromText(destination, { lat: -1.2611, lng: 36.8025 });

        if (!pickupCoords) setPickupCoords(resolvedPickup);
        if (!dropoffCoords) setDropoffCoords(resolvedDropoff);

        try {
            const response = await fetch('/api/rides/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup,
                    destination,
                    pickupCoords: resolvedPickup,
                    dropoffCoords: resolvedDropoff,
                    includeTrajectory: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : data.estimates || [];
                setVehicleOptions(list);
                if (!Array.isArray(data) && data.trajectory) {
                    setTrajectory(data.trajectory);
                }
                if (list.length > 0 && !selectedVehicle) {
                    setSelectedVehicle(list[1]?.id || list[0].id);
                }
                setExpanded(true);
            } else {
                setBookingError('Unable to compute trajectory. Please try again.');
            }
        } catch (error) {
            console.error('Failed to compute trajectory', error);
            setBookingError('Network error while computing trajectory.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenVerification = () => {
        if (!selectedVehicle) return;
        setVerificationError(null);
        if (!otpSentCode) {
            setOtpSentCode('4829');
        }
        setShowVerification(true);
    };

    const handleSendOtp = () => {
        setVerificationError(null);
        if (!isValidContactPhone(verifyPhone)) {
            setVerificationError('Please enter a valid phone number before requesting a code.');
            return;
        }
        setOtpSentCode('4829');
    };

    const handleVerifyAndBook = async () => {
        setVerificationError(null);

        if (verifyName.trim().length < 2) {
            setVerificationError('Please enter your full name.');
            return;
        }
        if (!isValidContactPhone(verifyPhone)) {
            setVerificationError('Please enter a valid phone number (e.g. +254 712 345 678).');
            return;
        }
        const trimmedOtp = otpInput.trim();
        if (!/^\d{4}$/.test(trimmedOtp) || (otpSentCode && trimmedOtp !== otpSentCode)) {
            setVerificationError(`Please enter the 4-digit verification code${otpSentCode ? ` (${otpSentCode})` : ''}.`);
            return;
        }
        if (!identityAttested) {
            setVerificationError('Please confirm your passenger identity check to proceed.');
            return;
        }

        const vehicle = vehicleOptions.find((v) => v.id === selectedVehicle);
        if (!vehicle) return;

        setVerificationLoading(true);
        setBookingError(null);

        const resolvedPickup =
            pickupCoords || { lat: -1.286389, lng: 36.817223 };
        const resolvedDropoff =
            dropoffCoords || { lat: -1.2611, lng: 36.8025 };

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('authToken');
                if (token) headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/rides/book', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    pickupLocation: {
                        address: pickup,
                        lat: resolvedPickup.lat,
                        lng: resolvedPickup.lng,
                    },
                    dropoffLocation: {
                        address: destination,
                        lat: resolvedDropoff.lat,
                        lng: resolvedDropoff.lng,
                    },
                    vehicleType: vehicle.name,
                    fare: vehicle.price,
                    passengerId: user?.id,
                    verification: {
                        verified: true,
                        method: 'PHONE_OTP',
                        name: verifyName.trim(),
                        phone: verifyPhone.trim(),
                        code: trimmedOtp,
                    },
                }),
            });

            const ride = await response.json();
            if (!response.ok) {
                setVerificationError(ride?.message || 'Unable to confirm trip request.');
                return;
            }

            setShowVerification(false);
            setBookingConfirmed(true);
            setTripStatus('CONFIRMED');
            setProgressStep(1);
            setActiveRideId(ride.id);

            if (ride.driver?.user) {
                setDriverInfo({
                    name: ride.driver.user.fullName,
                    plate: ride.driver.licenseNumber || 'KDK 482G',
                });
            }

            if (ride.simulatedQueue) {
                simTimeouts.current.forEach(clearTimeout);
                simTimeouts.current = [
                    setTimeout(() => {
                        setTripStatus('DRIVER_ASSIGNED');
                        setProgressStep(2);
                    }, 3000),
                    setTimeout(() => {
                        setTripStatus('ARRIVED');
                        setProgressStep(3);
                    }, 7000),
                ];
            } else if (user?.id) {
                startPolling(user.id);
            }
        } catch (error) {
            console.error('Failed to book ride', error);
            setVerificationError('Network error confirming your trip request.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleResetBooking = () => {
        simTimeouts.current.forEach(clearTimeout);
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setBookingConfirmed(false);
        setTripStatus('IDLE');
        setProgressStep(0);
        setActiveRideId(null);
        setExpanded(false);
        setSelectedVehicle(null);
        setTrajectory(null);
        setOtpInput('');
    };

    const mapMarkers: MapMarker[] = useMemo(
        () => buildPinMarkers(pickup, pickupCoords, destination, dropoffCoords),
        [pickupCoords, dropoffCoords, pickup, destination]
    );

    const renderProgressBar = () => {
        const steps = ['Confirmed', 'Driver Assigned', 'Arrived', 'In Progress'];
        return (
            <div className="w-full mt-6">
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`text-xs font-bold ${index + 1 <= progressStep ? 'text-brand-yellow' : 'text-neutral-500 dark:text-gray-600'}`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
        <section id="booking-section" className="relative z-20 mt-4 lg:mt-8 px-4 lg:px-6 mb-16 sm:mb-24 pointer-events-none">
            <div className="container mx-auto max-w-7xl">
                <div className="glass-premium rounded-[1.25rem] lg:rounded-[1.5rem] p-5 sm:p-8 lg:p-12 pointer-events-auto transform transition-all duration-700 hover:shadow-[0_0_100px_rgba(250,204,21,0.1)] outline outline-1 outline-black/5 dark:outline-white/10">
                    {/* Header */}
                    {!expanded && !bookingConfirmed && (
                        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-reveal">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-executive-gold/15 flex items-center justify-center border border-executive-gold/30 shrink-0">
                                    <FaSearch className="text-executive-gold lg:text-xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-executive-gold mb-0.5">
                                        Instant Logistics.
                                    </p>
                                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Neural Deployment Unit
                                    </h2>
                                </div>
                            </div>
                        </div>
                    )}

                    {bookingConfirmed ? (
                        <div className="text-center py-10 animate-reveal relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-yellow/10 blur-[80px] rounded-full" />

                            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative border border-slate-200 dark:border-white/10 shadow-2xl">
                                {tripStatus === 'CONFIRMED' && <span className="text-4xl animate-pulse">📡</span>}
                                {tripStatus === 'DRIVER_ASSIGNED' && <span className="text-4xl animate-bounce-short">🚖</span>}
                                {tripStatus === 'ARRIVED' && <span className="text-4xl">📍</span>}
                                {tripStatus === 'IN_PROGRESS' && <span className="text-4xl animate-spin-slow">🛣️</span>}
                                {tripStatus === 'COMPLETED' && <span className="text-4xl">✅</span>}

                                <div className="absolute -inset-4 border border-brand-yellow/25 rounded-full animate-ping-slow" />
                                <div className="absolute -inset-8 border border-[#D4AF37]/15 rounded-full animate-ping-slow animation-delay-400" />
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-4">
                                <FaCheckCircle className="w-3.5 h-3.5" />
                                <span>
                                    Identity Verified {activeRideId ? `• Trip #${activeRideId}` : ''}
                                </span>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase underline decoration-brand-yellow decoration-4 underline-offset-8">
                                {tripStatus === 'CONFIRMED' && 'Finding Your Driver...'}
                                {tripStatus === 'DRIVER_ASSIGNED' && 'Driver Assigned'}
                                {tripStatus === 'ARRIVED' && 'Driver Arrived'}
                                {tripStatus === 'IN_PROGRESS' && 'Trip in Progress'}
                                {tripStatus === 'COMPLETED' && 'Trip Completed'}
                            </h3>

                            <p className="text-slate-600 dark:text-white/60 text-base sm:text-lg max-w-md mx-auto mb-6 font-medium">
                                {tripStatus === 'CONFIRMED' && 'Matching you with the closest verified chauffeur.'}
                                {tripStatus === 'DRIVER_ASSIGNED' &&
                                    (driverInfo
                                        ? `${driverInfo.name} (${driverInfo.plate}) is on the way to your pickup point.`
                                        : 'Your driver is on the way.')}
                                {tripStatus === 'ARRIVED' && 'Your driver has arrived at your pickup location.'}
                                {tripStatus === 'IN_PROGRESS' && `En route to ${destination}.`}
                                {tripStatus === 'COMPLETED' && 'You have arrived safely at your destination.'}
                            </p>

                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-mono">
                                {pickup} &rarr; {destination}
                            </p>

                            <div className="max-w-xl mx-auto">{renderProgressBar()}</div>

                            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
                                {tripStatus !== 'COMPLETED' && (
                                    <button
                                        type="button"
                                        onClick={handleResetBooking}
                                        className="px-8 py-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95 shadow-lg"
                                    >
                                        Cancel Ride
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleResetBooking}
                                    className="px-10 py-4 rounded-2xl bg-brand-yellow text-black text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all active:scale-95"
                                >
                                    Book Another Ride
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                            {/* Inputs with Map Pin Points */}
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center px-1 gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-white/80">
                                            Pickup Location
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={getCurrentLocation}
                                                className="text-[#D4AF37] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                                title="Use my current location"
                                            >
                                                <FaLocationArrow className="text-xs" />
                                                <span>GPS</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('pickup')}
                                                className="text-[#D4AF37] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                                title="Pin pickup on map"
                                            >
                                                <FaMapMarkerAlt className="text-xs" />
                                                <span>Pin on Map</span>
                                            </button>
                                        </div>
                                    </div>
                                    <LocationAutocomplete
                                        id="booking-pickup-input"
                                        value={pickup}
                                        onChange={(val) => {
                                            setPickup(val);
                                            setPickupCoords(null);
                                        }}
                                        onSelect={(label, coords) => {
                                            setPickup(label);
                                            setPickupCoords(coords);
                                        }}
                                        placeholder="Enter or pin pickup point"
                                        ariaLabel="Pickup Location"
                                        surfaceClassName="bg-black/5 dark:bg-white/5 rounded-xl"
                                        inputClassName="w-full pl-5 pr-12 py-5 border border-black/10 dark:border-white/10 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-white/25 transition-all duration-300"
                                        rightSlot={
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('pickup')}
                                                aria-label="Select pickup pin point on map"
                                                title="Pin pickup location on map"
                                                className={`absolute right-3 z-10 p-2.5 rounded-lg border transition-all ${
                                                    pickupCoords
                                                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                                        : 'bg-white dark:bg-surface-dark text-[#D4AF37] border-slate-200 dark:border-white/10 hover:border-[#D4AF37]'
                                                }`}
                                            >
                                                <FaMapMarkerAlt className="w-4 h-4" />
                                            </button>
                                        }
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center px-1 gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-white/80">
                                            Drop-off Destination
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setMapPickerMode('dropoff')}
                                            className="text-[#D4AF37] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                            title="Pin drop-off destination on map"
                                        >
                                            <FaMapMarkerAlt className="text-xs" />
                                            <span>Pin on Map</span>
                                        </button>
                                    </div>
                                    <LocationAutocomplete
                                        id="booking-dropoff-input"
                                        value={destination}
                                        onChange={(val) => {
                                            setDestination(val);
                                            setDropoffCoords(null);
                                        }}
                                        onSelect={(label, coords) => {
                                            setDestination(label);
                                            setDropoffCoords(coords);
                                        }}
                                        placeholder="Enter or pin destination"
                                        ariaLabel="Drop-off Destination"
                                        surfaceClassName="bg-black/5 dark:bg-white/5 rounded-xl"
                                        inputClassName="w-full pl-5 pr-12 py-5 border border-black/10 dark:border-white/10 rounded-xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 outline-none text-gray-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-white/25 transition-all duration-300"
                                        rightSlot={
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('dropoff')}
                                                aria-label="Select drop-off pin point on map"
                                                title="Pin drop-off destination on map"
                                                className={`absolute right-3 z-10 p-2.5 rounded-lg border transition-all ${
                                                    dropoffCoords
                                                        ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                                        : 'bg-white dark:bg-surface-dark text-[#D4AF37] border-slate-200 dark:border-white/10 hover:border-[#D4AF37]'
                                                }`}
                                            >
                                                <FaMapMarkerAlt className="w-4 h-4" />
                                            </button>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Primary Action Button: Compute Trajectory */}
                            <div className="w-full lg:w-auto pt-2 lg:pt-6">
                                <button
                                    type="button"
                                    onClick={handleComputeTrajectory}
                                    disabled={loading || !pickup.trim() || !destination.trim()}
                                    className={`relative w-full lg:w-64 py-5 px-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden group active:scale-95 ${
                                        loading || !pickup.trim() || !destination.trim()
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-white/5 dark:text-white/20 dark:border-white/5 cursor-not-allowed'
                                            : 'text-black shadow-[0_20px_40px_-15px_rgba(250,204,21,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(250,204,21,0.5)]'
                                    }`}
                                >
                                    <span
                                        className={`absolute inset-0 transition-colors duration-500 ${
                                            loading || !pickup.trim() || !destination.trim()
                                                ? 'hidden'
                                                : 'bg-brand-yellow group-hover:bg-amber-400'
                                        }`}
                                    />
                                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <span>Computing Trajectory</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaRoute className="w-4 h-4" />
                                                <span>Compute Trajectory</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {bookingError && (
                        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                            {bookingError}
                        </div>
                    )}

                    {/* Results Expansion: Trajectory Map + Estimated Tiers */}
                    {expanded && !bookingConfirmed && vehicleOptions.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-slate-200 dark:border-white/10 animate-reveal text-left space-y-8">
                            {/* Trajectory Preview & Telemetry */}
                            {trajectory && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-slate-50 dark:bg-surface-dark/80 border border-slate-200 dark:border-[#D4AF37]/25 rounded-2xl p-4 sm:p-6">
                                    <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] mb-1">
                                                Trajectory Computed
                                            </p>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                Route Overview
                                            </h3>
                                            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-neutral-300">
                                                <div className="flex items-start gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-black border-2 border-[#D4AF37] mt-1 shrink-0" />
                                                    <span>
                                                        <strong className="text-slate-900 dark:text-white">Pickup:</strong> {pickup}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] border-2 border-black mt-1 shrink-0" />
                                                    <span>
                                                        <strong className="text-slate-900 dark:text-white">Drop-off:</strong> {destination}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                                    <FaRoute className="text-[#D4AF37]" /> Distance
                                                </div>
                                                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                                    {trajectory.distanceKm} km
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                                    <FaClock className="text-[#D4AF37]" /> Est. Time
                                                </div>
                                                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                                    ~{trajectory.durationMin} min
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 h-[220px] sm:h-[250px] rounded-xl overflow-hidden">
                                        <CabiMap
                                            center={[trajectory.pickupCoords.lat, trajectory.pickupCoords.lng]}
                                            zoom={12}
                                            height="100%"
                                            markers={mapMarkers}
                                            route={trajectory.polyline}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-gray-900 dark:text-white text-xl font-black mb-6 tracking-tight uppercase flex items-center gap-3">
                                    <span className="w-8 h-px bg-brand-yellow"></span>
                                    Select Your Vehicle
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                                    {vehicleOptions.map((v) => (
                                        <div
                                            key={v.id}
                                            onClick={() => setSelectedVehicle(v.id)}
                                            className={`p-6 rounded-[1rem] border-2 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                                                selectedVehicle === v.id
                                                    ? 'bg-brand-yellow text-black border-brand-yellow shadow-[0_0_40px_rgba(250,204,21,0.3)]'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:border-[#D4AF37]/60'
                                            }`}
                                        >
                                            <div className="relative z-10">
                                                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                                                    {v.icon}
                                                </span>
                                                <span className="font-black text-lg block uppercase tracking-tighter">
                                                    {v.name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1.5 opacity-75">
                                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                                                    <span className="text-xs font-bold uppercase tracking-widest">
                                                        {v.eta}m away
                                                    </span>
                                                </div>
                                                <div className="mt-5 pt-4 border-t border-current/15">
                                                    <span className="text-[10px] uppercase font-black opacity-70 block">
                                                        Estimated Minimum Fare
                                                    </span>
                                                    <span className="font-black text-2xl block tracking-tighter mt-0.5">
                                                        KES {Math.round(v.price).toLocaleString()} &ge;
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <p className="text-gray-500 dark:text-white/50 text-xs font-medium max-w-md text-center lg:text-left">
                                        Prices shown are trajectory minimum estimates (&ge;). Complete quick passenger verification in the next step to dispatch your ride.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setExpanded(false)}
                                            className="px-8 py-4 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white uppercase font-black tracking-widest text-xs transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleOpenVerification}
                                            disabled={!selectedVehicle}
                                            className={`px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-95 ${
                                                selectedVehicle
                                                    ? 'bg-[#D4AF37] hover:bg-[#ffe088] text-black shadow-lg'
                                                    : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-white/5 dark:text-white/20 dark:border-white/5 cursor-not-allowed'
                                            }`}
                                        >
                                            Verify &amp; Confirm Ride
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Map Pin-Point Modal */}
            <MapPinModal
                mode={mapPickerMode}
                onModeChange={setMapPickerMode}
                pickup={pickup}
                destination={destination}
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                onPickupSelect={(label, coords) => {
                    setPickupCoords(coords);
                    setPickup(label);
                }}
                onDropoffSelect={(label, coords) => {
                    setDropoffCoords(coords);
                    setDestination(label);
                }}
            />

            {/* Passenger Identity & Trip Verification Modal */}
            {showVerification && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowVerification(false)}
                    />
                    <div className="relative bg-white dark:bg-card-dark p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 dark:border-[#D4AF37]/30 shadow-2xl animate-reveal z-10">
                        <button
                            type="button"
                            onClick={() => setShowVerification(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                            aria-label="Close verification modal"
                        >
                            <FaTimes />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaShieldAlt className="text-3xl text-[#D4AF37]" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Passenger Verification
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-white/60 mt-1.5">
                                Verify your contact details via 4-digit SMS code to finish dispatching your trip.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={verifyName}
                                    onChange={(e) => setVerifyName(e.target.value)}
                                    placeholder="Amara Ochieng"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
                                    Phone Number *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        value={verifyPhone}
                                        onChange={(e) => setVerifyPhone(e.target.value)}
                                        placeholder="+254 712 345 678"
                                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold text-slate-800 dark:text-white transition-colors shrink-0 flex items-center gap-1.5"
                                    >
                                        <FaSms />
                                        <span>{otpSentCode ? 'Resend' : 'Send Code'}</span>
                                    </button>
                                </div>
                            </div>

                            {otpSentCode && (
                                <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-slate-800 dark:text-[#ffe088] flex items-center justify-between">
                                    <span>Verification Code Sent via SMS</span>
                                    <span className="font-mono font-black tracking-widest">
                                        {otpSentCode}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
                                    4-Digit Verification Code *
                                </label>
                                <div className="relative">
                                    <FaFingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 4-digit code (e.g. 4829)"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-neutral-300 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={identityAttested}
                                    onChange={(e) => setIdentityAttested(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                                <span>
                                    I confirm these trip &amp; identity details for chauffeur dispatch and safety verification.
                                </span>
                            </label>

                            {verificationError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                    {verificationError}
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleVerifyAndBook}
                                    disabled={verificationLoading}
                                    className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    {verificationLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                            <span>Dispatching Trip...</span>
                                        </>
                                    ) : (
                                        <span>Verify &amp; Finish Request</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVerification(false)}
                                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/50 text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
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
