import React, { useState, useEffect } from 'react';
import { adminService, Organization } from '../../services/adminService';
import { SubgroupManagement } from './SubgroupManagement';
import { OrganizationAuditLog } from './OrganizationAuditLog';
import { OrganizationAnalytics } from './OrganizationAnalytics';
import {
    Business,
    People,
    AssignmentInd,
    ArrowBack,
    Edit,
    Search,
    CorporateFare,
    Groups
} from '@mui/icons-material';

export const OrganizationManagement: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'subgroups' | 'audit'>('subgroups');
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.ownerId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedOrgId) {
        const selectedOrg = organizations.find(o => o.id === selectedOrgId);

        return (
            <div className="space-y-6">
                {/* Detail Header */}
                <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedOrgId(null)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <ArrowBack />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Business className="text-blue-600 dark:text-blue-400" />
                                {selectedOrg?.name || 'Organization Details'}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                ID: {selectedOrgId} • Type: {selectedOrg?.type || 'Group'}
                            </p>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('subgroups')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'subgroups'
                                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Subgroups
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'audit'
                                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Audit Log
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    {activeTab === 'subgroups' ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <SubgroupManagement orgId={selectedOrgId} onBack={() => { /* No-op */ }} />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <OrganizationAuditLog orgId={selectedOrgId} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <OrganizationAnalytics />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CorporateFare className="text-blue-600 dark:text-blue-400" />
                    Organizations
                </h2>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">All Organizations</h3>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {filteredOrgs.length} Total
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Members</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>

                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading organizations...</td></tr>
                            ) : filteredOrgs.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No organizations found matching your search.</td></tr>
                            ) : filteredOrgs.map(org => (
                                <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-3">
                                                <Business fontSize="small" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{org.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                            <People fontSize="small" className="mr-1.5 opacity-70" />
                                            {org.memberCount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                            {org.type || 'GROUP'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                            <AssignmentInd fontSize="small" className="mr-1.5 opacity-70" />
                                            <span className="font-mono text-xs">{org.ownerId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${org.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                org.status === 'HOLD' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                            }`}>
                                            {org.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3 items-center">
                                            <button
                                                onClick={() => setSelectedOrgId(org.id)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                            >
                                                Manage
                                            </button>
                                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                                            <select
                                                value={org.status || 'ACTIVE'}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value as any;
                                                    await adminService.updateOrganizationStatus(org.id, newStatus);
                                                    setOrganizations(orgs => orgs.map(o => o.id === org.id ? { ...o, status: newStatus } : o));
                                                }}
                                                className="text-xs border-none bg-transparent focus:ring-0 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                                            >
                                                <option value="ACTIVE">Set Active</option>
                                                <option value="HOLD">Set Hold</option>
                                                <option value="TEMP_HOLD">Set Temp Hold</option>
                                                <option value="PENDING">Set Pending</option>
                                            </select>
                                        </div>
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
