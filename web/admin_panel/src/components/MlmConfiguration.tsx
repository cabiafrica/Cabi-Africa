import React, { useState } from 'react';
import {
  MonetizationOn,
  Percent,
  People,
  Save,
  CheckCircle,
  Info
} from '@mui/icons-material';

// Types
type ConfigType = 'FIXED' | 'PERCENTAGE';

interface SignupConfig {
  enabled: boolean;
  totalFee: number;
  allocations: {
    sacco: number;
    directReferrer: number;
    indirectReferrer: number;
  };
}

interface PercentageRule {
  recipient: string;
  percentage: number;
}

interface PromotionalConfig {
  enabled: boolean;
  dateRange: { from: Date; to: Date } | undefined;
  rules: PercentageRule[];
}

export const MlmConfiguration: React.FC = () => {
  // 1. Signup Fee Config (Fixed Amount)
  const [signupConfig, setSignupConfig] = useState<SignupConfig>({
    enabled: true,
    totalFee: 1250,
    allocations: {
      sacco: 1000,
      directReferrer: 100,
      indirectReferrer: 50,
    }
  });

  // 2. Driver Earnings Config (Promotional Percentage)
  const [driverConfig, setDriverConfig] = useState<PromotionalConfig>({
    enabled: true,
    dateRange: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 30)) }, // Default 30 days
    rules: [
      { recipient: 'Driver Take Home', percentage: 80 },
      { recipient: 'Sacco', percentage: 5 },
      { recipient: 'Direct Referrer', percentage: 2 },
      { recipient: 'Indirect Referrer', percentage: 1 },
    ]
  });

  // 3. Passenger Spending Config (Promotional Percentage)
  const [passengerConfig, setPassengerConfig] = useState<PromotionalConfig>({
    enabled: true,
    dateRange: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 30)) },
    rules: [
      { recipient: 'Direct Referrer', percentage: 2 },
      { recipient: 'Indirect Referrer', percentage: 1 },
    ]
  });

  const [activeTab, setActiveTab] = useState<'signup' | 'driver' | 'passenger'>('signup');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Helpers
  const calculateSystemBalanceFixed = () => {
    const { totalFee, allocations } = signupConfig;
    return totalFee - (allocations.sacco + allocations.directReferrer + allocations.indirectReferrer);
  };

  const calculateSystemBalancePercentage = (rules: PercentageRule[]) => {
    const totalAllocated = rules.reduce((acc, rule) => acc + rule.percentage, 0);
    return Math.max(0, 100 - totalAllocated); // Ensure no negative balance
  };

  // Handlers
  const handleSignupChange = (field: keyof SignupConfig['allocations'], value: number) => {
    setSignupConfig(prev => ({
      ...prev,
      allocations: { ...prev.allocations, [field]: value }
    }));
  };

  const handlePercentageChange = (
    config: 'driver' | 'passenger',
    recipient: string,
    val: number
  ) => {
    const setter = config === 'driver' ? setDriverConfig : setPassengerConfig;
    setter(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.recipient === recipient ? { ...r, percentage: val } : r)
    }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MonetizationOn className="text-blue-600 dark:text-blue-400" />
            Revenue Distribution Rules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure fixed fees and percentage-based revenue sharing across the network.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${saveStatus === 'saved'
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved Successfully' : 'Save Configuration'}
          {saveStatus === 'saved' ? <CheckCircle fontSize="small" /> : <Save fontSize="small" />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'signup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            Signup Fees (Fixed)
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'driver'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            Driver Earnings (Promo)
          </button>
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'passenger'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
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
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Fixed Fee Allocation (KES)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Standard driver registration fee distribution.</p>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <label className="font-semibold text-slate-700 dark:text-slate-200">Total Signup Fee</label>
                      <input
                        type="number"
                        value={signupConfig.totalFee}
                        onChange={(e) => setSignupConfig({ ...signupConfig, totalFee: Number(e.target.value) })}
                        className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                        min={0}
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Sacco Allocation</label>
                        <input
                          type="number"
                          value={signupConfig.allocations.sacco}
                          onChange={(e) => handleSignupChange('sacco', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Direct Referrer</label>
                        <input
                          type="number"
                          value={signupConfig.allocations.directReferrer}
                          onChange={(e) => handleSignupChange('directReferrer', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-slate-600 dark:text-slate-400">Indirect Referrer</label>
                        <input
                          type="number"
                          value={signupConfig.allocations.indirectReferrer}
                          onChange={(e) => handleSignupChange('indirectReferrer', Number(e.target.value))}
                          className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-right font-mono"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">System Balance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Remaining amount goes to the System.</p>

                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                    KES {calculateSystemBalanceFixed()}
                  </div>

                  <div className="flex justify-between text-sm pt-4 border-t border-blue-200 dark:border-blue-800">
                    <span className="text-slate-600 dark:text-slate-400">Total Distributed</span>
                    <span className="font-bold text-slate-900 dark:text-white">KES {signupConfig.allocations.sacco + signupConfig.allocations.directReferrer + signupConfig.allocations.indirectReferrer}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DRIVER EARNINGS PANEL */}
          {activeTab === 'driver' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promotional Settings</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Set active dates for this split.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={driverConfig.enabled} onChange={() => setDriverConfig(p => ({ ...p, enabled: !p.enabled }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Enabled</span>
                    </label>
                  </div>

                  {/* Date Pickers would go here - simplified for this enhancement */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Active Period</p>
                    <div className="flex gap-4">
                      <input type="date" className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                      <span className="text-slate-400 self-center">to</span>
                      <input type="date" className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Percentage Split (Total Fare)</h3>
                  <div className="space-y-3">
                    {driverConfig.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={rule.percentage}
                            onChange={(e) => handlePercentageChange('driver', rule.recipient, Number(e.target.value))}
                            className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-right font-mono"
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
                <div className={`p-6 rounded-xl border ${calculateSystemBalancePercentage(driverConfig.rules) < 0 ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900' : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900'}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">System Balance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Remaining percentage.</p>

                  <div className={`text-4xl font-bold mb-6 ${calculateSystemBalancePercentage(driverConfig.rules) < 0 ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {calculateSystemBalancePercentage(driverConfig.rules).toFixed(1)}%
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {driverConfig.rules.map(r => (
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
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Promotional Settings</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Set active dates for passenger referral bonuses.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={passengerConfig.enabled} onChange={() => setPassengerConfig(p => ({ ...p, enabled: !p.enabled }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Enabled</span>
                    </label>
                  </div>

                  {/* Date Pickers Placeholder */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Active Period</p>
                    <div className="flex gap-4">
                      <input type="date" className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                      <span className="text-slate-400 self-center">to</span>
                      <input type="date" className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Referral Commissions (On Spend)</h3>
                  <div className="space-y-3">
                    {passengerConfig.rules.map((rule) => (
                      <div key={rule.recipient} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{rule.recipient}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={rule.percentage}
                            onChange={(e) => handlePercentageChange('passenger', rule.recipient, Number(e.target.value))}
                            className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-right font-mono"
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

                  <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Example: For a KES 1000 trip:</p>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {passengerConfig.rules.map(r => (
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