'use client';

import { useState } from 'react';

interface ReturnFeeTransaction {
    id: string;
    ticketId: string;
    passengerName: string;
    driverName: string;
    itemDescription: string;
    feeAmount: number;
    status: 'pending' | 'completed' | 'failed';
    processedAt: string;
}

export default function LostItemReturnFeePage() {
    const [returnFee, setReturnFee] = useState(15.00);
    const [transactions, setTransactions] = useState<ReturnFeeTransaction[]>([
        {
            id: '1',
            ticketId: 'LF-2024-001',
            passengerName: 'Sarah Johnson',
            driverName: 'Mike Davis',
            itemDescription: 'iPhone 13 Pro',
            feeAmount: 15.00,
            status: 'completed',
            processedAt: '2024-12-15T18:30:00Z',
        },
        {
            id: '2',
            ticketId: 'LF-2024-002',
            passengerName: 'John Smith',
            driverName: 'Emily Brown',
            itemDescription: 'Wallet',
            feeAmount: 15.00,
            status: 'completed',
            processedAt: '2024-12-15T16:45:00Z',
        },
    ]);

    const handleUpdateFee = () => {
        alert(`Return fee updated to $${returnFee.toFixed(2)}`);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors];
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lost Item Return Fee Management</h1>
                    <p className="text-gray-600 mt-2">
                        Configure and track return fees for lost items
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Fee Configuration */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 text-black">
                            <h2 className="text-xl font-bold mb-6">Fee Configuration</h2>

                            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
                                <p className="text-sm font-semibold mb-2">Current Return Fee</p>
                                <p className="text-4xl font-bold">${returnFee.toFixed(2)}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Set Return Fee Amount
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.50"
                                        value={returnFee}
                                        onChange={(e) => setReturnFee(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-black"
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateFee}
                                    className="w-full px-6 py-3 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-bold"
                                >
                                    Update Fee
                                </button>

                                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-sm">
                                    <p className="font-semibold mb-2">ℹ️ Fee Details:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Charged to passenger</li>
                                        <li>• 100% credited to driver</li>
                                        <li>• Applied when item is returned</li>
                                        <li>• Configurable per market</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-600 font-medium">Total Fees</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    ${(transactions.reduce((sum, t) => sum + t.feeAmount, 0)).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <p className="text-sm text-gray-600 font-medium">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {transactions.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Return Fee Transactions</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {transaction.ticketId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.passengerName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {transaction.driverName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {transaction.itemDescription}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        ${transaction.feeAmount.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(transaction.processedAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {transactions.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
                                    <p className="text-gray-600">Return fee transactions will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">How Return Fees Work</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• When a driver returns a lost item, a return fee is automatically charged to the passenger</li>
                                <li>• The full fee amount is credited to the driver's earnings as compensation for their time</li>
                                <li>• Fees are processed through the payment service and appear in both user's transaction history</li>
                                <li>• Both passenger and driver receive notifications about the fee transaction</li>
                                <li>• The fee amount can be configured per market to account for local conditions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
