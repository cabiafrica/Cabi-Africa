import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const VehicleCategoriesManagement: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getVehicleCategories().then(setCategories).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading vehicle categories...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Vehicle Categories</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Fare</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((c: any) => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.baseFare}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.perKm}</td>
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
