import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface UserPaymentHistoryProps {
    userId: string;
    onBack?: () => void;
}

export const UserPaymentHistory: React.FC<UserPaymentHistoryProps> = ({ userId, onBack }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Mock fetching payment history
        adminService.getUserPaymentHistory(userId).then(data => {
            setPayments(data);
            setLoading(false);
        });
    }, [userId]);

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                {onBack && (
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
                        ← Back to User
                    </button>
                )}
                <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : payments.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.type}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${p.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {p.amount < 0 ? '-' : '+'} KES {Math.abs(p.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!loading && payments.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
