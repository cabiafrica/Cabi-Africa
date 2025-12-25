import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.5: Fraud Detection Dashboard ---
export const FraudDetectionDashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getFraudAlerts().then(setAlerts).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Scanning for Fraud...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
            <h2 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
                <span>⚠️</span> Fraud Detection Alerts
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Alert Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">User / Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {alerts.map((a: any) => (
                            <tr key={a.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{a.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${a.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {a.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-red-600 hover:text-red-900 font-bold mr-4">Investigate</button>
                                    <button className="text-gray-600 hover:text-gray-900">Dismiss</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {alerts.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No active fraud alerts. System is monitoring...
                </div>
            )}
        </div>
    );
};
