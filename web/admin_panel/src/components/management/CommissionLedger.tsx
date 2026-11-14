import React, { useState, useEffect, useCallback } from 'react';
import { adminService, CommissionLedgerEntry } from '../../services/adminService';
import {
    AccountBalanceWallet,
    Person,
    Search,
    CalendarMonth,
    FilterList,
    TrendingUp,
    TrendingDown,
    NavigateNext,
    NavigateBefore
} from '@mui/icons-material';

export const CommissionLedger: React.FC = () => {
    const [entries, setEntries] = useState<CommissionLedgerEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Filters
    const [driverId, setDriverId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeFilter, setActiveFilter] = useState(false);

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getCommissionLedger({
                page,
                limit: 20,
                driverId: driverId || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setEntries(data.entries);
            setTotal(data.total);

            // Check if active filters exist
            if (driverId || startDate || endDate) setActiveFilter(true);
            else setActiveFilter(false);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, driverId, startDate, endDate]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setDriverId('');
        setActiveFilter(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AccountBalanceWallet className="text-amber-600 dark:text-amber-400" />
                        Commission Ledger
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track financial transactions and commission history.</p>
                </div>

                <div className="flex bg-white dark:bg-card-dark rounded-lg shadow-sm border border-slate-200 dark:border-white/10 p-1">
                    <div className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-white/10">
                        Total Records
                    </div>
                    <div className="px-4 py-2 text-sm font-bold text-slate-900 dark:text-white">
                        {total}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 transition-all">
                <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Driver ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                    value={driverId}
                                    onChange={e => setDriverId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">End Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                        <button
                            onClick={resetFilters}
                            disabled={!activeFilter}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full lg:w-auto ${activeFilter ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => fetchLedger()}
                            className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-transform active:scale-95 w-full lg:w-auto flex justify-center items-center gap-2"
                        >
                            <FilterList fontSize="small" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-card-dark shadow-sm rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-surface-dark">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount (KES)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading ledger data...</td></tr>
                            ) : entries.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No transactions found matching criteria.</td></tr>
                            ) : (
                                entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <CalendarMonth fontSize="small" className="text-slate-400" />
                                                {new Date(entry.date).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <Person style={{ fontSize: 14 }} className="text-slate-500" />
                                                </div>
                                                {entry.driverId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.transactionType === 'MANUAL_ADJUSTMENT'
                                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800'
                                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                                }`}>
                                                {entry.transactionType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={entry.description}>
                                            {entry.description}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${entry.amount >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {entry.amount >= 0
                                                    ? <TrendingUp fontSize="small" className="text-green-500" />
                                                    : <TrendingDown fontSize="small" className="text-red-500" />
                                                }
                                                {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-dark flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                    <div>Page {page}</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <NavigateBefore fontSize="small" />
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={entries.length < 20}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <NavigateNext fontSize="small" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
