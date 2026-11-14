import React, { useState } from 'react';

// Using ContentService structure from Story 102.x
export default function HelpContentManager() {
    const [faqs] = useState([
        { id: '1', q: 'How to rest password?', a: 'Go to settings...', category: 'Account' }
    ]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Help Center Content</h1>

            <div className="mb-8">
                <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
                <table className="min-w-full bg-white border">
                    <thead><tr><th className="border p-2">Question</th><th className="border p-2">Category</th><th className="border p-2">Action</th></tr></thead>
                    <tbody>
                        {faqs.map(f => (
                            <tr key={f.id}>
                                <td className="border p-2">{f.q}</td>
                                <td className="border p-2">{f.category}</td>
                                <td className="border p-2 text-amber-600">Edit</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">+ Add FAQ</button>
            </div>

            <div>
                <h2 className="text-lg font-bold mb-4">Help Articles</h2>
                <p className="text-gray-500">Manage longer form articles here...</p>
            </div>
        </div>
    );
}
