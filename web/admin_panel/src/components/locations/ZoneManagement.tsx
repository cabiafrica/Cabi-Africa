import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../common/PageHeader';
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
    const icon = type === 'SURGE' ? <TrendingUp className="w-5 h-5 text-amber-500" /> : <Flight className="w-5 h-5 text-amber-500" />;

    return (
        <div className="space-y-6">
            <PageHeader
                category="Growth & Platform"
                title={title}
                subtitle={description}
                icon={icon}
                action={
                    <button className="btn-primary flex items-center gap-1.5">
                        <Add fontSize="small" />
                        <span>Create New Zone</span>
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder Panel */}
                <div className="lg:col-span-2 bg-[#131722] rounded-[3px] border border-dashed border-white/10 flex flex-col justify-center items-center h-96 relative overflow-hidden group">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500"
                        style={{
                            backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=-1.2921,36.8219&zoom=13&size=800x600&sensor=false&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA_ybfC1sxL4K92fKiuIsfHLkFK7sWl9-0'}')`
                        }}
                    ></div>
                    <div className="z-10 bg-[#0a0a0a] border border-white/10 px-6 py-4 rounded-[3px] shadow-lg text-center">
                        <Map className="text-gray-400 text-4xl mb-2 mx-auto" />
                        <h3 className="text-white font-semibold text-sm">Interactive Map Viewer</h3>
                        <p className="text-xs text-gray-400 max-w-xs mt-1">
                            Use the drawing tools to define polygon boundaries for {type.toLowerCase()} zones.
                        </p>
                    </div>
                </div>

                {/* List Panel */}
                <div className="bg-[#131722] shadow-sm rounded-[3px] border border-white/10 overflow-hidden flex flex-col h-96">
                    <div className="px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                        <h3 className="font-semibold text-white text-xs">Defined Zones</h3>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400 text-xs">Loading zones...</div>
                        ) : zones.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-xs">No zones defined.</div>
                        ) : zones.map((z: any) => (
                            <div key={z.id} className="bg-[#0a0a0a] p-3 rounded-[3px] border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Layers fontSize="small" className="text-gray-400 group-hover:text-amber-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-white">{z.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono">ID: {z.id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-white/10 rounded-[3px] text-gray-400 hover:text-amber-400"><Edit style={{ fontSize: 14 }} /></button>
                                        <button className="p-1 hover:bg-white/10 rounded-[3px] text-gray-400 hover:text-red-400"><Delete style={{ fontSize: 14 }} /></button>
                                    </div>
                                </div>
                                {type === 'SURGE' && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[11px] text-gray-400">Multiplier</span>
                                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-[3px]">
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
