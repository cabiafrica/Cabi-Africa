'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyCenterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [preferences, setPreferences] = useState({
        marketingEmails: true,
        pushNotifications: true,
        thirdPartySharing: false, // Default opt-out
    });

    useEffect(() => {
        // Mock fetch preferences
        // fetch('/api/users/me/preferences')
        setTimeout(() => {
            setPreferences({
                marketingEmails: true,
                pushNotifications: true,
                thirdPartySharing: false,
            });
        }, 500);
    }, []);

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        // Simulate API call
        setTimeout(() => {
            console.log('Saved preferences:', preferences);
            setIsLoading(false);
            setMessage({ type: 'success', text: 'Privacy preferences updated successfully.' });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Privacy Center</h1>
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">&larr; Back to Dashboard</Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-8">

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Communication Preferences</h2>
                            <p className="text-gray-600 text-sm">Manage how we communicate with you.</p>
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Marketing Emails</div>
                                    <div className="text-sm text-gray-500">Receive news, promotions, and product updates.</div>
                                </div>
                                <button
                                    onClick={() => handleToggle('marketingEmails')}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${preferences.marketingEmails ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${preferences.marketingEmails ? 'translate-x-5' : 'translate-x-0'}`}
                                    ></span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Push Notifications</div>
                                    <div className="text-sm text-gray-500">Receive real-time alerts about your rides and account.</div>
                                </div>
                                <button
                                    onClick={() => handleToggle('pushNotifications')}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${preferences.pushNotifications ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${preferences.pushNotifications ? 'translate-x-5' : 'translate-x-0'}`}
                                    ></span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Third-Party Data Sharing</div>
                                    <div className="text-sm text-gray-500">Allow us to share data with partners for better offers.</div>
                                </div>
                                <button
                                    onClick={() => handleToggle('thirdPartySharing')}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${preferences.thirdPartySharing ? 'bg-black' : 'bg-gray-200'}`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${preferences.thirdPartySharing ? 'translate-x-5' : 'translate-x-0'}`}
                                    ></span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Your Data</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <div className="font-medium text-gray-900">Download My Data</div>
                                    <div className="text-sm text-gray-500">Get a copy of your personal data and trip history.</div>
                                </div>
                                <button disabled className="text-gray-400 font-medium text-sm cursor-not-allowed border border-gray-200 px-3 py-1 rounded">
                                    Coming Soon
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <div className="font-medium text-red-600">Delete Account</div>
                                    <div className="text-sm text-gray-500">Permanently delete your account and all data.</div>
                                </div>
                                <button disabled className="text-gray-400 font-medium text-sm cursor-not-allowed border border-gray-200 px-3 py-1 rounded">
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
