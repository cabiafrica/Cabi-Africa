import React, { useState, useEffect } from 'react';

export default function HomepageManagementPage() {
    const [data, setData] = useState({
        heroTitle: '',
        heroSubtitle: '',
        ctaText: '',
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Mock fetch from ContentService
        setTimeout(() => {
            setData({
                heroTitle: 'Drive Your Way',
                heroSubtitle: 'Earn more with Cabi. The driver-first platform.',
                ctaText: 'Get Started'
            });
        }, 500);
    }, []);

    const handleChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        // Mock save to ContentService
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1000);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Homepage</h1>
                    <p className="text-gray-600">Update key sections of the homepage.</p>
                </div>
                <button className="text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50">
                    View Live Site
                </button>
            </div>

            <div className="bg-white p-6 rounded shadow max-w-4xl">
                <h2 className="text-lg font-bold mb-4 border-b pb-2">Hero Section</h2>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                        <p className="text-xs text-gray-500 mb-1">The main headline that appears at the top of the page.</p>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={data.heroTitle}
                            onChange={(e) => handleChange('heroTitle', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                        <p className="text-xs text-gray-500 mb-1">A brief description under the title.</p>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={data.heroSubtitle}
                            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action (Button Text)</label>
                        <p className="text-xs text-gray-500 mb-1">The text on the primary button (e.g. "Join Now")</p>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={data.ctaText}
                            onChange={(e) => handleChange('ctaText', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t flex justify-end items-center">
                    {saved && (
                        <span className="mr-4 text-green-600 font-bold flex items-center animate-pulse">
                            ✓ Content Updated
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Updates'}
                    </button>
                </div>
            </div>
        </div>
    );
}
