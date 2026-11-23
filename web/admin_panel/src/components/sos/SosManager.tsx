import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SosAlertBanner } from './SosAlertBanner';
import { SosIncidentDashboard } from './SosIncidentDashboard';

export const SosManager: React.FC = () => {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [viewingIncidentId, setViewingIncidentId] = useState<string | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://cabi.africa';
    const socket = io(`${socketUrl}/sos`, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Admin SOS Safety Gateway Connected');
      socket.emit('registerClient', { userId: 'admin', role: 'ADMIN' });
    });

    socket.on('sos_alert', (alert: any) => {
      console.warn('🚨 Admin Panel: Live SOS alert received:', alert);
      const targetId = alert.alertId || alert.occurrenceId || alert.id || alert.obNumber;
      setActiveIncidentId(targetId);

      // Synthesize audible siren/alarm via Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.7);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.85);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.85);
        }
      } catch (_) {}
    });

    socket.on('sos_resolved', (res: any) => {
      setActiveIncidentId((prev) => (prev === res.occurrenceId || prev === res.obNumber ? null : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleViewIncident = (incidentId: string) => {
    setViewingIncidentId(incidentId);
    setActiveIncidentId(null); // Hide banner once viewing details
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

  return null;
};
