import React, { useState, useEffect, useMemo } from 'react';
import {
    FileDownload,
    FilterList,
    Search,
    History,
    ReceiptLong,
    Payments,
    AccountBalance,
    ErrorOutline,
    CheckCircle,
    Pending
} from '@mui/icons-material';

interface TractionLog {
    id: string;
    date: string;
    userId: string;
    userName: string;
    type: 'RIDE' | 'COMMISSION' | 'PAYOUT' | 'REFUND';
    amount: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    description: string;
}

export const TractionLogs: React.FC = () => {
    const [logs, setLogs] = useState<TractionLog[]>([]);
    const [filterText, setFilterText] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetching
        const mockLogs: TractionLog[] = [
            { id: 'TRX-9821', date: new Date().toISOString(), userId: 'USR-001', userName: 'John Doe', type: 'RIDE', amount: 450, status: 'COMPLETED', description: 'Nairobi to Westlands' },
            { id: 'TRX-9822', date: new Date(Date.now() - 3600000).toISOString(), userId: 'DRV-556', userName: 'Jane Smith', type: 'COMMISSION', amount: -45, status: 'COMPLETED', description: 'Platform fee for TRX-9821' },
            { id: 'TRX-9823', date: new Date(Date.now() - 7200000).toISOString(), userId: 'DRV-556', userName: 'Jane Smith', type: 'PAYOUT', amount: -1200, status: 'PENDING', description: 'Weekly earnings payout' },
            { id: 'TRX-9824', date: new Date(Date.now() - 86400000).toISOString(), userId: 'USR-088', userName: 'Bob Wilson', type: 'RIDE', amount: 820, status: 'FAILED', description: 'Airport Transfer' },
            { id: 'TRX-9825', date: new Date(Date.now() - 90000000).toISOString(), userId: 'USR-102', userName: 'Alice Green', type: 'REFUND', amount: 450, status: 'COMPLETED', description: 'Refund for TRX-9824' },
        ];

        setTimeout(() => {
            setLogs(mockLogs);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.id.toLowerCase().includes(filterText.toLowerCase()) ||
            log.userName.toLowerCase().includes(filterText.toLowerCase()) ||
            log.description.toLowerCase().includes(filterText.toLowerCase()) ||
            log.type.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [logs, filterText]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED': return { color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: <CheckCircle style={{ fontSize: 14 }} /> };
            case 'PENDING': return { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: <Pending style={{ fontSize: 14 }} /> };
            case 'FAILED': return { color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: <ErrorOutline style={{ fontSize: 14 }} /> };
            default: return { color: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300', icon: null };
        }
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'RIDE': return { icon: <History />, color: 'text-blue-600 dark:text-blue-400' };
            case 'COMMISSION': return { icon: <ReceiptLong />, color: 'text-purple-600 dark:text-purple-400' };
            case 'PAYOUT': return { icon: <Payments />, color: 'text-emerald-600 dark:text-emerald-400' };
            case 'REFUND': return { icon: <AccountBalance />, color: 'text-orange-600 dark:text-orange-400' };
            default: return { icon: <History />, color: 'text-slate-600' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ReceiptLong className="text-emerald-600 dark:text-emerald-400" />
                        Traction Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all financial and operational transactions.</p>
                </div>
                <button
                    onClick={() => alert('Exporting to CSV...')}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                    <FileDownload fontSize="small" />
                    Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by ID, User, or Description..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <FilterList />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-white dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading traction logs...</td></tr>
                            ) : filteredLogs
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((log) => {
                                    const statusStyle = getStatusConfig(log.status);
                                    const typeStyle = getTypeConfig(log.type);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{log.id}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={log.description}>{log.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center gap-2 text-sm font-bold ${typeStyle.color}`}>
                                                    {React.cloneElement(typeStyle.icon as any, { fontSize: 'small' })}
                                                    {log.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{log.userName}</span>
                                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{log.userId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`text-sm font-bold font-mono ${log.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()} KES
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full border ${statusStyle.color}`}>
                                                    {statusStyle.icon}
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(log.date).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}

                            {!loading && filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No transactions found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified for Demo) */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Showing {Math.min(filteredLogs.length, rowsPerPage)} of {filteredLogs.length} entries</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={(page + 1) * rowsPerPage >= filteredLogs.length}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
