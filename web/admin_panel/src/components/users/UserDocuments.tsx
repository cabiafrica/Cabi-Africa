import React, { useState, useEffect } from 'react';
import { adminService, UserDocument } from '../../services/adminService';

interface Props {
    userId: string;
}

export const UserDocuments: React.FC<Props> = ({ userId }) => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getUserDocuments(userId).then(setDocuments).finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div>Loading documents...</div>;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Documents</h3>
            </div>
            <div className="divide-y divide-gray-200">
                {documents.map(doc => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-50 p-2 rounded text-amber-600">📄</div>
                            <div>
                                <p className="font-medium text-gray-900">{doc.type}</p>
                                <p className="text-sm text-gray-500">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {doc.status}
                            </span>
                            <a href={doc.url} className="text-amber-600 text-sm hover:underline">View</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
