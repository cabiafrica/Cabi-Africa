import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const ScheduledRideManagement: React.FC = () => {
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getScheduledRides().then(setRides).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading scheduled rides...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Scheduled Rides</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rides.map((r: any) => (
                            <tr key={r.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.pickupTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.passenger}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.pickup} → {r.dropoff}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
