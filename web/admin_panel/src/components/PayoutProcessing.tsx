import React, { useState, useEffect } from 'react';
import {
  Payments,
  PlayArrow,
  CheckCircle,
  AttachMoney,
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  Warning
} from '@mui/icons-material';

interface PendingPayout {
  driverId: string;
  driverName: string;
  pendingBalance: number;
  payoutMethod: string;
}

export const PayoutProcessing: React.FC = () => {
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API fetch
    setTimeout(() => {
      setPendingPayouts([
        { driverId: 'd1', driverName: 'John Doe', pendingBalance: 4500, payoutMethod: 'M-Pesa: +254712...' },
        { driverId: 'd2', driverName: 'Jane Smith', pendingBalance: 12000, payoutMethod: 'Bank: Equity...' },
        { driverId: 'd3', driverName: 'Peter Jones', pendingBalance: 850, payoutMethod: 'M-Pesa: +254789...' },
        { driverId: 'd4', driverName: 'Sarah Connor', pendingBalance: 3200, payoutMethod: 'M-Pesa: +254700...' },
      ]);
      setLoading(false);
    }, 800);
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

    if (!window.confirm(`Process payouts for ${selectedDriverIds.size} drivers totaling KES ${totalAmount.toLocaleString()}?`)) {
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setPendingPayouts(prev => prev.filter(p => !selectedDriverIds.has(p.driverId)));
      setSelectedDriverIds(new Set());
      setIsProcessing(false);
    }, 1500);
  };

  const getMethodIcon = (method: string) => {
    if (method.includes('M-Pesa')) return <PhoneAndroid fontSize="small" className="text-green-600" />;
    if (method.includes('Bank')) return <AccountBalance fontSize="small" className="text-blue-600" />;
    return <CreditCard fontSize="small" className="text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Payments className="text-blue-600 dark:text-blue-400" />
            Payout Processing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve driver withdrawals manually.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleProcess}
            disabled={selectedDriverIds.size === 0 || isProcessing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all ${selectedDriverIds.size > 0 && !isProcessing
                ? 'bg-green-600 hover:bg-green-700 text-white transform active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlayArrow fontSize="small" />
                Process Selected ({selectedDriverIds.size})
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Total Summary Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Pending:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              KES {pendingPayouts.reduce((acc, curr) => acc + curr.pendingBalance, 0).toLocaleString()}
            </span>
          </div>
          {selectedDriverIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Selected Total:</span>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                KES {pendingPayouts.filter(p => selectedDriverIds.has(p.driverId)).reduce((acc, curr) => acc + curr.pendingBalance, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedDriverIds.size === pendingPayouts.length && pendingPayouts.length > 0}
                    onChange={toggleSelectAll}
                    disabled={loading || pendingPayouts.length === 0}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination Method</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Loading payout queue...</td></tr>
              ) : pendingPayouts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                    <CheckCircle fontSize="large" className="text-green-500 mb-2" />
                    All caught up! No pending payouts.
                  </td>
                </tr>
              ) : pendingPayouts.map((payout) => (
                <tr
                  key={payout.driverId}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${selectedDriverIds.has(payout.driverId) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  onClick={() => toggleSelection(payout.driverId)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedDriverIds.has(payout.driverId)}
                      onChange={() => toggleSelection(payout.driverId)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                    {payout.driverName}
                    <div className="text-xs text-slate-500 font-mono mt-0.5 opacity-70">ID: {payout.driverId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded w-fit text-sm">
                      {getMethodIcon(payout.payoutMethod)}
                      {payout.payoutMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900 dark:text-slate-100 text-lg">
                    KES {payout.pendingBalance.toLocaleString()}
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