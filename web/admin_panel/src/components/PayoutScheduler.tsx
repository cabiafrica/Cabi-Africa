import React, { useState } from 'react';
import { PageHeader } from './common/PageHeader';
import {
  Schedule,
  PlayArrow,
  Pause,
  Update,
  CheckCircle,
  ErrorOutline,
  History
} from '@mui/icons-material';

export const PayoutScheduler: React.FC = () => {
  const [config, setConfig] = useState({
    enabled: false,
    schedule: 'Weekly (Monday 00:00 EAT)',
    lastRun: new Date().toISOString(),
    lastRunStatus: 'IDLE',
    nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalProcessedLastRun: 0
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleRunNow = () => {
    if (!window.confirm('Are you sure you want to trigger the payout job manually?')) return;
    setIsRunning(true);

    // Simulate backend job execution
    setTimeout(() => {
      setIsRunning(false);
      setConfig(prev => ({
        ...prev,
        lastRun: new Date().toISOString(),
        lastRunStatus: 'SUCCESS',
        totalProcessedLastRun: Math.floor(Math.random() * 100000) + 50000
      }));
      //   alert('Payout job completed successfully.'); // Using UI feedback instead
    }, 3000);
  };

  const toggleAutomation = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        category="Finance & Sacco"
        title="Automated Payout Scheduler"
        subtitle="Manage automated withdrawal processing intervals and recurring execution runs"
        icon={<Schedule className="w-5 h-5 text-amber-500" />}
      />

      <div className="bg-[#131722] rounded-[3px] shadow-sm border border-white/10 overflow-hidden">
        {/* Status Header */}
        <div className={`px-5 py-4 border-b border-white/10 flex items-center justify-between ${config.enabled ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${config.enabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div>
              <h3 className="font-bold text-white text-sm">
                Scheduler is {config.enabled ? 'Active' : 'Paused'}
              </h3>
              <p className="text-xs text-gray-400">
                {config.enabled ? 'Payouts will occur automatically.' : 'Automatic payouts are suspended.'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAutomation}
            className="btn-secondary flex items-center gap-1.5"
          >
            {config.enabled ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
            <span>{config.enabled ? 'Pause Scheduler' : 'Resume Scheduler'}</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] p-3.5 rounded-[3px] border border-white/10">
              <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">Current Frequency</span>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Update className="text-amber-500" fontSize="small" />
                {config.schedule}
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-3.5 rounded-[3px] border border-white/10">
              <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">Next Scheduled Run</span>
              <div className="text-white font-bold font-mono text-sm">
                {new Date(config.nextRun).toLocaleString()}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunNow}
                disabled={isRunning}
                className="btn-primary w-full flex justify-center items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Processing batch...</span>
                  </>
                ) : (
                  <>
                    <PlayArrow fontSize="small" />
                    <span>Run Batch Manually</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-gray-500 mt-2">
                This will immediately trigger pending payouts for processing.
              </p>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-1.5 text-xs">
                <History fontSize="small" className="text-gray-400" />
                Last Execution
              </h4>

              <div className="space-y-3">
                <div className="bg-[#0a0a0a] p-3 rounded-[3px] border border-white/5">
                  <span className="text-gray-400 text-xs block">Date & Time</span>
                  <p className="font-medium text-white text-xs mt-0.5">{new Date(config.lastRun).toLocaleString()}</p>
                </div>

                <div className="bg-[#0a0a0a] p-3 rounded-[3px] border border-white/5">
                  <span className="text-gray-400 text-xs block mb-1">Status</span>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${config.lastRunStatus === 'SUCCESS'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                      {config.lastRunStatus === 'SUCCESS' ? <CheckCircle style={{ fontSize: 12 }} /> : <ErrorOutline style={{ fontSize: 12 }} />}
                      {config.lastRunStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] p-3 rounded-[3px] border border-white/5">
                  <span className="text-gray-400 text-xs block">Volume Processed</span>
                  <p className="font-bold text-lg text-white mt-0.5">
                    KES {config.totalProcessedLastRun.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};