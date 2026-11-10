import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import VerificationFlow from '../components/verification/VerificationFlow';
import RandomBiometricCheck from '../components/verification/RandomBiometricCheck';
import { FaShieldAlt } from 'react-icons/fa';

export default function VerificationDemo() {
    const [showFlow, setShowFlow] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const [verificationData, setVerificationData] = useState<any>(null);
    const [showRandomCheck, setShowRandomCheck] = useState(false);

    // Mock user data for testing
    const mockUser = {
        id: 'test-user-123',
        role: 'driver' as const,
        providedFields: {
            fullName: 'John Kamau Mwangi',
            idNumber: '12345678',
            dateOfBirth: '1990-03-15',
            licenseNumber: 'DL-9876543',
        },
    };

    const handleVerificationComplete = (data: any) => {
        setVerificationData(data);
        setVerificationComplete(true);
    };

    return (
        <div className="min-h-screen bg-brand-black text-white">
            <Head>
                <title>Verification Demo - Cabi Africa</title>
            </Head>

            {/* Random Check Component (Hidden unless triggered) */}
            {showRandomCheck && (
                <RandomBiometricCheck
                    userId={mockUser.id}
                    documentVerificationId={verificationData?.documentVerificationId || 'mock-doc-id'}
                    onCheckComplete={() => {
                        setShowRandomCheck(false);
                        alert('Random check verification successful!');
                    }}
                />
            )}

            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <div className="mb-12 flex justify-between items-center">
                    <Link href="/" className="text-3xl font-bold tracking-tighter hover:text-brand-yellow transition-colors">
                        Cabi <span className="text-brand-yellow">.</span>
                    </Link>
                    <div className="text-sm text-gray-400">
                        <Link href="/register" className="text-brand-yellow hover:underline">
                            Back to Registration
                        </Link>
                    </div>
                </div>

                {!showFlow && !verificationComplete ? (
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Document Verification <span className="text-gradient">Demo</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8">
                            Test the complete verification flow with document upload, field mapping, and biometric verification.
                        </p>

                        <div className="glass p-8 rounded-2xl border-t border-brand-yellow/20 mb-8">
                            <h3 className="text-xl font-bold mb-4">Test User Information</h3>
                            <div className="text-left space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">User ID:</span>
                                    <span className="font-mono">{mockUser.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">Role:</span>
                                    <span className="capitalize">{mockUser.role}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">Full Name:</span>
                                    <span>{mockUser.providedFields.fullName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">ID Number:</span>
                                    <span className="font-mono">{mockUser.providedFields.idNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-400">Date of Birth:</span>
                                    <span>{mockUser.providedFields.dateOfBirth}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-400">License Number:</span>
                                    <span className="font-mono">{mockUser.providedFields.licenseNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-dark/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
                            <h4 className="font-bold mb-3">📋 Test Instructions</h4>
                            <ol className="text-sm text-gray-400 space-y-2 ml-5 list-decimal">
                                <li>Click "Start Verification" below</li>
                                <li>Select document type (use sample documents from the guide)</li>
                                <li>Upload a document image</li>
                                <li>Review the extracted fields vs provided fields</li>
                                <li>Validate the fields</li>
                                <li>Capture a selfie for biometric verification</li>
                                <li>Complete the verification process</li>
                            </ol>
                        </div>

                        <button
                            onClick={() => setShowFlow(true)}
                            className="px-8 py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors text-lg"
                        >
                            Start Verification Demo
                        </button>

                        <div className="mt-8 pt-8 border-t border-gray-800">
                            <h4 className="font-bold mb-4 text-gray-400">Additional Tests</h4>
                            <button
                                onClick={() => setShowRandomCheck(true)}
                                className="px-6 py-3 bg-card-dark hover:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                                <FaShieldAlt className="text-brand-yellow" />
                                Test Random Biometric Check
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                Simulates a random or scheduled security check overlay
                            </p>
                        </div>

                    </div>
                ) : verificationComplete ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="glass p-12 rounded-2xl border-t border-green-500/20 text-center">
                            <div className="h-24 w-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold mb-4">Verification Complete!</h2>
                            <p className="text-gray-400 mb-8">
                                The verification process has been successfully completed.
                            </p>

                            <div className="bg-brand-dark/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
                                <h4 className="font-bold mb-4">Verification Results</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Document Verification ID:</span>
                                        <span className="font-mono text-xs">{verificationData?.documentVerificationId}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Biometric Verification ID:</span>
                                        <span className="font-mono text-xs">{verificationData?.biometricVerificationId}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Status:</span>
                                        <span className="text-green-500 font-bold">{verificationData?.status}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-800">
                                        <span className="text-gray-400">Face Match Score:</span>
                                        <span>{(verificationData?.matchScore * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-400">Liveness Score:</span>
                                        <span>{(verificationData?.livenessScore * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowFlow(false);
                                        setVerificationComplete(false);
                                        setVerificationData(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-card-dark hover:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white font-bold rounded-lg transition-colors"
                                >
                                    Test Again
                                </button>
                                <Link
                                    href="/register"
                                    className="flex-1 px-6 py-3 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors text-center"
                                >
                                    Go to Registration
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                            <h4 className="font-bold mb-4 text-gray-400">Additional Tests</h4>
                            <button
                                onClick={() => setShowRandomCheck(true)}
                                className="px-6 py-3 bg-card-dark hover:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                                <FaShieldAlt className="text-brand-yellow" />
                                Test Random Biometric Check
                            </button>
                        </div>

                    </div>
                ) : (
                    <VerificationFlow
                        userId={mockUser.id}
                        userRole={mockUser.role}
                        providedFields={mockUser.providedFields}
                        onComplete={handleVerificationComplete}
                    />
                )}
            </div>
        </div>
    );
}
