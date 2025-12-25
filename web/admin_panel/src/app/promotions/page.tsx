import React, { useState, useEffect } from 'react';

// Mock fetch
const fetchPromoCodes = async () => {
    return [
        { id: '1', code: 'SAVE10', discountType: 'PERCENTAGE', value: 10, expiresAt: '2025-12-31', maxUses: 1000, currentUses: 45, isActive: true },
        { id: '2', code: 'FIRSTRIDE', discountType: 'FIXED', value: 5.00, expiresAt: '2025-12-31', maxUses: -1, currentUses: 234, isActive: true },
    ];
};

export default function PromotionsPage() {
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        value: 10,
        expiresAt: '',
        maxUses: 1000,
        usesPerUser: 1,
    });

    useEffect(() => {
        fetchPromoCodes().then(setPromoCodes);
    }, []);

    const handleCreate = () => {
        // API call
        const newPromo = { ...formData, id: Date.now().toString(), currentUses: 0, isActive: true };
        setPromoCodes([newPromo, ...promoCodes]);
        setShowCreateForm(false);
        setFormData({ code: '', discountType: 'PERCENTAGE', value: 10, expiresAt: '', maxUses: 1000, usesPerUser: 1 });
    };

    const toggleActive = (id: string) => {
        setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Promo Codes</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Promo Code'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-bold mb-4">Create New Promo Code</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full border rounded px-3 py-2"
                                placeholder="SAVE10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="PERCENTAGE">Percentage</option>
                                <option value="FIXED">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                            </label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expires At</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Uses (-1 = unlimited)</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Uses Per User</label>
                            <input
                                type="number"
                                value={formData.usesPerUser}
                                onChange={(e) => setFormData({ ...formData, usesPerUser: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Create Promo Code
                    </button>
                </div>
            )}

            <div className="bg-white rounded shadow">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Code</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Value</th>
                            <th className="p-3 text-left">Usage</th>
                            <th className="p-3 text-left">Expires</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promoCodes.map((promo) => (
                            <tr key={promo.id} className="border-b">
                                <td className="p-3 font-mono font-bold">{promo.code}</td>
                                <td className="p-3">{promo.discountType}</td>
                                <td className="p-3">
                                    {promo.discountType === 'PERCENTAGE' ? `${promo.value}%` : `$${promo.value}`}
                                </td>
                                <td className="p-3">
                                    {promo.currentUses} / {promo.maxUses === -1 ? '∞' : promo.maxUses}
                                </td>
                                <td className="p-3">{new Date(promo.expiresAt).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {promo.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleActive(promo.id)}
                                        className="text-blue-600 hover:underline mr-3"
                                    >
                                        {promo.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
