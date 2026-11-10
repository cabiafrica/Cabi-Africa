import React, { useState } from 'react';
import { Upload, CheckCircle, Loader2, X, FileText, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export interface DocumentsData {
  nationalIdUrl: string;
  drivingLicenseUrl: string;
  psvBadgeUrl: string;
  passportPhotoUrl: string;
  aiVerified: boolean;
  aiScore: number;
  userId?: string;
}

interface Props {
  data: DocumentsData;
  onChange: (updates: Partial<DocumentsData>) => void;
  errors: Partial<Record<keyof DocumentsData, string>>;
}

import apiClient from '@/lib/apiClient';

export const Step2Documents: React.FC<Props> = ({ data, onChange, errors }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifError, setVerifError] = useState<string | null>(null);

  const [files, setFiles] = useState<Partial<Record<keyof DocumentsData, File>>>({});

  const handleFileUpload = async (field: keyof DocumentsData, file: File) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    const url = URL.createObjectURL(file);
    onChange({ [field]: url });
  };

  const runAIVerification = async () => {
    if (!data.userId) {
      setVerifError('User ID missing. Please complete Step 1 first.');
      return;
    }

    setIsVerifying(true);
    setVerifError(null);

    try {
      const formData = new FormData();
      // Append all available files
      Object.entries(files).forEach(([key, file]) => {
          if (file) formData.append(key, file);
      });
      
      const response = await apiClient.post('/verification/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const result = response.data;
      onChange({ 
        aiVerified: result.status === 'VERIFIED', 
        aiScore: Math.round(result.confidenceScore * 100) 
      });

      if (result.status === 'FAILED') {
        setVerifError(`Verification failed: ${result.rejectionReason}`);
      }
    } catch (err: any) {
      console.error(err);
      setVerifError(err.response?.data?.message || 'Verification service unreachable');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderUploadBox = (title: string, field: keyof DocumentsData, isMandatory = true) => {
    const hasFile = !!data[field];
    return (
      <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${hasFile ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-300 dark:border-white/15 hover:border-[#D4AF37]'}`}>
        <div className="flex flex-col items-center justify-center space-y-3">
          {hasFile ? (
            <>
              <CheckCircle className="text-4xl text-emerald-500" />
              <p className="font-medium text-emerald-600 dark:text-emerald-400">Document Uploaded</p>
              <button 
                type="button" 
                onClick={() => {
                    onChange({ [field]: '' });
                    setFiles(prev => ({ ...prev, [field]: undefined }));
                }}
                className="text-sm text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{title} {isMandatory ? '*' : ''}</p>
                <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
              <input 
                type="file" 
                id={`file-${field}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field, file);
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`file-${field}`)?.click()}
                className="px-4 py-2 mt-2 text-sm bg-white dark:bg-surface-dark border border-slate-300 dark:border-white/15 rounded-xl shadow-sm hover:border-[#D4AF37] font-semibold"
              >
                Browse File
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          2. Identity & Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload clear, legible photos of your documents. Our AI will automatically verify your identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderUploadBox('Clear Passport Photo (Selfie)', 'passportPhotoUrl')}
        {renderUploadBox('National ID (Front & Back)', 'nationalIdUrl')}
        {renderUploadBox('Driving License', 'drivingLicenseUrl')}
        {renderUploadBox('PSV Badge (Optional)', 'psvBadgeUrl', false)}
      </div>

      {errors.passportPhotoUrl && <p className="text-sm text-red-500">{errors.passportPhotoUrl}</p>}
      {(errors.nationalIdUrl || errors.drivingLicenseUrl) && (
        <p className="text-sm text-red-500">Please upload all mandatory documents before proceeding.</p>
      )}

      {/* AI Verification Section */}
      <div className="mt-8 bg-[#D4AF37]/10 rounded-2xl p-6 border border-[#D4AF37]/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#ffe088] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Document Verification
            </h4>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {data.aiVerified 
                ? `Verification complete (${data.aiScore}% match).`
                : 'Documents must be verified to continue.'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={runAIVerification}
            disabled={isVerifying || data.aiVerified || !data.nationalIdUrl || !data.drivingLicenseUrl || !data.passportPhotoUrl}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#ffe088] disabled:bg-neutral-500 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-md"
          >
            {isVerifying ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Verifying...</>
            ) : data.aiVerified ? (
              <><CheckCircle className="w-4 h-4" /> Verified</>
            ) : (
              'Verify Documents'
            )}
          </button>
        </div>
        {verifError && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/30">
            {verifError}
          </div>
        )}
      </div>
      {errors.aiVerified && <p className="text-sm text-red-500">{errors.aiVerified}</p>}
    </div>
  );
};
