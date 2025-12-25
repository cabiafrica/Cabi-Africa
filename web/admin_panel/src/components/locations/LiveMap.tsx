import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.8: Live Map (God View) ---
export const LiveMap: React.FC = () => {
    const [drivers, setDrivers] = useState<any[]>([]);

    useEffect(() => {
        // Poll every 5 seconds
        const fetchDrivers = () => adminService.getLiveDrivers().then(setDrivers);
        fetchDrivers();
        const interval = setInterval(fetchDrivers, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white shadow rounded-lg p-6 h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex justify-between">
                <span>Live Operations Map</span>
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {drivers.filter(d => d.status === 'AVAILABLE').length} Available • {drivers.filter(d => d.status === 'ON_TRIP').length} On Trip
                </span>
            </h2>

            <div className="flex-1 bg-slate-200 border rounded relative overflow-hidden">
                {/* Visual placeholder for MapBox / Google Maps */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-lg select-none pointer-events-none">
                    [ LIVE MAP VIEW ]
                </div>

                {/* Simulate Driver Icons moving */}
                {drivers.map((d: any) => (
                    <div
                        key={d.id}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-[5000ms] linear
                            ${d.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{
                            left: `${(d.lng - 36.8) * 1200 + 50}%`, // Fake projection
                            top: `${(d.lat + 1.29) * 1200 + 50}%`
                        }}
                        title={`Driver ${d.id}`}
                    />
                ))}
            </div>

            <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-600"></div> On Trip</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Offline</div>
            </div>
        </div>
    );
};
