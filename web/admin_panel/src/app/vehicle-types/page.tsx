'use client';

import { useState } from 'react';

interface VehicleType {
    id: string;
    name: string;
    description: string;
    baseFare: number;
    perMile: number;
    perMinute: number;
    minFare: number;
    capacity: number;
    icon: string;
    isActive: boolean;
}

export default function VehicleTypesPage() {
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([
        {
            id: '1',
            name: 'Standard',
            description: 'Affordable everyday rides',
            baseFare: 2.50,
            perMile: 1.10,
            perMinute: 0.20,
            minFare: 7.00,
            capacity: 4,
            icon: '🚗',
            isActive: true,
        },
        {
            id: '2',
            name: 'XL',
            description: 'Larger vehicles for up to 6 passengers',
            baseFare: 4.50,
            perMile: 1.80,
            perMinute: 0.35,
            minFare: 12.00,
            capacity: 6,
            icon: '🚙',
            isActive: true,
        },
        {
            id: '3',
            name: 'Comfort',
            description: 'Newer cars with extra legroom',
            baseFare: 3.50,
            perMile: 1.40,
            perMinute: 0.30,
            minFare: 10.00,
            capacity: 4,
            icon: '✨',
            isActive: true,
        },
        {
            id: '4',
            name: 'Green',
            description: 'Electric and hybrid vehicles',
            baseFare: 2.50,
            perMile: 1.10,
            perMinute: 0.20,
            minFare: 7.00,
            capacity: 4,
            icon: '🌱',
            isActive: true,
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<VehicleType | null>(null);

    const handleEdit = (type: VehicleType) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(false);
        // In a real app, this would call an API
        alert('Vehicle type saved!');
    };

    const toggleStatus = (id: string) => {
        setVehicleTypes(vehicleTypes.map(type =>
            type.id === id ? { ...type, isActive: !type.isActive } : type
        ));
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vehicle Classes</h1>
                        <p className="text-gray-600 mt-2">Manage ride types and pricing configurations</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center px-6 py-3 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-bold"
                    >
                        <span className="mr-2">＋</span> Add New Class
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicleTypes.map((type) => (
                        <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition hover:shadow-md hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                                        {type.icon}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="text-gray-400 hover:text-amber-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {type.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-6">{type.description}</p>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Base Fare</span>
                                        <span className="font-medium text-gray-900">${type.baseFare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Per Mile</span>
                                        <span className="font-medium text-gray-900">${type.perMile.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Per Minute</span>
                                        <span className="font-medium text-gray-900">${type.perMinute.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-gray-100 pt-3 mt-3">
                                        <span className="text-gray-500">Min Fare</span>
                                        <span className="font-bold text-gray-900">${type.minFare.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Max {type.capacity} passengers
                                </div>
                                <button
                                    onClick={() => toggleStatus(type.id)}
                                    className={`text-sm font-medium ${type.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                >
                                    {type.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Modal (Simplified) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingType ? `Edit ${editingType.name}` : 'New Vehicle Class'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                    <input type="text" defaultValue={editingType?.name} className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea defaultValue={editingType?.description} className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm" rows={3}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare ($)</label>
                                        <input type="number" step="0.01" defaultValue={editingType?.baseFare} className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Mile ($)</label>
                                        <input type="number" step="0.01" defaultValue={editingType?.perMile} className="w-full px-4 py-3 sm:py-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm" />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 font-bold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
