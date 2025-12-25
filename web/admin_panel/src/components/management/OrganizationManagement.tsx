import React, { useState, useEffect } from 'react';
import { adminService, Organization } from '../../services/adminService';
import { SubgroupManagement } from './SubgroupManagement';
import { OrganizationAuditLog } from './OrganizationAuditLog';

export const OrganizationManagement: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'subgroups' | 'audit'>('subgroups');

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await adminService.getOrganizations();
                setOrganizations(data);
            } catch (err) {
                console.error("Failed to fetch organizations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    if (selectedOrgId) {
        return (
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="bg-white shadow rounded-lg px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedOrgId(null)}
                            className="text-gray-500 hover:text-gray-900 font-medium"
                        >
                            &larr; Back
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">
                            {organizations.find(o => o.id === selectedOrgId)?.name || 'Organization Details'}
                        </h2>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('subgroups')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'subgroups' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Subgroups
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Audit Log
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    {activeTab === 'subgroups' ? (
                        <SubgroupManagement orgId={selectedOrgId} onBack={() => { }} />
                    ) : (
                        <OrganizationAuditLog orgId={selectedOrgId} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Organization Management</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner ID</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : organizations.map(org => (
                            <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{org.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.memberCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-mono">{org.ownerId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedOrgId(org.id)}
                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
