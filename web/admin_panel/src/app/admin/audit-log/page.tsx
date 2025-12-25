import React from 'react';
import { AuditLogViewer } from '../../../../components/viewers/AuditLogViewer';

export default function AuditLogPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">System Audit Log</h1>
            <p className="mb-4 text-gray-600">
                View a raw stream of important system events for debugging and auditing.
            </p>
            <AuditLogViewer />
        </div>
    );
}
