import React, { useState, useEffect } from 'react';

interface PayoutRecord {
  driverId: string;
  driverName: string;
  phoneNumber: string;
  amount: number;
  method: 'MPESA' | 'BANK';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
}

export const PayoutProcessingDashboard: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Mock Data Fetching
    setPayouts([]);
  }, []);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingPayouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingPayouts.map(p => p.driverId)));
    }
  };

  const handleProcessPayouts = async () => {
    if (selectedIds.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to process ${selectedIds.size} payouts?`)) return;

    setIsProcessing(true);

    // Simulate API call
    // await api.post('/admin/payouts/process', { driverIds: Array.from(selectedIds) });
    
    setTimeout(() => {
      setPayouts(prev => prev.map(p => 
        selectedIds.has(p.driverId) ? { ...p, status: 'PAID' } : p
      ));
      setSelectedIds(new Set());
      setIsProcessing(false);
      alert('Payouts processed successfully.');
    }, 2000);
  };

  const pendingPayouts = payouts.filter(p => p.status === 'PENDING');
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
  const selectedAmount = payouts.filter(p => selectedIds.has(p.driverId)).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Payout Processing</h1>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Pending</div>
          <div className="text-xl font-bold text-gray-900">KES {totalPendingAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold">Pending Payouts</h2>
          <button
            onClick={handleProcessPayouts}
            disabled={selectedIds.size === 0 || isProcessing}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {isProcessing ? 'Processing...' : `Pay Selected (KES ${selectedAmount.toLocaleString()})`}
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={pendingPayouts.length > 0 && selectedIds.size === pendingPayouts.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (KES)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payouts.map((p) => (
              <tr key={p.driverId} className={p.status !== 'PENDING' ? 'bg-gray-50 opacity-60' : ''}>
                <td className="px-6 py-4">
                  {p.status === 'PENDING' && (
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(p.driverId)}
                      onChange={() => toggleSelection(p.driverId)}
                    />
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{p.driverName}<br/><span className="text-xs text-gray-500">{p.phoneNumber}</span></td>
                <td className="px-6 py-4 text-sm">{p.method}</td>
                <td className="px-6 py-4 font-bold">{p.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};