import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
    LocalTaxi,
    Add,
    Edit,
    Image,
    AttachMoney,
    DirectionsCar
} from '@mui/icons-material';

export const VehicleCategoriesManagement: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = () => {
        setLoading(true);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LocalTaxi className="text-blue-600 dark:text-blue-400" />
                        Services Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure vehicle types and base pricing models.</p>
                </div>
                <button
                    onClick={handleAddService}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Add fontSize="small" />
                    Add Service
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Vehicle Categories</h3>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {services.length} Active
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Fare</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Per KM</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading services...</td></tr>
                            ) : services.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No services found.</td></tr>
                            ) : services.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {c.imageUrl ? (
                                            <img src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-600">
                                                <Image fontSize="small" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono">
                                        KES {c.baseFare}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono">
                                        KES {c.perKm}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Edit fontSize="small" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
