import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.11: Heat Map Analytics ---
export const HeatMapAnalytics: React.FC = () => {
    const [points, setPoints] = useState<any[]>([]);
    const [type, setType] = useState<'DEMAND' | 'SUPPLY'>('DEMAND');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        adminService.getHeatMapData(type).then(setPoints).finally(() => setLoading(false));
    }, [type]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Heat Map Analytics</h2>
                <div className="flex bg-gray-100 rounded p-1">
                    <button
                        onClick={() => setType('DEMAND')}
                        className={`px-4 py-1 rounded ${type === 'DEMAND' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                    >
                        Demand (Requests)
                    </button>
                    <button
                        onClick={() => setType('SUPPLY')}
                        className={`px-4 py-1 rounded ${type === 'SUPPLY' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
                    >
                        Supply (Drivers)
                    </button>
                </div>
            </div>

            <div className="aspect-video bg-slate-100 rounded border-2 border-slate-200 flex items-center justify-center relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">Loading...</div>}

                {/* Visual Simulation of a Map */}
                <div className="text-slate-400 font-mono text-sm">
                    [ Interactive Map Component ]
                </div>

                {/* Visualizing "Heat" points roughly */}
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full blur-xl opacity-50"
                        style={{
                            left: `${(p.lng - 36.8) * 1000}%`, // Rough adjustment for mock coords
                            top: `${(p.lat + 1.3) * 1000}%`,
                            width: '40px',
                            height: '40px',
                            backgroundColor: type === 'DEMAND' ? `rgba(255, 0, 0, ${p.intensity})` : `rgba(0, 255, 0, ${p.intensity})`
                        }}
                    />
                ))}
            </div>

            <div className="mt-4 text-sm text-gray-500 text-center">
                Visualizing data for Nairobi Region. Warmer colors indicate higher intensity.
            </div>
        </div>
    );
};
