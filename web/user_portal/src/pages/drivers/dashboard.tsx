import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from "react-qr-code";
import { driverLeadService, ProspectStatus } from '../../services/driverLeadService';
import PassportPhotoUploader from '../../components/ui/PassportPhotoUploader';
import { UserCircle2, CheckCircle2, Circle, LogOut, Settings } from 'lucide-react';
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
                id: user?.id || 'new-driver-123',
                firstName: user?.firstName || 'Driver',
                email: user?.email || 'driver@cabi.africa',
                phone: user?.phone || '+254700000000',
                status: 'DOCUMENTS_PENDING',
                submittedDate: new Date().toISOString(),
                nextAction: 'Upload necessary documents to proceed.',
                documents: []
            });
            setLoading(false);
            return;
        }

        // If unauthenticated, redirect to login
        if (!user && typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (!token) {
                router.replace('/login?redirect=/drivers/dashboard');
                return;
            }
        }

        const targetEmail = user?.email || (typeof router.query.email === 'string' ? router.query.email : 'driver@cabi.africa');

        driverLeadService.getProspectStatus(targetEmail)
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load driver prospect status:', err);
                setLoading(false);
            });
    }, [router.isReady, router.query, user]);

    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-white">
            <Head>
                <title>My Application | Cabi Driver</title>
                <meta name="description" content="Track your Cabi driver application status." />
                <meta property="og:title" content="My Application | Cabi Driver" />
            </Head>

            {/* Header / Navbar */}
            <header className="bg-black border-b border-neutral-900 sticky top-16 md:top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-4 overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Driver Portal</span>
                        </div>
                        <nav className="flex items-center gap-2">
                            <Link href="/drivers/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-yellow-400 shadow-sm shadow-yellow-500/20">
                                Dashboard
                            </Link>
                            <Link href="/drivers/demand-analysis" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all flex items-center gap-1.5">
                                <span>Demand Intelligence</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-extrabold">HOT</span>
                            </Link>
                            <Link href="/drivers/sacco" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all">
                                Wealth Creation
                            </Link>
                        </nav>
                    </div>
                    <div>
                        <div className="relative">
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end text-right">
                                    <span className="text-xs font-black text-white leading-tight">
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Driver Account'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Verified Driver
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label="Account Menu"
                                    className="h-11 w-11 rounded-full bg-black border-2 border-yellow-500/70 hover:border-yellow-400 shadow-md shadow-yellow-500/20 flex items-center justify-center text-yellow-400 hover:scale-105 hover:bg-neutral-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                >
                                    <UserCircle2 className="w-7 h-7" />
                                </button>
                            </div>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setIsMenuOpen(false)}
                                    ></div>
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1 bg-neutral-900 border border-neutral-800 z-20">
                                        <div className="px-4 py-2 border-b border-neutral-800">
                                            <p className="text-sm text-white font-medium">Driver Account</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
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
                    <h1 className="text-3xl font-black text-white tracking-tight">Application Status</h1>
                    <p className="mt-2 text-neutral-400 text-sm">Welcome back, {user?.firstName || status?.firstName || 'User'}. Here is the real-time status of your driver application.</p>
                </div>

                {loading ? (
                    <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-yellow"></div>
                    </div>
                ) : status ? (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl overflow-hidden border-l-4 border-l-brand-yellow">
                            <div className="p-6">
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Current Status</h2>
                                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                                    <div className={`
                                        inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider
                                        ${status.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            status.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                status.status === 'PENDING_APPROVAL' ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 animate-pulse' :
                                                    'bg-amber-500/20 text-brand-yellow border border-brand-yellow/30'}
                                    `}>
                                        {status.status.replace(/_/g, ' ')}
                                    </div>
                                    <span className="text-xs text-neutral-500 font-medium">
                                        Submitted on {new Date(status.submittedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next Actions Card */}
                        <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-800">
                                <h3 className="text-base font-bold text-white">Next Steps</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M12 6a2 2 0 00-2 2v6a2 2 0 002 2h.01m-2.01 6a2 2 0 114.02 0 2 2 0 01-4.02 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-white">Action Required</h4>
                                        <p className="mt-2 text-neutral-300 text-sm leading-relaxed">
                                            {status.nextAction}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <a href="#" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-yellow/20">
                                                Download for iOS
                                            </a>
                                            <a href="#" className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-yellow/20">
                                                Download for Android
                                            </a>
                                        </div>
                                        <p className="mt-3 text-xs text-neutral-400">
                                            Open the app and log in with <strong className="text-brand-yellow">{status.email}</strong> to continue.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Upload Section (Visible when Pending) */}
                        {status.status === 'DOCUMENTS_PENDING' && (
                            <div className="bg-neutral-900 border border-brand-yellow/30 shadow-xl rounded-2xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-neutral-800 bg-black/40">
                                    <h3 className="text-base font-bold text-brand-yellow">Required Documents</h3>
                                    <p className="mt-1 text-xs text-neutral-400">Please upload clear photos of the following documents to verify your identity.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Passport Photo */}
                                    <div className="border border-neutral-800 rounded-xl p-4 bg-black/40">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <label className="block text-sm font-bold text-white">Professional Passport Photo <span className="text-amber-500">*</span></label>
                                                <p className="text-xs text-neutral-400 mt-0.5">Face must be clearly visible with good lighting.</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                Required
                                            </span>
                                        </div>
                                        <div className="mt-3 bg-neutral-900 rounded-xl p-2 border border-neutral-800">
                                            <PassportPhotoUploader
                                                onFileSelect={(file) => {
                                                    console.log("Photo selected:", file);
                                                }}
                                                label="Upload or take a photo"
                                                aspectRatio={1}
                                            />
                                        </div>
                                    </div>

                                    {/* National ID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-neutral-800 rounded-xl p-4 bg-black/40">
                                            <label className="block text-sm font-bold text-white mb-2">National ID (Front)</label>
                                            <input type="file" className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-brand-yellow hover:file:bg-neutral-700" />
                                        </div>
                                        <div className="border border-neutral-800 rounded-xl p-4 bg-black/40">
                                            <label className="block text-sm font-bold text-white mb-2">National ID (Back)</label>
                                            <input type="file" className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-brand-yellow hover:file:bg-neutral-700" />
                                        </div>
                                    </div>

                                    {/* Driving License */}
                                    <div className="border border-neutral-800 rounded-xl p-4 bg-black/40">
                                        <label className="block text-sm font-bold text-white mb-2">Driving License</label>
                                        <input type="file" className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-brand-yellow hover:file:bg-neutral-700" />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleSubmitDocuments}
                                            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-yellow/20 text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-400 uppercase tracking-wider transition-all"
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
                                <div className="bg-amber-500/10 border-l-4 border-brand-yellow p-5 rounded-2xl border border-amber-500/20">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-brand-yellow" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-bold text-brand-yellow">
                                                Application Verification in Progress
                                            </h3>
                                            <div className="mt-1 text-xs text-neutral-300 leading-relaxed">
                                                <p>
                                                    We are reviewing your submission. You can see the status of each item below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Per-Item Approval Status */}
                                <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl overflow-hidden">
                                    <div className="px-6 py-5 border-b border-neutral-800">
                                        <h3 className="text-base font-bold text-white">Verification Details</h3>
                                    </div>
                                    <div className="divide-y divide-neutral-800">
                                        {[
                                            { label: 'Basic Info', status: 'Approved', note: 'Verified by system' },
                                            { label: 'Passport Photo', status: 'Pending Review', note: 'Checking image quality' },
                                            { label: 'National ID', status: 'Pending Review', note: 'Verifying details against registry' },
                                            { label: 'Driving License', status: 'Pending Review', note: 'Validity check in progress' },
                                            { label: 'Background Check', status: 'Pending', note: 'Not started' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="px-6 py-4 flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-bold text-white">{item.label}</div>
                                                    <div className="text-xs text-neutral-400">{item.note}</div>
                                                </div>
                                                <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-black uppercase tracking-wider rounded-full border 
                                                    ${item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                        item.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                                            'bg-amber-500/20 text-brand-yellow border-amber-500/30'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Referral Section (Always Visible for Applicants) */}
                        <div className="bg-gradient-to-br from-neutral-900 via-black to-neutral-950 rounded-2xl border border-brand-yellow/30 shadow-2xl text-white overflow-hidden">
                            <div className="px-6 py-5 border-b border-neutral-800 bg-brand-yellow/5">
                                <h3 className="text-base font-bold text-brand-yellow">Refer & Earn</h3>
                                <p className="text-neutral-400 text-xs mt-0.5">Share your unique code to build your network.</p>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                                <div className="bg-white p-3 rounded-2xl shadow-inner border border-neutral-800 shrink-0">
                                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }}>
                                        <QRCode
                                            size={256}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            value={'https://cabi.africa/register?ref=DRIVER123'}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-xs text-neutral-400 uppercase font-black tracking-widest mb-1">Your Referral Code</div>
                                    <div className="text-3xl font-black mb-3 font-mono tracking-widest text-brand-yellow">DRIVER123</div>
                                    <p className="text-neutral-300 text-xs leading-relaxed mb-5 max-w-md">
                                        Invite fellow drivers and passengers. Earn 2-level recurring referral shares from driver earnings and passenger ride usage in Ksh.
                                    </p>
                                    <button className="bg-brand-yellow text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-yellow/20">
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Progress Visualization */}
                        <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl p-6">
                            <h3 className="text-base font-bold text-white mb-6">Onboarding Progress</h3>
                            <div className="relative">
                                <div className="absolute left-4 top-0 h-full w-0.5 bg-neutral-800" aria-hidden="true"></div>
                                <ul className="space-y-8 relative">
                                    <li className="flex gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-neutral-900">
                                            <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <div>
                                            <p className="font-bold text-white text-sm">Web Registration</p>
                                            <p className="text-xs text-neutral-500">Completed</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-neutral-900 ${status.status === 'DOCUMENTS_PENDING' ? 'bg-brand-yellow animate-pulse text-black' : 'bg-emerald-500'}`}>
                                            {status.status === 'DOCUMENTS_PENDING' ? <span className="h-2.5 w-2.5 rounded-full bg-black" /> : (
                                                <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                        <div>
                                            <p className="font-bold text-white text-sm">Document Submission</p>
                                            <p className="text-xs text-neutral-400">{status.status === 'DOCUMENTS_PENDING' ? 'In Progress' : 'Completed'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-neutral-900 ${status.status === 'PENDING_APPROVAL' ? 'bg-brand-yellow text-black' : 'bg-neutral-800'}`}>
                                            {status.status === 'PENDING_APPROVAL'
                                                ? <CheckCircle2 className="w-4 h-4 text-black" />
                                                : <Circle className="w-4 h-4 text-neutral-600" />
                                            }
                                        </span>
                                        <div>
                                            <p className="font-bold text-white text-sm">Background Check</p>
                                            <p className="text-xs text-neutral-500">{status.status === 'PENDING_APPROVAL' ? 'Under Review' : 'Pending'}</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 ring-4 ring-neutral-900">
                                            <Circle className="w-4 h-4 text-neutral-600" />
                                        </span>
                                        <div>
                                            <p className="font-bold text-white text-sm">Activation</p>
                                            <p className="text-xs text-neutral-500">Pending</p>
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
