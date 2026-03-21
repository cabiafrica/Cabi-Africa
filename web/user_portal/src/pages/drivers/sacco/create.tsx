import { useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function CreateSaccoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        email: '',
        founderName: '',
        certificateUrl: '',
    });
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

        try {
            const response = await fetch('/api/sacco/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Registration failed');

            alert('Organization registered successfully! Status: PENDING VERIFICATION');
            router.push('/drivers/dashboard');
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
