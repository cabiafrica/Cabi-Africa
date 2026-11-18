import React, { useEffect, useState, FormEvent } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Headset, ShieldCheck, Wallet, Car, CheckCircle2 } from 'lucide-react';

export default function DriverConciergePage() {
    const { user } = useAuth();
    const [category, setCategory] = useState('PSV_COMPLIANCE');
    const [subject, setSubject] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const getAuthToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('authToken') || localStorage.getItem('token');
    };

    const loadTickets = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch('/api/concierge', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) setTickets(data.requests || []);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (user?.phone && !driverPhone) {
            setDriverPhone(user.phone);
        }
        loadTickets();
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback(null);
        try {
            const token = getAuthToken();
            const res = await fetch('/api/concierge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ category, subject, driverPhone: driverPhone || user?.phone, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit concierge request');
            setSubject('');
            setMessage('');
            setFeedback(data.message);
            loadTickets();
        } catch (err: any) {
            setFeedback(err.message || 'Error submitting request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout
            title="Driver Concierge | CABI Africa"
            description="24/7 dedicated Driver Concierge for PSV compliance, vehicle transfers, instant payouts, and shift support."
        >
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-3">
                            <Headset className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                                24/7 Partner Support
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Driver Concierge
                        </h1>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
                            Priority assistance for PSV cab compliance, vehicle plate transfers, Airtel Money &amp; M-Pesa instant payouts, and on-road dispatch.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">PSV &amp; NTSA Desk</h3>
                            <p className="text-xs text-neutral-500 mt-1">Fast-track badge, inspection &amp; insurance verification.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Car className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Vehicle Transfers</h3>
                            <p className="text-xs text-neutral-500 mt-1">Plate release &amp; fleet reassignment concierge.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                            <Wallet className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Instant Payout Help</h3>
                            <p className="text-xs text-neutral-500 mt-1">M-Pesa &amp; Airtel Money B2C disbursement desk.</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 shadow-xl space-y-5"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Concierge Desk
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                >
                                    <option value="PSV_COMPLIANCE">PSV Cab &amp; NTSA Compliance</option>
                                    <option value="VEHICLE_TRANSFER">Vehicle Plate Transfer / Release</option>
                                    <option value="INSTANT_PAYOUT">Instant Payouts (M-Pesa / Airtel)</option>
                                    <option value="LOST_AND_FOUND">Lost &amp; Found Office Drop-off</option>
                                    <option value="ON_ROAD_DISPATCH">On-Road Dispatch Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Driver Phone
                                </label>
                                <input
                                    type="tel"
                                    value={driverPhone}
                                    onChange={(e) => setDriverPhone(e.target.value)}
                                    placeholder="+254 712 345 678"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Need help releasing plate KDA 123A"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Details *
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe how our concierge team can assist you..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {feedback && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> {feedback}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                        >
                            {submitting ? 'Sending...' : 'Request Concierge Assistance'}
                        </button>
                    </form>

                    {tickets.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                                Recent Concierge Requests
                            </h2>
                            {tickets.slice(0, 5).map((t) => (
                                <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex justify-between items-center gap-4">
                                    <div>
                                        <p className="text-xs font-mono text-[#D4AF37]">{t.id} &bull; {t.category}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{t.subject}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                        {t.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
