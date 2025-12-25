import React, { useState, useEffect, useCallback } from 'react';
import { adminService, SOSIncidentDetails } from '../../services/adminService';
import { SosResolutionModal } from '../SosResolutionModal';

interface Props {
  incidentId: string;
  onBack: () => void; // To go back to the main view
}

export const SosIncidentDashboard: React.FC<Props> = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState<SOSIncidentDetails | null>(null);
  const [newLog, setNewLog] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncident = useCallback(async () => {
    try {
      const data = await adminService.getSosIncidentDetails(incidentId);
      setIncident(data);
    } catch (error) {
      alert('Failed to fetch incident details.');
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncident();
    // In a real app, you'd also subscribe to location updates via WebSocket here.
  }, [fetchIncident]);

  const handleLogAction = async () => {
    if (!newLog.trim()) return;
    setIsLoading(true);
    try {
      await adminService.logSosIncidentAction(incidentId, newLog);
      setNewLog('');
      fetchIncident(); // Refetch to show the new log
    } catch (error) {
      alert('Failed to log action.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListenIn = () => {
    // In a real app, this would connect to a WebRTC or WebSocket audio stream.
    console.log(`Attempting to connect to audio stream for incident ${incidentId}...`);
    alert('Check console for audio stream connection attempt.');
  };

  const handleResolve = async (outcome: 'LEGITIMATE' | 'MISUSE') => {
    setIsResolving(false); // Close the modal
    setIsLoading(true);
    try {
      await adminService.resolveSosIncident(incidentId, outcome);
      alert(`Incident resolved as ${outcome}.`);
      onBack(); // Go back to the main view
    } catch (error) {
      alert('Failed to resolve incident.');
    } finally {
      setIsLoading(false);
    }
  };
  if (!incident) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl font-semibold text-gray-500 animate-pulse">Loading Incident Details...</div>
    </div>
  );

  return (
    <div className="bg-red-50 min-h-screen p-4 -m-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-600">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE INCIDENT</span>
              <h2 className="text-2xl font-bold text-gray-900">SOS Incident #{incident.id.split('-')[1]}</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Started at: {new Date().toLocaleTimeString()} (placeholder)</p>
          </div>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Parties & Location */}
          <div className="lg:col-span-2 space-y-6">

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-gray-200 h-96 w-full flex flex-col items-center justify-center relative">
                <span className="text-4xl mb-4">🗺️</span>
                <p className="text-gray-600 font-medium">Live Map Feed</p>
                <p className="text-xs text-gray-500">Lat: {incident.liveLocation.lat}, Lon: {incident.liveLocation.lon}</p>

                {/* Overlay Controls */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg">
                  <button
                    onClick={handleListenIn}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md animate-pulse"
                  >
                    <span>🎙️</span> Listen In Live
                  </button>
                </div>
              </div>
            </div>

            {/* Involved Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">🚗 Driver</h3>
                <div className="space-y-2">
                  <div className="text-xl font-bold">{incident.driver.name}</div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <span>📞</span> {incident.driver.phone}
                  </div>
                  <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                    vehicle info placeholder
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">👤 Passenger</h3>
                <div className="space-y-2">
                  <div className="text-xl font-bold">{incident.passenger.name}</div>
                  <div className="text-gray-600 flex items-center gap-2">
                    <span>📞</span> {incident.passenger.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Upline Contacts */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Emergency Contacts (Uplines)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold">Upline 1</p>
                  <p className="font-semibold">{incident.upline1.name}</p>
                  <p className="text-sm text-blue-600">{incident.upline1.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-bold">Upline 2</p>
                  <p className="font-semibold">{incident.upline2.name}</p>
                  <p className="text-sm text-blue-600">{incident.upline2.phone}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Logs & Actions */}
          <div className="space-y-6">

            {/* Action Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700">Detailed Incident Log</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {incident.logs.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="text-xs text-gray-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      <p className="text-sm text-gray-800">{log.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-white rounded-b-xl">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Add Log Entry</label>
                <div className="flex flex-col gap-2">
                  <textarea
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                    placeholder="Record action taken..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleLogAction}
                    disabled={isLoading}
                    className="self-end bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Add Log Entry'}
                  </button>
                </div>
              </div>
            </div>

            {/* Resolution Control */}
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">Resolution</h3>
              <p className="text-sm text-gray-600 mb-4">Once functionality is restored or the emergency is handled, you must resolve the incident.</p>
              <button
                onClick={() => setIsResolving(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Resolve Incident
              </button>
            </div>

          </div>
        </div>

        {isResolving && (
          <SosResolutionModal
            incidentId={incidentId}
            onResolve={(_, outcome) => handleResolve(outcome)}
            onClose={() => setIsResolving(false)}
          />
        )}
      </div>
    </div>
  );
};