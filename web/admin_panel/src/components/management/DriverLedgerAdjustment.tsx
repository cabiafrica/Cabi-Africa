import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

interface DriverLedgerAdjustmentProps {
    driverId: string;
    onSuccess?: () => void;
}

export const DriverLedgerAdjustment: React.FC<DriverLedgerAdjustmentProps> = ({ driverId, onSuccess }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [type, setType] = useState('Manual Credit');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount === '' || !reason) {
            setMessage({ text: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await adminService.adjustDriverLedger({
                driverId,
                amount: Number(amount),
                type,
                reason,
            });
            setMessage({ text: 'Adjustment submitted successfully.', type: 'success' });
            setAmount('');
            setReason('');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Failed to submit adjustment.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Ledger Adjustment</h3>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="focus:ring-amber-500 focus:border-amber-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="0.00"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Positive for credit, negative for debit.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md border"
                    >
                        <option value="Manual Credit">Manual Credit</option>
                        <option value="Manual Debit">Manual Debit</option>
                        <option value="Correction">Correction</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Deduction">Deduction</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason (Mandatory)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border py-2 px-3 focus:ring-amber-500 focus:border-amber-500"
                        required
                        placeholder="Explain why this adjustment is being made..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : 'Submit Adjustment'}
                </button>
            </form>
        </div>
    );
};
