import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { driverLeadService, ProspectStatus } from '../../services/driverLeadService';

// Simple mock Auth context or similar could be used here, 
// for now we'll simulate fetching for a hardcoded user or from query param.

export default function ApplicationDashboard() {
    const [status, setStatus] = useState<ProspectStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching for the currently logged in user
        driverLeadService.getProspectStatus('driver@example.com')
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

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
                        {/* User Profile / Logout would go here */}
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            👤
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
                    <p className="mt-2 text-gray-600">Welcome back, {status?.firstName || 'User'}. Here is the status of your driver application.</p>
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
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${status.status === 'DOCUMENTS_PENDING' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-200'}`}>
                                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Document Submission</p>
                                            <p className="text-sm text-gray-500">{status.status === 'DOCUMENTS_PENDING' ? 'In Progress' : 'Pending'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-4 ring-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-white" />
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">Background Check</p>
                                            <p className="text-sm text-gray-500">Pending</p>
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
