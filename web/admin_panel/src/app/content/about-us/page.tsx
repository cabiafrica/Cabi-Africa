import React, { useState, useEffect } from 'react';

export default function AboutUsManagementPage() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Mock fetch from ContentService
        setTimeout(() => {
            setContent('<h1>About Cabi</h1>\n<p>Our mission is to revolutionize ride-sharing.</p>');
        }, 500);
    }, []);

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
                    <h1 className="text-2xl font-bold">Manage "About Us" Page</h1>
                    <p className="text-gray-600">Edit the content of the public About Us page.</p>
                </div>
                <button className="text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50">
                    View Live Page
                </button>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Content (HTML)</label>
                <div className="mb-4 text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                    ℹ️ Tip: This is a raw HTML editor. Use standard tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.
                </div>
                <textarea
                    className="w-full h-96 p-4 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    spellCheck={false}
                />

                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Last updated: Just now
                    </div>
                    <div className="flex items-center">
                        {saved && (
                            <span className="mr-4 text-green-600 font-bold flex items-center animate-pulse">
                                ✓ Saved Successfully
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
