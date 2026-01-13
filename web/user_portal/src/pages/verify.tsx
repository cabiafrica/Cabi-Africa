import React from 'react';
import VerificationFlow from '@/components/verification/VerificationFlow';
import MainLayout from '@/components/layout/MainLayout';

export default function VerifyPage() {
    const handleComplete = (data: any) => {
        console.log('Verification Complete:', data);
        alert('Verification Complete! Check console.');
    };

    return (
        <MainLayout title="Identity Verification" description="Verify your identity">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2 text-brand-yellow">Identity Verification</h1>
                        <p className="text-gray-400">Please verify your identity to continue using Cabi</p>
                    </div>

                    <VerificationFlow
                        userId="test-user-123"
                        userRole="driver"
                        providedFields={{
                            firstName: "JOHN",
                            lastName: "DOE",
                            idNumber: "12345678"
                        }}
                        onComplete={handleComplete}
                    />
                </div>
            </div>
        </MainLayout>
    );
}
