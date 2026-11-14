'use client';

import { useState } from 'react';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string | null;
    category: string;
    tags: string[];
    status: 'draft' | 'published';
    imageUrl?: string;
    promotionStats?: { recipients: number, opens: number, clicks: number, lastPromotedAt: string };
}

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: [],
        status: 'draft',
    });

    const [isPromoting, setIsPromoting] = useState(false);
    const [promotionPost, setPromotionPost] = useState<BlogPost | null>(null);
    const [promotionData, setPromotionData] = useState({
        audience: 'all',
        sendPushNotification: true,
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
    });

    const handleCreateNew = () => {
        setCurrentPost({
            title: '',
            excerpt: '',
            content: '',
            category: '',
            tags: [],
            status: 'draft',
        });
        setIsEditing(true);
    };

    const handleEdit = (post: BlogPost) => {
        setCurrentPost(post);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (currentPost.id) {
            // Update existing post
            setPosts(posts.map(p => p.id === currentPost.id ? currentPost as BlogPost : p));
        } else {
            // Create new post
            const newPost: BlogPost = {
                ...currentPost as BlogPost,
                id: Date.now().toString(),
                slug: currentPost.title?.toLowerCase().replace(/\s+/g, '-') || '',
                author: 'Admin',
                publishedAt: currentPost.status === 'published' ? new Date().toISOString() : null,
            };
            setPosts([...posts, newPost]);
        }
        setIsEditing(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handlePublish = (id: string) => {
        setPosts(posts.map(p =>
            p.id === id
                ? { ...p, status: 'published' as const, publishedAt: new Date().toISOString() }
                : p
        ));
    };

    const handleUnpublish = (id: string) => {
        setPosts(posts.map(p =>
            p.id === id
                ? { ...p, status: 'draft' as const, publishedAt: null }
                : p
        ));
    };

    const handlePromote = (post: BlogPost) => {
        setPromotionPost(post);
        setIsPromoting(true);
    };

    const handleSendPromotion = () => {
        // TODO: Integrate with notification service
        console.log('Sending promotion for:', promotionPost?.title);
        console.log('Promotion data:', promotionData);
        alert(`Promotion scheduled for "${promotionPost?.title}"!\n\nAudience: ${promotionData.audience}\nPush Notification: ${promotionData.sendPushNotification ? 'Yes' : 'No'}\nSchedule: ${promotionData.scheduleType}`);

        // Mock stats update
        if (promotionPost) {
            const newStats = {
                recipients: Math.floor(Math.random() * 500) + 100,
                opens: 0,
                clicks: 0,
                lastPromotedAt: new Date().toISOString()
            };
            setPosts(posts.map(p => p.id === promotionPost.id ? { ...p, promotionStats: newStats } : p));
        }

        setIsPromoting(false);
    };

    if (isEditing) {
        return (
            <div className="p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {currentPost.id ? 'Edit Post' : 'Create New Post'}
                        </h1>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Back to List
                        </button>
                    </div>

                    {/* Editor Form */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Title */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={currentPost.title || ''}
                                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                placeholder="Enter post title..."
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Excerpt *
                            </label>
                            <textarea
                                value={currentPost.excerpt || ''}
                                onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                placeholder="Brief summary of the post..."
                            />
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content *
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-300 p-2 flex space-x-2">
                                    <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium">
                                        <strong>B</strong>
                                    </button>
                                    <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm italic">
                                        I
                                    </button>
                                    <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm">
                                        H2
                                    </button>
                                    <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm">
                                        Link
                                    </button>
                                    <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm">
                                        Image
                                    </button>
                                </div>
                                <textarea
                                    value={currentPost.content || ''}
                                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    rows={15}
                                    className="w-full px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                    placeholder="Write your post content here... (HTML supported)"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Tip: You can use HTML tags for formatting
                            </p>
                        </div>

                        {/* Category and Tags Row */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={currentPost.category || ''}
                                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                >
                                    <option value="">Select a category...</option>
                                    <option value="Announcements">Announcements</option>
                                    <option value="Features">Features</option>
                                    <option value="Driver Stories">Driver Stories</option>
                                    <option value="Tips & Tricks">Tips & Tricks</option>
                                    <option value="Company News">Company News</option>
                                    <option value="Industry Insights">Industry Insights</option>
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={currentPost.tags?.join(', ') || ''}
                                    onChange={(e) => setCurrentPost({
                                        ...currentPost,
                                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="e.g., launch, news, drivers"
                                />
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Featured Image URL
                            </label>
                            <input
                                type="text"
                                value={currentPost.imageUrl || ''}
                                onChange={(e) => setCurrentPost({ ...currentPost, imageUrl: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setCurrentPost({ ...currentPost, status: 'draft' });
                                        handleSave();
                                    }}
                                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentPost({ ...currentPost, status: 'published' });
                                        handleSave();
                                    }}
                                    className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-bold"
                                >
                                    Publish Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                        <p className="text-gray-600 mt-2">Create and manage blog posts for the marketing website</p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-bold flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Post</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Posts</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{posts.length}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Published</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {posts.filter(p => p.status === 'published').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Drafts</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    {posts.filter(p => p.status === 'draft').length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Published
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                        <div className="text-sm text-gray-500">{post.excerpt.substring(0, 60)}...</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {post.promotionStats ? (
                                            <div className="text-xs">
                                                <div className="flex items-center space-x-1" title="Recipients">
                                                    <span>👥</span> <span className="font-semibold">{post.promotionStats.recipients}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1 text-green-600" title="Opens">
                                                    <span>📩</span> <span className="font-semibold">{post.promotionStats.opens}</span>
                                                    <span className="text-gray-400 ml-1">({Math.round(post.promotionStats.opens / post.promotionStats.recipients * 100)}%)</span>
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1 text-amber-600" title="Clicks">
                                                    <span>🖱️</span> <span className="font-semibold">{post.promotionStats.clicks}</span>
                                                    <span className="text-gray-400 ml-1">({Math.round(post.promotionStats.clicks / post.promotionStats.recipients * 100)}%)</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not promoted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(post)}
                                                className="text-amber-600 hover:text-amber-900"
                                            >
                                                Edit
                                            </button>
                                            {post.status === 'published' && (
                                                <button
                                                    onClick={() => handlePromote(post)}
                                                    className="text-cyan-600 hover:text-cyan-900"
                                                >
                                                    Promote
                                                </button>
                                            )}
                                            {post.status === 'draft' ? (
                                                <button
                                                    onClick={() => handlePublish(post.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Publish
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUnpublish(post.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    Unpublish
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {posts.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCreateNew}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Promotion Modal */}
                {isPromoting && promotionPost && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Promote Blog Post</h2>
                                        <p className="text-cyan-100 mt-1">Send to users via in-app message</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPromoting(false)}
                                        className="text-white hover:bg-cyan-800 rounded-lg p-2 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Post Preview */}
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border-2 border-cyan-200">
                                    <p className="text-xs text-cyan-600 font-semibold uppercase mb-2">Post to Promote</p>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{promotionPost.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{promotionPost.excerpt}</p>
                                    <div className="flex items-center space-x-2 text-xs text-cyan-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="font-mono">/blog/{promotionPost.slug}</span>
                                    </div>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Target Audience *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: 'all', label: 'All Users', icon: '👥' },
                                            { value: 'passengers', label: 'Passengers Only', icon: '🚗' },
                                            { value: 'drivers', label: 'Drivers Only', icon: '🚕' },
                                            { value: 'region', label: 'Specific Region', icon: '🌍' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setPromotionData({ ...promotionData, audience: option.value })}
                                                className={`p-4 rounded-lg border-2 transition-all ${promotionData.audience === option.value
                                                    ? 'border-cyan-600 bg-cyan-50 shadow-md'
                                                    : 'border-gray-200 hover:border-cyan-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">{option.icon}</div>
                                                <div className="text-sm font-semibold text-gray-900">{option.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Push Notification */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={promotionData.sendPushNotification}
                                            onChange={(e) => setPromotionData({ ...promotionData, sendPushNotification: e.target.checked })}
                                            className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                <span className="font-semibold text-gray-900">Send High-Priority Push Notification</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Users will receive a push notification on their device</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Schedule Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Delivery Schedule *
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${promotionData.scheduleType === 'immediate' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200'}">
                                            <input
                                                type="radio"
                                                name="scheduleType"
                                                value="immediate"
                                                checked={promotionData.scheduleType === 'immediate'}
                                                onChange={(e) => setPromotionData({ ...promotionData, scheduleType: e.target.value })}
                                                className="mt-1 w-4 h-4 text-cyan-600"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">Send Immediately</div>
                                                <div className="text-xs text-gray-600">Promotion will be sent right away</div>
                                            </div>
                                        </label>

                                        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${promotionData.scheduleType === 'scheduled' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200'}">
                                            <input
                                                type="radio"
                                                name="scheduleType"
                                                value="scheduled"
                                                checked={promotionData.scheduleType === 'scheduled'}
                                                onChange={(e) => setPromotionData({ ...promotionData, scheduleType: e.target.value })}
                                                className="mt-1 w-4 h-4 text-cyan-600"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">Schedule for Later</div>
                                                <div className="text-xs text-gray-600 mb-3">Choose a specific date and time</div>
                                                {promotionData.scheduleType === 'scheduled' && (
                                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                                        <input
                                                            type="date"
                                                            value={promotionData.scheduledDate}
                                                            onChange={(e) => setPromotionData({ ...promotionData, scheduledDate: e.target.value })}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                                                        />
                                                        <input
                                                            type="time"
                                                            value={promotionData.scheduledTime}
                                                            onChange={(e) => setPromotionData({ ...promotionData, scheduledTime: e.target.value })}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Message Preview */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                    <p className="text-xs text-gray-600 font-semibold uppercase mb-3">Message Preview</p>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 text-sm">New Blog Post</p>
                                                <p className="text-sm text-gray-700 mt-1">{promotionPost.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">Tap to read more →</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between border-t border-gray-200">
                                <button
                                    onClick={() => setIsPromoting(false)}
                                    className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendPromotion}
                                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all font-bold shadow-lg flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span>{promotionData.scheduleType === 'immediate' ? 'Send Now' : 'Schedule Promotion'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
