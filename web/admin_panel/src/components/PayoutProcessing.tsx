import React, { useState, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
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
      setPendingPayouts([]);
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
    if (method.includes('Bank')) return <AccountBalance fontSize="small" className="text-amber-600" />;
    return <CreditCard fontSize="small" className="text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Finance & Sacco"
        title="Driver Payout Processing"
        subtitle="Review, audit, and approve manual and batch driver withdrawal settlements"
        icon={<Payments className="w-5 h-5 text-amber-500" />}
        action={
          <button
            onClick={handleProcess}
            disabled={selectedDriverIds.size === 0 || isProcessing}
            className={`btn-primary flex items-center gap-1.5 ${
              selectedDriverIds.size === 0 || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PlayArrow fontSize="small" />
                <span>Process Selected ({selectedDriverIds.size})</span>
              </>
            )}
          </button>
        }
      />

      <div className="bg-[#131722] shadow-sm rounded-[3px] border border-white/10 overflow-hidden">

        {/* Total Summary Bar */}
        <div className="px-5 py-3.5 bg-[#0a0a0a] border-b border-white/10 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-400">Total Pending:</span>
            <span className="text-sm font-bold text-white">
              KES {pendingPayouts.reduce((acc, curr) => acc + curr.pendingBalance, 0).toLocaleString()}
            </span>
          </div>
          {selectedDriverIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="font-semibold text-amber-500">Selected Total:</span>
              <span className="text-sm font-bold text-amber-400">
                KES {pendingPayouts.filter(p => selectedDriverIds.has(p.driverId)).reduce((acc, curr) => acc + curr.pendingBalance, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-5 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all pending payouts"
                    checked={selectedDriverIds.size === pendingPayouts.length && pendingPayouts.length > 0}
                    onChange={toggleSelectAll}
                    disabled={loading || pendingPayouts.length === 0}
                    className="rounded-[3px] border-white/20 text-amber-500 focus:ring-amber-500/50 bg-[#0a0a0a] cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Destination Method</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pending Balance</th>
              </tr>
            </thead>
            <tbody className="bg-[#131722] divide-y divide-white/5 text-xs">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">Loading payout queue...</td></tr>
              ) : pendingPayouts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle fontSize="large" className="text-emerald-500 mb-2" />
                      All caught up! No pending payouts.
                    </div>
                  </td>
                </tr>
              ) : pendingPayouts.map((payout) => (
                <tr
                  key={payout.driverId}
                  className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedDriverIds.has(payout.driverId) ? 'bg-amber-500/10' : ''}`}
                  onClick={() => toggleSelection(payout.driverId)}
                >
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select payout for ${payout.driverName}`}
                      checked={selectedDriverIds.has(payout.driverId)}
                      onChange={() => toggleSelection(payout.driverId)}
                      className="rounded-[3px] border-white/20 text-amber-500 focus:ring-amber-500/50 bg-[#0a0a0a] cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium text-white">
                    {payout.driverName}
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 opacity-70">ID: {payout.driverId}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-300">
                    <div className="flex items-center gap-1.5 bg-[#0a0a0a] px-2 py-0.5 rounded-[3px] border border-white/10 w-fit text-xs">
                      {getMethodIcon(payout.payoutMethod)}
                      {payout.payoutMethod}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-white text-sm">
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