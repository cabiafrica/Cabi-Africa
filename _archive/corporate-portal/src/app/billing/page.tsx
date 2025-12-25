import React from 'react';

export default function BillingPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Corporate Billing</h1>
            <div className="bg-white shadow p-4 rounded">
                <h2 className="text-xl font-semibold">Ride Pass Subscription</h2>
                <p className="text-gray-600 my-2">
                    The Corporate Ride Pass provides unlimited free unlocks and waived surge pricing for all your employees.
                </p>
                <div className="flex items-center space-x-2 my-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">Active</span>
                    <span className="text-sm text-gray-500">Renews on Oct 1, 2024</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                    Manage Subscription
                </button>
            </div>
        </div>
    );
}
