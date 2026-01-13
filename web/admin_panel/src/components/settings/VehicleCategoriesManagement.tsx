import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export const VehicleCategoriesManagement: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = () => {
        adminService.getServices().then(setServices).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAddService = async () => {
        const name = prompt("Enter Service Name (e.g., 'Premium', 'Delivery'):");
        if (!name) return;
        const imageUrl = prompt("Enter Image URL (e.g., 'https://example.com/icon.png'):");
        const baseFare = Number(prompt("Enter Base Fare:"));
        const perKm = Number(prompt("Enter Per KM Rate:"));

        await adminService.createService({ name, baseFare, perKm, imageUrl: imageUrl || '' });
        // Optimistic update
        setServices([...services, { id: `new-${Date.now()}`, name, baseFare, perKm, imageUrl: imageUrl || '' }]);
    };

    if (loading) return <div>Loading services...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Services Management</h2>
                <button
                    onClick={handleAddService}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                    + Add Service
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Fare</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((c: any) => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {c.imageUrl ? (
                                        <img src={c.imageUrl} alt={c.name} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">IMG</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.baseFare}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.perKm}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No services found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
