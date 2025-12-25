import React from 'react';

interface Props {
  incidentId: string;
  onView: (incidentId: string) => void;
}

export const SosAlertBanner: React.FC<Props> = ({ incidentId, onView }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      backgroundColor: 'red', color: 'white', padding: '1rem',
      textAlign: 'center', fontWeight: 'bold',
    }}>
      <span>
        🚨 SOS ALERT: New Incident Received! 🚨
      </span>
      <button onClick={() => onView(incidentId)} style={{ marginLeft: '2rem' }}>View Incident</button>
    </div>
  );
};