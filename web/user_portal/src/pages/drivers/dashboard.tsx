import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from "react-qr-code";
import { driverLeadService, ProspectStatus } from '../../services/driverLeadService';
import PassportPhotoUploader from '../../components/ui/PassportPhotoUploader';
// import { useLogout } from '@/hooks/useLogout'; // handled by useAuth
import { useAuth } from '@/context/AuthContext';

// Simple mock Auth context or similar could be used here, 
// for now we'll simulate fetching for a hardcoded user or from query param.

export default function ApplicationDashboard() {
    const [status, setStatus] = useState<ProspectStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const router = useRouter();

    const handleSubmitDocuments = () => {
        // Simulate document submission
        setStatus(prev => prev ? ({
            ...prev,
            status: 'PENDING_APPROVAL',
            nextAction: 'Wait for verification.',
        }) : null);
    };

    useEffect(() => {
        if (!router.isReady) return;

        // If newly registered (simulated by query param), show Documents Pending state immediately
        if (router.query.new_applicant === 'true') {
            setStatus({
                id: 'new-driver-123',
                firstName: 'Driver',
                email: 'driver@cabi.com',
                phone: '+254700000000',
                status: 'DOCUMENTS_PENDING',
                submittedDate: new Date().toISOString(),
                nextAction: 'Upload necessary documents to proceed.',
                documents: []
            });
            setLoading(false);
            return;
        }

        // Otherwise simulate fetching for the currently logged in user
        driverLeadService.getProspectStatus('driver@example.com')
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [router.isReady, router.query]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Head>
                <title>My Application | Cabi Driver</title>
                <meta name="description" content="Track your Cabi driver application status." />
            </Head>

            {/* Header / Navbar */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                            Cabi
                        </span>
                        <span className="text-gray-500 text-sm border-l pl-2 ml-2 border-gray-300">Driver Portal</span>
                    </div>
                    <div>
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                👤
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setIsMenuOpen(false)}
                                    ></div>
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm text-gray-700 font-medium">Driver Account</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
                    <p className="mt-2 text-gray-600">Welcome back, {user?.firstName || status?.firstName || 'User'}. Here is the status of your driver application.</p>
                </div>

                {loading ? (
                    <div className="bg-white shadow rounded-lg p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                    </div>
                ) : status ? (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white shadow rounded-lg overflow-hidden border-l-4 border-yellow-500">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
                                <div className="mt-4 flex items-center">
                                    <div className={`
                                        inline-flex items-center px-4 py-2 rounded-full text-sm font-bold
                                        ${status.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            status.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                status.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}
                                    `}>
                                        {status.status.replace(/_/g, ' ')}
                                    </div>
                                    <span className="ml-4 text-sm text-gray-500">
                                        Submitted on {new Date(status.submittedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next Actions Card */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Next Steps</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                                            {/* Icon */}
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M12 6a2 2 0 00-2 2v6a2 2 0 002 2h.01m-2.01 6a2 2 0 114.02 0 2 2 0 01-4.02 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-bold text-gray-900">Action Required</h4>
                                        <p className="mt-2 text-gray-600">
                                            {status.nextAction}
                                        </p>
                                        <div className="mt-4 space-x-4">
                                            <a href="#" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none">
                                                Download for iOS
                                            </a>
                                            <a href="#" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none">
                                                Download for Android
                                            </a>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400">
                                            Open the app and log in with <strong>{status.email}</strong> to continue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Upload Section (Visible when Pending) */}
                        {status.status === 'DOCUMENTS_PENDING' && (
                            <div className="bg-white shadow rounded-lg overflow-hidden border-2 border-indigo-100">
                                <div className="px-6 py-5 border-b border-gray-200 bg-indigo-50">
                                    <h3 className="text-lg leading-6 font-bold text-indigo-900">Required Documents</h3>
                                    <p className="mt-1 text-sm text-indigo-700">Please upload clear photos of the following documents to verify your identity.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Passport Photo */}
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900">Professional Passport Photo <span className="text-red-500">*</span></label>
                                                <p className="text-xs text-gray-500">Analysis: Face must be clearly visible, white background preferred.</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Required
                                            </span>
                                        </div>
                                        <div className="mt-2 bg-white rounded-md">
                                            <PassportPhotoUploader
                                                onFileSelect={(file) => {
                                                    console.log("Photo selected:", file);
                                                    // In a real app, we would upload this file here or store in state
                                                }}
                                                label="Upload or take a photo"
                                                aspectRatio={1}
                                            />
                                        </div>
                                    </div>

                                    {/* National ID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">National ID (Front)</label>
                                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                            <label className="block text-sm font-medium text-gray-900 mb-2">National ID (Back)</label>
                                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                        </div>
                                    </div>

                                    {/* Driving License */}
                                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Driving License</label>
                                        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleSubmitDocuments}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Submit Documents for Verification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status for PENDING_APPROVAL and later */}
                        {status.status === 'PENDING_APPROVAL' && (
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm leading-5 font-medium text-yellow-800">
                                                Application Verification in Progress
                                            </h3>
                                            <div className="mt-2 text-sm leading-5 text-yellow-700">
                                                <p>
                                                    We are reviewing your submission. You can see the status of each item below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Per-Item Approval Status */}
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-5 border-b border-gray-200">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Details</h3>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {[
                                            { label: 'Basic Info', status: 'Approved', note: 'Verified by system' },
                                            { label: 'Passport Photo', status: 'Pending Review', note: 'Checking image quality' },
                                            { label: 'National ID', status: 'Pending Review', note: 'Verifying details against registry' },
                                            { label: 'Driving License', status: 'Pending Review', note: 'Validity check in progress' },
                                            { label: 'Background Check', status: 'Pending', note: 'Not started' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="px-6 py-4 flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                                                    <div className="text-xs text-gray-500">{item.note}</div>
                                                </div>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Referral Section (Always Visible for Applicants) */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg text-white overflow-hidden">
                            <div className="px-6 py-5 border-b border-purple-400/30">
                                <h3 className="text-lg leading-6 font-bold">Refer & Earn</h3>
                                <p className="text-purple-100 text-sm mt-1">Share your unique code to build your network.</p>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                                <div className="bg-white p-4 rounded-xl shadow-inner">
                                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }}>
                                        <QRCode
                                            size={256}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            value={'https://cabi.com/register?ref=DRIVER123'}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-purple-200 text-sm uppercase font-bold tracking-wider mb-2">Your Referral Code</div>
                                    <div className="text-4xl font-extrabold mb-4 font-mono tracking-widest">DRIVER123</div>
                                    <p className="text-purple-100 mb-6">
                                        Invite other drivers and passengers. Earn 5% commission on their first 50 trips.
                                    </p>
                                    <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors shadow-lg">
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Progress Visualization (Optional Mock) */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Onboarding Progress</h3>
                            <div className="relative">
                                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                                <ul className="space-y-8 relative">
                                    <li className="flex gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-4 ring-white">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Web Registration</p>
                                            <p className="text-sm text-gray-500">Completed</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${status.status === 'DOCUMENTS_PENDING' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}>
                                            {status.status === 'DOCUMENTS_PENDING' ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : (
                                                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Document Submission</p>
                                            <p className="text-sm text-gray-500">{status.status === 'DOCUMENTS_PENDING' ? 'In Progress' : 'Completed'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${status.status === 'PENDING_APPROVAL' ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'}`}>
                                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Background Check</p>
                                            <p className="text-sm text-gray-500">{status.status === 'PENDING_APPROVAL' ? 'Under Review' : 'Pending'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-4 ring-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Activation</p>
                                            <p className="text-sm text-gray-500">Pending</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-red-500">Failed to load application status.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
