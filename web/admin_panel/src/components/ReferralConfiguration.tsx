import React, { useState, useEffect } from 'react';
import {
  MonetizationOn,
  Save,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { adminService, ReferralConfig } from '../services/adminService';

export const ReferralConfiguration: React.FC = () => {
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'signup' | 'driver' | 'passenger'>('signup');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminService.getReferralConfig();
        setConfig(data);
      } catch (error) {
        console.error('Failed to load Referral config', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  if (loading || !config) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Referral Configuration...</div>;
  }

  // Helpers
  const calculateSystemBalanceFixed = () => {
    const { totalFee, allocations } = config.signup;
    return totalFee - (allocations.sacco + allocations.directReferrer + allocations.indirectReferrer);
  };

  const calculateSystemBalancePercentage = (rules: Array<{ recipient: string; percentage: number }>) => {
    const totalAllocated = rules.reduce((acc, rule) => acc + rule.percentage, 0);
    return Math.max(0, 100 - totalAllocated);
  };

  // Handlers
  const handleConfigChange = (path: string, value: any) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let current: any = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const handlePercentageChange = (
    type: 'driverPromo' | 'passengerPromo',
    recipient: string,
    val: number
  ) => {
    const rules = config[type].rules.map(r =>
      r.recipient === recipient ? { ...r, percentage: val } : r
    );
    handleConfigChange(`${type}.rules`, rules);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await adminService.updateReferralConfig(config);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save Referral config', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MonetizationOn className="text-amber-600 dark:text-amber-400" />
            Revenue Distribution Rules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure fixed fees and percentage-based revenue sharing across the network.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${saveStatus === 'saved'
            ? 'bg-green-600 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-black'
            }`}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved Successfully' : 'Save Configuration'}
          {saveStatus === 'saved' ? <CheckCircle fontSize="small" /> : <Save fontSize="small" />}
        </button>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'signup'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            Signup Fees (Fixed)
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'driver'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            Driver Earnings (Promo)
          </button>
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'passenger'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            Passenger Spending (Promo)
          </button>
        </div>

        <div className="p-6">
          {/* SIGNUP FEE PANEL */}
          {activeTab === 'signup' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Fixed Fee Allocation (KES)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Standard driver registration fee distribution.</p>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                      <label className="font-semibold text-slate-700 dark:text-slate-200">Total Signup Fee</label>
                      <input
                        type="number"
                        value={config.signup.totalFee}
                        onChange={(e) => handleConfigChange('signup.totalFee', Number(e.target.value))}
                        className="w-32 px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                        min={0}
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Sacco Allocation</label>
                        <input
                          type="number"
                          value={config.signup.allocations.sacco}
                          onChange={(e) => handleConfigChange('signup.allocations.sacco', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Direct Referrer</label>
                        <input
                          type="number"
                          value={config.signup.allocations.directReferrer}
                          onChange={(e) => handleConfigChange('signup.allocations.directReferrer', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Indirect Referrer</label>
                        <input
                          type="number"
                          value={config.signup.allocations.indirectReferrer}
                          onChange={(e) => handleConfigChange('signup.allocations.indirectReferrer', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">System Balance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Remaining amount goes to the System.</p>

                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-6">
                    KES {calculateSystemBalanceFixed()}
                  </div>

                  <div className="flex justify-between text-sm pt-4 border-t border-amber-200 dark:border-amber-800">
                    <span className="text-slate-600 dark:text-slate-400">Total Distributed</span>
                    <span className="font-bold text-slate-900 dark:text-white">KES {config.signup.allocations.sacco + config.signup.allocations.directReferrer + config.signup.allocations.indirectReferrer}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DRIVER EARNINGS PANEL */}
          {activeTab === 'driver' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promotional Settings</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Global driver earning split rules.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={config.driverPromo.enabled} onChange={() => handleConfigChange('driverPromo.enabled', !config.driverPromo.enabled)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Enabled</span>
                    </label>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Percentage Split (Total Fare)</h3>
                  <div className="space-y-3">
                    {config.driverPromo.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-4 bg-white dark:bg-card-dark rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={rule.percentage}
                            onChange={(e) => handlePercentageChange('driverPromo', rule.recipient, Number(e.target.value))}
                            className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-md text-right font-mono"
                            min={0} max={100}
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className={`p-6 rounded-xl border ${calculateSystemBalancePercentage(config.driverPromo.rules) < 0 ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900' : 'bg-cyan-50 border-cyan-100 dark:bg-cyan-900/20 dark:border-cyan-900'}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">System Balance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Remaining percentage.</p>

                  <div className={`text-4xl font-bold mb-6 ${calculateSystemBalancePercentage(config.driverPromo.rules) < 0 ? 'text-red-600 dark:text-red-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                    {calculateSystemBalancePercentage(config.driverPromo.rules).toFixed(1)}%
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {config.driverPromo.rules.map(r => (
                        <div key={r.recipient} className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">{r.recipient}</span>
                          <span className="font-mono text-slate-900 dark:text-slate-200">{r.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSENGER SPENDING PANEL */}
          {activeTab === 'passenger' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promotional Settings</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Passenger referral reward rules.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={config.passengerPromo.enabled} onChange={() => handleConfigChange('passengerPromo.enabled', !config.passengerPromo.enabled)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Enabled</span>
                    </label>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Referral Commissions (On Spend)</h3>
                  <div className="space-y-3">
                    {config.passengerPromo.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-4 bg-white dark:bg-card-dark rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={rule.percentage}
                            onChange={(e) => handlePercentageChange('passengerPromo', rule.recipient, Number(e.target.value))}
                            className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-slate-600 rounded-md text-right font-mono"
                            min={0} max={100}
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Info className="text-amber-500" /> Note
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    These percentages are calculated based on the total trip amount paid by the passenger.
                  </p>

                  <div className="mt-4 p-4 bg-white dark:bg-card-dark rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Example: For a KES 1000 trip:</p>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {config.passengerPromo.rules.map(r => (
                        <li key={r.recipient} className="flex justify-between">
                          <span>{r.recipient}</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">KES {(1000 * r.percentage / 100).toFixed(0)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};