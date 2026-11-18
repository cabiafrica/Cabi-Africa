import React, { useState, useEffect } from 'react';
import { FaCar, FaTimes, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import MapPinModal, { Coords, MapPinMode } from '@/components/maps/MapPinModal';

export default function FloatingTripWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
    const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null);
    const [mapPickerMode, setMapPickerMode] = useState<MapPinMode | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100); // Reduce threshold for easier testing
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isMounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pickup.trim() || !destination.trim()) {
            setValidationError('Please select or pin both pickup and destination.');
            return;
        }
        setValidationError(null);

        // Dispatch custom event to update BookingSection
        const event = new CustomEvent('tactical-booking', {
            detail: {
                pickup: pickup.trim(),
                destination: destination.trim(),
                pickupCoords,
                dropoffCoords,
            },
        });
        window.dispatchEvent(event);

        // Scroll to the booking section
        const bookingSection = document.getElementById('booking-section');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        } else {
            // Fallback if not on home page
            const params = new URLSearchParams({
                pickup: pickup.trim(),
                destination: destination.trim(),
            });
            if (pickupCoords) {
                params.set('pLat', String(pickupCoords.lat));
                params.set('pLng', String(pickupCoords.lng));
            }
            if (dropoffCoords) {
                params.set('dLat', String(dropoffCoords.lat));
                params.set('dLng', String(dropoffCoords.lng));
            }
            window.location.href = `/?${params.toString()}#booking-section`;
        }
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none flex flex-col items-end">
                {/* Floating Toggle Button */}
                {!isOpen && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsOpen(true);
                            }
                        }}
                        aria-label="Open quick ride booking"
                        className={`pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#F59E0B] rounded-full shadow-lg flex items-center justify-center text-black transition-all duration-500 transform hover:scale-110 active:scale-95 group relative ${!isScrolled ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
                    >
                        <FaCar className="text-lg sm:text-xl lg:text-2xl" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-black border border-[#F59E0B] text-[8px] font-black items-center justify-center text-[#F59E0B]">!</span>
                        </span>
                    </button>
                )}

                {/* Floating Widget Card */}
                {isOpen && (
                    <div
                        className="pointer-events-auto w-[calc(100vw-2rem)] max-w-[340px] lg:max-w-[380px] bg-white/95 dark:bg-[#0a0a0a]/95 border border-slate-200 dark:border-white/15 rounded-3xl sm:rounded-[2.5rem] shadow-2xl transition-all duration-300 transform origin-bottom-right backdrop-blur-3xl overflow-visible"
                    >
                        <div className="relative z-10">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center border border-[#F59E0B]/25">
                                        <FaCar className="text-[#D4AF37] dark:text-[#F59E0B]" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">Quick Booking</h3>
                                        <p className="text-[9px] text-[#B48A14] dark:text-executive-gold font-black uppercase tracking-[0.2em]">Instant Ride</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close quick ride booking"
                                    className="text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white p-1.5 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
                                <div className="space-y-3.5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                            <label
                                                htmlFor="floating-pickup-input"
                                                className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-white/75"
                                            >
                                                Pickup Location
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('pickup')}
                                                className="text-[#D4AF37] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                <FaMapMarkerAlt className="text-[10px]" />
                                                <span>Pin on Map</span>
                                            </button>
                                        </div>
                                        <LocationAutocomplete
                                            id="floating-pickup-input"
                                            value={pickup}
                                            onChange={(val) => {
                                                setPickup(val);
                                                setPickupCoords(null);
                                                if (validationError) setValidationError(null);
                                            }}
                                            onSelect={(label, coords) => {
                                                setPickup(label);
                                                setPickupCoords(coords);
                                                if (validationError) setValidationError(null);
                                            }}
                                            placeholder="Search or pin pickup point"
                                            ariaLabel="Pickup Location"
                                            surfaceClassName="bg-slate-50 dark:bg-white/5 rounded-xl"
                                            inputClassName="w-full pl-3.5 pr-11 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15 outline-none text-xs text-slate-900 dark:text-white font-semibold placeholder-slate-400 dark:placeholder-white/30 transition-all"
                                            rightSlot={
                                                <button
                                                    type="button"
                                                    onClick={() => setMapPickerMode('pickup')}
                                                    aria-label="Pin pickup on map"
                                                    title="Pin pickup location on map"
                                                    className={`absolute right-2 z-10 p-1.5 rounded-lg border transition-all ${
                                                        pickupCoords
                                                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                                            : 'bg-white dark:bg-surface-dark text-[#D4AF37] border-slate-200 dark:border-white/10 hover:border-[#D4AF37]'
                                                    }`}
                                                >
                                                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                                </button>
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                            <label
                                                htmlFor="floating-dropoff-input"
                                                className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-white/75"
                                            >
                                                Destination
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setMapPickerMode('dropoff')}
                                                className="text-[#D4AF37] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                <FaMapMarkerAlt className="text-[10px]" />
                                                <span>Pin on Map</span>
                                            </button>
                                        </div>
                                        <LocationAutocomplete
                                            id="floating-dropoff-input"
                                            value={destination}
                                            onChange={(val) => {
                                                setDestination(val);
                                                setDropoffCoords(null);
                                                if (validationError) setValidationError(null);
                                            }}
                                            onSelect={(label, coords) => {
                                                setDestination(label);
                                                setDropoffCoords(coords);
                                                if (validationError) setValidationError(null);
                                            }}
                                            placeholder="Search or pin destination"
                                            ariaLabel="Destination"
                                            surfaceClassName="bg-slate-50 dark:bg-white/5 rounded-xl"
                                            inputClassName="w-full pl-3.5 pr-11 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15 outline-none text-xs text-slate-900 dark:text-white font-semibold placeholder-slate-400 dark:placeholder-white/30 transition-all"
                                            rightSlot={
                                                <button
                                                    type="button"
                                                    onClick={() => setMapPickerMode('dropoff')}
                                                    aria-label="Pin drop-off on map"
                                                    title="Pin drop-off destination on map"
                                                    className={`absolute right-2 z-10 p-1.5 rounded-lg border transition-all ${
                                                        dropoffCoords
                                                            ? 'bg-[#FACC15] text-black border-[#FACC15]'
                                                            : 'bg-white dark:bg-surface-dark text-[#D4AF37] border-slate-200 dark:border-white/10 hover:border-[#D4AF37]'
                                                    }`}
                                                >
                                                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                                </button>
                                            }
                                        />
                                    </div>
                                </div>

                                {validationError && (
                                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 px-1">
                                        {validationError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-[#F59E0B] hover:bg-[#fbbf24] transition-colors rounded-2xl font-black text-xs uppercase tracking-widest text-black flex items-center justify-center gap-2 shadow-md"
                                >
                                    Check Fares
                                    <FaChevronRight />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <MapPinModal
                mode={mapPickerMode}
                onModeChange={setMapPickerMode}
                pickup={pickup}
                destination={destination}
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                onPickupSelect={(label, coords) => {
                    setPickup(label);
                    setPickupCoords(coords);
                    if (validationError) setValidationError(null);
                }}
                onDropoffSelect={(label, coords) => {
                    setDestination(label);
                    setDropoffCoords(coords);
                    if (validationError) setValidationError(null);
                }}
            />
        </>
    );
}
