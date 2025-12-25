import React, { useState } from 'react';

interface SosResolutionModalProps {
  incidentId: string;
  onClose: () => void;
  onResolve: (incidentId: string, outcome: 'LEGITIMATE' | 'MISUSE') => void;
}

export const SosResolutionModal: React.FC<SosResolutionModalProps> = ({ incidentId, onClose, onResolve }) => {
  const [outcome, setOutcome] = useState<'LEGITIMATE' | 'MISUSE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;
    setIsSubmitting(true);
    
    // Simulate API call
    // await api.post(`/admin/sos-incidents/${incidentId}/resolve`, { outcome });
    
    setTimeout(() => {
      onResolve(incidentId, outcome);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Resolve SOS Incident</h2>
        <p className="text-gray-600 mb-6">
          Please classify this incident. If marked as <strong>Misuse</strong>, the configured penalty will be automatically applied to the driver.
        </p>

        <div className="space-y-3 mb-8">
          <label className={`flex items-center p-3 border rounded cursor-pointer ${outcome === 'LEGITIMATE' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="outcome"
              className="mr-3"
              checked={outcome === 'LEGITIMATE'}
              onChange={() => setOutcome('LEGITIMATE')}
            />
            <div>
              <div className="font-semibold text-green-800">Legitimate Emergency</div>
              <div className="text-xs text-green-600">No penalty applied.</div>
            </div>
          </label>

          <label className={`flex items-center p-3 border rounded cursor-pointer ${outcome === 'MISUSE' ? 'border-red-500 bg-red-50' : 'hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="outcome"
              className="mr-3"
              checked={outcome === 'MISUSE'}
              onChange={() => setOutcome('MISUSE')}
            />
            <div>
              <div className="font-semibold text-red-800">Misuse / False Alarm</div>
              <div className="text-xs text-red-600">Applies configured penalty (Fee or Badge Revocation).</div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!outcome || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
          </button>
        </div>
      </div>
    </div>
  );
};