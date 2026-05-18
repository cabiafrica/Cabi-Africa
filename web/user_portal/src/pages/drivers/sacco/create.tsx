import { useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function CreateSaccoPage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        email: '',
        founderName: '',
        certificateUrl: '',
    });
    const [category, setCategory] = useState<'organization' | 'sacco'>('organization');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Simulate upload to a storage service (like Supabase or S3)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormData(prev => ({ ...prev, certificateUrl: `https://storage.cabi.africa/certs/${file.name}` }));
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const features = [
            `category:${category}`,
            ...selectedServices.map(s => `service:${s}`)
        ];

        try {
            const response = await fetch('/api/sacco/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    features,
                    driverId: user?.id || '',
                }),
            });

            if (!response.ok) throw new Error('Registration failed');

            // Refresh user profile so that organizationId is updated
            if (refreshProfile) {
                await refreshProfile();
            }

            alert('Organization registered successfully! Status: PENDING VERIFICATION');
            router.push('/drivers/sacco/manage');
        } catch (error) {
            console.error(error);
            alert('Failed to register organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout title="Register Organization | CABI Africa">
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12">
                        <Link href="/drivers/dashboard" className="text-yellow-400 hover:text-yellow-300 flex items-center mb-6">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Register Your SACCO / Organization
                        </h1>
                        <p className="text-gray-400 mt-2">Empower your group with Cabi's management tools and group benefits.</p>
                    </div>

                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Category Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-400">Choose Group Category</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div 
                                        onClick={() => {
                                            setCategory('organization');
                                            setSelectedServices([]);
                                        }}
                                        className={`cursor-pointer p-6 rounded-2xl border transition-all ${category === 'organization' ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-lg text-white">Driver Organisation</h3>
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${category === 'organization' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'}`}>
                                                {category === 'organization' && <span className="w-2.5 h-2.5 bg-black rounded-full" />}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">Mainly for uniting drivers, support networks, social groups, and driver directories. No financial overhead.</p>
                                    </div>

                                    <div 
                                        onClick={() => setCategory('sacco')}
                                        className={`cursor-pointer p-6 rounded-2xl border transition-all ${category === 'sacco' ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-lg text-white">SACCO</h3>
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${category === 'sacco' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'}`}>
                                                {category === 'sacco' && <span className="w-2.5 h-2.5 bg-black rounded-full" />}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">Cooperative organization focusing on financial pools, pension schemes, savings, custom insurance, and housing investments.</p>
                                    </div>
                                </div>
                            </div>

                            {/* SACCO Financial Services multi-select checklist */}
                            {category === 'sacco' && (
                                <div className="space-y-4 border border-white/10 bg-white/5 rounded-2xl p-6 transition-all duration-300 animate-fadeIn">
                                    <div>
                                        <h3 className="text-yellow-500 font-bold text-lg">Financial Services Selection</h3>
                                        <p className="text-sm text-gray-400 mt-1">Select the custom services your SACCO offers. You can select multiple simultaneously.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        {[
                                            { id: 'pension', name: 'Pension & Retirement Fund', desc: 'Secure retirement assets and payouts' },
                                            { id: 'insurance', name: 'Personal Insurance', desc: 'Cooperative health, collision & life packages' },
                                            { id: 'housing', name: 'Housing & Land Investment Pools', desc: 'Acquire real estate and properties collectively' },
                                            { id: 'savings', name: 'Savings & High-Yield Dividends', desc: 'Regular pooling with periodic dividend cycles' },
                                            { id: 'loans', name: 'Emergency Credit & Micro-loans', desc: 'Fast approval credit for vehicles/emergencies' }
                                        ].map(svc => {
                                            const isChecked = selectedServices.includes(svc.id);
                                            return (
                                                <div 
                                                    key={svc.id}
                                                    onClick={() => {
                                                        setSelectedServices(prev => 
                                                            prev.includes(svc.id) 
                                                                ? prev.filter(x => x !== svc.id) 
                                                                : [...prev, svc.id]
                                                        );
                                                    }}
                                                    className={`cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all ${isChecked ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/5 hover:border-white/10 bg-black/20'}`}
                                                >
                                                    <div className="pt-0.5">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'border-yellow-500 bg-yellow-500 text-black' : 'border-white/30'}`}>
                                                            {isChecked && (
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white text-sm">{svc.name}</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">{svc.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Organization Name (Official)</label>
                                    <input
                                        required
                                        name="name"
                                        placeholder="e.g. United Drivers SACCO"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Registration Number (Government)</label>
                                    <input
                                        required
                                        name="registrationNumber"
                                        placeholder="e.g. CS/123456"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Official Email</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="admin@yoursacco.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Founder / Managing Director</label>
                                    <input
                                        required
                                        name="founderName"
                                        placeholder="Full Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
                                        value={formData.founderName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-400">Government Registration Certificate</label>
                                <div className={`border-2 border-dashed ${formData.certificateUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-yellow-500/50'} rounded-2xl p-10 text-center transition-all relative cursor-pointer`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                    {uploading ? (
                                        <div className="animate-pulse text-yellow-500">Uploading certificate...</div>
                                    ) : formData.certificateUrl ? (
                                        <div className="text-green-400 flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Certificate Uploaded Successfully
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Click to upload PDF or Photo of Certificate
                                            <span className="text-xs mt-1">(Max size 5MB)</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Note: Your organization will remain <strong>INVALID</strong> until a valid certificate is verified by our AI and compliance team.
                                </p>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploading}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
                                >
                                    {isSubmitting && (
                                        <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    Create My Organization
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                            <h3 className="text-yellow-500 font-bold mb-2">Auto-Verification</h3>
                            <p className="text-sm text-gray-400">AI extracts registration details and expiry dates instantly.</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                            <h3 className="text-yellow-500 font-bold mb-2">Group Commission</h3>
                            <p className="text-sm text-gray-400">Save up to 5% on platform commission for your members.</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                            <h3 className="text-yellow-500 font-bold mb-2">Fleet Management</h3>
                            <p className="text-sm text-gray-400">Monitor all driver activities and earnings in one place.</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
