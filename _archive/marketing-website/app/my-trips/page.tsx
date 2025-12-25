'use client';

import Link from 'next/link';

// Mock trip history data
const MOCK_TRIPS = [
    {
        id: 'trip_101',
        date: '2025-06-15T08:30:00',
        pickup: '123 Market St, San Francisco, CA',
        destination: '456 Valencia St, San Francisco, CA',
        fare: 15.50,
        status: 'completed',
    },
    {
        id: 'trip_102',
        date: '2025-06-14T18:45:00',
        pickup: 'SFO Airport',
        destination: '789 Mission St, San Francisco, CA',
        fare: 32.20,
        status: 'completed',
    },
    {
        id: 'trip_103',
        date: '2025-06-10T21:15:00',
        pickup: '321 Castro St, Mountain View, CA',
        destination: '654 El Camino Real, Palo Alto, CA',
        fare: 22.10,
        status: 'cancelled',
    },
];

export default function MyTripsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
                <Link href="/" className="text-2xl font-bold">Cabi</Link>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black font-semibold">Back to Dashboard</Link>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">My Trips</h1>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fare</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {MOCK_TRIPS.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(trip.date).toLocaleDateString()} <br />
                                            <span className="text-gray-500 text-xs">{new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center">
                                                    <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                                                    <span className="truncate max-w-xs" title={trip.pickup}>{trip.pickup}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="w-2 h-2 bg-black border-2 border-white shadow-sm ring-1 ring-black rounded-sm mr-2"></span>
                                                    <span className="truncate max-w-xs" title={trip.destination}>{trip.destination}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ${trip.fare.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${trip.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Link href={`/trip/${trip.id}`} className="text-black hover:underline font-medium">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center text-sm text-gray-600">
                        <span>Showing 1 to 3 of 3 entries</span>
                        <div className="space-x-2">
                            <button className="px-3 py-1 border rounded bg-white text-gray-400 cursor-not-allowed">Previous</button>
                            <button className="px-3 py-1 border rounded bg-white text-gray-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
