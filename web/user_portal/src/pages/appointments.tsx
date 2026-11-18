import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    ArrowLeft,
    Phone,
    Mail,
    Briefcase,
    Download,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import {
    APPOINTMENT_PURPOSES,
    CONTACT_INFO,
} from '@/config/contactConfig';

interface SlotOption {
    value: string;
    label: string;
    available: boolean;
}

interface ConfirmedAppointment {
    reference: string;
    purpose: string;
    date: string;
    timeSlot: string;
    fullName: string;
    phone: string;
    email: string;
    officeLocation: string;
    icsContent?: string;
}

function getDefaultDate(): string {
    const d = new Date(Date.now() + 86400000);
    if (d.getDay() === 0) {
        d.setDate(d.getDate() + 1); // Skip Sunday
    }
    return d.toISOString().split('T')[0];
}

export default function AppointmentsPage() {
    const [formData, setFormData] = useState({
        purpose: APPOINTMENT_PURPOSES[0] as string,
        date: getDefaultDate(),
        timeSlot: '',
        fullName: '',
        phone: '',
        email: '',
        notes: '',
    });
    const [slots, setSlots] = useState<SlotOption[]>([]);
    const [isClosed, setIsClosed] = useState(false);
    const [closedReason, setClosedReason] = useState<string | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);

    useEffect(() => {
        if (!formData.date) return;
        setSlotsLoading(true);
        fetch(`/api/appointments?date=${encodeURIComponent(formData.date)}`)
            .then((r) => r.json())
            .then((data) => {
                setIsClosed(Boolean(data.isClosed));
                setClosedReason(data.reason || null);
                const list: SlotOption[] = Array.isArray(data.slots) ? data.slots : [];
                setSlots(list);
                const firstAvailable = list.find((s) => s.available);
                setFormData((prev) => ({
                    ...prev,
                    timeSlot: list.some((s) => s.value === prev.timeSlot && s.available)
                        ? prev.timeSlot
                        : firstAvailable?.value || '',
                }));
            })
            .catch(() => {
                setSlots([]);
            })
            .finally(() => setSlotsLoading(false));
    }, [formData.date]);

    const handleDownloadIcs = () => {
        if (!confirmed?.icsContent) return;
        const blob = new Blob([confirmed.icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cabi-appointment-${confirmed.reference}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.timeSlot) {
            setError('Please select an available 30-minute time slot.');
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.appointment) {
                throw new Error(payload?.message || 'Unable to book your office appointment.');
            }

            setConfirmed({ ...payload.appointment, icsContent: payload.icsContent });
        } catch (err: any) {
            setError(err?.message || 'An unexpected error occurred while scheduling.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout
            title="Book an Office Appointment | CABI Africa"
            description="Schedule an in-person appointment at the CABI Africa Nairobi Hub for driver verification, fleet inspection, corporate partnerships, or support."
        >
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] hover:text-[#ffe088] transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Contact Us</span>
                        </Link>
                    </div>

                    {/* Hero Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-4">
                            <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                                Visit Our Office
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Book an{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                Appointment.
                            </span>
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Reserve a dedicated time slot at our Nairobi Hub so our onboarding, fleet, or corporate concierge team is ready for you upon arrival.
                        </p>
                    </div>

                    {/* Office Quick Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Location</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{CONTACT_INFO.officeName}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Office Hours</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{CONTACT_INFO.officeHours}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Direct Desk</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{CONTACT_INFO.phoneDisplay}</p>
                            </div>
                        </div>
                    </div>

                    {confirmed ? (
                        <div className="rounded-3xl bg-white dark:bg-card-dark border border-[#D4AF37]/40 p-8 sm:p-10 shadow-2xl text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>

                            <div>
                                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold">
                                    Ref: {confirmed.reference}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
                                    Appointment Confirmed
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    We look forward to hosting you at {confirmed.officeLocation}.
                                </p>
                            </div>

                            <div className="max-w-md mx-auto text-left bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-2.5 text-xs">
                                <div className="flex justify-between gap-4 py-1 border-b border-slate-200 dark:border-white/5">
                                    <span className="text-neutral-500">Visitor</span>
                                    <strong className="text-slate-900 dark:text-white">{confirmed.fullName}</strong>
                                </div>
                                <div className="flex justify-between gap-4 py-1 border-b border-slate-200 dark:border-white/5">
                                    <span className="text-neutral-500">Purpose</span>
                                    <strong className="text-slate-900 dark:text-white text-right">{confirmed.purpose}</strong>
                                </div>
                                <div className="flex justify-between gap-4 py-1 border-b border-slate-200 dark:border-white/5">
                                    <span className="text-neutral-500">Date &amp; Time</span>
                                    <strong className="text-[#D4AF37]">{confirmed.date} &bull; {confirmed.timeSlot}</strong>
                                </div>
                                <div className="flex justify-between gap-4 py-1">
                                    <span className="text-neutral-500">Contact</span>
                                    <strong className="text-slate-900 dark:text-white">{confirmed.phone}</strong>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                {confirmed.icsContent && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadIcs}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest shadow-md"
                                    >
                                        <Download className="w-4 h-4" />
                                        Add to Calendar (.ics)
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setConfirmed(null)}
                                    className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-md"
                                >
                                    Book Another Appointment
                                </button>
                                <Link
                                    href="/"
                                    className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-neutral-300 font-bold text-xs uppercase tracking-widest hover:border-[#D4AF37]"
                                >
                                    Return Home
                                </Link>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                A confirmation email with your calendar invite has been sent to {confirmed.email}.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-10 shadow-2xl space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="appointment-purpose"
                                    className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                >
                                    Purpose of Visit *
                                </label>
                                <select
                                    id="appointment-purpose"
                                    required
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                >
                                    {APPOINTMENT_PURPOSES.map((purpose) => (
                                        <option key={purpose} value={purpose}>
                                            {purpose}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="appointment-date"
                                        className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Preferred Date *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            id="appointment-date"
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">
                                        Available 30-Min Slots (Mon–Fri 8am–4pm, Sat 8am–12:30pm) *
                                    </label>
                                    {slotsLoading ? (
                                        <p className="text-xs text-neutral-500 py-3">Loading available slots...</p>
                                    ) : isClosed ? (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                                            {closedReason || 'Office is closed on this date.'}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot.value}
                                                    type="button"
                                                    disabled={!slot.available}
                                                    onClick={() => setFormData({ ...formData, timeSlot: slot.value })}
                                                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                                                        !slot.available
                                                            ? 'bg-slate-100 dark:bg-white/5 text-neutral-400 border-slate-200 dark:border-white/5 line-through cursor-not-allowed opacity-50'
                                                            : formData.timeSlot === slot.value
                                                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                                                            : 'bg-slate-50 dark:bg-surface-dark text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50'
                                                    }`}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label
                                        htmlFor="appointment-name"
                                        className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Full Name *
                                    </label>
                                    <input
                                        id="appointment-name"
                                        type="text"
                                        required
                                        placeholder="Amara Ochieng"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="appointment-phone"
                                        className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Phone Number *
                                    </label>
                                    <input
                                        id="appointment-phone"
                                        type="tel"
                                        required
                                        placeholder="+254 712 345 678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="appointment-email"
                                        className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Email Address *
                                    </label>
                                    <input
                                        id="appointment-email"
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="appointment-notes"
                                    className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                >
                                    Notes or Preparation Details (Optional)
                                </label>
                                <textarea
                                    id="appointment-notes"
                                    rows={3}
                                    placeholder="Share vehicle plate number, fleet size, or documents you are bringing..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                <a
                                    href={`mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent('Office Visit Inquiry')}`}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#D4AF37] transition-colors"
                                >
                                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                                    <span>Or email {CONTACT_INFO.email}</span>
                                </a>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {submitting ? 'Scheduling...' : 'Confirm Office Appointment'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

