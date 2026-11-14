import React, { useState } from 'react';
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Schedule className="text-amber-600 dark:text-amber-400" />
          Automated Payout Scheduler
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage automated withdrawal processing intervals.</p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Status Header */}
        <div className={`px-6 py-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between ${config.enabled ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-amber-50/50 dark:bg-amber-900/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${config.enabled ? 'bg-green-500' : 'bg-amber-500'}`} />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Scheduler is {config.enabled ? 'Active' : 'Paused'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {config.enabled ? 'Payouts will occur automatically.' : 'Automatic payouts are suspended.'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAutomation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${config.enabled
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20'
                : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20'
              }`}
          >
            {config.enabled ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
            {config.enabled ? 'Pause Scheduler' : 'Resume Scheduler'}
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-surface-dark p-4 rounded-lg border border-slate-100 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Current Frequency</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Update className="text-amber-500" fontSize="small" />
                {config.schedule}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-surface-dark p-4 rounded-lg border border-slate-100 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Next Scheduled Run</span>
              <div className="text-slate-900 dark:text-white font-bold font-mono text-lg">
                {new Date(config.nextRun).toLocaleString()}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunNow}
                disabled={isRunning}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing batch...
                  </>
                ) : (
                  <>
                    <PlayArrow />
                    Run Batch Manually
                  </>
                )}
              </button>
              <p className="text-xs text-center text-slate-400 mt-2">
                This will immediately trigger pending payouts for processing.
              </p>
            </div>
          </div>

          <div className="border-l border-slate-200 dark:border-white/10 pl-8 md:block flex flex-col gap-6">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <History fontSize="small" className="text-slate-400" />
                Last Execution
              </h4>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-500 text-sm">Date & Time</span>
                  <p className="font-medium text-slate-900 dark:text-white">{new Date(config.lastRun).toLocaleString()}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-sm">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${config.lastRunStatus === 'SUCCESS'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {config.lastRunStatus === 'SUCCESS' ? <CheckCircle style={{ fontSize: 14 }} /> : <ErrorOutline style={{ fontSize: 14 }} />}
                      {config.lastRunStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-sm">Volume Processed</span>
                  <p className="font-bold text-2xl text-slate-900 dark:text-white">
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