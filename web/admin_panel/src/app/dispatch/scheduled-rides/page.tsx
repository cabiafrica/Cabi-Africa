import React from 'react';

// Mock Data
const scheduledRides: any[] = [];

export default function ScheduledRidesPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Scheduled Rides Management</h1>
            <p className="text-gray-600 mb-6">Monitor and assign drivers to upcoming scheduled bookings.</p>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {scheduledRides.map((ride) => (
                            <tr key={ride.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ride.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ride.passenger}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center text-xs text-gray-500 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {ride.pickup}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {ride.dropoff}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {ride.assignedDriver ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {ride.assignedDriver}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                                            Unassigned
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-amber-600 hover:text-amber-900 font-bold border border-amber-200 px-3 py-1 rounded bg-amber-50">
                                        {ride.assignedDriver ? 'Reassign' : 'Assign Driver'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
