import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SaccoDetails {
    id: string;
    name: string;
    registrationNumber: string;
    email: string;
    founderName: string;
    certificateUrl: string;
    status: string;
    bio?: string;
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    website?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    features?: string[];
}

export default function EditSaccoPage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const [activeTab, setActiveTab] = useState<'branding' | 'legal'>('branding');
    const [category, setCategory] = useState<'organization' | 'sacco'>('organization');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [formData, setFormData] = useState<SaccoDetails>({
        id: '',
        name: '',
        registrationNumber: '',
        email: '',
        founderName: '',
        certificateUrl: '',
        status: 'PENDING',
        bio: '',
        logoUrl: '',
        bannerUrl: '',
        primaryColor: '#EAB308',
        secondaryColor: '#000000',
        website: '',
        twitter: '',
        facebook: '',
        instagram: '',
        features: [],
    });

    const [initialLegalFields, setInitialLegalFields] = useState({
        registrationNumber: '',
        certificateUrl: '',
    });

    const organizationId = user?.driverProfile?.organizationId || user?.organizationId || user?.driver?.organizationId;

    useEffect(() => {
        if (!organizationId) {
            router.push('/drivers/sacco/manage');
            return;
        }
        fetchSaccoDetails(organizationId);
    }, [organizationId]);

    const fetchSaccoDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/sacco/details/${id}`);
            if (res.ok) {
                const data = await res.json();
                const updatedData = {
                    ...data,
                    bio: data.bio || '',
                    logoUrl: data.logoUrl || '',
                    bannerUrl: data.bannerUrl || '',
                    primaryColor: data.primaryColor || '#EAB308',
                    secondaryColor: data.secondaryColor || '#000000',
                    website: data.website || '',
                    twitter: data.twitter || '',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    features: data.features || [],
                };
                setFormData(updatedData);
                setInitialLegalFields({
                    registrationNumber: data.registrationNumber || '',
                    certificateUrl: data.certificateUrl || '',
                });

                // Extract category and services
                const featuresList = data.features || [];
                const cat = featuresList.find((f: string) => f.startsWith('category:'))?.replace('category:', '') || 'organization';
                const svcs = featuresList.filter((f: string) => f.startsWith('service:')).map((f: string) => f.replace('service:', ''));
                setCategory(cat as 'organization' | 'sacco');
                setSelectedServices(svcs);
            }
        } catch (error) {
            console.error('Failed to load SACCO details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'cert') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'logo') setUploadingLogo(true);
        if (type === 'banner') setUploadingBanner(true);
        if (type === 'cert') setUploadingCert(true);

        try {
            // Simulate upload to a storage service (like Supabase or S3)
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockUrl = `https://storage.cabi.africa/sacco/${type}s/${file.name}`;
            
            setFormData(prev => ({
                ...prev,
                [type === 'logo' ? 'logoUrl' : type === 'banner' ? 'bannerUrl' : 'certificateUrl']: mockUrl,
            }));
        } catch (error) {
            console.error(error);
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            if (type === 'banner') setUploadingBanner(false);
            if (type === 'cert') setUploadingCert(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Detect if any critical compliance legal fields were modified
        const isLegalFieldChanged = 
            formData.registrationNumber !== initialLegalFields.registrationNumber || 
            formData.certificateUrl !== initialLegalFields.certificateUrl;

        const updatedFeatures = [
            `category:${category}`,
            ...selectedServices.map(s => `service:${s}`)
        ];

        try {
            const response = await fetch(`/api/sacco/update/${formData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    features: updatedFeatures
                }),
            });

            if (!response.ok) throw new Error('Failed to update organization');

            if (refreshProfile) {
                await refreshProfile();
            }

            if (isLegalFieldChanged) {
                alert('Organization updated successfully! Legal changes were detected, so your status has been set to PENDING VERIFICATION.');
            } else {
                alert('Branding and details updated successfully!');
            }

            router.push('/drivers/sacco/manage');
        } catch (error) {
            console.error(error);
            alert('Failed to update organization');
        } finally {
            setIsSaving(false);
        }
    };

    const isLegalFieldChanged = 
        formData.registrationNumber !== initialLegalFields.registrationNumber || 
        formData.certificateUrl !== initialLegalFields.certificateUrl;

    if (loading) {
        return (
            <MainLayout title="Edit Organization Settings">
                <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Edit Sacco Settings | CABI Africa">
            <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <Link href="/drivers/sacco/manage" className="text-yellow-400 hover:text-yellow-300 flex items-center mb-6">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Management
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Organization Settings
                        </h1>
                        <p className="text-gray-400 mt-2">Customize your SACCO brand identity, details, and legal compliance.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: NAVIGATION & PREVIEW */}
                        <div className="space-y-6">
                            {/* TAB NAVIGATION CARD */}
                            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-lg mb-4 text-white">Settings Menu</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('branding')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium ${
                                            activeTab === 'branding'
                                                ? 'bg-yellow-500 text-black font-bold'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        🎨 Branding & General
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('legal')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium ${
                                            activeTab === 'legal'
                                                ? 'bg-yellow-500 text-black font-bold'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        ⚖️ Legal & Compliance
                                    </button>
                                </div>
                            </div>

                            {/* DYNAMIC LIVE BRAND PREVIEW */}
                            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
                                <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-sm tracking-wider uppercase text-yellow-500">
                                    Live Brand Preview
                                </div>
                                <div className="relative h-32 bg-gray-800">
                                    {formData.bannerUrl ? (
                                        <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                            No Banner Image
                                        </div>
                                    )}
                                    <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl border-4 border-[#121212] bg-gray-900 overflow-hidden flex items-center justify-center">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-gray-500">
                                                {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'CO'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-10 p-6 space-y-4">
                                    <div>
                                        <h4 className="font-bold text-xl text-white">{formData.name || 'Organization Name'}</h4>
                                        <p className="text-xs text-gray-500 font-mono">{formData.registrationNumber || 'CS/XXXXXX'}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-3">
                                        {formData.bio || 'Provide a compelling short biography or mission statement for your SACCO brand.'}
                                    </p>
                                    <div className="flex gap-3">
                                        <span
                                            style={{ backgroundColor: formData.primaryColor }}
                                            className="px-3 py-1 text-xs font-bold text-black rounded-lg"
                                        >
                                            Primary Color
                                        </span>
                                        <span
                                            style={{ backgroundColor: formData.secondaryColor || '#000000', color: '#ffffff' }}
                                            className="px-3 py-1 text-xs font-bold border border-white/10 rounded-lg"
                                        >
                                            Secondary
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: MAIN SETTINGS FORM */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                                    {activeTab === 'branding' && (
                                        <div className="space-y-8">
                                            <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">
                                                Branding & General Info
                                            </h2>

                                            {/* Category & Services Selectors */}
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-gray-400">Group Category</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div 
                                                        onClick={() => {
                                                            setCategory('organization');
                                                            setSelectedServices([]);
                                                        }}
                                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${category === 'organization' ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-sm text-white">Driver Organisation</h4>
                                                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${category === 'organization' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'}`}>
                                                                {category === 'organization' && <span className="w-2 h-2 bg-black rounded-full" />}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">Unification network and directories.</p>
                                                    </div>

                                                    <div 
                                                        onClick={() => setCategory('sacco')}
                                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${category === 'sacco' ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-sm text-white">SACCO</h4>
                                                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${category === 'sacco' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'}`}>
                                                                {category === 'sacco' && <span className="w-2 h-2 bg-black rounded-full" />}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">Cooperative financial pools and retirement funds.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {category === 'sacco' && (
                                                <div className="space-y-4 border border-white/10 bg-white/5 rounded-xl p-4 transition-all duration-300">
                                                    <div>
                                                        <h4 className="text-yellow-500 font-bold text-sm">Financial Services Offered</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">Toggle services provided to your SACCO members.</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'pension', name: 'Pension & Retirement Fund' },
                                                            { id: 'insurance', name: 'Personal Insurance' },
                                                            { id: 'housing', name: 'Housing & Land Pools' },
                                                            { id: 'savings', name: 'Savings & Dividends' },
                                                            { id: 'loans', name: 'Emergency Credit & Micro-loans' }
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
                                                                    className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg border transition-all ${isChecked ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/5 hover:border-white/10'}`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'border-yellow-500 bg-yellow-500 text-black' : 'border-white/30'}`}>
                                                                        {isChecked && (
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <span className="font-medium text-white text-xs">{svc.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Name & Founder Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Official Brand Name</label>
                                                    <input
                                                        required
                                                        name="name"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Managing Director / MD</label>
                                                    <input
                                                        required
                                                        name="founderName"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                                                        value={formData.founderName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bio Description */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">SACCO Biography & Mission</label>
                                                <textarea
                                                    name="bio"
                                                    rows={4}
                                                    placeholder="Describe your organization's vision, culture, and goals..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white resize-none"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            {/* Visual Customizer Branding Colors */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Primary Brand Accent Color</label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="color"
                                                            name="primaryColor"
                                                            className="w-12 h-12 bg-transparent border-0 cursor-pointer rounded-xl"
                                                            value={formData.primaryColor}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="primaryColor"
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 text-white font-mono"
                                                            value={formData.primaryColor}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Secondary Brand Accent Color</label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="color"
                                                            name="secondaryColor"
                                                            className="w-12 h-12 bg-transparent border-0 cursor-pointer rounded-xl"
                                                            value={formData.secondaryColor}
                                                            onChange={handleInputChange}
                                                        />
                                                        <input
                                                            type="text"
                                                            name="secondaryColor"
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 text-white font-mono"
                                                            value={formData.secondaryColor}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logo & Banner Uploads */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium text-gray-400">Brand Logo</label>
                                                    <div className="border border-dashed border-white/10 hover:border-yellow-500/50 rounded-xl p-4 text-center relative cursor-pointer transition-all bg-white/[0.02]">
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                                            accept=".png,.jpg,.jpeg"
                                                        />
                                                        {uploadingLogo ? (
                                                            <div className="text-xs text-yellow-500">Uploading logo...</div>
                                                        ) : formData.logoUrl ? (
                                                            <div className="text-xs text-green-500 truncate">{formData.logoUrl}</div>
                                                        ) : (
                                                            <div className="text-xs text-gray-500">Upload square PNG/JPG logo</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium text-gray-400">Brand Cover Banner</label>
                                                    <div className="border border-dashed border-white/10 hover:border-yellow-500/50 rounded-xl p-4 text-center relative cursor-pointer transition-all bg-white/[0.02]">
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleFileUpload(e, 'banner')}
                                                            accept=".png,.jpg,.jpeg"
                                                        />
                                                        {uploadingBanner ? (
                                                            <div className="text-xs text-yellow-500">Uploading banner...</div>
                                                        ) : formData.bannerUrl ? (
                                                            <div className="text-xs text-green-500 truncate">{formData.bannerUrl}</div>
                                                        ) : (
                                                            <div className="text-xs text-gray-500">Upload landscape cover banner</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Details & Social Links */}
                                            <h3 className="text-lg font-bold text-white border-t border-white/10 pt-6 mt-6">
                                                Digital presence & Social media
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Website Address</label>
                                                    <input
                                                        name="website"
                                                        placeholder="https://yoursacco.com"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white font-mono"
                                                        value={formData.website}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Twitter URL</label>
                                                    <input
                                                        name="twitter"
                                                        placeholder="https://twitter.com/yoursacco"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white font-mono"
                                                        value={formData.twitter}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Facebook URL</label>
                                                    <input
                                                        name="facebook"
                                                        placeholder="https://facebook.com/yoursacco"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white font-mono"
                                                        value={formData.facebook}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400">Instagram URL</label>
                                                    <input
                                                        name="instagram"
                                                        placeholder="https://instagram.com/yoursacco"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white font-mono"
                                                        value={formData.instagram}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'legal' && (
                                        <div className="space-y-8">
                                            <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">
                                                Legal & Compliance Details
                                            </h2>

                                            {isLegalFieldChanged && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-2xl flex items-start gap-4">
                                                    <span className="text-2xl">⚠️</span>
                                                    <div>
                                                        <h4 className="text-yellow-500 font-bold text-lg">Compliance Action Required</h4>
                                                        <p className="text-gray-400 text-sm mt-1">
                                                            You have modified critical legal fields (Registration Number or Certificate). Saving these changes will automatically reset your status to <strong className="text-yellow-400">PENDING VERIFICATION</strong>. An administrator must re-verify your certificate before your organization returns to a VERIFIED state.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Government Registration Number</label>
                                                <input
                                                    required
                                                    name="registrationNumber"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white font-mono"
                                                    value={formData.registrationNumber}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-gray-400">Government Registration Certificate</label>
                                                <div className={`border-2 border-dashed ${formData.certificateUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-yellow-500/50'} rounded-2xl p-10 text-center transition-all relative cursor-pointer`}>
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => handleFileUpload(e, 'cert')}
                                                        accept=".pdf,.png,.jpg,.jpeg"
                                                    />
                                                    {uploadingCert ? (
                                                        <div className="animate-pulse text-yellow-500">Uploading certificate...</div>
                                                    ) : formData.certificateUrl ? (
                                                        <div className="text-green-500 font-bold flex flex-col items-center">
                                                            <span>✓ Certificate Document Uploaded</span>
                                                            <span className="text-xs text-gray-500 mt-1 font-mono">{formData.certificateUrl}</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-gray-400 font-semibold mb-1">Click or drag certificate PDF here to update</p>
                                                            <p className="text-xs text-gray-500">PDF, PNG, JPG, or JPEG up to 10MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Current Verification Status</label>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                                                        formData.status === 'VERIFIED' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                                                        formData.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                                                        'border-red-500/30 text-red-500 bg-red-500/5'
                                                    }`}>
                                                        {formData.status}
                                                    </span>
                                                    {formData.status === 'PENDING' && (
                                                        <span className="text-xs text-gray-500">
                                                            Currently waiting for admin confirmation.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-8 mt-8">
                                        <Link
                                            href="/drivers/sacco/manage"
                                            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800/50 disabled:text-black/50 text-black px-8 py-3 rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg shadow-yellow-500/10"
                                        >
                                            {isSaving ? 'Saving Changes...' : 'Save Settings'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
