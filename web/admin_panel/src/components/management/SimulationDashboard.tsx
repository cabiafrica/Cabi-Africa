import React, { useState } from 'react';
import { adminService, SimulationResult } from '../../services/adminService';

export const SimulationDashboard: React.FC = () => {
    const [fareIncrease, setFareIncrease] = useState(0);
    const [surgeCap, setSurgeCap] = useState(2.0);
    const [incentiveBoost, setIncentiveBoost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleRun = async () => {
        setLoading(true);
        try {
            const data = await adminService.runSimulation({
                fareIncreasePercentage: fareIncrease,
                surgeCapMultiplier: surgeCap,
                incentiveBoostPercentage: incentiveBoost
            });
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Simulation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Marketplace Simulation Mode</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Fare Increase (%)</label>
                    <input
                        type="number"
                        value={fareIncrease}
                        onChange={(e) => setFareIncrease(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Surge Cap Multiplier (x)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={surgeCap}
                        onChange={(e) => setSurgeCap(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incentive Boost (%)</label>
                    <input
                        type="number"
                        value={incentiveBoost}
                        onChange={(e) => setIncentiveBoost(Number(e.target.value))}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <div className="flex justify-end mb-8">
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Running Simulation...' : 'Run Simulation'}
                </button>
            </div>

            {result && (
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Projected Impact (Next 30 Days)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 p-4 rounded border border-green-100">
                            <span className="block text-sm text-green-800 font-medium">Projected Revenue</span>
                            <span className="text-2xl font-bold text-green-900">${result.projectedRevenue.toLocaleString()}</span>
                            <span className={`text-xs ml-2 ${result.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.revenueChange >= 0 ? '+' : ''}{result.revenueChange}%
                            </span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded border border-blue-100">
                            <span className="block text-sm text-blue-800 font-medium">Driver Earnings</span>
                            <span className="text-2xl font-bold text-blue-900">${result.projectedDriverEarnings.toLocaleString()}</span>
                            <span className={`text-xs ml-2 ${result.driverEarningsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.driverEarningsChange >= 0 ? '+' : ''}{result.driverEarningsChange}%
                            </span>
                        </div>
                        <div className="bg-purple-50 p-4 rounded border border-purple-100">
                            <span className="block text-sm text-purple-800 font-medium">Passenger Demand</span>
                            <span className="text-2xl font-bold text-purple-900">{result.projectedRides.toLocaleString()} Rides</span>
                            <span className={`text-xs ml-2 ${result.demandChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.demandChange >= 0 ? '+' : ''}{result.demandChange}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
