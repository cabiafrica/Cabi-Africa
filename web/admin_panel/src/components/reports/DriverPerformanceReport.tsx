import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const DriverPerformanceReport: React.FC = () => {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getDriverPerformanceReport().then(setReport).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Generating report...</div>;
    if (!report) return <div>No data available</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Driver Performance Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Rides</p>
                    <p className="text-2xl font-bold text-blue-900">{report.totalRides}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-900">{report.earnings.toLocaleString()} KES</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-900">{report.avgRating} ★</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Acceptance Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{report.acceptanceRate}%</p>
                </div>
            </div>

            <div className="mt-8">
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                    Export to CSV
                </button>
            </div>
        </div>
    );
};
