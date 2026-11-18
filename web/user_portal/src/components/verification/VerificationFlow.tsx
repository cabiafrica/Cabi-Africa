import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import FieldMapping from './FieldMapping';
import BiometricCapture from './BiometricCapture';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface VerificationFlowProps {
    userId: string;
    userRole: 'passenger' | 'driver';
    providedFields: any;
    onComplete: (verificationData: any) => void;
}

type Step = 'document-type' | 'document-upload' | 'field-validation' | 'biometric' | 'complete';

export default function VerificationFlow({
    userId,
    userRole,
    providedFields,
    onComplete,
}: VerificationFlowProps) {
    const [currentStep, setCurrentStep] = useState<Step>('document-type');
    const [documentType, setDocumentType] = useState<'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT'>('NATIONAL_ID');
    const [verificationId, setVerificationId] = useState<string>('');
    const [extractedFields, setExtractedFields] = useState<any>({});
    const [matchResults, setMatchResults] = useState<any[]>([]);
    const [validationStatus, setValidationStatus] = useState<'PENDING' | 'VERIFIED' | 'FAILED'>('PENDING');
    const [biometricVerificationId, setBiometricVerificationId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [validating, setValidating] = useState(false);

    const handleDocumentUploadSuccess = (id: string, fields: any) => {
        setVerificationId(id);
        setExtractedFields(fields);
        setError('');
        setCurrentStep('field-validation');
    };

    const handleDocumentUploadError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const handleValidateFields = async () => {
        setValidating(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3003/api/v1/verification/document/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verificationId,
                    providedFields,
                }),
            });

            if (!response.ok) {
                throw new Error('Validation failed');
            }

            const data = await response.json();
            setMatchResults(data.matchResults);
            setValidationStatus(data.status);

            if (data.allFieldsMatch) {
                // Move to biometric verification
                setTimeout(() => {
                    setCurrentStep('biometric');
                }, 1500);
            } else {
                setError('Some fields do not match. Please re-upload your document with better quality.');
            }
        } catch (error) {
            console.error('Validation error:', error);
            setError('Failed to validate fields. Please try again.');
        } finally {
            setValidating(false);
        }
    };

    const handleBiometricSuccess = (id: string, matchScore: number, livenessScore: number) => {
        setBiometricVerificationId(id);
        setError('');
        setCurrentStep('complete');

        // Call parent completion handler
        setTimeout(() => {
            onComplete({
                documentVerificationId: verificationId,
                biometricVerificationId: id,
                status: 'VERIFIED',
                matchScore,
                livenessScore,
            });
        }, 2000);
    };

    const handleBiometricError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const getStepNumber = () => {
        const steps = ['document-type', 'document-upload', 'field-validation', 'biometric', 'complete'];
        return steps.indexOf(currentStep) + 1;
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">
                        Step {getStepNumber()} of 4
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                        {Math.round((getStepNumber() / 4) * 100)}% Complete
                    </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-yellow transition-all duration-500"
                        style={{ width: `${(getStepNumber() / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Step Content */}
            <div className="glass p-8 rounded-2xl border-t border-brand-yellow/20">
                {currentStep === 'document-type' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Select Document Type</h3>
                            <p className="text-gray-400">
                                Choose the type of identification document you'll be uploading.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDocumentType('NATIONAL_ID');
                                    setCurrentStep('document-upload');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setDocumentType('NATIONAL_ID');
                                        setCurrentStep('document-upload');
                                    }
                                }}
                                className="w-full p-4 bg-brand-dark hover:bg-gray-800 border border-gray-700 hover:border-brand-yellow rounded-lg transition-all text-left"
                            >
                                <h4 className="font-bold mb-1">National ID Card</h4>
                                <p className="text-sm text-gray-400">Kenyan National Identity Card</p>
                            </button>

                            {userRole === 'driver' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDocumentType('DRIVERS_LICENSE');
                                        setCurrentStep('document-upload');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setDocumentType('DRIVERS_LICENSE');
                                            setCurrentStep('document-upload');
                                        }
                                    }}
                                    className="w-full p-4 bg-brand-dark hover:bg-gray-800 border border-gray-700 hover:border-brand-yellow rounded-lg transition-all text-left"
                                >
                                    <h4 className="font-bold mb-1">Driver's License</h4>
                                    <p className="text-sm text-gray-400">Valid Kenyan Driving License</p>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setDocumentType('PASSPORT');
                                    setCurrentStep('document-upload');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setDocumentType('PASSPORT');
                                        setCurrentStep('document-upload');
                                    }
                                }}
                                className="w-full p-4 bg-brand-dark hover:bg-gray-800 border border-gray-700 hover:border-brand-yellow rounded-lg transition-all text-left"
                            >
                                <h4 className="font-bold mb-1">Passport</h4>
                                <p className="text-sm text-gray-400">International Passport</p>
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'document-upload' && (
                    <DocumentUpload
                        documentType={documentType}
                        userId={userId}
                        onUploadSuccess={handleDocumentUploadSuccess}
                        onUploadError={handleDocumentUploadError}
                    />
                )}

                {currentStep === 'field-validation' && (
                    <div className="space-y-6">
                        <FieldMapping
                            extractedFields={extractedFields}
                            providedFields={providedFields}
                            matchResults={matchResults}
                            documentType={documentType}
                        />

                        {matchResults.length === 0 ? (
                            <button
                                type="button"
                                onClick={handleValidateFields}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleValidateFields();
                                    }
                                }}
                                disabled={validating}
                                className="w-full py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {validating ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    'Validate Fields'
                                )}
                            </button>
                        ) : validationStatus === 'VERIFIED' ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-center">
                                <FaCheckCircle className="inline-block text-2xl mb-2" />
                                <p className="font-bold">Document Verified!</p>
                                <p className="text-sm">Proceeding to biometric verification...</p>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setCurrentStep('document-upload')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setCurrentStep('document-upload');
                                    }
                                }}
                                className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Re-upload Document
                            </button>
                        )}
                    </div>
                )}

                {currentStep === 'biometric' && (
                    <BiometricCapture
                        userId={userId}
                        documentVerificationId={verificationId}
                        onCaptureSuccess={handleBiometricSuccess}
                        onCaptureError={handleBiometricError}
                    />
                )}

                {currentStep === 'complete' && (
                    <div className="text-center py-12">
                        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="text-green-500 text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Verification Complete!</h3>
                        <p className="text-gray-400 mb-6">
                            Your identity has been successfully verified. You can now proceed with your registration.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <FaSpinner className="animate-spin" />
                            Completing registration...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
