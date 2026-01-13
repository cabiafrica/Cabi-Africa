import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { occurrenceService } from '../../services/occurrence.service';
import type { Occurrence } from '../../types/occurrence';
import { CATEGORY_LABELS, CATEGORY_COLORS, SEVERITY_COLORS } from '../../types/occurrence';

export default function OccurrenceDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
    const [loading, setLoading] = useState(true);
    const [showObjectionForm, setShowObjectionForm] = useState(false);
    const [objectionText, setObjectionText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) loadOccurrence();
    }, [id]);

    const loadOccurrence = async () => {
        try {
            setLoading(true);
            const data = await occurrenceService.getOccurrence(id as string);
            setOccurrence(data);
        } catch (error) {
            console.error('Failed to load occurrence:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitObjection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!objectionText.trim() || objectionText.length < 20) {
            alert('Please provide at least 20 characters explaining your objection');
            return;
        }

        try {
            setSubmitting(true);
            await occurrenceService.fileObjection({
                occurrenceId: id as string,
                objectorId: localStorage.getItem('userId') || '',
                objectionText,
            });
            alert('Objection filed successfully! It will be reviewed by our team.');
            setShowObjectionForm(false);
            setObjectionText('');
            loadOccurrence();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to file objection');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!occurrence) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Occurrence not found</h2>
                    <button
                        onClick={() => router.push('/my-occurrences')}
                        className="mt-4 text-red-600 hover:text-red-700"
                    >
                        ← Back to My Occurrences
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const canFileObjection = occurrence.status !== 'RESOLVED' &&
        (!occurrence.objections || occurrence.objections.every(obj => obj.status === 'REJECTED'));

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/my-occurrences')}
                    className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                    ← Back to My Occurrences
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">{occurrence.obNumber}</h1>
                        <p className="text-red-100">{occurrence.title}</p>
                    </div>

                    {/* Badges */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
                        <span
                            className="px-4 py-2 rounded-lg text-sm font-bold"
                            style={{
                                backgroundColor: CATEGORY_COLORS[occurrence.category] + '20',
                                color: CATEGORY_COLORS[occurrence.category],
                                border: `2px solid ${CATEGORY_COLORS[occurrence.category]}`,
                            }}
                        >
                            {CATEGORY_LABELS[occurrence.category]}
                        </span>
                        <span
                            className="px-4 py-2 rounded-lg text-sm font-bold"
                            style={{
                                backgroundColor: SEVERITY_COLORS[occurrence.severity] + '20',
                                color: SEVERITY_COLORS[occurrence.severity],
                            }}
                        >
                            {occurrence.severity} SEVERITY
                        </span>
                        <span
                            className={`px-4 py-2 rounded-lg text-sm font-bold ${occurrence.status === 'RESOLVED'
                                    ? 'bg-green-100 text-green-800'
                                    : occurrence.status === 'DISPUTED'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                        >
                            {occurrence.status}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        {/* Time, Date & Place */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-red-900 mb-3">📅 TIME, DATE & PLACE</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-bold text-gray-900">{formatDate(occurrence.occurrenceDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Time</p>
                                    <p className="font-bold text-gray-900">{occurrence.occurrenceTime}</p>
                                </div>
                                {occurrence.locationPlaceName && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-bold text-gray-900">📍 {occurrence.locationPlaceName}</p>
                                        {occurrence.locationAddress && (
                                            <p className="text-sm text-gray-600 mt-1">{occurrence.locationAddress}</p>
                                        )}
                                        {occurrence.locationCity && (
                                            <p className="text-sm text-gray-600">{occurrence.locationCity}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{occurrence.description}</p>
                        </div>

                        {/* Tags */}
                        {occurrence.tags && occurrence.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {occurrence.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resolution */}
                        {occurrence.status === 'RESOLVED' && occurrence.resolutionNotes && (
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-green-900 mb-2">✓ Resolution</h3>
                                <p className="text-sm text-green-700 mb-2">
                                    Resolved on {occurrence.resolvedAt && new Date(occurrence.resolvedAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-700">{occurrence.resolutionNotes}</p>
                            </div>
                        )}

                        {/* Objections */}
                        {occurrence.objections && occurrence.objections.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">⚖️ Your Objections</h3>
                                <div className="space-y-3">
                                    {occurrence.objections.map((objection) => (
                                        <div
                                            key={objection.id}
                                            className={`border-2 rounded-lg p-4 ${objection.status === 'ACCEPTED'
                                                    ? 'border-green-200 bg-green-50'
                                                    : objection.status === 'REJECTED'
                                                        ? 'border-red-200 bg-red-50'
                                                        : 'border-yellow-200 bg-yellow-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-gray-600">
                                                    Filed on {new Date(objection.createdAt).toLocaleDateString()}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${objection.status === 'ACCEPTED'
                                                            ? 'bg-green-200 text-green-800'
                                                            : objection.status === 'REJECTED'
                                                                ? 'bg-red-200 text-red-800'
                                                                : 'bg-yellow-200 text-yellow-800'
                                                        }`}
                                                >
                                                    {objection.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-2">{objection.objectionText}</p>
                                            {objection.reviewNotes && (
                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                    <p className="text-sm font-bold text-gray-900">Admin Response:</p>
                                                    <p className="text-sm text-gray-700 mt-1">{objection.reviewNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Objection Button */}
                        {canFileObjection && !showObjectionForm && (
                            <button
                                onClick={() => setShowObjectionForm(true)}
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                ⚖️ File an Objection
                            </button>
                        )}

                        {/* Objection Form */}
                        {showObjectionForm && (
                            <form onSubmit={handleSubmitObjection} className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">File an Objection</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Explain why you believe this occurrence record is incorrect or unfair. Your objection will be reviewed by our team.
                                </p>
                                <textarea
                                    value={objectionText}
                                    onChange={(e) => setObjectionText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Provide a detailed explanation (minimum 20 characters)..."
                                    required
                                    minLength={20}
                                />
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Objection'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowObjectionForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
