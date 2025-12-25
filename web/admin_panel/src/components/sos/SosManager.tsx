import React, { useState, useEffect } from 'react';
import { SosAlertBanner } from './SosAlertBanner';
import { SosIncidentDashboard } from './SosIncidentDashboard';

/**
 * This component simulates a global WebSocket listener for SOS alerts.
 * In a real app, it would be placed in the root layout and use a WebSocket library.
 */
export const SosManager: React.FC = () => {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate receiving a WebSocket message for a new SOS alert
    const timeout = setTimeout(() => {
      console.log('Simulating SOS alert received via WebSocket...');
      setActiveIncidentId('sos-xyz-123');
      // In a real app, you'd also play an audible alarm here.
      // new Audio('/path/to/alarm.mp3').play();
    }, 5000); // Show alert 5 seconds after app loads

    return () => clearTimeout(timeout);
  }, []);

  const handleViewIncident = (incidentId: string) => {
    setViewingIncidentId(incidentId);
    setActiveIncidentId(null); // Hide the banner once viewing
  };

  const handleCloseDashboard = () => {
    setViewingIncidentId(null);
  };

  if (viewingIncidentId) {
    return <SosIncidentDashboard incidentId={viewingIncidentId} onBack={handleCloseDashboard} />;
  }

  if (activeIncidentId) {
    return <SosAlertBanner incidentId={activeIncidentId} onView={handleViewIncident} />;
  }

  return null; // No active alert
};