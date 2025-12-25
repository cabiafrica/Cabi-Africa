import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

interface Props {
    type: 'SURGE' | 'AIRPORT';
}

export const ZoneManagement: React.FC<Props> = ({ type }) => {
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getZones(type).then(setZones).finally(() => setLoading(false));
    }, [type]);

    if (loading) return <div>Loading zones...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{type === 'SURGE' ? 'Surge Zones' : 'Airport Zones'}</h2>
            <div className="mb-4 p-4 bg-gray-100 rounded text-center text-gray-500">
                [Map Component Placeholder - GeoJSON Viewer/Editor]
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            {type === 'SURGE' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Multiplier</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {zones.map((z: any) => (
                            <tr key={z.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{z.name}</td>
                                {type === 'SURGE' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{z.multiplier}x</td>}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
