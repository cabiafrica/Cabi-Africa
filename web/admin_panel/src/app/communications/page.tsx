'use client';

import { useState } from 'react';

interface FeaturedContent {
    title: string;
    description: string;
    imageUrl: string;
    destinationLink: string;
    isPublished: boolean;
    publishedAt: string | null;
}

interface ExperimentVariant extends FeaturedContent {
    id: string;
    name: string;
    stats?: { impressions: number, clicks: number, ctr: number };
}

export default function CommunicationsPage() {
    const initialContent = {
        title: '',
        description: '',
        imageUrl: '',
        destinationLink: '',
        isPublished: false,
        publishedAt: null,
    };

    const [featuredContent, setFeaturedContent] = useState<FeaturedContent>(initialContent);
    const [savedContent, setSavedContent] = useState<FeaturedContent | null>(null);

    // A/B Test State
    const [isExperiment, setIsExperiment] = useState(false);
    const [variants, setVariants] = useState<ExperimentVariant[]>([
        { ...initialContent, id: 'A', name: 'Variant A' },
        { ...initialContent, id: 'B', name: 'Variant B' }
    ]);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);
    const [experimentResults, setExperimentResults] = useState<any>(null); // Mock results




    const handlePublish = () => {
        if (isExperiment) {
            const updatedVariants = variants.map(v => ({ ...v, isPublished: true, publishedAt: new Date().toISOString() }));
            setVariants(updatedVariants);
            // Mock starting experiment
            setExperimentResults({
                status: 'RUNNING',
                winner: null,
                variants: updatedVariants.map(v => ({
                    id: v.id,
                    name: v.name,
                    stats: { impressions: 0, clicks: 0, ctr: 0 }
                }))
            });

            // Simulate data coming in after 2 seconds
            setTimeout(() => {
                setExperimentResults((prev: any) => ({
                    ...prev,
                    status: 'Winner Found',
                    winner: 'Variant B',
                    variants: [
                        { id: 'A', name: 'Variant A', stats: { impressions: 1000, clicks: 50, ctr: 0.05 } },
                        { id: 'B', name: 'Variant B', stats: { impressions: 1050, clicks: 120, ctr: 0.114 } }
                    ]
                }));
            }, 2000);

            alert('A/B Test Started! Collecting data...');
        } else {
            const published = {
                ...featuredContent,
                isPublished: true,
                publishedAt: new Date().toISOString(),
            };
            setSavedContent(published);
            setFeaturedContent(published);
            alert('Featured content published successfully!');
        }
    };

    const handleUnpublish = () => {
        if (isExperiment) {
            const updatedVariants = variants.map(v => ({ ...v, isPublished: false, publishedAt: null }));
            setVariants(updatedVariants);
            setExperimentResults(null);
            alert('A/B Test Stopped.');
        } else {
            const unpublished = {
                ...featuredContent,
                isPublished: false,
                publishedAt: null,
            };
            setSavedContent(unpublished);
            setFeaturedContent(unpublished);
            alert('Featured content unpublished successfully!');
        }
    };

    const handleClear = () => {
        if (isExperiment) {
            setVariants([
                { ...initialContent, id: 'A', name: 'Variant A' },
                { ...initialContent, id: 'B', name: 'Variant B' }
            ]);
            setExperimentResults(null);
            alert('Experiment settings cleared!');
        } else {
            setFeaturedContent(initialContent);
            setSavedContent(null);
            alert('Featured content cleared!');
        }
    };

    // Helper to get current form data
    const activeData = isExperiment ? variants[activeVariantIndex] : featuredContent;
    const updateActiveData = (newData: Partial<FeaturedContent>) => {
        if (isExperiment) {
            const newVariants = [...variants];
            newVariants[activeVariantIndex] = { ...newVariants[activeVariantIndex], ...newData };
            setVariants(newVariants);
        } else {
            setFeaturedContent({ ...featuredContent, ...newData });
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Communications Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage featured content and communications across the platform
                    </p>
                </div>

                {/* Featured Content Section */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">What's New - {isExperiment ? 'A/B Test' : 'Featured Content'}</h2>
                                <p className="text-purple-100 mt-1">
                                    Manage the content displayed on user home screens
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer bg-purple-800 bg-opacity-50 px-3 py-1 rounded-full hover:bg-opacity-75 transition">
                                    <input
                                        type="checkbox"
                                        checked={isExperiment}
                                        onChange={(e) => setIsExperiment(e.target.checked)}
                                        className="form-checkbox text-purple-400"
                                    />
                                    <span className="text-sm font-medium">Enable A/B Testing</span>
                                </label>
                                {(isExperiment ? variants[0].isPublished : savedContent?.isPublished) && (
                                    <div className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-semibold">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Experiment Tabs */}
                        {isExperiment && (
                            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                                {variants.map((v, idx) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setActiveVariantIndex(idx)}
                                        className={`pb-2 px-4 font-medium transition-colors ${activeVariantIndex === idx
                                            ? 'border-b-2 border-purple-600 text-purple-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Status Banner */}
                        {(isExperiment ? variants[0].isPublished : savedContent?.isPublished) ? (
                            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-green-900">Content is Live</h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            {isExperiment
                                                ? 'Experiment is running. Users are being assigned to variants.'
                                                : 'Users are currently seeing this content on their home screens'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-yellow-900">No Active Content</h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            The "What's New" banner is not currently visible to users
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experiment Results */}
                        {isExperiment && experimentResults && (
                            <div className="mb-8 border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b font-bold flex justify-between">
                                    <span>Experiment Results</span>
                                    <span className={experimentResults.winner ? 'text-green-600' : 'text-blue-600'}>{experimentResults.status}</span>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {experimentResults.variants.map((v: any) => (
                                            <tr key={v.id}>
                                                <td className="px-4 py-2">{v.name}</td>
                                                <td className="px-4 py-2">{v.stats.impressions}</td>
                                                <td className="px-4 py-2">{v.stats.clicks}</td>
                                                <td className="px-4 py-2">{(v.stats.ctr * 100).toFixed(1)}%</td>
                                                <td className="px-4 py-2">
                                                    {experimentResults.winner === v.name && (
                                                        <span className="text-yellow-500">👑</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={activeData.title}
                                    onChange={(e) => updateActiveData({ title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., New Driver Organizations Feature"
                                    maxLength={60}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {activeData.title.length}/60 characters
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={activeData.description}
                                    onChange={(e) => updateActiveData({ description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Brief description of what's new..."
                                    maxLength={120}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {activeData.description.length}/120 characters
                                </p>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={activeData.imageUrl}
                                    onChange={(e) => updateActiveData({ imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional. Leave empty to use default icon.
                                </p>
                            </div>

                            {/* Destination Link */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Destination Link *
                                </label>
                                <input
                                    type="text"
                                    value={activeData.destinationLink}
                                    onChange={(e) => updateActiveData({ destinationLink: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com/blog/post or app://screen/name"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Can be a web URL or app deep link
                                </p>
                            </div>

                            {/* Preview */}
                            {activeData.title && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Preview {isExperiment && `(${variants[activeVariantIndex].name})`}
                                    </label>
                                    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-center space-x-4">
                                            {/* Icon/Image */}
                                            {activeData.imageUrl ? (
                                                <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={activeData.imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="inline-block px-2 py-1 bg-black rounded text-yellow-400 text-xs font-bold mb-2">
                                                    WHAT'S NEW
                                                </div>
                                                <h3 className="text-black font-bold text-base leading-tight mb-1">
                                                    {activeData.title}
                                                </h3>
                                                {activeData.description && (
                                                    <p className="text-black text-sm opacity-80 line-clamp-2">
                                                        {activeData.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 text-red-600 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                disabled={!activeData.title && !savedContent}
                            >
                                Clear Content
                            </button>

                            <div className="flex space-x-4">
                                {(isExperiment ? variants[0].isPublished : savedContent?.isPublished) && (
                                    <button
                                        onClick={handleUnpublish}
                                        className="px-6 py-3 text-yellow-700 bg-yellow-50 border-2 border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                                    >
                                        {isExperiment ? 'Stop Experiment' : 'Unpublish'}
                                    </button>
                                )}
                                <button
                                    onClick={handlePublish}
                                    disabled={!activeData.title || !activeData.destinationLink}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{isExperiment ? 'Start Experiment' : (savedContent?.isPublished ? 'Update' : 'Publish')} Content</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Single Feature</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Only one piece of content can be featured at a time. Publishing new content will replace the current one.
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Both Apps</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Featured content appears on both passenger and driver app home screens.
                        </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900">Dismissible</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Users can dismiss the banner for their current session. It will reappear on next app launch.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
