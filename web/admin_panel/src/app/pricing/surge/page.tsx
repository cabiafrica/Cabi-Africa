'use client';

import { useState } from 'react';

interface SurgeZone {
    id: string;
    name: string;
    multiplier: number;
    isActive: boolean;
    appliedAt?: string;
    appliedBy?: string;
}

export default function ManualSurgePricingPage() {
    const [zones, setZones] = useState<SurgeZone[]>([
        { id: '1', name: 'Downtown', multiplier: 1.0, isActive: false },
        { id: '2', name: 'Airport', multiplier: 1.0, isActive: false },
        { id: '3', name: 'University District', multiplier: 1.0, isActive: false },
        { id: '4', name: 'Business District', multiplier: 1.0, isActive: false },
        { id: '5', name: 'Stadium Area', multiplier: 1.8, isActive: true, appliedAt: '2024-12-15T20:30:00Z', appliedBy: 'Admin User' },
    ]);

    const [selectedZone, setSelectedZone] = useState<SurgeZone | null>(null);
    const [multiplierInput, setMultiplierInput] = useState('1.0');

    const handleApplySurge = () => {
        if (!selectedZone) return;

        const multiplier = parseFloat(multiplierInput);
        if (isNaN(multiplier) || multiplier < 1.0 || multiplier > 5.0) {
            alert('Please enter a valid multiplier between 1.0 and 5.0');
            return;
        }

        setZones(zones.map(z =>
            z.id === selectedZone.id
                ? {
                    ...z,
                    multiplier,
                    isActive: true,
                    appliedAt: new Date().toISOString(),
                    appliedBy: 'Current Admin'
                }
                : z
        ));

        setSelectedZone(null);
        setMultiplierInput('1.0');
        alert(`Surge ${multiplier}x applied to ${selectedZone.name}`);
    };

    const handleRemoveSurge = (zoneId: string) => {
        setZones(zones.map(z =>
            z.id === zoneId
                ? { ...z, multiplier: 1.0, isActive: false, appliedAt: undefined, appliedBy: undefined }
                : z
        ));
    };

    const activeZones = zones.filter(z => z.isActive);
    const inactiveZones = zones.filter(z => !z.isActive);

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manual Surge Pricing</h1>
                    <p className="text-gray-600 mt-2">
                        Apply surge multipliers to specific zones during high-demand events
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Zones</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{zones.length}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active Surge</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{activeZones.length}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Avg Multiplier</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {activeZones.length > 0
                                        ? (activeZones.reduce((sum, z) => sum + z.multiplier, 0) / activeZones.length).toFixed(1)
                                        : '0.0'}x
                                </p>
                            </div>
                            <div className="p-3 bg-cyan-100 rounded-lg">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Normal Zones</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{inactiveZones.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Surge Zones */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Active Surge Zones</h2>
                            </div>

                            {activeZones.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {activeZones.map((zone) => (
                                        <div key={zone.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-bold rounded-full">
                                                            {zone.multiplier.toFixed(1)}x SURGE
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>👤 Applied by: {zone.appliedBy}</span>
                                                        <span>🕐 {zone.appliedAt ? new Date(zone.appliedAt).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveSurge(zone.id)}
                                                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    Remove Surge
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Surge</h3>
                                    <p className="text-gray-600">All zones are currently at normal pricing</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apply Surge Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                            <h2 className="text-xl font-bold mb-6">Apply Surge Pricing</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Select Zone</label>
                                    <select
                                        value={selectedZone?.id || ''}
                                        onChange={(e) => {
                                            const zone = zones.find(z => z.id === e.target.value);
                                            setSelectedZone(zone || null);
                                        }}
                                        className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Choose a zone...</option>
                                        {zones.map((zone) => (
                                            <option key={zone.id} value={zone.id}>
                                                {zone.name} {zone.isActive ? `(${zone.multiplier}x active)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Multiplier (1.0 - 5.0)</label>
                                    <input
                                        type="number"
                                        min="1.0"
                                        max="5.0"
                                        step="0.1"
                                        value={multiplierInput}
                                        onChange={(e) => setMultiplierInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-yellow-400"
                                        placeholder="e.g., 1.5"
                                    />
                                </div>

                                {selectedZone && (
                                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                        <p className="text-sm font-semibold mb-2">Preview:</p>
                                        <p className="text-lg">
                                            Base fare: <span className="font-bold">$10.00</span>
                                        </p>
                                        <p className="text-lg">
                                            With {multiplierInput}x: <span className="font-bold">${(10 * parseFloat(multiplierInput || '1')).toFixed(2)}</span>
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleApplySurge}
                                    disabled={!selectedZone}
                                    className="w-full px-6 py-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Surge
                                </button>

                                <div className="bg-white bg-opacity-10 rounded-lg p-4 text-sm">
                                    <p className="font-semibold mb-2">⚠️ Important:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Surge affects all new ride requests in the zone</li>
                                        <li>• Passengers will see the multiplier clearly</li>
                                        <li>• Use responsibly during events/emergencies</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
