import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// --- Story 79.21: Admin Manage Driver Unions ---
export const DriverUnionManagement: React.FC = () => {
    const [unions, setUnions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getDriverUnions().then(setUnions).finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading Unions...</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Driver Organizations & Unions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {unions.map((u: any) => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.founder}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.members}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-amber-600 hover:text-amber-900 mr-2">Manage</button>
                                    {u.status === 'PENDING' && <button className="text-green-600 hover:text-green-900">Approve</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
