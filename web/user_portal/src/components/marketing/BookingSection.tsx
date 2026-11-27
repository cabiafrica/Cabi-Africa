import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    FaLocationArrow,
    FaMapMarkerAlt,
    FaRoute,
    FaShieldAlt,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaSms,
    FaFingerprint,
    FaUserFriends,
    FaCar,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { isValidContactPhone } from '@/config/contactConfig';
import type { MapMarker } from '@/components/maps/CabiMap';
import MapPinModal, {
    Coords,
    MapPinMode,
    inferCoordsFromText,
    buildPinMarkers,
} from '@/components/maps/MapPinModal';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

// Dynamically import CabiMap with SSR disabled to prevent Leaflet window reference bugs
const CabiMap = dynamic(() => import('@/components/maps/CabiMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[300px] rounded-[3px] bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-neutral-500">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Loading interactive route map...</span>
            </div>
        </div>
    ),
});

interface VehicleOption {
    id: string;
    name: string;
    price: number;
    eta: number;
    icon: string;
    tag?: string;
    capacity?: string;
}

interface TrajectoryData {
    distanceKm: number;
    durationMin: number;
    pickupCoords: Coords;
    dropoffCoords: Coords;
    polyline: [number, number][];
}

const DEFAULT_VEHICLES: VehicleOption[] = [
    { id: 'boda', name: 'Cabi Boda', price: 150, eta: 3, icon: '🏍️', tag: 'FASTEST', capacity: '1 Seat' },
    { id: 'cabigo', name: 'CabiGo', price: 320, eta: 4, icon: '🚗', tag: 'POPULAR', capacity: '4 Seats' },
    { id: 'executive', name: 'Executive Suite', price: 650, eta: 6, icon: '✨', tag: 'LUXURY', capacity: '3 Seats' },
    { id: 'xl', name: 'Diplomatic XL', price: 1100, eta: 8, icon: '🚙', tag: 'GROUP', capacity: '6 Seats' },
];

