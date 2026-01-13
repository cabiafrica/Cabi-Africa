import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.11: Heat Map Analytics ---
export const HeatMapAnalytics: React.FC = () => {
    const [points, setPoints] = useState<any[]>([]);
    const [type, setType] = useState<'DEMAND' | 'SUPPLY'>('DEMAND');
    const [serviceId, setServiceId] = useState<string>('ALL');
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        // Fetch services for filter
        adminService.getServices().then(data => {
            setServices([{ id: 'ALL', name: 'All Services' }, ...data]);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        // @ts-ignore - Ignoring potential signature mismatch until adminService is updated
        adminService.getHeatMapData(type, serviceId).then(setPoints).finally(() => setLoading(false));
    }, [type, serviceId]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Heat Map Analytics</h2>

                <div className="flex gap-4">
                    <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="border rounded-md px-3 py-1 text-sm bg-gray-50"
                    >
                        {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <div className="flex bg-gray-100 rounded p-1">
                        <button
                            onClick={() => setType('DEMAND')}
                            className={`px-4 py-1 rounded text-sm font-medium transition-colors ${type === 'DEMAND' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Demand
                        </button>
                        <button
                            onClick={() => setType('SUPPLY')}
                            className={`px-4 py-1 rounded text-sm font-medium transition-colors ${type === 'SUPPLY' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Supply
                        </button>
                    </div>
                </div>
            </div>

            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center relative overflow-hidden group">
                {loading && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 text-white font-medium">Updating Heatmap...</div>}

                {/* Map Placeholder Content */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                <div className="text-slate-500 font-mono text-xs absolute bottom-4 right-4 z-0">
                    Nairobi Region: -1.2921, 36.8219
                </div>

                {/* Heat Points */}
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full blur-xl mix-blend-screen transition-all duration-1000"
                        style={{
                            left: `${(p.lng - 36.7) * 400}%`, // Adjusted scaling for visualization
                            top: `${(p.lat + 1.2) * 400}%`,
                            width: `${p.intensity * 60}px`,
                            height: `${p.intensity * 60}px`,
                            backgroundColor: type === 'DEMAND' ? `rgba(239, 68, 68, ${p.intensity * 0.6})` : `rgba(34, 197, 94, ${p.intensity * 0.6})`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                ))}

                {points.length === 0 && !loading && (
                    <div className="text-slate-500">No data points for this selection.</div>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500 opacity-50"></span> Demand (Requests)
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500 opacity-50"></span> Supply (Drivers)
                    </div>
                </div>
                <div>
                    Showing {points.length} data points
                </div>
            </div>
        </div>
    );
};
