
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { FaUser, FaCar, FaBuilding, FaArrowRight, FaCheck, FaCheckCircle } from 'react-icons/fa';
import FileUpload from '../components/forms/FileUpload';
import VideoEmbed from '../components/VideoEmbed';

type UserRole = 'passenger' | 'driver' | 'organization';

interface FileUploads {
    // Driver files
    drivingLicence: File | null;
    psvBadge: File | null;
    policeClearance: File | null;
    driverPhoto: File | null;
    // Passenger files
    passengerPhoto: File | null;
    // Organization files
    registrationCertificate: File | null;
}

export default function Register() {
    const [role, setRole] = useState<UserRole | null>(null);
    const router = useRouter();

    // Organization Sub-types
    const [orgType, setOrgType] = useState<'sacco' | 'fleet' | 'corporate'>('sacco');

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [referralValidation, setReferralValidation] = useState<{ valid: boolean; referrerName?: string } | null>(null);

    // File upload state
    const [files, setFiles] = useState<FileUploads>({
        drivingLicence: null,
        psvBadge: null,
        policeClearance: null,
        driverPhoto: null,
        passengerPhoto: null,
        registrationCertificate: null,
    });

    const handleFileChange = (fieldName: keyof FileUploads, file: File | null) => {
        setFiles(prev => ({ ...prev, [fieldName]: file }));
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Create FormData for multipart upload
            const formData = new FormData();

            // Add all form fields
            Object.keys(data).forEach(key => {
                if (data[key]) {
                    formData.append(key, data[key]);
                }
            });

            // Add role and orgType
            formData.append('role', role || '');
            if (role === 'organization') {
                formData.append('orgType', orgType);
            }

            // Add files
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, file);
                }
            });

            // Call the Registration API
            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData, // Send as FormData instead of JSON
            });

            if (!response.ok) throw new Error('Registration failed');

            const result = await response.json();
            console.log("Registration Success:", result);

            // Save user data to localStorage for dashboard access
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(result.user));
            }

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

                            {/* Video Embed for Selected Role */}
                            <div className="mb-8">
                                <VideoEmbed
                                    videoId={role === 'driver' ? 'dQw4w9WgXcQ' : role === 'passenger' ? 'dQw4w9WgXcQ' : 'dQw4w9WgXcQ'}
                                    title={`${role} Registration Guide`}
                                    showChannelLink={false}
                                    className="mb-6"
                                />
                            </div>

                            <h2 className="text-3xl font-bold mb-2 capitalize">Join as {role}</h2>
                            <p className="text-gray-400 mb-8">Enter your details to create your secure account.</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Common Fields */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">First Name</label>
                                        <input {...register('firstName', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Middle Name</label>
                                        <input {...register('middleName')} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Michael" />
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

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Gender</label>
                                            <select {...register('gender', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-gray-300">
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Date of Birth</label>
                                            <input type="date" {...register('dob', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone Number</label>
                                        <input type="tel" {...register('phone', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="+254 712 345 678" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">ID Number</label>
                                        <input {...register('idNumber', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="12345678" />
                                    </div>
                                </div>

                                {/* Organization Specific Fields */}
                                {role === 'organization' && (
                                    <div className="space-y-6 pt-4 border-t border-gray-800 animate-fade-in">
                                        <h3 className="text-lg font-bold text-brand-purple">Organization Details</h3>

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

                                        <FileUpload
                                            label="Registration Certificate"
                                            name="registrationCertificate"
                                            accept="application/pdf"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('registrationCertificate', file)}
                                            value={files.registrationCertificate}
                                            helperText="Upload your organization's registration certificate (PDF only)"
                                        />

                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-md font-semibold text-gray-300 mb-4">Founder Information</h4>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Founder Name</label>
                                                <input {...register('founderName', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="John Doe" />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-md font-semibold text-gray-300 mb-4">Member 1</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Name</label>
                                                    <input {...register('member1Name', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="Jane Smith" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</label>
                                                    <input type="email" {...register('member1Email', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="jane@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone</label>
                                                    <input type="tel" {...register('member1Phone', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="+254 712 345 678" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-md font-semibold text-gray-300 mb-4">Member 2</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Name</label>
                                                    <input {...register('member2Name', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="Bob Johnson" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</label>
                                                    <input type="email" {...register('member2Email', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="bob@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone</label>
                                                    <input type="tel" {...register('member2Phone', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="+254 712 345 678" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="text-md font-semibold text-gray-300 mb-4">Member 3</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Name</label>
                                                    <input {...register('member3Name', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="Alice Williams" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</label>
                                                    <input type="email" {...register('member3Email', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="alice@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone</label>
                                                    <input type="tel" {...register('member3Phone', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all" placeholder="+254 712 345 678" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Driver Specific Fields */}
                                {role === 'driver' && (
                                    <div className="space-y-6 pt-4 border-t border-gray-800 animate-fade-in">
                                        <h3 className="text-lg font-bold text-brand-accent">Driver Documents</h3>

                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">License Number</label>
                                            <input {...register('licenseNumber', { required: true })} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" placeholder="DL-1234567" />
                                        </div>

                                        <FileUpload
                                            label="Driving Licence"
                                            name="drivingLicence"
                                            accept="image/*,application/pdf"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('drivingLicence', file)}
                                            value={files.drivingLicence}
                                            helperText="Upload a clear copy of your driving licence (PDF or Image)"
                                        />

                                        <FileUpload
                                            label="PSV Badge"
                                            name="psvBadge"
                                            accept="image/*,application/pdf"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('psvBadge', file)}
                                            value={files.psvBadge}
                                            helperText="Upload your PSV badge certificate"
                                        />

                                        <FileUpload
                                            label="Police Clearance Certificate"
                                            name="policeClearance"
                                            accept="application/pdf"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('policeClearance', file)}
                                            value={files.policeClearance}
                                            helperText="Upload your police clearance certificate (PDF only)"
                                        />

                                        <FileUpload
                                            label="Professional Passport Photo"
                                            name="driverPhoto"
                                            accept="image/*"
                                            maxSize={2}
                                            required={true}
                                            onChange={(file) => handleFileChange('driverPhoto', file)}
                                            value={files.driverPhoto}
                                            helperText="Upload a professional passport-sized photo"
                                        />
                                    </div>
                                )}

                                {/* Passenger Specific Fields */}
                                {role === 'passenger' && (
                                    <div className="space-y-6 pt-4 border-t border-gray-800 animate-fade-in">
                                        <h3 className="text-lg font-bold text-brand-yellow">Passenger Information</h3>

                                        <FileUpload
                                            label="Professional Passport Photo"
                                            name="passengerPhoto"
                                            accept="image/*"
                                            maxSize={2}
                                            required={false}
                                            onChange={(file) => handleFileChange('passengerPhoto', file)}
                                            value={files.passengerPhoto}
                                            helperText="Upload a professional passport-sized photo (optional)"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Referral Code (Optional)</label>
                                    <input type="text" {...register('referralCode')} className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Enter code if you have one" />
                                    {referralValidation?.valid && (
                                        <p className="text-sm text-green-500 flex items-center gap-1">
                                            <FaCheckCircle /> Referred by {referralValidation.referrerName}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {role === 'passenger' && 'You can use a referral code from a driver or another passenger'}
                                        {role === 'driver' && 'You can use a referral code from another driver'}
                                    </p>
                                </div>

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
