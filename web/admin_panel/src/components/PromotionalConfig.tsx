import React, { useState, useEffect } from 'react';
import {
  Campaign,
  Save,
  CheckCircle,
  CalendarMonth,
  PieChart,
  VerifiedUser,
  Info,
  Warning
} from '@mui/icons-material';

interface PromoConfig {
  isActive: boolean;
  startDate: string;
  endDate: string;
  splits: {
    system: number;
    driver: number;
    upline1: number;
    upline2: number;
  };
  requiredBadgeId: string;
}

interface Badge {
  id: string;
  name: string;
}

export const PromotionalConfig: React.FC = () => {
  const [config, setConfig] = useState<PromoConfig>({
    isActive: false,
    startDate: '',
    endDate: '',
    splits: { system: 0, driver: 0, upline1: 0, upline2: 0 },
    requiredBadgeId: '',
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Mock fetch config
    setTimeout(() => {
      setConfig({
        isActive: true,
        startDate: '2026-02-01T00:00',
        endDate: '2026-02-28T23:59',
        splits: { system: 10, driver: 80, upline1: 5, upline2: 5 },
        requiredBadgeId: 'b1',
      });
      setBadges([
        { id: 'b1', name: 'Promo Qualified' },
        { id: 'b2', name: 'Super Driver' },
        { id: 'b3', name: 'Top Earner' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const totalSplit = config.splits.system + config.splits.driver + config.splits.upline1 + config.splits.upline2;
  const isValidSplit = totalSplit === 100;

  const handleSave = () => {
    if (!isValidSplit) {
      return;
    }
    setSaveStatus('saving');
    // API Call: PUT /admin/config/promotions
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const updateSplit = (key: keyof typeof config.splits, value: string) => {
    const numVal = parseFloat(value) || 0;
    setConfig((prev) => ({
      ...prev,
      splits: { ...prev.splits, [key]: numVal },
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Campaign className="text-blue-600 dark:text-blue-400" />
            Promotional Campaigns
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage temporary fare splits and referral bonuses.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus !== 'idle' || !isValidSplit}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${saveStatus === 'saved'
              ? 'bg-green-600 text-white'
              : !isValidSplit
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved Successfully' : 'Save Campaign'}
          {saveStatus === 'saved' ? <CheckCircle fontSize="small" /> : <Save fontSize="small" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Config Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            {/* Activation Switch */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campaign Status</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable the current promotion.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config.isActive}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-200">{config.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>

            {/* Date Setup */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <CalendarMonth fontSize="small" className="text-slate-400" />
                Campaign Duration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Splits */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <PieChart fontSize="small" className="text-slate-400" />
                Fare Splits (%)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(config.splits).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 capitalize mb-1">{key} Share</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 text-right focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                        value={value}
                        onChange={(e) => updateSplit(key as any, e.target.value)}
                        min={0} max={100}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>
              {!isValidSplit && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                  <Warning fontSize="small" />
                  Total must sum to exactly 100% (Current: {totalSplit}%)
                </div>
              )}
            </div>

            {/* Qualification */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <VerifiedUser fontSize="small" className="text-slate-400" />
                Earning Qualification
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Required Badge for Upline</label>
                <select
                  className="w-full md:w-1/2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={config.requiredBadgeId}
                  onChange={(e) => setConfig({ ...config, requiredBadgeId: e.target.value })}
                >
                  <option value="">-- No Restriction --</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">Only uplines holding this badge will receive the promotional split.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {config.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Allocation</span>
                <span className={`font-mono font-bold ${isValidSplit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalSplit}%
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3">
                <Info className="text-blue-500 flex-shrink-0" fontSize="small" />
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-snug">
                  Changes to active campaigns apply immediately to all new rides. Past rides are not affected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};