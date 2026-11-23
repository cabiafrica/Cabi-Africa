'use client';
import React, { useState, useEffect } from 'react';

interface Perk {
    id: string;
    partner: string;
    title: string;
    description: string;
    type: 'CODE' | 'LINK';
    isActive: boolean;
    code?: string;
    link?: string;
}

// Mock Data
const MOCK_PERKS: Perk[] = [];

export default function DriverPerksPage() {
    const [perks, setPerks] = useState<Perk[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        partner: '',
        title: '',
        description: '',
        type: 'CODE',
        code: '',
        link: '',
    });

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => setPerks(MOCK_PERKS), 500);
    }, []);

    const handleCreate = () => {
        const newPerk: Perk = {
            ...formData,
            type: formData.type as 'CODE' | 'LINK',
            id: Date.now().toString(),
            isActive: true
        };
        setPerks([newPerk, ...perks]);
        setShowCreateForm(false);
        setFormData({ partner: '', title: '', description: '', type: 'CODE', code: '', link: '' });
    };

    const toggleActive = (id: string) => {
        setPerks(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this perk?')) {
            setPerks(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Driver Perks & Discounts</h1>
                    <p className="text-gray-500">Manage partner offers for the discount marketplace.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700 transition"
                >
                    {showCreateForm ? 'Cancel' : '+ Add New Perk'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                    <h2 className="text-lg font-bold mb-4">Add New Partner Offer</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Partner Name</label>
                            <input
                                type="text"
                                value={formData.partner}
                                onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                                className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                                placeholder="e.g. Shell"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Offer Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                                placeholder="e.g. 5% Off Fuel"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                                rows={2}
                                placeholder="Short description of the offer..."
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1">Redemption Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                            >
                                <option value="CODE">Promo Code</option>
                                <option value="LINK">External Link</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            {formData.type === 'CODE' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Promo Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                                        placeholder="e.g. DRIVER2024"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Website Link</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none text-amber-600"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleCreate}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition shadow-sm"
                        >
                            Save and Publish
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-semibold text-gray-600">Partner</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Offer Details</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Redemption</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {perks.map((perk) => (
                            <tr key={perk.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-800">{perk.partner}</td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{perk.title}</div>
                                    <div className="text-sm text-gray-500">{perk.description}</div>
                                </td>
                                <td className="p-4">
                                    {perk.type === 'CODE' ? (
                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-300">
                                            {perk.code}
                                        </span>
                                    ) : (
                                        <a href={perk.link} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline flex items-center gap-1">
                                            Visit Site <span className="text-xs">↗</span>
                                        </a>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span
                                        onClick={() => toggleActive(perk.id)}
                                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer select-none ${perk.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {perk.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-3">
                                        <button className="text-amber-600 hover:text-amber-800 text-sm font-medium">Edit</button>
                                        <button
                                            onClick={() => handleDelete(perk.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {perks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No perks found. Add your first partner offer above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-100">
                    <h3 className="text-sm font-medium text-cyan-700 mb-2">Total Partners</h3>
                    <p className="text-3xl font-bold text-cyan-900">{new Set(perks.map(p => p.partner)).size}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Active Offers</h3>
                    <p className="text-3xl font-bold text-green-900">{perks.filter(p => p.isActive).length}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                    <h3 className="text-sm font-medium text-amber-700 mb-2">Total Redemptions (30d)</h3>
                    <p className="text-3xl font-bold text-amber-900">0</p>
                </div>
            </div>
        </div>
    );
}
