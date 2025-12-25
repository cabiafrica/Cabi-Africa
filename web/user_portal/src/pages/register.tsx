
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { FaUser, FaCar, FaBuilding, FaArrowRight, FaCheck } from 'react-icons/fa';

type UserRole = 'passenger' | 'driver' | 'organization';

export default function Register() {
    const [role, setRole] = useState<UserRole | null>(null);
    const router = useRouter();

    // Organization Sub-types
    const [orgType, setOrgType] = useState<'sacco' | 'fleet' | 'corporate'>('sacco');

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Call the Driver Lead Service API
            const response = await fetch('http://localhost:3000/api/driver-lead-service/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    role: role,
                    orgType: role === 'organization' ? orgType : undefined,
                }),
            });

            if (!response.ok) throw new Error('Registration failed');

            const result = await response.json();
            console.log("Registration Success:", result);

            // Redirect to dashboard or success page
            router.push('/dashboard');
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white selection:bg-brand-yellow selection:text-black overflow-hidden relative">
            <Head>
                <title>Join Cabi - The Future of Mobility</title>
            </Head>

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10">

                {/* Header */}
                <div className="mb-12 flex justify-between items-center">
                    <Link href="/" className="text-3xl font-bold tracking-tighter hover:text-brand-yellow transition-colors">
                        Cabi <span className="text-brand-yellow">.</span>
                    </Link>
                    <div className="text-sm text-gray-400">
                        Already have an account? <Link href="/login" className="text-brand-yellow hover:underline">Log In</Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {!role ? (
                        // STEP 1: ROLE SELECTION
                        <div className="animate-fade-in">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                                How will you use <span className="text-gradient">Cabi</span>?
                            </h1>
                            <p className="text-gray-400 text-center mb-12 text-lg">Choose your journey type to get started.</p>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Passenger Card */}
                                <button onClick={() => setRole('passenger')} className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-2 border-transparent hover:border-brand-yellow/50 text-left">
                                    <div className="h-16 w-16 bg-brand-dark rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl text-gray-300 group-hover:text-brand-yellow border border-white/10">
                                        <FaUser />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Passenger</h3>
                                    <p className="text-gray-400 text-sm">Book rides, track trips, and manage your personal travel history.</p>
                                </button>

                                {/* Driver Card */}
                                <button onClick={() => setRole('driver')} className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-2 border-transparent hover:border-brand-accent/50 text-left">
                                    <div className="h-16 w-16 bg-brand-dark rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl text-gray-300 group-hover:text-brand-accent border border-white/10">
                                        <FaCar />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Driver</h3>
                                    <p className="text-gray-400 text-sm">Drive your own car, manage earnings, and build your own fleet.</p>
                                </button>

                                {/* Organization Card */}
                                <button onClick={() => setRole('organization')} className="group p-8 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-2 border-transparent hover:border-brand-purple/50 text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-brand-purple/20 text-brand-purple text-xs font-bold px-3 py-1 rounded-bl-lg">NEW</div>
                                    <div className="h-16 w-16 bg-brand-dark rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl text-gray-300 group-hover:text-brand-purple border border-white/10">
                                        <FaBuilding />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Organization</h3>
                                    <p className="text-gray-400 text-sm">Manage fleets, drivers, saccos, or corporate travel accounts.</p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // STEP 2: REGISTRATION FORM
                        <div className="animate-slide-up max-w-xl mx-auto glass p-8 md:p-12 rounded-3xl border-t border-brand-yellow/20">
                            <button onClick={() => setRole(null)} className="text-gray-500 hover:text-white mb-8 flex items-center gap-2 text-sm">
                                ← Back to roles
                            </button>

                            <h2 className="text-3xl font-bold mb-2 capitalize">Join as {role}</h2>
                            <p className="text-gray-400 mb-8">Enter your details to create your secure account.</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Common Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">First Name</label>
                                        <input {...register('firstName', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Last Name</label>
                                        <input {...register('lastName', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email Address</label>
                                    <input type="email" {...register('email', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="john@example.com" />
                                </div>

                                {/* Organization Specific Fields */}
                                {role === 'organization' && (
                                    <div className="space-y-6 pt-4 border-t border-gray-800 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Organization Name</label>
                                            <input {...register('orgName', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="Nairobi Central Sacco" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Type</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button type="button" onClick={() => setOrgType('sacco')} className={`px-4 py-2 rounded-lg text-sm border ${orgType === 'sacco' ? 'bg-brand-purple/20 border-brand-purple text-brand-purple' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>Sacco</button>
                                                <button type="button" onClick={() => setOrgType('fleet')} className={`px-4 py-2 rounded-lg text-sm border ${orgType === 'fleet' ? 'bg-brand-purple/20 border-brand-purple text-brand-purple' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>Fleet Co.</button>
                                                <button type="button" onClick={() => setOrgType('corporate')} className={`px-4 py-2 rounded-lg text-sm border ${orgType === 'corporate' ? 'bg-brand-purple/20 border-brand-purple text-brand-purple' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>Corporate</button>
                                            </div>
                                            <input type="hidden" {...register('orgType')} value={orgType} />
                                        </div>
                                    </div>
                                )}

                                {/* Driver Specific Fields */}
                                {role === 'driver' && (
                                    <div className="space-y-6 pt-4 border-t border-gray-800 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">License Number</label>
                                            <input {...register('licenseNumber', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" placeholder="DL-1234567" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Password</label>
                                    <input type="password" {...register('password', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="••••••••" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-xl font-bold text-black text-lg transition-all flex items-center justify-center gap-2
                            ${role === 'organization' ? 'bg-brand-purple hover:bg-blue-400' : role === 'driver' ? 'bg-brand-accent hover:bg-cyan-300' : 'bg-brand-yellow hover:bg-yellow-400'}
                            `}
                                >
                                    {isLoading ? 'Creating Account...' : (
                                        <>
                                            Create Account <FaArrowRight className="text-sm" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                                    By joining, you agree to our <Link href="/terms" className="underline hover:text-white">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
