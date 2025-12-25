import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.10: City Management Dashboard ---
export const CityManagementDashboard: React.FC = () => {
    const [kpis, setKPIs] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getCityKPIs('nairobi').then(setKPIs).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading City Dashboard...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">City Management: Nairobi</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <div className="text-sm text-blue-600">Active Drivers</div>
                    <div className="text-2xl font-bold">{kpis.activeDrivers}</div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100">
                    <div className="text-sm text-green-600">Total Trips (Today)</div>
                    <div className="text-2xl font-bold">{kpis.totalTrips}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                    <div className="text-sm text-yellow-600">Avg Surge Multiplier</div>
                    <div className="text-2xl font-bold">{kpis.avgSurge}x</div>
                </div>
                <div className="bg-red-50 p-4 rounded border border-red-100">
                    <div className="text-sm text-red-600">Open Complaints</div>
                    <div className="text-2xl font-bold">{kpis.complaints}</div>
                </div>
            </div>
            {/* Placeholder for settings */}
            <div className="mt-8 border-t pt-4">
                <h3 className="font-semibold mb-2">City Settings</h3>
                <div className="flex gap-4">
                    <button className="px-4 py-2 border rounded hover:bg-gray-50">Base Fare Config</button>
                    <button className="px-4 py-2 border rounded hover:bg-gray-50">Surge Settings</button>
                    <button className="px-4 py-2 border rounded hover:bg-gray-50">Zone Management</button>
                </div>
            </div>
        </div>
    );
};
