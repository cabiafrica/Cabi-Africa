'use client';

import { useState } from 'react';

// Mock Type
interface Organization {
    id: string;
    name: string;
    founderName: string;
    status: 'Pending Verification' | 'Active' | 'Rejected' | 'Expired' | 'Non-Compliant';
    certificateUrl: string;
    certificateExpirationDate?: string;
    submittedAt: string;
}

export default function OrganizationsPage() {
    const [filter, setFilter] = useState<'all' | 'expiring' | 'expired'>('all');

    // Mock Data with certificate expiration dates
    const [organizations, setOrganizations] = useState<Organization[]>([
        {
            id: 'org_1',
            name: 'Nairobi Drivers Union',
            founderName: 'John Kamau',
            status: 'Pending Verification',
            certificateUrl: 'https://example.com/cert.pdf',
            certificateExpirationDate: '2025-12-31',
            submittedAt: new Date().toISOString()
        },
        {
            id: 'org_2',
            name: 'Westlands Cab Association',
            founderName: 'Sarah Njoroge',
            status: 'Active',
            certificateUrl: 'https://example.com/cert2.pdf',
            certificateExpirationDate: '2025-12-25', // Expiring soon (9 days)
            submittedAt: '2023-01-01T10:00:00Z'
        },
        {
            id: 'org_3',
            name: 'Mombasa Transport Cooperative',
            founderName: 'Ali Hassan',
            status: 'Expired',
            certificateUrl: 'https://example.com/cert3.pdf',
            certificateExpirationDate: '2025-12-01', // Already expired
            submittedAt: '2023-06-15T10:00:00Z'
        },
        {
            id: 'org_4',
            name: 'Kisumu Drivers Alliance',
            founderName: 'Grace Ochieng',
            status: 'Active',
            certificateUrl: 'https://example.com/cert4.pdf',
            certificateExpirationDate: '2026-06-30', // Not expiring soon
            submittedAt: '2024-01-10T10:00:00Z'
        }
    ]);

    const getDaysUntilExpiry = (expirationDate?: string) => {
        if (!expirationDate) return null;
        const now = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredOrganizations = organizations.filter(org => {
        if (filter === 'all') return true;
        if (filter === 'expired') return org.status === 'Expired';
        if (filter === 'expiring') {
            const days = getDaysUntilExpiry(org.certificateExpirationDate);
            return days !== null && days <= 30 && days >= 0 && org.status === 'Active';
        }
        return true;
    });

    const handleApprove = (id: string) => {
        setOrganizations(organizations.map(org =>
            org.id === id ? { ...org, status: 'Active' as const } : org
        ));
        alert('Organization Approved!');
    };

    const handleReject = (id: string) => {
        setOrganizations(organizations.map(org =>
            org.id === id ? { ...org, status: 'Rejected' as const } : org
        ));
        alert('Organization Rejected!');
    };

    const getStatusBadgeClass = (status: Organization['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Expired': return 'bg-red-100 text-red-800';
            case 'Non-Compliant': return 'bg-orange-100 text-orange-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Driver Organizations</h1>

            {/* Filter Tabs */}
            <div className="mb-6 flex space-x-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium ${filter === 'all'
                            ? 'bg-amber-500 text-black'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All Organizations
                </button>
                <button
                    onClick={() => setFilter('expiring')}
                    className={`px-4 py-2 rounded-lg font-medium ${filter === 'expiring'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Expiring Soon (≤30 days)
                </button>
                <button
                    onClick={() => setFilter('expired')}
                    className={`px-4 py-2 rounded-lg font-medium ${filter === 'expired'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Expired
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate Expiry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrganizations.map(org => {
                            const daysUntilExpiry = getDaysUntilExpiry(org.certificateExpirationDate);
                            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                            const isExpired = org.status === 'Expired' || (daysUntilExpiry !== null && daysUntilExpiry < 0);

                            return (
                                <tr key={org.id} className={isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{org.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{org.founderName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(org.status)}`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {org.certificateExpirationDate ? (
                                            <div>
                                                <div className="text-sm text-gray-900">
                                                    {new Date(org.certificateExpirationDate).toLocaleDateString()}
                                                </div>
                                                {daysUntilExpiry !== null && (
                                                    <div className={`text-xs ${isExpired ? 'text-red-600 font-semibold' :
                                                            isExpiringSoon ? 'text-yellow-600 font-semibold' :
                                                                'text-gray-500'
                                                        }`}>
                                                        {isExpired
                                                            ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                                            : isExpiringSoon
                                                                ? `⚠️ ${daysUntilExpiry} days remaining`
                                                                : `${daysUntilExpiry} days remaining`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-amber-600 hover:underline cursor-pointer">
                                        View Certificate
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {org.status === 'Pending Verification' && (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleApprove(org.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(org.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
