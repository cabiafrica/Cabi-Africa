import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Car, Shield, AlertCircle, CheckCircle2, ArrowLeft, Upload, FileText, Sparkles, Send } from 'lucide-react';

export default function ReportBenefitPage() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [benefits, setBenefits] = useState<any[]>([]);
    const [loadingBenefits, setLoadingBenefits] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [selectedBenefit, setSelectedBenefit] = useState('');
    const [notes, setNotes] = useState('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

    const driverProfileId = user?.driverProfileId || user?.id || 'mock-driver-123';

    useEffect(() => {
        const fetchBenefits = async () => {
            try {
                const res = await fetch('/api/vehicles/benefits');
                const data = await res.json();
                if (data.success) {
                    setBenefits(data.benefits);
                }
            } catch (err) {
                console.error('Failed to load benefits list', err);
            } finally {
                setLoadingBenefits(false);
            }
        };
        fetchBenefits();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !selectedBenefit) {
            setError('Please select a benefit.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('benefitId', selectedBenefit);
            formData.append('reportedByDriverId', driverProfileId);
            formData.append('notes', notes);
            if (evidenceFile) {
                formData.append('evidence', evidenceFile);
            }

            const res = await fetch(`/api/vehicles/${id}/claims`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/drivers/vehicles/${id}`);
                }, 2000);
            } else {
                setError(data.message || 'Failed to submit claim.');
            }
        } catch (err: any) {
            setError(err.message || 'Network error submitting claim.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout title="Self-Report Benefit Claim | Cabi" description="Report vehicle maintenance, compliance, or service benefits to maintain premium vehicle account standing.">
            <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Back navigation */}
                    <div className="mb-8">
                        <Link href={`/drivers/vehicles/${id}`} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-yellow-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Vehicle Account
                        </Link>
                    </div>

                    {/* Header Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-8 sm:p-12 mb-12 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 text-black font-black text-xs uppercase tracking-widest backdrop-blur-md mb-4">
                                <Sparkles className="w-4 h-4 text-black animate-spin" /> Verification Protocol Active
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-2">
                                Self-Report Benefit
                            </h1>
                            <p className="text-black/80 font-medium text-lg max-w-xl">
                                Submit maintenance receipts, inspection pass certificates, or service logs to unlock vehicle qualifications.
                            </p>
                        </div>
                    </div>

                    {success ? (
                        <div className="bg-emerald-500/20 border border-emerald-500 rounded-3xl p-12 text-center backdrop-blur-xl animate-fadeIn">
                            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6 animate-bounce" />
                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Claim Submitted Successfully!</h2>
                            <p className="text-slate-300 mb-8 max-w-md mx-auto">
                                Your benefit self-report has been queued for admin verification. Redirecting you back to your vehicle account...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-slate-800/40 rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-8">
                            {error && (
                                <div className="flex items-center gap-4 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-2xl animate-fadeIn">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-bold">{error}</span>
                                </div>
                            )}

                            {/* Benefit Dropdown */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">
                                    Select Benefit Category <span className="text-red-500">*</span>
                                </label>
                                {loadingBenefits ? (
                                    <div className="p-4 bg-black/30 rounded-2xl border border-white/5 text-slate-400 animate-pulse">Loading available benefits...</div>
                                ) : (
                                    <select
                                        value={selectedBenefit}
                                        onChange={(e) => setSelectedBenefit(e.target.value)}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold text-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                                    >
                                        <option value="" disabled className="text-slate-500">-- Choose Benefit Item --</option>
                                        {benefits.map((b) => (
                                            <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                                {b.iconEmoji} {b.name} ({b.category})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Notes Textarea */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">
                                    Description & Notes <span className="text-slate-500">(Optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Provide details about the service, garage name, mileage, or inspection details..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 font-medium focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
                                />
                            </div>

                            {/* File Upload Input */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">
                                    Evidence Document / Receipt Photo <span className="text-slate-500">(Optional)</span>
                                </label>
                                <div className="relative border-2 border-dashed border-white/20 hover:border-yellow-500/50 rounded-3xl p-8 text-center transition-all bg-black/20 group">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-base mb-1">
                                                {evidenceFile ? evidenceFile.name : 'Click to Upload or Drag & Drop'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">PNG, JPG, or PDF up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting || !selectedBenefit}
                                className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 text-black font-black text-base uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 transform hover:scale-[1.02] active:scale-95"
                            >
                                {submitting ? (
                                    <span className="animate-spin">🔄 Submitting Claim...</span>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" /> Submit Benefit Claim
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
