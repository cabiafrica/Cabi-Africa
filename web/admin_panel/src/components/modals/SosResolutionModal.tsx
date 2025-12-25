import React from 'react';

interface Props {
  onResolve: (outcome: 'LEGITIMATE' | 'MISUSE') => void;
  onCancel: () => void;
}

export const SosResolutionModal: React.FC<Props> = ({ onResolve, onCancel }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'grid', placeContent: 'center'
    }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h3>Resolve SOS Incident</h3>
        <p>Please classify this incident.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => onResolve('LEGITIMATE')} style={{ backgroundColor: 'lightgreen' }}>
            Legitimate Emergency
          </button>
          <button onClick={() => onResolve('MISUSE')} style={{ backgroundColor: 'salmon' }}>
            Misuse / False Alarm
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};