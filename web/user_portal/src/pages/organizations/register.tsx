import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/router';
import { FaBuilding, FaArrowLeft, FaCheck, FaSearch, FaUser, FaGlobe, FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import VideoEmbed from '../../components/VideoEmbed';

// Mock list of registered drivers for demonstration
const mockDrivers: any[] = [];

// Helper Component for Member Row with Search
const MemberRow = ({ index, register, setValue }: { index: number, register: any, setValue: any }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleSearch = (e: any) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowResults(value.length > 0);
    };

    const selectDriver = (driver: typeof mockDrivers[0]) => {
        setValue(`members.${index}.name`, driver.name);
        setValue(`members.${index}.contact`, driver.contact);
        setSelectedPhoto(driver.passportUrl);

        // Clear search
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#D4AF37]/40 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {selectedPhoto ? (
                        <img src={selectedPhoto} alt="Organization director passport photograph" width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 rounded-lg object-cover border border-white/20" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <FaUser className="text-gray-500" />
                        </div>
                    )}
                    <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Member {index + 1}</label>
                        <div className="text-[10px] text-[#FACC15] bg-[#D4AF37]/15 border border-[#D4AF37]/25 px-2 py-0.5 rounded-full inline-block">Official Member</div>
                    </div>
                </div>

                {/* Driver Search Input */}
                <div className="relative z-20">
                    <div className="flex items-center bg-brand-black/50 border border-white/10 rounded-lg px-2 py-1 w-64 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37] transition-all">
                        <FaSearch className="text-gray-500 mr-2 text-xs" />
                        <input
                            type="text"
                            placeholder="Search registered driver..."
                            className="bg-transparent border-none outline-none text-xs w-full text-gray-300 placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={handleSearch}
                            onFocus={() => searchTerm && setShowResults(true)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-brand-black border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
                            {mockDrivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                                mockDrivers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(driver => (
                                    <button
                                        key={driver.id}
                                        type="button"
                                        disabled={!!driver.orgId}
                                        onClick={() => !driver.orgId && selectDriver(driver)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 ${driver.orgId ? 'opacity-50 cursor-not-allowed bg-red-500/5' : 'hover:bg-white/10'}`}
                                    >
                                        <img src={driver.passportUrl} alt={`${driver.name} verified fleet driver passport photograph`} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                        <div>
                                            <div className="text-sm font-bold text-white">
                                                {driver.name}
                                                {driver.orgId && <span className="ml-2 text-[10px] uppercase bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">Already Member</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{driver.contact}</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-gray-500">No active drivers found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold hidden md:block">Name</label>
                    <input
                        {...register(`members.${index}.name` as const, { required: true })}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                        placeholder="Full Name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold hidden md:block">Contact</label>
                    <input
                        {...register(`members.${index}.contact` as const, { required: true })}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                        placeholder="Phone or Email"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold hidden md:block">Position</label>
                    <input
                        {...register(`members.${index}.position` as const, { required: true })}
                        className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                        placeholder="e.g. Chairman, Secretary"
                    />
                </div>
                <div className="space-y-2 md:col-span-2 flex items-center gap-3 mt-2">
                    <input
                        type="checkbox"
                        {...register(`members.${index}.isDistressResponder` as const)}
                        className="w-4 h-4 rounded border-white/10 bg-brand-black/50 text-[#FACC15] focus:ring-[#FACC15]"
                        id={`distress-${index}`}
                    />
                    <label htmlFor={`distress-${index}`} className="text-sm text-gray-300">
                        Designate as Distress Responder (SOS Alert Contact)
                    </label>
                </div>
            </div>


        </div>
    );
};

export default function RegisterOrganization() {
    const router = useRouter();
    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            orgName: '',
            email: '',
            bio: '',
            logo: null,
            banner: null,
            regNumber: '',
            regCertificate: null,
            website: '',
            twitter: '',
            facebook: '',
            instagram: '',
            linkedin: '',
            // Tax PIN removed

            members: [
                { name: '', contact: '', position: 'Chairman', isDistressResponder: false },
                { name: '', contact: '', position: 'Secretary', isDistressResponder: false },
                { name: '', contact: '', position: 'Treasurer', isDistressResponder: false }
            ],
            subgroups: [] as { name: string; features: string[] }[]
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "members"
    });

    const { fields: subgroupFields, append: appendSubgroup, remove: removeSubgroup } = useFieldArray({
        control,
        name: "subgroups"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [brandColor, setBrandColor] = useState<string>('');
    // OrgType removed

    // Helper to extract color from image
    const extractColor = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = 1;
                canvas.height = 1;
                ctx.drawImage(img, 0, 0, 1, 1);

                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                setBrandColor(hex);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);

        try {
            const payload = {
                orgName: data.orgName,
                email: data.email,
                bio: data.bio,
                regNumber: data.regNumber,
                website: data.website,
                twitter: data.twitter,
                facebook: data.facebook,
                instagram: data.instagram,
                linkedin: data.linkedin,
                primaryColor: brandColor,
                members: data.members,
                subgroups: data.subgroups
            };

            const response = await fetch('/api/organizations/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            console.log("Organization Registration Success:", result);
            alert('Organization registered successfully! You can now access your dashboard.');
            router.push('/dashboard');

        } catch (error: any) {
            console.error("Registration failed:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-[#D4AF37] selection:text-black">
            <Head>
                <title>Register Organization - Cabi</title>
            </Head>

            <div className="container mx-auto px-6 py-12">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <div
                            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#D4AF37]/10 text-[#FACC15] text-4xl mb-6 border border-[#D4AF37]/25 transition-all duration-500"
                            style={brandColor ? {
                                backgroundColor: `${brandColor}20`,
                                color: brandColor,
                                borderColor: `${brandColor}40`
                            } : {}}
                        >
                            <FaBuilding />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Register Your Organization</h1>
                        <p className="text-gray-400 text-lg mb-8">Scale your operations. Required for Fleets and Wealth Creation Partner Groups.</p>

                        {/* Video Embed */}
                        <VideoEmbed
                            videoId="dQw4w9WgXcQ"
                            title="Organization Registration Guide"
                            showChannelLink={false}
                            className="mb-8"
                        />
                    </div>

                    <div
                        className="glass p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden transition-all duration-500"
                        style={brandColor ? { borderColor: `${brandColor}30` } : {}}
                    >
                        <div
                            className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#FACC15] to-[#ffe088] left-0 transition-all duration-500"
                            style={brandColor ? { backgroundImage: `linear-gradient(to right, ${brandColor}, #FACC15)` } : {}}
                        ></div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Basic Details & Branding */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Organization Details</h3>

                                {/* Branding */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Profile Photo (Logo)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register('logo', {
                                                onChange: (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        extractColor(e.target.files[0]);
                                                    }
                                                }
                                            })}
                                            className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37]/20 file:text-[#FACC15] hover:file:bg-[#D4AF37]/30"
                                            style={brandColor ? {
                                                // We can't easily style the file input pseudo-element directly with inline styles, 
                                                // so we'll leave it or user global CSS, but for now standard class is fine.
                                            } : {}}
                                        />
                                        <p className="text-[10px] text-gray-600">Square image, min 200x200px (PNG/JPG)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Cover Image (Banner)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register('banner')}
                                            className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37]/20 file:text-[#FACC15] hover:file:bg-[#D4AF37]/30"
                                        />
                                        <p className="text-[10px] text-gray-600">Wide image, min 1200x400px (PNG/JPG)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Organization Name</label>
                                        <input
                                            {...register('orgName', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                            placeholder="Enter organization name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Business Email</label>
                                        <input
                                            type="email"
                                            {...register('email', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                            placeholder="admin@organization.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Purpose / Bio</label>
                                    <textarea
                                        {...register('bio', { required: true })}
                                        className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all h-24"
                                        placeholder="Describe your organization's mission, goals, or services..."
                                    />
                                </div>

                                {/* Social Media & Web Links */}
                                <div className="space-y-6 pt-6 border-t border-white/10">
                                    <h3 className="text-xl font-bold border-b border-white/10 pb-2">Online Presence</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                                                <FaGlobe /> Website
                                            </label>
                                            <input
                                                {...register('website')}
                                                className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                placeholder="https://www.yourorganization.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                                                <FaTwitter className="text-blue-400" /> Twitter (X)
                                            </label>
                                            <input
                                                {...register('twitter')}
                                                className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                placeholder="@handle"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                                                <FaFacebook className="text-blue-600" /> Facebook
                                            </label>
                                            <input
                                                {...register('facebook')}
                                                className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                placeholder="Page URL or Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                                                <FaInstagram className="text-pink-500" /> Instagram
                                            </label>
                                            <input
                                                {...register('instagram')}
                                                className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                placeholder="@handle"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                                                <FaLinkedin className="text-blue-500" /> LinkedIn
                                            </label>
                                            <input
                                                {...register('linkedin')}
                                                className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                placeholder="Profile URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Verification Documents</h3>
                                <div className="p-4 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl">
                                    <p className="text-sm text-brand-yellow mb-2">Government Registration Certificate</p>
                                    <p className="text-xs text-gray-400 mb-4">Please upload your official registration document. If not provided, your organization will be marked as <span className="text-red-400 font-bold">Unverified</span> until submitted.</p>
                                    <input
                                        type="file"
                                        {...register('regCertificate')}
                                        className="block w-full text-sm text-gray-400
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-[#D4AF37]/20 file:text-[#FACC15]
                                          hover:file:bg-[#D4AF37]/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Registration Number</label>
                                    <input
                                        {...register('regNumber', { required: true })}
                                        className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                        placeholder="REG-12345"
                                    />
                                </div>
                            </div>

                            {/* Founding Members */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Founding Members (Min. 3)</h3>
                                <div className="grid gap-4">
                                    {fields.map((field, index) => (
                                        <MemberRow key={field.id} index={index} register={register} setValue={setValue} />
                                    ))}
                                </div>
                            </div>

                            {/* Subgroups Configuration */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <h3 className="text-xl font-bold">Subgroups Configuration</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => appendSubgroup({ name: '', features: [] })}
                                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        + Add Subgroup
                                    </button>
                                </div>
                                <div className="grid gap-4">
                                    {subgroupFields.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No subgroups configured. You can add them later.</p>
                                    ) : (
                                        subgroupFields.map((field, index) => (
                                            <div key={field.id} className="p-4 bg-white/5 rounded-xl border border-white/5 relative">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeSubgroup(index)}
                                                    className="absolute top-4 right-4 text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                                <div className="space-y-4 pr-16">
                                                    <div className="space-y-2">
                                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Subgroup Name</label>
                                                        <input
                                                            {...register(`subgroups.${index}.name` as const, { required: true })}
                                                            className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                                                            placeholder="e.g. Welfare Fund, Emergency Response"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Features (Comma-separated)</label>
                                                        <input
                                                            {...register(`subgroups.${index}.features` as const)}
                                                            onChange={(e) => {
                                                                const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                                                setValue(`subgroups.${index}.features`, vals);
                                                            }}
                                                            className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
                                                            placeholder="WELFARE, INVESTMENT, ALERTS"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl font-bold text-black text-lg bg-gradient-to-r from-[#D4AF37] to-[#FACC15] hover:brightness-110 transition-all shadow-lg hover:shadow-[#D4AF37]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={brandColor ? {
                                    backgroundColor: brandColor,
                                    boxShadow: `0 10px 15px -3px ${brandColor}40`
                                } : {}}
                            >
                                {isLoading ? 'Processing...' : 'Register Organization'}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
