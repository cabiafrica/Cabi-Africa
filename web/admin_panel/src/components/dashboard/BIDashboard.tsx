import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.4: BI Dashboard ---
export const BIDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getBIStats().then(setStats).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading BI Dashboard...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Business Intelligence (Global)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-500 font-bold uppercase">Gross Bookings</p>
                    <p className="text-xl font-bold text-indigo-900 mt-1">{stats.grossBookings.toLocaleString()} KES</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                    <p className="text-xs text-pink-500 font-bold uppercase">Total Trips</p>
                    <p className="text-xl font-bold text-pink-900 mt-1">{stats.trips.toLocaleString()}</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <p className="text-xs text-cyan-500 font-bold uppercase">New Users</p>
                    <p className="text-xl font-bold text-cyan-900 mt-1">{stats.newUsers}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-500 font-bold uppercase">Active Drivers</p>
                    <p className="text-xl font-bold text-orange-900 mt-1">{stats.activeDrivers}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <p className="text-xs text-teal-500 font-bold uppercase">Avg Rating</p>
                    <p className="text-xl font-bold text-teal-900 mt-1">{stats.avgRating} ★</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border rounded-lg p-6 h-64 bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400">[ Revenue Growth Chart ]</span>
                </div>
                <div className="border rounded-lg p-6 h-64 bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-400">[ Trip Volume by City Chart ]</span>
                </div>
            </div>
        </div>
    );
};
