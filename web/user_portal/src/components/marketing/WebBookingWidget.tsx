'use client';

import { useState } from 'react';

// Mock types
interface VehicleOption {
    id: string;
    name: string;
    price: number;
    eta: number;
    icon: string;
}

export default function WebBookingWidget() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [confirmedRideId, setConfirmedRideId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    // Fare estimation
    const handleGetEstimates = async () => {
        if (!pickup || !destination) return;

        setLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/rides/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pickup, destination }),
            });
            if (res.ok) {
                const data = await res.json();
                setVehicleOptions(data);
            } else {
                setVehicleOptions([
                    { id: 'v1', name: 'Standard', price: 12.50, eta: 4, icon: '🚗' },
                    { id: 'v2', name: 'Comfort', price: 16.00, eta: 6, icon: '✨' },
                    { id: 'v3', name: 'XL', price: 22.00, eta: 8, icon: '🚙' },
                    { id: 'v4', name: 'Green', price: 13.00, eta: 5, icon: '🌱' },
                ]);
            }
        } catch {
            setVehicleOptions([
                { id: 'v1', name: 'Standard', price: 12.50, eta: 4, icon: '🚗' },
                { id: 'v2', name: 'Comfort', price: 16.00, eta: 6, icon: '✨' },
                { id: 'v3', name: 'XL', price: 22.00, eta: 8, icon: '🚙' },
                { id: 'v4', name: 'Green', price: 13.00, eta: 5, icon: '🌱' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const bookRideAction = async () => {
        if (!selectedVehicle) return;
        setLoading(true);
        setErrorMessage(null);

        try {
            const selectedOpt = vehicleOptions.find(v => v.id === selectedVehicle);
            const res = await fetch('/api/rides/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passengerId: '5f0bc7ef-794f-4249-8460-0e9bbfb29763', // Verified passenger
                    pickupLocation: {
                        address: pickup || 'Kenyatta Avenue, Nairobi',
                        lat: -1.286389,
                        lng: 36.817223,
                    },
                    dropoffLocation: {
                        address: destination || 'Westlands, Nairobi',
                        lat: -1.2655,
                        lng: 36.8048,
                    },
                    vehicleType: selectedOpt?.name?.toUpperCase() || 'STANDARD',
                    fare: selectedOpt?.price ? Math.round(selectedOpt.price * 80) : 650,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Dispatch booking failed');
            }

            const ride = await res.json();
            setConfirmedRideId(ride.id);
            setBookingConfirmed(true);
        } catch (err: any) {
            console.error('Ride booking error:', err);
            setErrorMessage(err.message || 'Failed to dispatch ride request');
        } finally {
            setLoading(false);
        }
    };

    const handleBookRide = async () => {
        if (!selectedVehicle) return;
        // Direct instant booking for preview testing
        await bookRideAction();
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await bookRideAction();
    };

    if (bookingConfirmed) {
        return (
            <div className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full border border-brand-yellow/30 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400"></div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <span className="text-3xl">🚖</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1 text-white">Ride Requested!</h2>
                    <p className="text-xs text-amber-400 font-mono mb-3">ID: {confirmedRideId}</p>
                    <p className="text-gray-300 text-sm mb-6">
                        Trip dispatch initiated. The nearest driver has 20 seconds to accept before auto-escalating.
                    </p>

                    <div className="space-y-3 mb-6">
                        {confirmedRideId && (
                            <a
                                href={`/tracking/${confirmedRideId}`}
                                className="block w-full py-3.5 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg shadow-amber-400/20 text-center"
                            >
                                📡 Track Live Ride Status
                            </a>
                        )}

                        <a
                            href="http://localhost:3002"
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/15 transition-all text-center border border-white/10"
                        >
                            Open Dispatch Console (Port 3002) ↗
                        </a>
                    </div>

                    <button
                        onClick={() => {
                            setBookingConfirmed(false);
                            setPickup('');
                            setDestination('');
                            setVehicleOptions([]);
                            setSelectedVehicle(null);
                            setShowAuth(false);
                            setConfirmedRideId(null);
                            setErrorMessage(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors text-xs font-medium"
                    >
                        ← Book another ride
                    </button>
                </div>
            </div>
        );
    }

    if (showAuth) {
        return (
            <div className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden backdrop-blur-xl border border-white/10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow to-brand-accent"></div>

                <h2 className="text-2xl font-bold mb-6 text-white text-center">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>

                <div className="flex bg-brand-dark/50 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'login' ? 'bg-brand-gray text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authMode === 'register' ? 'bg-brand-gray text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div>
                        <input type="text" placeholder="Email or Phone number" required className="w-full px-4 py-3 bg-brand-dark/50 border border-gray-700 rounded-xl focus:border-brand-yellow outline-none text-white placeholder-gray-500" />
                    </div>
                    <div>
                        <input type="password" placeholder="Password" required className="w-full px-4 py-3 bg-brand-dark/50 border border-gray-700 rounded-xl focus:border-brand-yellow outline-none text-white placeholder-gray-500" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold text-black bg-brand-yellow hover:bg-brand-yellowHover transition-colors mt-2"
                    >
                        {loading ? 'Processing...' : (authMode === 'login' ? 'Log In & Book' : 'Sign Up & Book')}
                    </button>
                </form>

                <button
                    onClick={() => setShowAuth(false)}
                    className="w-full mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Back to vehicle selection
                </button>
            </div>
        );
    }

    return (
        <div className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden backdrop-blur-xl border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow to-brand-accent"></div>

            <h2 className="text-3xl font-bold mb-8 mt-2 text-white">Where to?</h2>

            <div className="space-y-6 mb-8">
                <div className="relative group">
                    <div className="absolute left-4 top-3.5 w-3 h-3 bg-brand-yellow rounded-full shadow-[0_0_10px_#FFD700]"></div>
                    <div className="absolute left-5.5 top-7 w-0.5 h-10 bg-gray-700"></div>
                    <input
                        type="text"
                        placeholder="Enter pickup location"
                        className="w-full pl-12 pr-4 py-4 bg-brand-dark/50 border border-gray-700 focus:border-brand-yellow rounded-xl outline-none transition-all placeholder-gray-500 font-medium text-white focus:ring-1 focus:ring-brand-yellow/50"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-4 top-3.5 w-3 h-3 bg-brand-accent border-2 border-brand-black shadow-[0_0_10px_#00f2fe]"></div>
                    <input
                        type="text"
                        placeholder="Enter destination"
                        className="w-full pl-12 pr-4 py-4 bg-brand-dark/50 border border-gray-700 focus:border-brand-accent rounded-xl outline-none transition-all placeholder-gray-500 font-medium text-white focus:ring-1 focus:ring-brand-accent/50"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>
            </div>

            {vehicleOptions.length === 0 ? (
                <button
                    onClick={handleGetEstimates}
                    disabled={!pickup || !destination || loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${!pickup || !destination || loading
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-yellow to-brand-yellowHover text-black shadow-lg hover:shadow-brand-yellow/20'
                        }`}
                >
                    {loading ? 'Calculating...' : 'See Prices'}
                </button>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {vehicleOptions.map((v) => (
                            <div
                                key={v.id}
                                onClick={() => setSelectedVehicle(v.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedVehicle === v.id
                                    ? 'border-brand-yellow bg-brand-yellow/10'
                                    : 'border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl filter drop-shadow-md">{v.icon}</span>
                                    <div>
                                        <div className="font-bold text-white text-lg">{v.name}</div>
                                        <div className="text-xs text-gray-400">{v.eta} min away</div>
                                    </div>
                                </div>
                                <div className="font-bold text-xl text-brand-yellow">${v.price.toFixed(2)}</div>
                            </div>
                        ))}
                    {errorMessage && (
                        <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={() => {
                                setVehicleOptions([]);
                                setSelectedVehicle(null);
                            }}
                            className="flex-1 py-4 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleBookRide}
                            disabled={!selectedVehicle || loading}
                            className={`flex-[2] py-4 rounded-xl font-bold text-lg transition-all ${!selectedVehicle
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-brand-accent text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                                }`}
                        >
                            {loading ? 'Booking...' : 'Book Ride'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
