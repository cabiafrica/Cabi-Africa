import React, { useState } from 'react';

// Mock map component
const SurgeZoneMap = ({ zones, _onZoneCreate, _onZoneUpdate, _onZoneDelete }: any) => {
    return (
        <div className="relative bg-gray-200 rounded-lg" style={{ height: '500px' }}>
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <p className="text-lg font-medium">Interactive Map (Mock)</p>
                    <p className="text-sm">Draw polygons to create surge zones</p>
                    <p className="text-xs mt-2">Integration: Google Maps / Mapbox</p>
                </div>
            </div>
            {/* Mock zone overlays */}
            {zones.map((zone: any, index: number) => (
                <div
                    key={zone.id}
                    className="absolute bg-red-500 bg-opacity-20 border-2 border-red-500 rounded"
                    style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + index * 10}%`,
                        width: '100px',
                        height: '80px',
                    }}
                >
                    <div className="bg-white px-2 py-1 text-xs font-bold">{zone.name}</div>
                </div>
            ))}
        </div>
    );
};

export default function SurgePricingPage() {
    const [zones, setZones] = useState([
        { id: '1', name: 'Downtown', multiplier: 1.5, isActive: true },
        { id: '2', name: 'Airport', multiplier: 2.0, isActive: true },
        { id: '3', name: 'Stadium District', multiplier: 1.8, isActive: false },
    ]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        multiplier: 1.5,
    });

    const handleCreate = () => {
        const newZone = {
            id: Date.now().toString(),
            ...formData,
            isActive: true,
        };
        setZones([...zones, newZone]);
        setShowCreateForm(false);
        setFormData({ name: '', multiplier: 1.5 });
    };

    const toggleActive = (id: string) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
    };

    const deleteZone = (id: string) => {
        if (confirm('Delete this surge zone?')) {
            setZones(prev => prev.filter(z => z.id !== id));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Dynamic Pricing Zones</h1>
                    <p className="text-gray-600">Manage surge pricing geographic zones</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-700"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Zone'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-bold mb-4">Create New Surge Zone</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Zone Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Downtown"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Surge Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.multiplier}
                                onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        After creating, draw the zone boundary on the map
                    </p>
                    <button
                        onClick={handleCreate}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Create Zone
                    </button>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Map */}
                <div className="col-span-2">
                    <div className="bg-white rounded shadow p-4">
                        <h3 className="font-bold mb-4">Zone Map</h3>
                        <SurgeZoneMap
                            zones={zones}
                            onZoneCreate={() => { /* No-op */ }}
                            onZoneUpdate={() => { /* No-op */ }}
                            onZoneDelete={() => { /* No-op */ }}
                        />
                    </div>
                </div>

                {/* Zone List */}
                <div className="bg-white rounded shadow p-4">
                    <h3 className="font-bold mb-4">Active Zones</h3>
                    <div className="space-y-3">
                        {zones.map((zone) => (
                            <div
                                key={zone.id}
                                className={`p-3 rounded border-2 ${zone.isActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold">{zone.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {zone.multiplier}x multiplier
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${zone.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {zone.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => toggleActive(zone.id)}
                                        className="text-xs text-amber-600 hover:underline"
                                    >
                                        {zone.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="text-xs text-gray-600 hover:underline">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteZone(zone.id)}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                        <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
                        <p className="text-xs text-gray-700">
                            Surge zones automatically apply multipliers to fares when demand is high in these areas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Total Zones</h3>
                    <p className="text-2xl font-bold">{zones.length}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Active Zones</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {zones.filter(z => z.isActive).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Avg Multiplier</h3>
                    <p className="text-2xl font-bold text-orange-600">
                        {(zones.reduce((sum, z) => sum + z.multiplier, 0) / zones.length).toFixed(1)}x
                    </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-sm text-gray-600 mb-1">Surge Revenue (Mock)</h3>
                    <p className="text-2xl font-bold text-amber-600">$12,450</p>
                </div>
            </div>
        </div>
    );
}
