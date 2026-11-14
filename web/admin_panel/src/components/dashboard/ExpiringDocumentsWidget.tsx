import React, { useState, useEffect } from 'react';
import { adminService, ExpiringDocumentResult } from '../../services/adminService';

export const ExpiringDocumentsWidget: React.FC = () => {
    const [docs, setDocs] = useState<ExpiringDocumentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getExpiringDocuments().then(setDocs).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-48 flex items-center justify-center">Loading widget...</div>;

    if (docs.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-bold text-lg">⚠️</span>
                    <h3 className="text-lg font-bold text-orange-900">Expiring Documents</h3>
                </div>
                <span className="bg-white text-orange-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm">
                    {docs.length} Requires Action
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {docs.map((doc, idx) => (
                    <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">{doc.driverName}</p>
                            <p className="text-xs text-gray-500">ID: {doc.driverId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{doc.docType}</p>
                            <p className="text-xs text-red-600 font-medium">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 px-6 py-2 text-center">
                <button className="text-xs text-amber-600 hover:text-amber-800 font-medium hover:underline">
                    View All Expiring Documents &rarr;
                </button>
            </div>
        </div>
    );
};
