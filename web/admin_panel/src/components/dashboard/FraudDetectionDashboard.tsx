import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Security,
    Warning,
    CheckCircle,
    RemoveRedEye,
    Block,
    ErrorOutline,
    FilterList
} from '@mui/icons-material';

export const FraudDetectionDashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');

    useEffect(() => {
        // Simulating a slightly richer data set or using the service
        adminService.getFraudAlerts().then(data => {
            // Enhance mock data if needed
            setAlerts(data);
        }).finally(() => setLoading(false));
    }, []);

    const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900';
            case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900';
            default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Security className="text-red-600 dark:text-red-500" />
                        Fraud Detection Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time monitoring of suspicious activities and anomalies.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filter === 'ALL' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                        All Alerts
                    </button>
                    <button
                        onClick={() => setFilter('HIGH')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filter === 'HIGH' ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-red-600'}`}
                    >
                        High Severity
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Active Critical Alerts</p>
                        <p className="text-3xl font-bold text-red-900 dark:text-red-200 mt-2">{alerts.filter(a => a.severity === 'HIGH').length}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-red-500">
                        <Warning />
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/50 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Suspicious Patterns</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-200 mt-2">{alerts.filter(a => a.severity === 'MEDIUM').length}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-amber-500">
                        <ErrorOutline />
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/50 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Resolved Today</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-200 mt-2">0</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-green-500">
                        <CheckCircle />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Recent Alerts</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FilterList fontSize="small" /> Filtered by: {filter}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-white dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alert Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User / Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Scanning activity logs...</td></tr>
                            ) : filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                        <CheckCircle className="text-green-500 mb-2" fontSize="large" />
                                        No active alerts matching your filter.
                                    </td>
                                </tr>
                            ) : filteredAlerts.map((a: any) => (
                                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{a.type.replace('_', ' ').toLowerCase()}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">ID: {a.id.substring(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono">
                                        {a.user}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${getSeverityStyles(a.severity)}`}>
                                            {a.severity === 'HIGH' && <Warning style={{ fontSize: 12, marginRight: 4 }} />}
                                            {a.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(a.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="View Details">
                                                <RemoveRedEye fontSize="small" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Suspend User">
                                                <Block fontSize="small" />
                                            </button>
                                            <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" title="Dismiss">
                                                <CheckCircle fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
