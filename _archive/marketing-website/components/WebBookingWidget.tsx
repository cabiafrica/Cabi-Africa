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

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        // Redirect to trip tracking page
        const mockTripId = `trip_${Date.now()}`;
        window.location.href = `/trip/${mockTripId}`;
    };

    if (bookingConfirmed) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-yellow-400">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Ride Booked!</h2>
                    <p className="text-gray-600 mb-6">Your driver is on the way. We'll send you updates via SMS.</p>
                    <button
                        onClick={() => {
                            setBookingConfirmed(false);
                            setPickup('');
                            setDestination('');
                            setVehicleOptions([]);
                            setSelectedVehicle(null);
                        }}
                        className="text-black font-semibold underline hover:text-yellow-600"
                    >
                        Book another ride
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-black"></div>

            <h2 className="text-2xl font-bold mb-6 mt-2">Where to?</h2>

            <div className="space-y-4 mb-6">
                <div className="relative">
                    <div className="absolute left-4 top-3.5 w-3 h-3 bg-black rounded-full"></div>
                    <div className="absolute left-5 top-7 w-0.5 h-8 bg-gray-200"></div>
                    <input
                        type="text"
                        placeholder="Enter pickup location"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-black focus:ring-0 rounded-lg outline-none transition-all placeholder-gray-500 font-medium"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <div className="absolute left-4 top-3.5 w-3 h-3 bg-black border-2 border-white shadow-sm"></div>
                    <input
                        type="text"
                        placeholder="Enter destination"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:border-black focus:ring-0 rounded-lg outline-none transition-all placeholder-gray-500 font-medium"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>
            </div>

            {vehicleOptions.length === 0 ? (
                <button
                    onClick={handleGetEstimates}
                    disabled={!pickup || !destination || loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${!pickup || !destination
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {loading ? 'Calculating...' : 'See Prices'}
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {vehicleOptions.map((v) => (
                            <div
                                key={v.id}
                                onClick={() => setSelectedVehicle(v.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedVehicle === v.id
                                    ? 'border-black bg-yellow-50'
                                    : 'border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{v.icon}</span>
                                    <div>
                                        <div className="font-bold text-gray-900">{v.name}</div>
                                        <div className="text-xs text-gray-500">{v.eta} min away</div>
                                    </div>
                                </div>
                                <div className="font-bold text-lg">${v.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setVehicleOptions([]);
                                setSelectedVehicle(null);
                            }}
                            className="flex-1 py-3 rounded-xl font-bold text-black bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleBookRide}
                            disabled={!selectedVehicle || loading}
                            className={`flex-[2] py-3 rounded-xl font-bold text-lg transition-all ${!selectedVehicle
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-yellow-400 hover:bg-gray-900 shadow-lg'
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
