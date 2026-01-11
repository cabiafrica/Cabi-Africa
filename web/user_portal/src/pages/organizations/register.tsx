import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/router';
import { FaBuilding, FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function RegisterOrganization() {
    const router = useRouter();
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            orgName: '',
            email: '',
            bio: '',
            regNumber: '',
            regCertificate: null,
            taxPin: '',
            members: [{ name: '', contact: '' }, { name: '', contact: '' }, { name: '', contact: '' }]
        }
    });

    const { fields } = useFieldArray({
        control,
        name: "members"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [orgType, setOrgType] = useState<'sacco' | 'fleet' | 'corporate'>('fleet');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if file was uploaded (mock check)
        const isVerified = data.regCertificate && data.regCertificate.length > 0;

        console.log("Organization Registration Data:", {
            ...data,
            orgType,
            status: isVerified ? 'Pending Verification' : 'Unverified'
        });

        // Mock alert for now
        alert(`Organization registered successfully! Status: ${isVerified ? 'Verified (Pending Approval)' : 'Unverified'}. You can now switch to your Organization dashboard.`);
        router.push('/dashboard');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-purple selection:text-white">
            <Head>
                <title>Register Organization - Cabi</title>
            </Head>

            <div className="container mx-auto px-6 py-12">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-brand-purple/10 text-brand-purple text-4xl mb-6 border border-brand-purple/20">
                            <FaBuilding />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Register Your Organization</h1>
                        <p className="text-gray-400 text-lg">Scale your operations. Required for Fleets and Saccos.</p>
                    </div>

                    <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-brand-purple to-blue-500 left-0"></div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Organization Type Selection */}
                            <div className="space-y-4">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Organization Type</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setOrgType('fleet')}
                                        className={`p-4 rounded-xl border text-center transition-all ${orgType === 'fleet' ? 'bg-brand-purple text-white border-brand-purple shadow-lg' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
                                    >
                                        <div className="font-bold mb-1">Fleet</div>
                                        <div className="text-xs opacity-70">Manage vehicles</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrgType('sacco')}
                                        className={`p-4 rounded-xl border text-center transition-all ${orgType === 'sacco' ? 'bg-brand-purple text-white border-brand-purple shadow-lg' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
                                    >
                                        <div className="font-bold mb-1">Sacco</div>
                                        <div className="text-xs opacity-70">Cooperative</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrgType('corporate')}
                                        className={`p-4 rounded-xl border text-center transition-all ${orgType === 'corporate' ? 'bg-brand-purple text-white border-brand-purple shadow-lg' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
                                    >
                                        <div className="font-bold mb-1">Corporate</div>
                                        <div className="text-xs opacity-70">Business travel</div>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Organization Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Organization Name</label>
                                        <input
                                            {...register('orgName', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                                            placeholder="Enter organization name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Business Email</label>
                                        <input
                                            type="email"
                                            {...register('email', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                                            placeholder="admin@organization.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Purpose / Bio</label>
                                    <textarea
                                        {...register('bio', { required: true })}
                                        className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all h-24"
                                        placeholder="Describe your organization's mission, goals, or services..."
                                    />
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
                                          file:bg-brand-purple/20 file:text-brand-purple
                                          hover:file:bg-brand-purple/30"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Registration Number</label>
                                        <input
                                            {...register('regNumber', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                                            placeholder="REG-12345"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Tax PIN (KRA)</label>
                                        <input
                                            {...register('taxPin', { required: true })}
                                            className="w-full bg-brand-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                                            placeholder="P05..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Founding Members */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Founding Members (Min. 3)</h3>
                                <div className="grid gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Member {index + 1} Name</label>
                                                <input
                                                    {...register(`members.${index}.name` as const, { required: true })}
                                                    className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all text-sm"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Member {index + 1} Contact</label>
                                                <input
                                                    {...register(`members.${index}.contact` as const, { required: true })}
                                                    className="w-full bg-brand-black/50 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all text-sm"
                                                    placeholder="Phone or Email"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl font-bold text-white text-lg bg-brand-purple hover:bg-brand-purple/80 transition-all shadow-lg hover:shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
