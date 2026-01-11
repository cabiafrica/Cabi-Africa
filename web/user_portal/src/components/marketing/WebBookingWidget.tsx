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

    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    // Mock fare estimation
    const handleGetEstimates = async () => {
        if (!pickup || !destination) return;

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setVehicleOptions([
            { id: 'v1', name: 'Standard', price: 12.50, eta: 4, icon: '🚗' },
            { id: 'v2', name: 'Comfort', price: 16.00, eta: 6, icon: '✨' },
            { id: 'v3', name: 'XL', price: 22.00, eta: 8, icon: '🚙' },
            { id: 'v4', name: 'Green', price: 13.00, eta: 5, icon: '🌱' },
        ]);
        setLoading(false);
    };

    const handleBookRide = async () => {
        if (!selectedVehicle) return;
        // Prompt for login/register
        setShowAuth(true);
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Auth API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setBookingConfirmed(true);

        // In a real app, we would redirect here or after a delay
        // const mockTripId = `trip_${Date.now()}`;
        // window.location.href = `/trip/${mockTripId}`;
    };

    if (bookingConfirmed) {
        return (
            <div className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full border border-brand-yellow/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow to-brand-accent"></div>
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Ride Booked!</h2>
                    <p className="text-gray-400 mb-8">Your driver is on the way. We've sent the details to your device.</p>
                    <button
                        onClick={() => {
                            setBookingConfirmed(false);
                            setPickup('');
                            setDestination('');
                            setVehicleOptions([]);
                            setSelectedVehicle(null);
                            setShowAuth(false);
                        }}
                        className="text-brand-yellow font-bold hover:text-white transition-colors uppercase tracking-wider text-sm"
                    >
                        Book another ride
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
                    </div>

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
