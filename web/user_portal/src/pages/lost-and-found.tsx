import React, { useEffect, useState, FormEvent } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PackageSearch, Clock, Building2, MessageSquare, CheckCircle2 } from 'lucide-react';

interface LostItem {
    id: string;
    obNumber?: string;
    description: string;
    reporterRole: string;
    contactPhone: string;
    tripCode: string;
    droppedAtOffice: boolean;
    status: string;
    createdAt: string;
    collectionDeadline: string;
    communications?: Array<{ message: string; sentAt: string }>;
}

export default function LostAndFoundPage() {
    const [items, setItems] = useState<LostItem[]>([]);
    const [description, setDescription] = useState('');
    const [reporterRole, setReporterRole] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
    const [contactPhone, setContactPhone] = useState('');
    const [tripCode, setTripCode] = useState('');
    const [droppedAtOffice, setDroppedAtOffice] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [commText, setCommText] = useState<Record<string, string>>({});

    const loadItems = async () => {
        try {
            const res = await fetch('/api/lost-and-found');
            const data = await res.json();
            if (data.success) setItems(data.items || []);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        setSubmitting(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/lost-and-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    reporterRole,
                    contactPhone,
                    tripCode,
                    droppedAtOffice: reporterRole === 'DRIVER' ? droppedAtOffice : false,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Submission failed');
            setDescription('');
            setTripCode('');
            setFeedback(data.message);
            loadItems();
        } catch (err: any) {
            setFeedback(err.message || 'Could not submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendCommunication = async (id: string) => {
        const msg = (commText[id] || '').trim();
        if (!msg) return;
        const res = await fetch('/api/lost-and-found', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, communicationMessage: msg }),
        });
        if (res.ok) {
            setCommText((prev) => ({ ...prev, [id]: '' }));
            loadItems();
        }
    };

    return (
        <MainLayout
            title="Lost & Found | CABI Africa"
            description="Report lost items or log found items dropped at the CABI Africa office for passenger collection within 7 days."
        >
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-3">
                            <PackageSearch className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                                7-Day Office Custody Policy
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Lost &amp; Found
                        </h1>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
                            Drivers can drop found items at the CABI Africa office for passengers to collect within <strong>7 days</strong>. Need more time? Send a communication directly below.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 shadow-xl space-y-5"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    I am a
                                </label>
                                <select
                                    value={reporterRole}
                                    onChange={(e) => setReporterRole(e.target.value as any)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                >
                                    <option value="PASSENGER">Passenger (Lost Item)</option>
                                    <option value="DRIVER">Driver (Found Item)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="+254 712 345 678"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lf-description" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                Short Description *
                            </label>
                            <textarea
                                id="lf-description"
                                required
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the item (e.g., Black Samsung phone left in back seat, trip CB-1042)..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {reporterRole === 'DRIVER' && (
                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-neutral-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={droppedAtOffice}
                                    onChange={(e) => setDroppedAtOffice(e.target.checked)}
                                    className="w-4 h-4 accent-[#D4AF37]"
                                />
                                <span>I have dropped this found item at the CABI Africa office for passenger collection (7-day window)</span>
                            </label>
                        )}

                        {feedback && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> {feedback}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Lost & Found'}
                        </button>
                    </form>

                    {/* Active Items & 7-Day Collection Communication */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Recent Lost &amp; Found Items
                        </h2>
                        {items.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 text-sm text-neutral-500 text-center">
                                No lost or found items reported yet.
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 space-y-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-[#D4AF37]">
                                                {item.id} &bull; {item.reporterRole}
                                            </span>
                                            {item.obNumber && (
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                                                    {item.obNumber}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                            {item.droppedAtOffice && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                                    <Building2 className="w-3 h-3" /> At Office
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">
                                                <Clock className="w-3 h-3" /> Collect by {new Date(item.collectionDeadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-800 dark:text-neutral-200">{item.description}</p>

                                    {item.communications && item.communications.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-surface-dark rounded-xl p-3 space-y-1.5">
                                            {item.communications.map((c, i) => (
                                                <p key={i} className="text-xs text-slate-600 dark:text-neutral-300">
                                                    <strong className="text-[#D4AF37]">Update:</strong> {c.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <input
                                            type="text"
                                            value={commText[item.id] || ''}
                                            onChange={(e) => setCommText((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                            placeholder="Cannot collect within 7 days? Send communication to office..."
                                            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSendCommunication(item.id)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white/10 text-white text-xs font-bold hover:bg-[#D4AF37] hover:text-black transition-colors"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" /> Send
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
