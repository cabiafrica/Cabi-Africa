import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
    Building2, 
    ShieldCheck, 
    CreditCard, 
    Users, 
    ArrowRight, 
    CheckCircle2, 
    AlertCircle, 
    Lock, 
    Mail, 
    Phone, 
    Globe, 
    MapPin, 
    Sparkles, 
    ChevronRight,
    Briefcase
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CorporateRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        businessEmail: '',
        phone: '+254',
        regNumber: '',
        kraPin: '',
        industry: 'Technology & Consulting',
        city: 'Nairobi',
        country: 'Kenya',
        adminName: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateStep1 = () => {
        if (!formData.companyName.trim()) {
            setErrorMessage('Please enter your legal company name.');
            return false;
        }
        if (!formData.businessEmail.trim() || !formData.businessEmail.includes('@')) {
            setErrorMessage('Please provide a valid company work email address.');
            return false;
        }
        if (!formData.regNumber.trim()) {
            setErrorMessage('Company Registration / Certificate number is required.');
            return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 9) {
            setErrorMessage('Please provide a valid company phone number.');
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    const validateStep2 = () => {
        if (!formData.adminName.trim()) {
            setErrorMessage('Please provide the primary administrator / billing lead full name.');
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return false;
        }
        if (!formData.agreeTerms) {
            setErrorMessage('Please accept the Cabi for Business Terms of Service to continue.');
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/corporate/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create corporate account');
            }

            // Store corporate session
            localStorage.setItem('cabi_corp_org_id', data.account.id);
            localStorage.setItem('cabi_corp_company', data.account.companyName);
            localStorage.setItem('cabi_corp_admin', data.admin.fullName);
            localStorage.setItem('cabi_corp_token', data.token);

            setStep(3); // Success step
            setTimeout(() => {
                router.push(`/corporate/dashboard?orgId=${data.account.id}`);
            }, 2500);
        } catch (err: any) {
            setErrorMessage(err.message || 'An error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white selection:bg-brand-yellow selection:text-black transition-colors duration-300">
            <Head>
                <title>Register Corporate Account | Cabi for Business</title>
                <meta name="description" content="Set up your enterprise corporate travel account on Cabi Africa. Manage employee rides, ride policies, and unified billing." />
            </Head>

            <Header />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-semibold tracking-wide uppercase mb-4">
                        <Briefcase className="w-3.5 h-3.5" />
                        Cabi for Business
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Corporate Travel & Team Management
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base">
                        Empower your team with seamless business rides, centralized prepaid wallet, customizable ride policies with grace justifications, and unified monthly invoicing.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-2xl mx-auto mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-white/10 z-0" />
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-yellow transition-all duration-500 z-0"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        />

                        {/* Step 1 Bubble */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 1 ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                            }`}>
                                1
                            </div>
                            <span className="text-xs font-medium mt-2 text-gray-400">Company Info</span>
                        </div>

                        {/* Step 2 Bubble */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 2 ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                            }`}>
                                2
                            </div>
                            <span className="text-xs font-medium mt-2 text-gray-400">Admin & Billing</span>
                        </div>

                        {/* Step 3 Bubble */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 3 ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                            }`}>
                                3
                            </div>
                            <span className="text-xs font-medium mt-2 text-gray-400">Activated</span>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-surface-dark/90 border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />

                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleNext} className="space-y-6">
                            <div className="border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-brand-yellow" />
                                    Company Details
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter your organization's legal and business contact information.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Legal Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Africa Ltd"
                                    required
                                    className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Company Work Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            name="businessEmail"
                                            value={formData.businessEmail}
                                            onChange={handleChange}
                                            placeholder="corporate@company.com"
                                            required
                                            className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Company Phone *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+254712345678"
                                            required
                                            className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Business Reg. / Certificate No. *
                                    </label>
                                    <input
                                        type="text"
                                        name="regNumber"
                                        value={formData.regNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. CPR/2023/123456"
                                        required
                                        className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        KRA PIN / Tax ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="kraPin"
                                        value={formData.kraPin}
                                        onChange={handleChange}
                                        placeholder="e.g. P051234567Z"
                                        className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Industry
                                    </label>
                                    <select
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                    >
                                        <option value="Technology & Consulting">Technology</option>
                                        <option value="Financial & Banking">Financial Services</option>
                                        <option value="Healthcare & Pharma">Healthcare</option>
                                        <option value="Manufacturing & Logistics">Logistics</option>
                                        <option value="Hospitality & Tourism">Hospitality</option>
                                        <option value="NGO & Non-Profit">NGO / Non-Profit</option>
                                        <option value="Other Enterprise">Other Enterprise</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-yellow"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        disabled
                                        className="w-full bg-slate-100 dark:bg-brand-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <Link 
                                    href="/corporate/login" 
                                    className="text-xs text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Already have a corporate account? <span className="text-brand-yellow font-medium">Log in</span>
                                </Link>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-sm tracking-wide transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    Next: Admin Credentials
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleNext} className="space-y-6">
                            <div className="border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                                    Company Admin & Billing Lead
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Set up the credentials for the person who will manage your team, policies, and wallet top-ups.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Admin Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="adminName"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    placeholder="e.g. David Kiprono"
                                    required
                                    className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-slate-50 dark:bg-brand-black/60 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Included Highlights */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-brand-yellow mb-2">
                                    Default Corporate Package Included:
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span><strong>Grace with Justification:</strong> Out-of-policy trips allowed when employees provide business rationale.</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span><strong>Safety Overdraft Buffer:</strong> KES 25,000 emergency travel buffer to prevent team stranding.</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span><strong>1-Click Platform Migration:</strong> Easily import your employee roster from Uber for Business, Bolt, or Little Cab via CSV.</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span><strong>Instant Team Invites:</strong> One-click Email and SMS invite links for all staff.</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-600 text-brand-yellow focus:ring-brand-yellow bg-brand-black"
                                />
                                <label htmlFor="agreeTerms" className="text-xs text-gray-300">
                                    I agree to the <Link href="/terms-of-service" className="text-brand-yellow underline">Cabi for Business Terms</Link> and authorize corporate travel billing.
                                </label>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold tracking-wide transition-all"
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-bold text-sm tracking-wide transition-all transform active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="py-8 text-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black">Welcome to Cabi for Business!</h2>
                            <p className="text-sm text-gray-400 max-w-md mx-auto">
                                Your corporate travel account for <strong className="text-slate-900 dark:text-white">{formData.companyName}</strong> has been successfully initialized with KES 10,000 welcome credit and KES 25,000 Safety Overdraft Buffer.
                            </p>
                            <div className="text-xs text-brand-yellow font-medium animate-pulse pt-4">
                                Redirecting you to the Corporate Dashboard...
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
