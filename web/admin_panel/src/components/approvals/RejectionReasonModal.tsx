import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
}

export const RejectionReasonModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title = "Reject Document" }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <textarea
                    className="w-full border rounded p-2 mb-4 h-32 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    placeholder="Enter reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};
