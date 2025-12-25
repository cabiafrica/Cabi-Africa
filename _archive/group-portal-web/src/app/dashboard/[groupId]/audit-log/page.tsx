'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AuditLogEntry {
    id: string;
    performedByName: string;
    action: string;
    targetName?: string;
    details?: string;
    timestamp: string;
}

export default function AuditLogPage({ params }: { params: { groupId: string } }) {
    const groupId = params.groupId;

    // Mock audit log data
    const [auditLogs] = useState<AuditLogEntry[]>([
        {
            id: 'audit_1',
            performedByName: 'John Kamau',
            action: 'APPROVE_JOIN_REQUEST',
            targetName: 'Sarah Mwangi',
            details: 'Join request approved',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'audit_2',
            performedByName: 'Jane Doe',
            action: 'POST_ANNOUNCEMENT',
            targetName: 'Weekly Meeting Reminder',
            details: 'Posted announcement: "Weekly Meeting Reminder"',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'audit_3',
            performedByName: 'John Kamau',
            action: 'APPOINT_LEADER',
            targetName: 'Michael Ochieng',
            details: 'Appointed as leadership team member',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'audit_4',
            performedByName: 'Jane Doe',
            action: 'CREATE_ACTIVITY',
            targetName: 'Safety Training Workshop',
            details: 'Created new activity',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'audit_5',
            performedByName: 'John Kamau',
            action: 'REMOVE_MEMBER',
            targetName: 'Peter Njoroge',
            details: 'Member removed from organization - Inactive',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'audit_6',
            performedByName: 'John Kamau',
            action: 'UPLOAD_CERTIFICATE',
            details: 'Uploaded new organization certificate',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]);

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'APPROVE_JOIN_REQUEST': 'Approved Join Request',
            'REJECT_JOIN_REQUEST': 'Rejected Join Request',
            'REMOVE_MEMBER': 'Removed Member',
            'POST_ANNOUNCEMENT': 'Posted Announcement',
            'CREATE_ACTIVITY': 'Created Activity',
            'EDIT_ACTIVITY': 'Edited Activity',
            'APPOINT_LEADER': 'Appointed Leader',
            'REMOVE_LEADER': 'Removed Leader',
            'UPLOAD_CERTIFICATE': 'Uploaded Certificate',
            'REQUEST_DISSOLUTION': 'Requested Dissolution',
            'REQUEST_FOUNDER_TRANSFER': 'Requested Founder Transfer'
        };
        return labels[action] || action;
    };

    const getActionIcon = (action: string) => {
        if (action.includes('APPROVE') || action.includes('APPOINT')) return '✅';
        if (action.includes('REJECT') || action.includes('REMOVE')) return '❌';
        if (action.includes('POST') || action.includes('CREATE')) return '📝';
        if (action.includes('EDIT')) return '✏️';
        if (action.includes('UPLOAD')) return '📄';
        if (action.includes('DISSOLUTION') || action.includes('TRANSFER')) return '⚠️';
        return '📋';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Group Portal</h1>
                </div>
                <nav className="mt-6 px-6 space-y-2">
                    <Link href={`/dashboard/${groupId}`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Overview
                    </Link>
                    <Link href={`/dashboard/${groupId}/management`} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                        Leadership Management
                    </Link>
                    <Link href={`/dashboard/${groupId}/audit-log`} className="block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                        Audit Log
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Organization Audit Log</h2>
                            <p className="text-gray-600 mt-2">
                                Complete history of all administrative actions performed by leadership team members
                            </p>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>ℹ️ Transparency & Accountability:</strong> This log provides a complete, read-only record of all significant actions taken by your organization's leadership team.
                            </p>
                        </div>

                        {/* Audit Log Entries */}
                        <div className="space-y-4">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <span className="text-2xl">{getActionIcon(log.action)}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-gray-900">{log.performedByName}</span>
                                                    <span className="text-gray-500">•</span>
                                                    <span className="text-gray-700">{getActionLabel(log.action)}</span>
                                                </div>
                                                {log.targetName && (
                                                    <div className="mt-1 text-sm text-gray-600">
                                                        Target: <span className="font-medium">{log.targetName}</span>
                                                    </div>
                                                )}
                                                {log.details && (
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        {log.details}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {auditLogs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-4">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Yet</h3>
                                <p className="text-gray-500">
                                    Leadership actions will appear here once they start managing the organization.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
