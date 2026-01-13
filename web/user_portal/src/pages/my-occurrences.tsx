import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { occurrenceService } from '../services/occurrence.service';
import type { Occurrence } from '../types/occurrence';
import { CATEGORY_LABELS, CATEGORY_COLORS, SEVERITY_COLORS } from '../types/occurrence';

export default function MyOccurrences() {
    const router = useRouter();
    const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'disputed'>('all');

    useEffect(() => {
        loadOccurrences();
    }, []);

    const loadOccurrences = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId') || '';
            const role = localStorage.getItem('userRole') === 'driver' ? 'driver' : 'passenger';
            const data = await occurrenceService.getUserHistory(userId, role);
            setOccurrences(data);
        } catch (error) {
            console.error('Failed to load occurrences:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOccurrences = occurrences.filter((occ) => {
        if (filter === 'all') return true;
        return occ.status.toLowerCase() === filter;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Occurrence Records</h1>
                    <p className="mt-2 text-gray-600">
                        View all incidents involving you. You can dispute any occurrence by filing an objection.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    {['all', 'open', 'resolved', 'disputed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredOccurrences.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No occurrences found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all'
                                ? 'You have no occurrence records.'
                                : `You have no ${filter} occurrences.`}
                        </p>
                    </div>
                )}

                {/* Occurrence List */}
                <div className="space-y-4">
                    {filteredOccurrences.map((occurrence) => (
                        <div
                            key={occurrence.id}
                            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/occurrences/${occurrence.id}`)}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{occurrence.obNumber}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{occurrence.title}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                backgroundColor: CATEGORY_COLORS[occurrence.category] + '20',
                                                color: CATEGORY_COLORS[occurrence.category],
                                            }}
                                        >
                                            {CATEGORY_LABELS[occurrence.category]}
                                        </span>
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                backgroundColor: SEVERITY_COLORS[occurrence.severity] + '20',
                                                color: SEVERITY_COLORS[occurrence.severity],
                                            }}
                                        >
                                            {occurrence.severity}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">📅 Date:</span>
                                        <span className="ml-2 font-medium">
                                            {formatDate(occurrence.occurrenceDate)} at {occurrence.occurrenceTime}
                                        </span>
                                    </div>
                                    {occurrence.locationPlaceName && (
                                        <div>
                                            <span className="text-gray-500">📍 Location:</span>
                                            <span className="ml-2 font-medium">{occurrence.locationPlaceName}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <span
                                            className={`ml-2 px-2 py-1 rounded text-xs font-bold ${occurrence.status === 'RESOLVED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : occurrence.status === 'DISPUTED'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {occurrence.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Objections */}
                                {occurrence.objections && occurrence.objections.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-600">
                                            ⚖️ {occurrence.objections.length} objection(s) filed
                                        </span>
                                    </div>
                                )}

                                {/* Resolved Info */}
                                {occurrence.status === 'RESOLVED' && occurrence.resolvedAt && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 bg-green-50 -m-6 mt-4 p-4 rounded-b-lg">
                                        <p className="text-sm text-green-800">
                                            ✓ Resolved on {new Date(occurrence.resolvedAt).toLocaleDateString()}
                                        </p>
                                        {occurrence.resolutionNotes && (
                                            <p className="text-sm text-green-700 mt-1">{occurrence.resolutionNotes}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
