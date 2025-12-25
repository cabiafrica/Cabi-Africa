import React, { useState, useEffect } from 'react';

// Mock fetch
const fetchIncentiveRules = async () => {
    return [
        { id: '1', type: 'CONSECUTIVE_TRIPS', name: '3 Trips Streak Bonus', threshold: 3, bonusAmount: 10.00, isActive: true },
        { id: '2', type: 'REFERRAL', name: 'Passenger Referral Bonus', threshold: 1, bonusAmount: 5.00, isActive: true },
        { id: '3', type: 'PEAK_HOURS', name: 'Peak Hours Bonus', threshold: 5, bonusAmount: 15.00, isActive: false },
    ];
};

export default function IncentivesPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'CONSECUTIVE_TRIPS',
        name: '',
        description: '',
        threshold: 3,
        bonusAmount: 10.00,
    });

    useEffect(() => {
        fetchIncentiveRules().then(setRules);
    }, []);

    const handleCreate = () => {
        const newRule = { ...formData, id: Date.now().toString(), isActive: true };
        setRules([newRule, ...rules]);
        setShowCreateForm(false);
        setFormData({ type: 'CONSECUTIVE_TRIPS', name: '', description: '', threshold: 3, bonusAmount: 10.00 });
    };

    const toggleActive = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Driver Incentives</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Incentive Rule'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-bold mb-4">Create New Incentive Rule</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="CONSECUTIVE_TRIPS">Consecutive Trips</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="PEAK_HOURS">Peak Hours</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                placeholder="3 Trips Streak Bonus"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                rows={2}
                                placeholder="Complete 3 trips in a row without canceling"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Threshold</label>
                            <input
                                type="number"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bonus Amount ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.bonusAmount}
                                onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Create Rule
                    </button>
                </div>
            )}

            <div className="bg-white rounded shadow">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Threshold</th>
                            <th className="p-3 text-left">Bonus</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map((rule) => (
                            <tr key={rule.id} className="border-b">
                                <td className="p-3 font-medium">{rule.name}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        {rule.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-3">{rule.threshold}</td>
                                <td className="p-3 font-bold text-green-600">${rule.bonusAmount.toFixed(2)}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {rule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleActive(rule.id)}
                                        className="text-blue-600 hover:underline mr-3"
                                    >
                                        {rule.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="text-gray-600 hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-2">Active Rules</h3>
                    <p className="text-3xl font-bold">{rules.filter(r => r.isActive).length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-2">Total Bonus Pool</h3>
                    <p className="text-3xl font-bold text-green-600">
                        ${rules.reduce((sum, r) => r.isActive ? sum + r.bonusAmount : sum, 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-2">Bonuses Awarded (Mock)</h3>
                    <p className="text-3xl font-bold text-blue-600">$1,234.50</p>
                </div>
            </div>
        </div>
    );
}
