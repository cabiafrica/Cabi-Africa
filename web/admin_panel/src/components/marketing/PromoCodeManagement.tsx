import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const PromoCodeManagement: React.FC = () => {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getPromoCodes().then(setPromos).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading promo codes...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Promo Codes</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {promos.map((p: any) => (
                            <tr key={p.code}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.value}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.uses}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
