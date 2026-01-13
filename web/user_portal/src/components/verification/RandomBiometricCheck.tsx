import React, { useEffect, useState } from 'react';
import BiometricCapture from './BiometricCapture';
import { FaLock, FaClock, FaRandom } from 'react-icons/fa';

interface RandomBiometricCheckProps {
    userId: string;
    documentVerificationId: string; // We'll need this to link the selfie
    onCheckComplete?: () => void;
}

export default function RandomBiometricCheck({
    userId,
    documentVerificationId,
    onCheckComplete,
}: RandomBiometricCheckProps) {
    const [isRequired, setIsRequired] = useState(false);
    const [checkReason, setCheckReason] = useState<'INITIAL' | 'RANDOM' | 'REGULAR'>('REGULAR');
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        checkRequirement();
    }, [userId]);

    const checkRequirement = async () => {
        try {
            const response = await fetch(`http://localhost:3003/api/v1/verification/biometric/required/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setIsRequired(data.required);
                if (data.reason) {
                    setCheckReason(data.reason);
                }
            }
        } catch (error) {
            console.error('Error checking biometric requirement:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleCaptureSuccess = () => {
        setIsRequired(false);
        if (onCheckComplete) {
            onCheckComplete();
        }
    };

    const handleCaptureError = (error: string) => {
        console.error('Biometric check failed:', error);
        // User cannot proceed until success
    };

    if (isChecking || !isRequired) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-brand-dark border border-brand-yellow/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="h-16 w-16 bg-brand-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {checkReason === 'RANDOM' ? (
                            <FaRandom className="text-brand-yellow text-2xl" />
                        ) : (
                            <FaClock className="text-brand-yellow text-2xl" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Security Check Required</h2>
                    <p className="text-gray-400">
                        {checkReason === 'RANDOM'
                            ? 'This is a random security check to verify your identity.'
                            : 'It has been a while since your last verification. Please verify your identity to continue.'}
                    </p>
                </div>

                <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
                    <BiometricCapture
                        userId={userId}
                        documentVerificationId={documentVerificationId}
                        onCaptureSuccess={handleCaptureSuccess}
                        onCaptureError={handleCaptureError}
                    />
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <FaLock />
                    <span>Your session is locked until verification is complete</span>
                </div>
            </div>
        </div>
    );
}
