import React, { useState, useEffect } from 'react';

// Mock Fetch
const fetchRatings = async () => {
    return [
        { id: '1', rater: 'Tom', ratee: 'Driver Dave', stars: 5, comment: 'Great!', type: 'PASSENGER_TO_DRIVER', status: 'VISIBLE' },
        { id: '2', rater: 'Driver Dave', ratee: 'Tom', stars: 1, comment: 'Rude.', type: 'DRIVER_TO_PASSENGER', status: 'VISIBLE' },
    ];
};

export default function RatingsModeration() {
    const [ratings, setRatings] = useState<any[]>([]);

    useEffect(() => {
        fetchRatings().then(setRatings);
    }, []);

    const hideRating = (id: string) => {
        setRatings(prev => prev.map(r => r.id === id ? { ...r, status: 'HIDDEN' } : r));
        // In real app: PUT /api/ratings/admin/:id/hide
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Ratings & Reviews Moderation</h1>

            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Rater -> Ratee</th>
                        <th className="p-3 text-left">Stars</th>
                        <th className="p-3 text-left">Comment</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {ratings.map(r => (
                        <tr key={r.id} className="border-b">
                            <td className="p-3 text-xs font-mono">{r.type === 'PASSENGER_TO_DRIVER' ? 'P->D' : 'D->P'}</td>
                            <td className="p-3">{r.rater} -> {r.ratee}</td>
                            <td className="p-3 text-amber-500">{'★'.repeat(r.stars)}</td>
                            <td className="p-3 italic">"{r.comment}"</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs ${r.status === 'VISIBLE' ? 'bg-green-100' : 'bg-red-100 text-red-800'}`}>
                                    {r.status}
                                </span>
                            </td>
                            <td className="p-3">
                                {r.status === 'VISIBLE' && (
                                    <button onClick={() => hideRating(r.id)} className="text-red-600 hover:underline">Hide</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
