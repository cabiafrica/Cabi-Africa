import React, { useState, useEffect } from 'react';

interface PendingPayout {
  driverId: string;
  driverName: string;
  pendingBalance: number;
  payoutMethod: string; // e.g., "M-Pesa: +254..."
}

export const PayoutProcessing: React.FC = () => {
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Mock API fetch
    setPendingPayouts([
      { driverId: 'd1', driverName: 'John Doe', pendingBalance: 4500, payoutMethod: 'M-Pesa: +254712...' },
      { driverId: 'd2', driverName: 'Jane Smith', pendingBalance: 12000, payoutMethod: 'Bank: Equity...' },
      { driverId: 'd3', driverName: 'Peter Jones', pendingBalance: 850, payoutMethod: 'M-Pesa: +254789...' },
    ]);
  }, []);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedDriverIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedDriverIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedDriverIds.size === pendingPayouts.length) {
      setSelectedDriverIds(new Set());
    } else {
      setSelectedDriverIds(new Set(pendingPayouts.map(p => p.driverId)));
    }
  };

  const handleProcess = async () => {
    if (selectedDriverIds.size === 0) return;

    const totalAmount = pendingPayouts
      .filter(p => selectedDriverIds.has(p.driverId))
      .reduce((sum, p) => sum + p.pendingBalance, 0);

    if (!window.confirm(`Process payouts for ${selectedDriverIds.size} drivers totaling KES ${totalAmount}?`)) {
      return;
    }

    setIsProcessing(true);
    console.log('Processing payouts for:', Array.from(selectedDriverIds));
    
    // Simulate API call: POST /admin/payouts/process
    setTimeout(() => {
      setPendingPayouts(prev => prev.filter(p => !selectedDriverIds.has(p.driverId)));
      setSelectedDriverIds(new Set());
      setIsProcessing(false);
      alert('Payouts initiated successfully.');
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payout Processing</h1>
        <button
          onClick={handleProcess}
          disabled={selectedDriverIds.size === 0 || isProcessing}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : `Process Selected (${selectedDriverIds.size})`}
        </button>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedDriverIds.size === pendingPayouts.length && pendingPayouts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingPayouts.map((payout) => (
              <tr key={payout.driverId} className={selectedDriverIds.has(payout.driverId) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedDriverIds.has(payout.driverId)}
                    onChange={() => toggleSelection(payout.driverId)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{payout.driverName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{payout.payoutMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                  KES {payout.pendingBalance.toLocaleString()}
                </td>
              </tr>
            ))}
            {pendingPayouts.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No pending payouts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};