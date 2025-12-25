import React, { useState, useEffect } from 'react';
import { adminService, UserRide } from '../../services/adminService';

interface Props {
    userId: string;
}

export const UserRideHistory: React.FC<Props> = ({ userId }) => {
    const [rides, setRides] = useState<UserRide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getUserRideHistory(userId).then(setRides).finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div>Loading rides...</div>;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ride History</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rides.map(ride => (
                        <tr key={ride.id}>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(ride.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="font-medium">{ride.pickup}</div>
                                <div className="text-xs text-gray-400">to</div>
                                <div className="font-medium">{ride.dropoff}</div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{ride.amount.toLocaleString()} KES</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{ride.status}</span>
                            </td>
                        </tr>
                    ))}
                    {rides.length === 0 && <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No rides found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};
