import React, { useState, useEffect } from 'react';
import {
  Sos,
  Gavel,
  MonetizationOn,
  RemoveCircle,
  Save,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { adminService, Badge, SosPenaltyConfig as PenaltyConfig } from '../services/adminService';

export const SosPenaltyConfig: React.FC = () => {
  const [config, setConfig] = useState<PenaltyConfig>({
    type: 'FEE',
    feeAmount: 500,
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, badgesData] = await Promise.all([
          adminService.getSosPenaltyConfig(),
          adminService.getBadges(),
        ]);
        setConfig(configData);
        setBadges(badgesData);
      } catch (error) {
        console.error('Failed to load SOS configuration', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (config.type === 'FEE' && (config.feeAmount === undefined || config.feeAmount <= 0)) {
      // Ideally show toast
      return;
    }
    if (config.type === 'REVOKE_BADGE' && !config.badgeId) {
      return;
    }

    setSaveStatus('saving');
    try {
      await adminService.updateSosPenaltyConfig(config);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save SOS configuration', error);
      setSaveStatus('idle');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading configuration...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sos className="text-red-600 dark:text-red-500" />
          SOS Misuse Penalty
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure automated penalties for false SOS alerts.</p>
      </div>

      <div className="bg-white dark:bg-card-dark shadow-sm rounded-xl border border-slate-200 dark:border-white/10 p-6 md:p-8">

        {/* WARNING BANNER */}
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
          <Warning className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Vital Configuration</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              These penalties apply automatically when an SOS alert is marked as "False Alarm" or "Misuse" by the support team. Please set carefully.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Gavel fontSize="small" className="text-slate-400" />
              Select Penalty Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all ${config.type === 'FEE'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                : 'border-slate-200 dark:border-white/10 hover:border-amber-300'
                }`}>
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name="penaltyType"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                    checked={config.type === 'FEE'}
                    onChange={() => setConfig({ ...config, type: 'FEE' })}
                  />
                </div>
                <div className="ml-3">
                  <span className={`block text-sm font-bold ${config.type === 'FEE' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>Monetary Fine</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">Deduct a fixed amount from the driver's wallet.</span>
                </div>
              </label>

              <label className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all ${config.type === 'REVOKE_BADGE'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                : 'border-slate-200 dark:border-white/10 hover:border-amber-300'
                }`}>
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    name="penaltyType"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                    checked={config.type === 'REVOKE_BADGE'}
                    onChange={() => setConfig({ ...config, type: 'REVOKE_BADGE' })}
                  />
                </div>
                <div className="ml-3">
                  <span className={`block text-sm font-bold ${config.type === 'REVOKE_BADGE' ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>Revoke Privilege</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">Remove a specific badge or qualification.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {config.type === 'FEE' ? (
              <div className="bg-slate-50 dark:bg-surface-dark p-6 rounded-lg border border-slate-100 dark:border-slate-600">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <MonetizationOn fontSize="small" className="text-green-600" />
                  Fee Amount (KES)
                </label>
                <input
                  type="number"
                  className="block w-full md:w-1/2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-lg font-mono font-bold"
                  value={config.feeAmount || ''}
                  onChange={(e) => setConfig({ ...config, feeAmount: parseFloat(e.target.value) })}
                  placeholder="e.g. 500"
                />
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-surface-dark p-6 rounded-lg border border-slate-100 dark:border-slate-600">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <RemoveCircle fontSize="small" className="text-red-600" />
                  Select Badge to Revoke
                </label>
                <select
                  className="block w-full md:w-1/2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  value={config.badgeId || ''}
                  onChange={(e) => setConfig({ ...config, badgeId: e.target.value })}
                >
                  <option value="">-- Choose Credential --</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                  Drivers will need to re-qualify for this badge manually if lost.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold shadow-sm shadow-amber-500/20 active:scale-95 transition-all ${saveStatus === 'saved'
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black disabled:opacity-50'
              }`}
          >
            {saveStatus === 'saving' ? 'Saving Rule...' : saveStatus === 'saved' ? 'Saved' : 'Save Configuration'}
            {saveStatus === 'saved' ? <CheckCircle fontSize="small" /> : <Save fontSize="small" />}
          </button>
        </div>
      </div>
    </div>
  );
};