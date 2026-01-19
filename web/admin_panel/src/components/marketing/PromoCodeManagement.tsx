import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Discount,
    Add,
    Edit,
    Delete,
    ConfirmationNumber,
    CheckCircle,
    Cancel
} from '@mui/icons-material';

export const PromoCodeManagement: React.FC = () => {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getPromoCodes().then(setPromos).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Discount className="text-blue-600 dark:text-blue-400" />
                        Promo Codes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage marketing codes and discount offers.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                    <Add fontSize="small" />
                    Create Promo Code
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Active Campaign Codes</h3>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {promos.length} Active
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uses</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading promo codes...</td></tr>
                            ) : promos.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No promo codes found.</td></tr>
                            ) : promos.map((p: any) => (
                                <tr key={p.code} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <ConfirmationNumber fontSize="small" className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wide">{p.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                            {p.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                                        {p.type === 'PERCENTAGE' ? `${p.value}%` : `KES ${p.value}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        {p.uses} / <span className="text-slate-400">∞</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                            }`}>
                                            {p.status === 'ACTIVE' ? <CheckCircle style={{ fontSize: 12 }} /> : <Cancel style={{ fontSize: 12 }} />}
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                <Edit fontSize="small" />
                                            </button>
                                            <button className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                <Delete fontSize="small" />
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
