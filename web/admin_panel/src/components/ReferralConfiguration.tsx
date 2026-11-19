import React, { useState, useEffect } from 'react';
import {
  MonetizationOn,
  Save,
  CheckCircle,
  Security,
  DirectionsCar,
  Person,
  VerifiedUser,
  AccountBalance
} from '@mui/icons-material';
import { adminService } from '../services/adminService';
import { ReferralConfig } from '../services/admin/types';

export const ReferralConfiguration: React.FC = () => {
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'driver' | 'passenger' | 'qualifiers' | 'fraud'>('driver');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data: any = await adminService.getReferralConfig();
        // Normalize with safe defaults
        const normalizedConfig: ReferralConfig = {
          driverProgram: {
            enabled: data?.driverProgram?.enabled ?? true,
            l1Percentage: data?.driverProgram?.l1Percentage ?? 2.0,
            l2Percentage: data?.driverProgram?.l2Percentage ?? 1.0,
            maxL1Drivers: data?.driverProgram?.maxL1Drivers ?? 10,
            maxL2Drivers: data?.driverProgram?.maxL2Drivers ?? 100,
          },
          passengerProgram: {
            enabled: data?.passengerProgram?.enabled ?? true,
            l1Percentage: data?.passengerProgram?.l1Percentage ?? 2.0,
            l2Percentage: data?.passengerProgram?.l2Percentage ?? 1.0,
            paxReferDriverFirstWeekPercent: data?.passengerProgram?.paxReferDriverFirstWeekPercent ?? 2.0,
            firstWeekDurationDays: data?.passengerProgram?.firstWeekDurationDays ?? 7,
          },
          qualifiers: {
            requiredBadgeCode: data?.qualifiers?.requiredBadgeCode ?? 'ROAD_MASTER',
            grandfatherExisting: data?.qualifiers?.grandfatherExisting ?? true,
            disqualifyingFareThreshold: data?.qualifiers?.disqualifyingFareThreshold ?? 300,
            maxPlatformFeeDeductionPercent: data?.qualifiers?.maxPlatformFeeDeductionPercent ?? 40.0,
            escrowHoldingHours: data?.qualifiers?.escrowHoldingHours ?? 72,
          },
          fraudDetection: {
            deviceFingerprintBlock: data?.fraudDetection?.deviceFingerprintBlock ?? true,
            maxReferrerTripDensity: data?.fraudDetection?.maxReferrerTripDensity ?? 0.30,
            minTripsForDensityCheck: data?.fraudDetection?.minTripsForDensityCheck ?? 5,
            immediateSuspension: data?.fraudDetection?.immediateSuspension ?? true,
          },
          saccoMatchingPool: {
            enabled: data?.saccoMatchingPool?.enabled ?? true,
            defaultSavingsPercent: data?.saccoMatchingPool?.defaultSavingsPercent ?? 25.0,
          },
        };
        setConfig(normalizedConfig);
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

  // Handlers
  const handleConfigChange = (path: string, value: any) => {
    const newConfig: any = { ...config };
    const parts = path.split('.');
    let current: any = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setConfig(newConfig);
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
            Referral Program & Anti-Fraud Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure trip-activity incentives, multi-tier downline caps, margin protections, 72h escrow, and collusion safeguards.
          </p>
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
        <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'driver'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <DirectionsCar fontSize="small" /> Driver Program (2% / 1%)
          </button>
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'passenger'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Person fontSize="small" /> Passenger Program (Promo)
          </button>
          <button
            onClick={() => setActiveTab('qualifiers')}
            className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'qualifiers'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <VerifiedUser fontSize="small" /> Qualifiers & 72h Escrow
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fraud'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Security fontSize="small" /> Fraud Detection
          </button>
        </div>

        <div className="p-6">
          {/* DRIVER PROGRAM PANEL */}
          {activeTab === 'driver' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Driver Referral Program</h3>
                      <p className="text-sm text-slate-500">Drivers can refer drivers only. Earnings are funded from platform fee.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.driverProgram.enabled}
                        onChange={(e) => handleConfigChange('driverProgram.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Level 1 Commission Rate</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={config.driverProgram.l1Percentage}
                            onChange={(e) => handleConfigChange('driverProgram.l1Percentage', Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Max Active Drivers (Cap)</label>
                        <input
                          type="number"
                          value={config.driverProgram.maxL1Drivers}
                          onChange={(e) => handleConfigChange('driverProgram.maxL1Drivers', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Level 2 Commission Rate</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={config.driverProgram.l2Percentage}
                            onChange={(e) => handleConfigChange('driverProgram.l2Percentage', Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Max Active Drivers (Cap)</label>
                        <input
                          type="number"
                          value={config.driverProgram.maxL2Drivers}
                          onChange={(e) => handleConfigChange('driverProgram.maxL2Drivers', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <AccountBalance className="text-amber-500" fontSize="small" /> SACCO Matching Pool Auto-Save
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">Route opt-in percentage of driver referral earnings directly to their SACCO ledger.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={config.saccoMatchingPool.enabled}
                          onChange={(e) => handleConfigChange('saccoMatchingPool.enabled', e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <span>Enabled</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          disabled={!config.saccoMatchingPool.enabled}
                          value={config.saccoMatchingPool.defaultSavingsPercent}
                          onChange={(e) => handleConfigChange('saccoMatchingPool.defaultSavingsPercent', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono disabled:opacity-50"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Driver Funding Rules</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>✅ 100% funded from platform fee net.</li>
                  <li>✅ Driver take-home pay is completely untouched.</li>
                  <li>✅ Strictly limited to 10 Level-1 and 100 Level-2 drivers.</li>
                  <li>✅ 72-hour escrow delay before funds become withdrawable.</li>
                </ul>
              </div>
            </div>
          )}

          {/* PASSENGER PROGRAM PANEL */}
          {activeTab === 'passenger' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Passenger Referral Promotion</h3>
                      <p className="text-sm text-slate-500">Promotional referral yields on passenger ride spend. Uncapped.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.passengerProgram.enabled}
                        onChange={(e) => handleConfigChange('passengerProgram.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <label className="font-semibold text-slate-800 dark:text-slate-200">Level 1 Pax Spend Rate</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={config.passengerProgram.l1Percentage}
                          onChange={(e) => handleConfigChange('passengerProgram.l1Percentage', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <label className="font-semibold text-slate-800 dark:text-slate-200">Level 2 Pax Spend Rate</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={config.passengerProgram.l2Percentage}
                          onChange={(e) => handleConfigChange('passengerProgram.l2Percentage', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm space-y-3 mt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Passenger Referring Driver (1st Week Incentive)</h4>
                    <p className="text-xs text-slate-500">When a passenger refers a driver, they earn a percentage of the driver earnings during their initial week.</p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-400">1st Week Cut (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.passengerProgram.paxReferDriverFirstWeekPercent}
                          onChange={(e) => handleConfigChange('passengerProgram.paxReferDriverFirstWeekPercent', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Duration (Days)</label>
                        <input
                          type="number"
                          value={config.passengerProgram.firstWeekDurationDays}
                          onChange={(e) => handleConfigChange('passengerProgram.firstWeekDurationDays', Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-surface-dark border rounded text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Promotional Rules</h3>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <li>✅ Passenger referrals of passengers are uncapped.</li>
                  <li>✅ Passenger cannot benefit from ongoing driver earnings after the 1st week window.</li>
                  <li>✅ Admin toggle allows turning the promo on or off instantly.</li>
                </ul>
              </div>
            </div>
          )}

          {/* QUALIFIERS & 72H ESCROW PANEL */}
          {activeTab === 'qualifiers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Qualifier & Margin Safeguards</h3>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Required Badge Tier Code</label>
                        <p className="text-xs text-slate-500">User must hold this badge to qualify for new referral incentives.</p>
                      </div>
                      <input
                        type="text"
                        value={config.qualifiers.requiredBadgeCode}
                        onChange={(e) => handleConfigChange('qualifiers.requiredBadgeCode', e.target.value)}
                        className="w-40 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border rounded font-mono text-center uppercase"
                      />
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Grandfather Existing Referrals</label>
                        <p className="text-xs text-slate-500">If a user badge drops, previously referred users remain grandfathered.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.qualifiers.grandfatherExisting}
                        onChange={(e) => handleConfigChange('qualifiers.grandfatherExisting', e.target.checked)}
                        className="w-5 h-5 accent-amber-600 rounded"
                      />
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Disqualifying Fare Threshold (KES)</label>
                        <p className="text-xs text-slate-500">Rides below this fare amount are excluded from referral cuts.</p>
                      </div>
                      <input
                        type="number"
                        value={config.qualifiers.disqualifyingFareThreshold}
                        onChange={(e) => handleConfigChange('qualifiers.disqualifyingFareThreshold', Number(e.target.value))}
                        className="w-28 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border rounded font-mono text-right"
                      />
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Escrow Holding Window (Hours)</label>
                        <p className="text-xs text-slate-500">All referral bonuses are held in PENDING_REVIEW before release.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={config.qualifiers.escrowHoldingHours}
                          onChange={(e) => handleConfigChange('qualifiers.escrowHoldingHours', Number(e.target.value))}
                          className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border rounded font-mono text-right"
                        />
                        <span className="text-slate-400 font-bold">hrs</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Max Platform Commission Deduction</label>
                        <p className="text-xs text-slate-500">Ceiling cap to guarantee positive gross platform margin on all rides.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={config.qualifiers.maxPlatformFeeDeductionPercent}
                          onChange={(e) => handleConfigChange('qualifiers.maxPlatformFeeDeductionPercent', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border rounded font-mono text-right"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Escrow Release Policy</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Referral earnings are safely held in <strong>72-hour escrow</strong>. A background cron job releases matured earnings automatically every hour, ensuring zero fraudulent extraction from cancelled or disputed rides.
                </p>
              </div>
            </div>
          )}

          {/* FRAUD DETECTION PANEL */}
          {activeTab === 'fraud' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-surface-dark/50 p-6 rounded-xl border border-slate-100 dark:border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Fraud Prevention Rules</h3>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Hardware Device Fingerprinting</label>
                        <p className="text-xs text-slate-500">Block referral attribution if referee shares device UUID or hashed IMEI with referrer.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.fraudDetection.deviceFingerprintBlock}
                        onChange={(e) => handleConfigChange('fraudDetection.deviceFingerprintBlock', e.target.checked)}
                        className="w-5 h-5 accent-amber-600 rounded"
                      />
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Trip Density / Collusion Check Threshold</label>
                        <p className="text-xs text-slate-500">Flag and suspend if &gt; 30% of a referred driver trips are with their referrer.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.05"
                          value={config.fraudDetection.maxReferrerTripDensity}
                          onChange={(e) => handleConfigChange('fraudDetection.maxReferrerTripDensity', Number(e.target.value))}
                          className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border rounded font-mono text-right"
                        />
                        <span className="text-slate-400 font-bold">ratio</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex justify-between items-center">
                      <div>
                        <label className="font-semibold text-slate-800 dark:text-slate-200">Immediate Payout Suspension</label>
                        <p className="text-xs text-slate-500">Automatically freeze referral payouts immediately upon triggering a fraud rule.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.fraudDetection.immediateSuspension}
                        onChange={(e) => handleConfigChange('fraudDetection.immediateSuspension', e.target.checked)}
                        className="w-5 h-5 accent-amber-600 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Audit & Dispute Trail</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Every fraud alert, badge drop, and payout suspension writes an immutable record to <code>notification_logs</code> and <code>referral_fraud_alerts</code> with full forensic evidence for dispute resolution.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
