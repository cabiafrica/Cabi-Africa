import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { CabiMap, MapMarker } from '../CabiMap';

// --- Story 79.8: Live Map (God View) ---
export const LiveMap: React.FC = () => {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [markers, setMarkers] = useState<MapMarker[]>([]);

    useEffect(() => {
        // Poll every 5 seconds
        const fetchDrivers = () => adminService.getLiveDrivers().then(data => {
            setDrivers(data);
            // Convert to MapMarkers
            const newMarkers: MapMarker[] = data.map((d: any) => ({
                id: d.id,
                position: [d.lat, d.lng],
                type: 'driver', // Can distinguish available/ontrip via icon color if supported by CabiMap or custom logic
                popup: `Driver: ${d.id}<br/>Status: ${d.status}`
            }));
            setMarkers(newMarkers);
        });

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

            <div className="flex-1 border rounded relative overflow-hidden z-0">
                <CabiMap
                    markers={markers}
                    center={[-1.2921, 36.8219]} // Nairobi
                    zoom={12}
                    height="100%"
                />
            </div>

            <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-600"></div> On Trip</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Offline</div>
            </div>
        </div>
    );
};
