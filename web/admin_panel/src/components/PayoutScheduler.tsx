import React, { useState } from 'react';

export const PayoutScheduler: React.FC = () => {
  const [config, setConfig] = useState({
    enabled: true,
    schedule: 'Weekly (Monday 00:00 EAT)',
    lastRun: '2024-05-27T00:00:00Z',
    lastRunStatus: 'SUCCESS',
    nextRun: '2024-06-03T00:00:00Z',
    totalProcessedLastRun: 450000
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
      alert('Payout job completed successfully.');
    }, 3000);
  };

  const toggleAutomation = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Automated Payout Scheduler</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <div className="mb-4">
                <span className="text-gray-500 text-sm">Status</span>
                <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${config.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">{config.enabled ? 'Active' : 'Paused'}</span>
                </div>
            </div>
            <div className="mb-4">
                <span className="text-gray-500 text-sm">Schedule</span>
                <p className="font-medium">{config.schedule}</p>
            </div>
            <div>
                <span className="text-gray-500 text-sm">Next Run</span>
                <p className="font-medium">{new Date(config.nextRun).toLocaleString()}</p>
            </div>
        </div>

        <div className="border-l pl-6">
            <div className="mb-4">
                <span className="text-gray-500 text-sm">Last Run</span>
                <p className="font-medium">{new Date(config.lastRun).toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded ${config.lastRunStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {config.lastRunStatus}
                </span>
            </div>
            <div className="mb-6">
                <span className="text-gray-500 text-sm">Processed Amount</span>
                <p className="font-medium">KES {config.totalProcessedLastRun.toLocaleString()}</p>
            </div>
            
            <div className="flex space-x-3">
                <button 
                    onClick={toggleAutomation}
                    className={`px-4 py-2 rounded text-sm font-medium border ${config.enabled ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                >
                    {config.enabled ? 'Pause Automation' : 'Resume Automation'}
                </button>
                <button 
                    onClick={handleRunNow}
                    disabled={isRunning}
                    className="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                    {isRunning ? 'Running...' : 'Run Now'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};