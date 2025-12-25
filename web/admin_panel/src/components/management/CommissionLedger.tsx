import React, { useState, useEffect, useCallback } from 'react';
import { adminService, CommissionLedgerEntry } from '../../services/adminService';

export const CommissionLedger: React.FC = () => {
    const [entries, setEntries] = useState<CommissionLedgerEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Filters
    const [driverId, setDriverId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, driverId, startDate, endDate]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Commission Ledger</h2>
                <div className="flex gap-2 flex-wrap">
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                    <input
                        type="text"
                        placeholder="Driver ID"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        value={driverId}
                        onChange={e => setDriverId(e.target.value)}
                    />
                    <button onClick={() => fetchLedger()} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Filter</button>
                    <button onClick={() => { setStartDate(''); setEndDate(''); setDriverId(''); }} className="text-gray-600 px-3 py-1 text-sm hover:underline">Clear</button>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center bg-gray-50">Loading ledger data...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>
                        ) : (
                            entries.map(entry => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.driverId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${entry.transactionType === 'MANUAL_ADJUSTMENT' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {entry.transactionType.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={entry.description}>
                                        {entry.description}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>Page {page}</div>
                <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={entries.length < 20} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};
