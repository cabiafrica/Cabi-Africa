'use client';

import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isConfirming?: boolean;
  confirmButtonClass?: string;
  reasonConfig?: {
    label: string;
    reason: string;
    setReason: (reason: string) => void;
  };
}

export default function ConfirmationModal({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isConfirming = false,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  reasonConfig,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            {reasonConfig && (
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">{reasonConfig.label}</label>
                <textarea id="reason" name="reason" rows={3} value={reasonConfig.reason} onChange={(e) => reasonConfig.setReason(e.target.value)} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md" required />
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button type="button" disabled={isConfirming || (reasonConfig && !reasonConfig.reason)} onClick={onConfirm} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 ${confirmButtonClass}`}>
            {isConfirming ? 'Processing...' : confirmText}
          </button>
          <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}