export default function BookingSection() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
    const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);
    const [trajectory, setTrajectory] = useState<TrajectoryData | null>(null);

    const [mapPickerMode, setMapPickerMode] = useState<MapPinMode | null>(null);

    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>(DEFAULT_VEHICLES);
    const [loading, setLoading] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('cabigo');
    const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
    const [mounted, setMounted] = useState(false);

    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [requestForOther, setRequestForOther] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && navigator.geolocation && navigator.permissions?.query) {
            navigator.permissions
                .query({ name: 'geolocation' })
                .then((status) => {
                    if (status.state === 'granted') {
                        getCurrentLocation(true);
                    }
                })
                .catch(() => undefined);
        }
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    useEffect(() => {
        if (user) {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
            if (fullName && !verifyName) setVerifyName(fullName);
            if (user.phone && !verifyPhone) setVerifyPhone(user.phone);
        }
    }, [user]);

    const getCurrentLocation = (silent = false) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            if (!silent) setGpsError('Geolocation is not supported by your browser.');
            return;
        }

        if (!silent) {
            setGpsLoading(true);
            setGpsError(null);
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setPickupCoords({ lat, lng });

                const label = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                setPickup(label);
                if (!silent) setGpsLoading(false);
            },
            (error) => {
                if (!silent) {
                    setGpsLoading(false);
                    if (error.code === error.PERMISSION_DENIED) {
                        setGpsError('Location permission denied. Use map pin or type your pickup.');
                    } else {
                        setGpsError('Could not acquire GPS position. Please type your location.');
                    }
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isAuthenticated && user?.id) {
            checkActiveRide(user.id);
        }

        const handleTacticalBooking = (e: any) => {
            if (e.detail) {
                setPickup(e.detail.pickup || '');
                setDestination(e.detail.destination || '');
                if (e.detail.pickupCoords !== undefined) setPickupCoords(e.detail.pickupCoords);
                if (e.detail.dropoffCoords !== undefined) setDropoffCoords(e.detail.dropoffCoords);
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
                startPolling(ride.id, passengerId);
            }
        } catch (error) {
            console.error('Failed to check active ride', error);
        }
    };

    const startPolling = (rideId?: string, passengerId?: string) => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = setInterval(() => {
            pollRideStatus(rideId, passengerId);
        }, 5000);
    };

    const pollRideStatus = async (rideId?: string, passengerId?: string) => {
        try {
            const query = rideId ? `rideId=${encodeURIComponent(rideId)}` : `passengerId=${encodeURIComponent(passengerId || '')}`;
            const response = await fetch(`/api/rides/status?${query}`);
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
        setActiveRideId(ride.tripCode || ride.id);
        setPickup(typeof ride.pickupLocation === 'string' ? ride.pickupLocation : ride.pickupLocation?.address || pickup);
        setDestination(typeof ride.dropoffLocation === 'string' ? ride.dropoffLocation : ride.dropoffLocation?.address || destination);
        setBookingConfirmed(true);

        const status = ride.status;
        if (status === 'REQUESTED' || status === 'MATCHING') {
            setTripStatus('CONFIRMED');
            setProgressStep(1);
        } else if (status === 'ACCEPTED' || status === 'DISPATCHED') {
            setTripStatus('DRIVER_ASSIGNED');
            setProgressStep(2);
        } else if (status === 'ARRIVED') {
            setTripStatus('ARRIVED');
            setProgressStep(3);
        } else if (status === 'IN_PROGRESS') {
            setTripStatus('IN_PROGRESS');
            setProgressStep(4);
        } else if (status === 'COMPLETED') {
            setTripStatus('COMPLETED');
            setProgressStep(5);
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }

        if (ride.driver?.user) {
            setDriverInfo({
                name: ride.driver.user.fullName || `${ride.driver.user.firstName || ''} ${ride.driver.user.lastName || ''}`.trim(),
                plate: ride.driver.vehicles?.[0]?.plateNumber || ride.driver.licenseNumber || 'Assigned Vehicle',
            });
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
                // Merge tags and capacities
                const mergedList = list.map((v: VehicleOption) => {
                    const found = DEFAULT_VEHICLES.find((d) => d.id === v.id);
                    return { ...v, tag: found?.tag, capacity: found?.capacity };
                });
                setVehicleOptions(mergedList);
                if (!Array.isArray(data) && data.trajectory) {
                    setTrajectory(data.trajectory);
                }
                if (mergedList.length > 0 && !selectedVehicle) {
                    setSelectedVehicle(mergedList[1]?.id || mergedList[0].id);
                }
            } else {
                setBookingError('Unable to compute route prices. Please check locations and try again.');
            }
        } catch (error) {
            console.error('Failed to compute route prices', error);
            setBookingError('Network error while computing trajectory.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenVerification = () => {
        if (!selectedVehicle) return;
        setVerificationError(null);
        if (isAuthenticated && user) {
            setVerifyName(user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Passenger');
            if (user.phone) setVerifyPhone(user.phone);
        }
        if (!otpSentCode) {
            setOtpSentCode(String(Math.floor(1000 + Math.random() * 9000)));
        }
        setShowVerification(true);
    };

    const handleSendOtp = async () => {
        setVerificationError(null);
        if (!isValidContactPhone(verifyPhone)) {
            setVerificationError('Please enter a valid phone number before requesting a code.');
            return;
        }
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: verifyPhone, purpose: 'ride_verification' }),
            });
            const data = await res.json();
            if (data.devOtp) {
                setOtpSentCode(data.devOtp);
            } else {
                setOtpSentCode(String(Math.floor(1000 + Math.random() * 9000)));
            }
        } catch {
            setOtpSentCode(String(Math.floor(1000 + Math.random() * 9000)));
        }
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
        if (!isAuthenticated) {
            if (!/^\d{4,6}$/.test(trimmedOtp) || (otpSentCode && trimmedOtp !== otpSentCode)) {
                setVerificationError(`Please enter the verification code${otpSentCode ? ` (${otpSentCode})` : ''}.`);
                return;
            }
        }
        if (!identityAttested) {
            setVerificationError('Please confirm your passenger identity check to proceed.');
            return;
        }
        if (requestForOther) {
            if (recipientName.trim().length < 2) {
                setVerificationError('Please enter the recipient passenger’s full name.');
                return;
            }
            if (!isValidContactPhone(recipientPhone)) {
                setVerificationError('Please enter a valid phone number for the recipient passenger.');
                return;
            }
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
                    requestedFor: requestForOther
                        ? { name: recipientName.trim(), phone: recipientPhone.trim() }
                        : undefined,
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
            setActiveRideId(ride.tripCode || ride.id);

            if (ride.driver?.user) {
                setDriverInfo({
                    name: ride.driver.user.fullName,
                    plate: ride.driver.vehicles?.[0]?.plateNumber || ride.driver.licenseNumber || 'Assigned Vehicle',
                });
            }

            startPolling(ride.id, ride.passengerId || user?.id);
        } catch (error) {
            console.error('Failed to book ride', error);
            setVerificationError('Network error confirming your trip request.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleResetBooking = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setBookingConfirmed(false);
        setTripStatus('IDLE');
        setProgressStep(0);
        setActiveRideId(null);
        setSelectedVehicle('cabigo');
        setTrajectory(null);
        setOtpInput('');
    };

    const mapMarkers: MapMarker[] = useMemo(
        () => buildPinMarkers(pickup, pickupCoords, destination, dropoffCoords),
        [pickupCoords, dropoffCoords, pickup, destination]
    );

    const activeVehicleObj = useMemo(
        () => vehicleOptions.find((v) => v.id === selectedVehicle) || vehicleOptions[1] || vehicleOptions[0],
        [vehicleOptions, selectedVehicle]
    );

    const renderProgressBar = () => {
        const steps = ['Confirmed', 'Driver Assigned', 'Arrived', 'In Progress'];
        return (
            <div className="w-full mt-6">
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`text-[11px] font-bold uppercase tracking-wider ${
                                index + 1 <= progressStep ? 'text-amber-500 font-black' : 'text-slate-400 dark:text-neutral-500'
                            }`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-[3px] overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(progressStep / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        );
    };

    if (!mounted) return null;

    return (
        <section id="booking-section" className="relative z-20 mt-4 lg:mt-6 px-4 lg:px-6 mb-16 sm:mb-24">
            <div className="container mx-auto max-w-7xl">
                {/* Main Glass Card with 3px radius and golden accent border */}
                <div className="relative bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-xl rounded-[3px] p-5 sm:p-7 lg:p-9 border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300">
                    {/* Top Golden Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-t-[3px]" />

                    {bookingConfirmed ? (
                        /* Active Ride Status View */
                        <div className="text-center py-8 animate-reveal relative overflow-hidden">
                            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-[3px] flex items-center justify-center mx-auto mb-5 shadow-lg">
                                {tripStatus === 'CONFIRMED' && <span className="text-3xl animate-pulse">📡</span>}
                                {tripStatus === 'DRIVER_ASSIGNED' && <span className="text-3xl animate-bounce-short">🚖</span>}
                                {tripStatus === 'ARRIVED' && <span className="text-3xl">📍</span>}
                                {tripStatus === 'IN_PROGRESS' && <span className="text-3xl animate-spin-slow">🛣️</span>}
                                {tripStatus === 'COMPLETED' && <span className="text-3xl">✅</span>}
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
                                <FaCheckCircle className="w-3.5 h-3.5" />
                                <span>Verified Captain Dispatched {activeRideId ? `• Trip #${activeRideId}` : ''}</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
                                {tripStatus === 'CONFIRMED' && 'Connecting with Nearby Captain...'}
                                {tripStatus === 'DRIVER_ASSIGNED' && 'Captain Assigned & En Route'}
                                {tripStatus === 'ARRIVED' && 'Captain Has Arrived'}
                                {tripStatus === 'IN_PROGRESS' && 'Trip in Progress'}
                                {tripStatus === 'COMPLETED' && 'Trip Completed Successfully'}
                            </h3>

                            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-4 font-medium">
                                {tripStatus === 'CONFIRMED' && 'Matching you with the closest certified captain on the network.'}
                                {tripStatus === 'DRIVER_ASSIGNED' &&
                                    (driverInfo
                                        ? `${driverInfo.name} (${driverInfo.plate}) is on the way to your pickup location.`
                                        : 'Your verified captain is en route.')}
                                {tripStatus === 'ARRIVED' && 'Your captain has arrived at the pickup location.'}
                                {tripStatus === 'IN_PROGRESS' && `In transit to ${destination}.`}
                                {tripStatus === 'COMPLETED' && 'Thank you for riding with CABI Africa.'}
                            </p>

                            <div className="inline-block px-4 py-2 rounded-[3px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 mb-6">
                                <span className="font-bold">{pickup}</span> <span className="text-amber-500 font-bold">&rarr;</span> <span className="font-bold">{destination}</span>
                            </div>

                            <div className="max-w-xl mx-auto">{renderProgressBar()}</div>

                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                                {tripStatus !== 'COMPLETED' && (
                                    <button
                                        type="button"
                                        onClick={handleResetBooking}
                                        className="px-6 py-3 rounded-[3px] bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-wider border border-red-500/30 transition-all cursor-pointer"
                                    >
                                        Cancel Request
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleResetBooking}
                                    className="px-8 py-3 rounded-[3px] bg-amber-500 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer shadow-sm"
                                >
                                    Book Another Ride
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Modern Dual-Panel Layout */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                            {/* Left Panel: Inputs + Vehicle Tiers + Action (lg:col-span-7) */}
                            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                                {/* Header Badge & Title */}
                                <div>
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2 shadow-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span>INSTANT LOGISTICS • CITY DISPATCH</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Book Your Ride
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Transparent upfront pricing with verified professional captains.
                                    </p>
                                </div>

                                {/* Pickup & Drop-off Location Card */}
                                <div className="p-4 sm:p-5 rounded-[3px] bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-4">
                                    {/* Pickup Location */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-0.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-[2px] bg-emerald-500 inline-block" />
                                                <span>Pickup Location</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => getCurrentLocation(false)}
                                                    disabled={gpsLoading}
                                                    className="text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                                                    title="Detect live location via GPS"
                                                >
                                                    <FaLocationArrow className={`text-[10px] ${gpsLoading ? 'animate-spin' : ''}`} />
                                                    <span>{gpsLoading ? 'Detecting...' : 'Live GPS'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMapPickerMode('pickup')}
                                                    className="text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                                    title="Pin pickup on map"
                                                >
                                                    <FaMapMarkerAlt className="text-[10px]" />
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
                                            onPinClick={() => setMapPickerMode('pickup')}
                                            placeholder="Enter pickup point or landmark"
                                            ariaLabel="Pickup Location"
                                            surfaceClassName="bg-white dark:bg-white/5 rounded-[3px]"
                                            inputClassName="w-full pl-4 pr-10 py-3 border border-slate-200 dark:border-white/10 rounded-[3px] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none text-slate-900 dark:text-white font-semibold text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                                            rightSlot={
                                                <button
                                                    type="button"
                                                    onClick={() => setMapPickerMode('pickup')}
                                                    aria-label="Select pickup pin on map"
                                                    title="Pin pickup location on map"
                                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-[3px] border transition-all cursor-pointer ${
                                                        pickupCoords
                                                            ? 'bg-amber-500 text-black border-amber-500'
                                                            : 'bg-slate-100 dark:bg-white/10 text-amber-500 border-slate-200 dark:border-white/10 hover:border-amber-500'
                                                    }`}
                                                >
                                                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                                </button>
                                            }
                                        />
                                        {gpsError && (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium px-1">
                                                {gpsError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Drop-off Destination */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-0.5">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-[2px] bg-amber-500 inline-block" />
                                                <span>Drop-off Destination</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('dropoff')}
                                                className="text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                                title="Pin drop-off destination on map"
                                            >
                                                <FaMapMarkerAlt className="text-[10px]" />
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
                                            onPinClick={() => setMapPickerMode('dropoff')}
                                            placeholder="Enter destination address or building"
                                            ariaLabel="Drop-off Destination"
                                            surfaceClassName="bg-white dark:bg-white/5 rounded-[3px]"
                                            inputClassName="w-full pl-4 pr-10 py-3 border border-slate-200 dark:border-white/10 rounded-[3px] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none text-slate-900 dark:text-white font-semibold text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                                            rightSlot={
                                                <button
                                                    type="button"
                                                    onClick={() => setMapPickerMode('dropoff')}
                                                    aria-label="Select drop-off pin on map"
                                                    title="Pin drop-off destination on map"
                                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-[3px] border transition-all cursor-pointer ${
                                                        dropoffCoords
                                                            ? 'bg-amber-500 text-black border-amber-500'
                                                            : 'bg-slate-100 dark:bg-white/10 text-amber-500 border-slate-200 dark:border-white/10 hover:border-amber-500'
                                                    }`}
                                                >
                                                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                                </button>
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Upfront Vehicle Tiers Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-2 px-0.5">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Choose Vehicle Tier
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500">
                                            {trajectory ? 'Live Route Fare' : 'Starting Base Estimate'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                                        {vehicleOptions.map((v) => {
                                            const isSelected = selectedVehicle === v.id;
                                            return (
                                                <div
                                                    key={v.id}
                                                    onClick={() => setSelectedVehicle(v.id)}
                                                    className={`p-3 rounded-[3px] border transition-all duration-150 cursor-pointer flex flex-col justify-between relative ${
                                                        isSelected
                                                            ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white ring-1 ring-amber-500/50 shadow-xs'
                                                            : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-500/40'
                                                    }`}
                                                >
                                                    {v.tag && (
                                                        <span
                                                            className={`absolute top-2 right-2 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-[2px] ${
                                                                isSelected
                                                                    ? 'bg-amber-500 text-black'
                                                                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                        >
                                                            {v.tag}
                                                        </span>
                                                    )}
                                                    <div>
                                                        <span className="text-2xl mb-1 block">{v.icon}</span>
                                                        <p className="font-bold text-xs uppercase tracking-tight truncate">
                                                            {v.name}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                            {v.capacity || `${v.eta}m away`}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10">
                                                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                                            {trajectory ? 'Fare' : 'From'}
                                                        </span>
                                                        <p className="font-black text-sm text-amber-600 dark:text-amber-400">
                                                            KES {Math.round(v.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Request for someone else toggle */}
                                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={requestForOther}
                                            onChange={(e) => setRequestForOther(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded-[2px] border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Requesting this ride for someone else?
                                        </span>
                                    </label>

                                    {requestForOther && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                                            <input
                                                type="text"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                placeholder="Recipient full name *"
                                                aria-label="Recipient full name"
                                                className="w-full px-3.5 py-2.5 rounded-[3px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                                            />
                                            <input
                                                type="tel"
                                                value={recipientPhone}
                                                onChange={(e) => setRecipientPhone(e.target.value)}
                                                placeholder="Recipient phone (e.g. +254 7XX XXX XXX) *"
                                                aria-label="Recipient phone number"
                                                className="w-full px-3.5 py-2.5 rounded-[3px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white font-medium focus:border-amber-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {bookingError && (
                                    <div className="p-3 rounded-[3px] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                        {bookingError}
                                    </div>
                                )}

                                {/* Primary Action Button */}
                                <div>
                                    {!trajectory ? (
                                        <button
                                            type="button"
                                            onClick={handleComputeTrajectory}
                                            disabled={loading || !pickup.trim() || !destination.trim()}
                                            className={`w-full py-3.5 px-6 rounded-[3px] font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                                loading || !pickup.trim() || !destination.trim()
                                                    ? 'bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/30 cursor-not-allowed border border-slate-300 dark:border-white/5'
                                                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 active:scale-[0.99]'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    <span>Calculating Route &amp; Fares...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaRoute className="w-4 h-4" />
                                                    <span>See Prices &amp; Rides</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleComputeTrajectory}
                                                disabled={loading}
                                                className="px-4 py-3.5 rounded-[3px] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                title="Recompute route"
                                            >
                                                Refresh
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleOpenVerification}
                                                className="flex-1 py-3.5 px-6 rounded-[3px] font-black text-xs sm:text-sm uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <span>Confirm &amp; Request {activeVehicleObj.name}</span>
                                                <span className="font-mono text-xs font-black bg-black/15 px-2 py-0.5 rounded-[2px]">
                                                    KES {Math.round(activeVehicleObj.price).toLocaleString()}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Live Route Map & Telemetry (lg:col-span-5) */}
                            <div className="lg:col-span-5 flex flex-col justify-between rounded-[3px] bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 overflow-hidden min-h-[380px] lg:min-h-[460px]">
                                {/* Map Telemetry Header */}
                                <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Interactive Radar Map
                                        </span>
                                    </div>
                                    {trajectory && (
                                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                                            <span>{trajectory.distanceKm} km</span>
                                            <span>•</span>
                                            <span>~{trajectory.durationMin} min</span>
                                        </div>
                                    )}
                                </div>

                                {/* Map Display */}
                                <div className="flex-1 relative w-full h-full min-h-[300px]">
                                    <CabiMap
                                        center={
                                            trajectory
                                                ? [trajectory.pickupCoords.lat, trajectory.pickupCoords.lng]
                                                : pickupCoords
                                                ? [pickupCoords.lat, pickupCoords.lng]
                                                : [-1.286389, 36.817223]
                                        }
                                        zoom={trajectory ? 13 : 12}
                                        height="100%"
                                        markers={mapMarkers}
                                        route={trajectory?.polyline}
                                    />

                                    {!trajectory && (
                                        <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-[3px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 text-center shadow-sm pointer-events-none">
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                                📍 Enter pickup and destination to calculate live route trajectory.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Map Footer / Quick Controls */}
                                <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <button
                                        type="button"
                                        onClick={() => setMapPickerMode('pickup')}
                                        className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <FaMapMarkerAlt className="text-emerald-500" />
                                        <span>Pin Pickup</span>
                                    </button>
                                    <span className="text-slate-300 dark:text-white/10">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setMapPickerMode('dropoff')}
                                        className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <FaMapMarkerAlt className="text-amber-500" />
                                        <span>Pin Destination</span>
                                    </button>
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

            {/* Passenger Identity & Trip Verification Modal (Strict 3px Corners) */}
            {showVerification && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowVerification(false)}
                    />
                    <div className="relative bg-white dark:bg-card-dark p-6 sm:p-8 rounded-[3px] max-w-md w-full border border-slate-200 dark:border-amber-500/30 shadow-2xl animate-reveal z-10">
                        <button
                            type="button"
                            onClick={() => setShowVerification(false)}
                            className="absolute top-4 right-4 p-2 rounded-[3px] text-slate-500 hover:text-black dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                            aria-label="Close verification modal"
                        >
                            <FaTimes />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-[3px] flex items-center justify-center mx-auto mb-3">
                                <FaShieldAlt className="text-2xl text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Passenger Verification
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-white/60 mt-1">
                                Confirm contact details to finish dispatching your {activeVehicleObj.name} ride.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={verifyName}
                                    onChange={(e) => setVerifyName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-3.5 py-2.5 rounded-[3px] bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                                    Phone Number *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        value={verifyPhone}
                                        onChange={(e) => setVerifyPhone(e.target.value)}
                                        placeholder="+254 7XX XXX XXX"
                                        className="flex-1 px-3.5 py-2.5 rounded-[3px] bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="px-3.5 py-2 rounded-[3px] bg-slate-100 dark:bg-white/10 hover:bg-amber-500 hover:text-black text-xs font-bold text-slate-800 dark:text-white transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FaSms />
                                        <span>{otpSentCode ? 'Resend' : 'Send Code'}</span>
                                    </button>
                                </div>
                            </div>

                            {otpSentCode && (
                                <div className="p-2.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-xs text-slate-800 dark:text-amber-300 flex items-center justify-between">
                                    <span>Verification Code Sent via SMS</span>
                                    <span className="font-mono font-black tracking-widest">{otpSentCode}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                                    4-Digit Verification Code *
                                </label>
                                <div className="relative">
                                    <FaFingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xs" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 4-digit SMS code"
                                        className="w-full pl-8 pr-4 py-2.5 rounded-[3px] bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-neutral-300 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={identityAttested}
                                    onChange={(e) => setIdentityAttested(e.target.checked)}
                                    className="mt-0.5 rounded-[2px] border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                                <span className="text-[11px]">
                                    I confirm these trip &amp; identity details for captain dispatch and safety verification.
                                </span>
                            </label>

                            {verificationError && (
                                <div className="p-2.5 rounded-[3px] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                    {verificationError}
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleVerifyAndBook}
                                    disabled={verificationLoading}
                                    className="w-full py-3 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-xs"
                                >
                                    {verificationLoading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            <span>Dispatching Trip...</span>
                                        </>
                                    ) : (
                                        <span>Verify &amp; Finish Request</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVerification(false)}
                                    className="w-full py-2.5 rounded-[3px] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/60 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
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
