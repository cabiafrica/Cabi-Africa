'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock payment methods
const MOCK_PAYMENT_METHODS = [
    { id: 'pm_1', type: 'Visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true, icon: '💳' },
    { id: 'pm_2', type: 'MasterCard', last4: '8844', expMonth: 5, expYear: 2026, isDefault: false, icon: '💳' },
];

export default function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState(MOCK_PAYMENT_METHODS);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this payment method?')) {
            setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        }
    };

    const handleSetDefault = (id: string) => {
        setPaymentMethods(prev => prev.map(pm => ({
            ...pm,
            isDefault: pm.id === id
        })));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4 flex justify-between items-center z-10">
                <Link href="/" className="text-2xl font-bold">Cabi</Link>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black font-semibold">Back to Dashboard</Link>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
                    <p className="text-gray-500 mb-8">Manage your saved cards for faster booking.</p>

                    <div className="space-y-4">
                        {paymentMethods.map(pm => (
                            <div key={pm.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                                        {pm.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg flex items-center">
                                            {pm.type} •••• {pm.last4}
                                            {pm.isDefault && (
                                                <span className="ml-2 bg-black text-white text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                            )}
                                        </div>
                                        <div className="text-gray-500 text-sm">Expires {pm.expMonth}/{pm.expYear}</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {!pm.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(pm.id)}
                                            className="text-sm font-bold text-gray-600 hover:text-black"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(pm.id)}
                                        className="text-sm font-bold text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card Button Mock */}
                        <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-black hover:text-black transition-colors flex items-center justify-center space-x-2">
                            <span className="text-xl">+</span>
                            <span>Add New Payment Method</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
