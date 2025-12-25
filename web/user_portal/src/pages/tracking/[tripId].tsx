import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Mock component for map
const LiveMap = ({ driverLocation, pickup, dropoff }: any) => (
    <div className="bg-gray-200 w-full h-96 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p>Interactive Map View</p>
        </div>
        {driverLocation && (
            <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"
                style={{ top: '50%', left: '50%' }} // Mock position
            >
                <div className="absolute -top-8 -left-4 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                    Driver
                </div>
            </div>
        )}
    </div>
);

export default function TrackingPage() {
    const router = useRouter();
    const { tripId } = router.query;
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tripId) return;

        // Simulate polling for updates
        const fetchData = () => {
            // Mock API response
            setTrackingData({
                status: 'IN_PROGRESS',
                eta: '12 mins',
                driver: {
                    name: 'Sarah M.',
                    rating: 4.9,
                    vehicle: 'Toyota Rav4 • Silver',
                    plate: 'ABC 123',
                    phone: '(555) 012-3456'
                },
                pickup: { address: '123 Main St', completed: true },
                dropoff: { address: '456 Office Park', completed: false },
                currentLocation: { lat: 40.7128, lng: -74.0060 },
                package: { description: 'Small box' }
            });
            setLoading(false);
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [tripId]);

    if (loading) return <div className="p-8 text-center text-gray-600">Loading delivery status...</div>;
    if (!trackingData) return <div className="p-8 text-center text-red-600">Delivery not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head>
                <title>Track Delivery #{tripId}</title>
            </Head>

            {/* Header */}
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-xl text-blue-900">Cabi Delivery</div>
                <div className="text-sm text-gray-500">Trip #{tripId}</div>
            </header>

            <main className="max-w-3xl mx-auto mt-6 px-4">
                {/* Status Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-blue-600 text-white p-6">
                        <h1 className="text-2xl font-bold mb-1">Arriving in {trackingData.eta}</h1>
                        <p className="opacity-90">Your package is on the way</p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                👤
                            </div>
                            <div className="ml-4">
                                <h3 className="font-bold text-lg">{trackingData.driver.name}</h3>
                                <p className="text-gray-600 text-sm">
                                    {trackingData.driver.vehicle} • {trackingData.driver.plate}
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                <span>⭐</span>
                                <span className="font-bold text-yellow-700">{trackingData.driver.rating}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">PICKUP</p>
                                <p className="font-medium text-gray-900 line-through text-opacity-50">
                                    {trackingData.pickup.address}
                                </p>
                                <span className="text-green-600 text-xs font-bold">✓ COMPLETED</span>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium mb-1">DROPOFF</p>
                                <p className="font-medium text-gray-900">{trackingData.dropoff.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="p-4 border-b font-bold text-gray-700">Live Location</div>
                    <LiveMap
                        driverLocation={trackingData.currentLocation}
                        pickup={trackingData.pickup}
                        dropoff={trackingData.dropoff}
                    />
                </div>

                {/* Help */}
                <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Need help with this delivery?</p>
                    <button className="text-blue-600 font-bold hover:underline">
                        Contact Support
                    </button>
                </div>
            </main>
        </div>
    );
}
