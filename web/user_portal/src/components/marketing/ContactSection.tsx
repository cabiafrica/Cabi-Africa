'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare, Send, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [feedback, setFeedback] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setFeedback('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.message || 'Unable to send your message right now.');
            }

            setStatus('success');
            setFeedback(payload?.message || "Thank you for reaching out. We'll respond shortly.");
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            setStatus('error');
            setFeedback(err?.message || 'An unexpected error occurred.');
        }
    };

    return (
        <section
            id="contact-us"
            className="py-20 sm:py-28 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300"
        >
            <div className="absolute -bottom-32 left-1/4 w-[520px] h-[520px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    {/* Left Column: Direct Concierge Info */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-[#D4AF37] opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                                Contact Us
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                            Connect with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                CABI.
                            </span>
                        </h2>

                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md">
                            Have a question about executive rides, fleet onboarding, or corporate accounts? Our Nairobi team is ready to assist.
                        </p>

                        <div className="space-y-4 pt-2">
                            <a
                                href="mailto:support@cabi.com"
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 transition-all group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                        Concierge &amp; Support
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                                        support@cabi.com
                                    </p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10">
                                <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                        Regional Headquarters
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        Nairobi Hub (HQ) &bull; Westlands &amp; CBD
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/help"
                                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 hover:border-[#D4AF37]/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                            24/7 Assistance
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                                            Visit Help &amp; FAQ Center
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Obsidian-Gold Inquiry Form */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 lg:p-10 shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label
                                            htmlFor="home-contact-name"
                                            className="block text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            id="home-contact-name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Amara Ochieng"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="home-contact-email"
                                            className="block text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            id="home-contact-email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="name@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="home-contact-subject"
                                        className="block text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Subject
                                    </label>
                                    <input
                                        id="home-contact-subject"
                                        name="subject"
                                        type="text"
                                        required
                                        placeholder="Executive travel, driver onboarding, or general inquiry"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="home-contact-message"
                                        className="block text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2"
                                    >
                                        Message
                                    </label>
                                    <textarea
                                        id="home-contact-message"
                                        name="message"
                                        rows={4}
                                        required
                                        placeholder="Tell us how we can help..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-widest shadow-lg hover:bg-[#ffe088] transition-all duration-300 active:scale-95 disabled:opacity-60"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                                    </button>

                                    <Link
                                        href="/contact"
                                        className="text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#D4AF37] transition-colors"
                                    >
                                        Prefer our dedicated Contact Page &rarr;
                                    </Link>
                                </div>

                                {feedback && (
                                    <div
                                        className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold border ${
                                            status === 'success'
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                                        }`}
                                    >
                                        {status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                        <span>{feedback}</span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

