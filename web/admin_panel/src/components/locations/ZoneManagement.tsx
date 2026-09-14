import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    Map,
    Flight,
    TrendingUp,
    Add,
    Edit,
    Delete,
    Layers
} from '@mui/icons-material';

interface Props {
    type: 'SURGE' | 'AIRPORT';
}

export const ZoneManagement: React.FC<Props> = ({ type }) => {
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getZones(type).then(setZones).finally(() => setLoading(false));
    }, [type]);

    const title = type === 'SURGE' ? 'Surge Zones' : 'Airport Zones';
    const description = type === 'SURGE'
        ? 'Define high-demand areas with dynamic pricing multipliers.'
        : 'Manage airport geofences and queue configurations.';
    const icon = type === 'SURGE' ? <TrendingUp className="text-blue-600 dark:text-blue-400" /> : <Flight className="text-blue-600 dark:text-blue-400" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {icon}
                        {title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                    <Add fontSize="small" />
                    Create New Zone
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder Panel */}
                <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-center items-center h-96 relative overflow-hidden group">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500"
                        style={{
                            backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=-1.2921,36.8219&zoom=13&size=800x600&sensor=false&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA_ybfC1sxL4K92fKiuIsfHLkFK7sWl9-0'}')`
                        }}
                    ></div>
                    <div className="z-10 bg-white dark:bg-slate-900 px-6 py-4 rounded-lg shadow-lg text-center">
                        <Map className="text-slate-400 text-4xl mb-2 mx-auto" />
                        <h3 className="text-slate-900 dark:text-white font-semibold">Interactive Map Viewer</h3>
                        <p className="text-xs text-slate-500 max-w-xs mt-1">
                            Use the drawing tools to define polygon boundaries for {type.toLowerCase()} zones.
                        </p>
                    </div>
                </div>

                {/* List Panel */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-96">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Defined Zones</h3>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading zones...</div>
                        ) : zones.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No zones defined.</div>
                        ) : zones.map((z: any) => (
                            <div key={z.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Layers fontSize="small" className="text-slate-400 group-hover:text-blue-500" />
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{z.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {z.id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-600"><Edit style={{ fontSize: 16 }} /></button>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-600"><Delete style={{ fontSize: 16 }} /></button>
                                    </div>
                                </div>
                                {type === 'SURGE' && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Multiplier</span>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {z.multiplier}x
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
