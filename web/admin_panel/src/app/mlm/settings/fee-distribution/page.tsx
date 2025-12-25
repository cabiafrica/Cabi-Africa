'use client';

import React, { useState, useEffect } from 'react';
import { adminService, MlmConfig } from '@/services/adminService';

export default function FeeDistributionPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<MlmConfig['registrationFee']>({
        total: 2000,
        systemCut: 0,
        upline1Cut: 0,
        upline2Cut: 0,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const data = await adminService.getMlmConfig();
            setConfig(data.registrationFee);
        } catch (err) {
            setError('Failed to load configuration.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof MlmConfig['registrationFee'], value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const totalPercentage = config.systemCut + config.upline1Cut + config.upline2Cut;
        // Allow small floating point margin or strict 1.0/100
        // Assuming backend uses 0.5 for 50%.
        if (Math.abs(totalPercentage - 1.0) > 0.01) {
            setError(`Total percentage must equal 100% (currently ${(totalPercentage * 100).toFixed(1)}%)`);
            return;
        }

        setSaving(true);
        try {
            const currentConfig = await adminService.getMlmConfig();
            await adminService.updateMlmConfig({
                ...currentConfig,
                registrationFee: config
            });
            setSuccess('Configuration updated successfully.');
        } catch (err) {
            setError('Failed to update configuration.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">MLM Registration Fee Distribution</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 max-w-xl">
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Total Registration Fee (KES)</label>
                    <input
                        type="number"
                        value={config.total}
                        onChange={(e) => handleChange('total', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-700"
                    />
                </div>

                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Commission Splits (Decimal, e.g., 0.5 = 50%)</h3>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Platform Fee (System)</label>
                    <input
                        type="number" step="0.01" max="1" min="0"
                        value={config.systemCut}
                        onChange={(e) => handleChange('systemCut', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-700"
                    />
                    <p className="text-sm text-gray-500 mt-1">{(config.systemCut * 100).toFixed(1)}%</p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Direct Referrer (Level 1)</label>
                    <input
                        type="number" step="0.01" max="1" min="0"
                        value={config.upline1Cut}
                        onChange={(e) => handleChange('upline1Cut', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-700"
                    />
                    <p className="text-sm text-gray-500 mt-1">{(config.upline1Cut * 100).toFixed(1)}%</p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Second Level Referrer (Level 2)</label>
                    <input
                        type="number" step="0.01" max="1" min="0"
                        value={config.upline2Cut}
                        onChange={(e) => handleChange('upline2Cut', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-700"
                    />
                    <p className="text-sm text-gray-500 mt-1">{(config.upline2Cut * 100).toFixed(1)}%</p>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className={`text-sm font-bold ${Math.abs((config.systemCut + config.upline1Cut + config.upline2Cut) - 1) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        Total: {((config.systemCut + config.upline1Cut + config.upline2Cut) * 100).toFixed(1)}%
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}
