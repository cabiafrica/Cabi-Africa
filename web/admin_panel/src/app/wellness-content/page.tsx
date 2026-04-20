'use client';
import React, { useState, useEffect } from 'react';

// Mock Data
const MOCK_CONTENT: any[] = [];

export default function WellnessContentPage() {
    const [content, setContent] = useState<any[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Breathing Exercises',
        duration: '',
    });

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => setContent(MOCK_CONTENT), 500);
    }, []);

    const handleUpload = () => {
        const newItem = {
            ...formData,
            id: Date.now().toString(),
            type: 'AUDIO',
            isActive: true
        };
        setContent([newItem, ...content]);
        setShowUploadForm(false);
        setFormData({ title: '', category: 'Breathing Exercises', duration: '' });
    };

    const toggleActive = (id: string) => {
        setContent(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this track?')) {
            setContent(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-teal-800">Wellness Content Library</h1>
                    <p className="text-gray-500">Manage audio tracks for the driver app mindfulness section.</p>
                </div>
                <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
                >
                    {showUploadForm ? 'Cancel' : '+ Upload New Track'}
                </button>
            </div>

            {showUploadForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-teal-100">
                    <h2 className="text-lg font-bold mb-4 text-teal-700">Upload Audio Track</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Track Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="e.g. Deep Relaxation"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option>Breathing Exercises</option>
                                <option>Short Meditations</option>
                                <option>Stress Relief</option>
                                <option>Sleep Aid</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Duration (MM:SS)</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="e.g. 5:00"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Audio File</label>
                            <div className="border border-dashed border-gray-300 rounded p-2 text-center text-gray-500 cursor-pointer hover:bg-gray-50">
                                Click to select MP3 file...
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleUpload}
                            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition shadow-sm"
                        >
                            Upload & Publish
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-semibold text-gray-600">Title</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Category</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Duration</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {content.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                    <div className="bg-teal-100 p-2 rounded-full">
                                        <svg className="w-4 h-4 text-teal-700" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
                                    </div>
                                    {item.title}
                                </td>
                                <td className="p-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 font-mono text-sm">{item.duration}</td>
                                <td className="p-4">
                                    <span
                                        onClick={() => toggleActive(item.id)}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer select-none ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {item.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-3">
                                        <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">Edit</button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
