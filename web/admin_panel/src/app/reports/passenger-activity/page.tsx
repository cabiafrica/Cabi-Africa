import React, { useState } from 'react';

export default function PassengerActivityReport() {
    const [selectedPassenger, setSelectedPassenger] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [report, setReport] = useState<any>(null);

    const mockPassengers = [
        { id: 'pass_1', name: 'Alice Johnson', email: 'alice@example.com' },
        { id: 'pass_2', name: 'Bob Smith', email: 'bob@example.com' },
    ];

    const generateReport = () => {
        // Mock API call
        setReport({
            passengerId: selectedPassenger,
            name: mockPassengers.find(p => p.id === selectedPassenger)?.name,
            period: dateRange,
            totalTrips: 28,
            totalSpent: 450.75,
            averageRating: 4.9,
            mostFrequentPickup: '123 Main St, New York',
            mostFrequentDropoff: '456 Park Ave, New York',
            promoCodesUsed: [
                { code: 'SAVE10', discount: 15.00, usedAt: '2024-12-01' },
                { code: 'FIRSTRIDE', discount: 5.00, usedAt: '2024-11-15' }
            ],
            paymentMethods: { card: 20, wallet: 5, cash: 3 },
            tripsByTimeOfDay: { morning: 8, afternoon: 12, evening: 6, night: 2 }
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Passenger Activity Report</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Passenger</label>
                        <select
                            value={selectedPassenger}
                            onChange={(e) => setSelectedPassenger(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Choose passenger...</option>
                            {mockPassengers.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>
                <button
                    onClick={generateReport}
                    disabled={!selectedPassenger || !dateRange.start || !dateRange.end}
                    className="mt-4 bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-700 disabled:bg-gray-400"
                >
                    Generate Report
                </button>
            </div>

            {/* Report */}
            {report && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-sm text-gray-600 mb-1">Total Trips</h3>
                            <p className="text-3xl font-bold">{report.totalTrips}</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-sm text-gray-600 mb-1">Total Spent</h3>
                            <p className="text-3xl font-bold text-green-600">${report.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-sm text-gray-600 mb-1">Avg Rating Given</h3>
                            <p className="text-3xl font-bold text-yellow-600">{report.averageRating} ⭐</p>
                        </div>
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-sm text-gray-600 mb-1">Avg Trip Value</h3>
                            <p className="text-3xl font-bold">${(report.totalSpent / report.totalTrips).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Locations */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-4">Most Frequent Locations</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Pickup</h3>
                                <p className="flex items-center">
                                    <span className="text-green-500 mr-2">📍</span>
                                    {report.mostFrequentPickup}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Dropoff</h3>
                                <p className="flex items-center">
                                    <span className="text-red-500 mr-2">📍</span>
                                    {report.mostFrequentDropoff}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Promo Codes */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-4">Promo Codes Used</h2>
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Code</th>
                                    <th className="p-3 text-left">Discount</th>
                                    <th className="p-3 text-left">Used On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.promoCodesUsed.map((promo: any, i: number) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-3 font-mono">{promo.code}</td>
                                        <td className="p-3 text-green-600">-${promo.discount.toFixed(2)}</td>
                                        <td className="p-3">{promo.usedAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Methods & Trip Times */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-lg font-bold mb-4">Payment Methods</h2>
                            <div className="space-y-2">
                                {Object.entries(report.paymentMethods).map(([method, count]: any) => (
                                    <div key={method} className="flex justify-between items-center">
                                        <span className="capitalize">{method}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-amber-600 h-2 rounded-full"
                                                    style={{ width: `${(count / report.totalTrips) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-lg font-bold mb-4">Trips by Time of Day</h2>
                            <div className="space-y-2">
                                {Object.entries(report.tripsByTimeOfDay).map(([time, count]: any) => (
                                    <div key={time} className="flex justify-between items-center">
                                        <span className="capitalize">{time}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-cyan-600 h-2 rounded-full"
                                                    style={{ width: `${(count / report.totalTrips) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
