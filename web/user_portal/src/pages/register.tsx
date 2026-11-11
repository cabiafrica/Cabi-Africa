import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { User, Car, Key, ArrowRight, CheckCircle, Building, ShieldCheck, Loader2, Mail, Phone, Lock } from 'lucide-react';
import FileUpload from '../components/forms/FileUpload';
import VideoEmbed from '../components/VideoEmbed';
import BrandLogo from '@/components/ui/BrandLogo';

type UserRole = 'passenger' | 'driver' | 'vehicle_owner';

interface FileUploads {
    // Driver files
    drivingLicence: File | null;
    psvBadge: File | null;
    policeClearance: File | null;
    driverPhoto: File | null;
    // Passenger files
    passengerPhoto: File | null;
    // Vehicle Owner files - Removed from initial registration
    idCopy: File | null;
    kraPin: File | null;
}

export default function Register() {
    const [role, setRole] = useState<UserRole | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [referralValidation, setReferralValidation] = useState<{ valid: boolean; referrerName?: string } | null>(null);
    const [driverStep, setDriverStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation Helpers
    const validateName = (val: string, fieldName = 'Name') => {
        if (!val || !val.trim()) return `${fieldName} is required`;
        const trimmed = val.trim();
        if (/^\d+$/.test(trimmed)) return `${fieldName} cannot be a number`;
        if (/\d/.test(trimmed)) return `${fieldName} cannot contain numbers`;
        if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return `${fieldName} can only contain letters, hyphens, and apostrophes`;
        if (trimmed.length < 2) return `${fieldName} must be at least 2 characters`;
        return true;
    };

    const validatePhone = (val: string) => {
        if (!val || !val.trim()) return "Phone number is required";
        const cleaned = val.replace(/\s+/g, '');
        if (!/^(?:\+254|0)?(7|1)\d{8}$/.test(cleaned) && !/^\+[1-9]\d{7,14}$/.test(cleaned)) {
            return "Enter a valid phone number (e.g. +254 712 345 678)";
        }
        return true;
    };

    const validatePassword = (val: string) => {
        if (!val) return "Password is required";
        if (val.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(val)) return "Password must contain at least one lowercase letter";
        if (!/\d/.test(val)) return "Password must contain at least one number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) return "Password must contain at least one special character (!@#$%^&*)";
        return true;
    };

    const passwordVal = watch('password') || '';
    const hasMinLength = passwordVal.length >= 8;
    const hasUppercase = /[A-Z]/.test(passwordVal);
    const hasLowercase = /[a-z]/.test(passwordVal);
    const hasNumber = /\d/.test(passwordVal);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordVal);

    // File upload state
    const [files, setFiles] = useState<FileUploads>({
        drivingLicence: null,
        psvBadge: null,
        policeClearance: null,
        driverPhoto: null,
        passengerPhoto: null,
        idCopy: null,
        kraPin: null,
    });

    const handleFileChange = (fieldName: keyof FileUploads, file: File | null) => {
        setFiles(prev => ({ ...prev, [fieldName]: file }));
    };

    const handleNextStep = async () => {
        const isValid = await trigger(['firstName', 'lastName', 'email', 'phone', 'gender', 'dob', 'idNumber', 'licenseNumber']);
        if (isValid) {
            setDriverStep(2);
        }
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

            // Add role
            formData.append('role', role || '');

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

            // Perform login via context (handles storage and redirect)
            if (result.token && result.user) {
                login(result.token, result.user);
            } else {
                // Fallback for unexpected API response structure
                if (typeof window !== 'undefined') {
                    localStorage.setItem('authUser', JSON.stringify(result.user));
                }
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-brand-black text-slate-900 dark:text-white selection:bg-brand-yellow selection:text-black overflow-hidden relative font-sans transition-colors duration-300">
            <Head>
                <title>Join Cabi - The Future of Mobility</title>
            </Head>

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10">

                {/* Header */}
                <div className="mb-12 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                        <BrandLogo size="md" />
                    </Link>
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                        Already have an account? <Link href="/login" className="text-brand-yellow hover:underline font-bold">Log In</Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {!role ? (
                        // STEP 1: ROLE SELECTION
                        <div className="animate-fade-in">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
                                How will you use <span className="text-brand-yellow">Cabi</span>?
                            </h1>
                            <p className="text-slate-600 dark:text-gray-400 text-center mb-12 text-lg">Choose your journey type to get started.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* Passenger Card */}
                                <button onClick={() => setRole('passenger')} className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all hover:-translate-y-2 shadow-sm hover:shadow-lg hover:border-brand-yellow/50 text-left">
                                    <div className="h-14 w-14 bg-slate-100 dark:bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-xl text-slate-600 dark:text-gray-300 group-hover:text-brand-yellow border border-slate-200 dark:border-white/10">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">Passenger</h3>
                                    <p className="text-slate-600 dark:text-gray-400 text-xs">Book rides, track trips, and manage your personal travel history.</p>
                                </button>

                                {/* Driver Card */}
                                <button onClick={() => setRole('driver')} className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all hover:-translate-y-2 shadow-sm hover:shadow-lg hover:border-[#D4AF37]/50 text-left">
                                    <div className="h-14 w-14 bg-slate-100 dark:bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-xl text-slate-600 dark:text-gray-300 group-hover:text-[#FACC15] border border-slate-200 dark:border-white/10">
                                        <Car className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">Driver</h3>
                                    <p className="text-slate-600 dark:text-gray-400 text-xs">Drive your own car, manage earnings, and build your own fleet.</p>
                                </button>

                                {/* Vehicle Owner Card */}
                                <button onClick={() => setRole('vehicle_owner')} className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all hover:-translate-y-2 shadow-sm hover:shadow-lg hover:border-brand-yellow/50 text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-brand-yellow text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">EARN</div>
                                    <div className="h-14 w-14 bg-slate-100 dark:bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-xl text-slate-600 dark:text-gray-300 group-hover:text-brand-yellow border border-slate-200 dark:border-white/10">
                                        <Key className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">Vehicle Owner</h3>
                                    <p className="text-slate-600 dark:text-gray-400 text-xs">List your vehicles, manage drivers, and earn passive income.</p>
                                </button>

                                {/* Corporate Card */}
                                <Link
                                    href="/corporate/register"
                                    className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-[#D4AF37]/35 hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all hover:-translate-y-2 shadow-sm hover:shadow-lg hover:border-[#FACC15]/70 text-left relative overflow-hidden block"
                                >
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#FACC15] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">BUSINESS</div>
                                    <div className="h-14 w-14 bg-slate-100 dark:bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-xl text-slate-600 dark:text-gray-300 group-hover:text-[#FACC15] border border-slate-200 dark:border-white/10">
                                        <Building className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">Corporate</h3>
                                    <p className="text-slate-600 dark:text-gray-400 text-xs">Set up corporate travel accounts, employee ride allowances, and unified billing.</p>
                                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FACC15] opacity-90 group-hover:translate-x-1 transition-transform">
                                        Register Company <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // STEP 2: REGISTRATION FORM
                        <div className="animate-slide-up max-w-xl mx-auto bg-white dark:bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">
                            <button onClick={() => { setRole(null); setDriverStep(1); }} className="text-slate-500 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white mb-8 flex items-center gap-2 text-sm font-medium transition-colors">
                                ← Back to roles
                            </button>

                            {/* Video Embed for Selected Role */}
                            <div className="mb-8">
                                <VideoEmbed
                                    videoId={role === 'driver' ? 'dQw4w9WgXcQ' : role === 'passenger' ? 'dQw4w9WgXcQ' : 'dQw4w9WgXcQ'} // TODO: Update video IDs per role
                                    title={`${role === 'vehicle_owner' ? 'Vehicle Owner' : role} Registration Guide`}
                                    showChannelLink={false}
                                    className="mb-6 rounded-xl overflow-hidden shadow-2xl"
                                />
                            </div>

                            <h2 className="text-3xl font-bold mb-2 capitalize text-slate-900 dark:text-white">
                                Join as {role === 'vehicle_owner' ? 'Vehicle Owner' : role}
                            </h2>
                            <p className="text-slate-600 dark:text-gray-400 mb-8">
                                {role === 'driver' && driverStep === 1 && "Start your journey - Personal Details (1/2)"}
                                {role === 'driver' && driverStep === 2 && "Finalize Profile - Documents & Secure (2/2)"}
                                {role !== 'driver' && "Enter your details to create your secure account."}
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* Common Fields - Simplified for Passenger & Vehicle Owner */}
                                {(role === 'passenger' || role === 'vehicle_owner') && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">First Name</label>
                                                <input
                                                    {...register('firstName', {
                                                        required: 'First name is required',
                                                        validate: (val) => validateName(val, 'First name')
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="John"
                                                />
                                                {errors.firstName && <span className="text-red-500 text-xs block">{errors.firstName.message as string}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Last Name</label>
                                                <input
                                                    {...register('lastName', {
                                                        required: 'Last name is required',
                                                        validate: (val) => validateName(val, 'Last name')
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="Doe"
                                                />
                                                {errors.lastName && <span className="text-red-500 text-xs block">{errors.lastName.message as string}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone Number</label>
                                            <input
                                                type="tel"
                                                {...register('phone', {
                                                    required: 'Phone number is required',
                                                    validate: validatePhone
                                                })}
                                                className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                placeholder="+254 712 345 678"
                                            />
                                            {errors.phone && <span className="text-red-500 text-xs block">{errors.phone.message as string}</span>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email Address</label>
                                            <input type="email" {...register('email', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                )}


                                {/* Driver Specific Fields - 2 Steps */}
                                {role === 'driver' && driverStep === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        {/* Step 1: Personal Information */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">First Name</label>
                                                <input
                                                    {...register('firstName', {
                                                        required: 'First name is required',
                                                        validate: (val) => validateName(val, 'First name')
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="John"
                                                />
                                                {errors.firstName && <span className="text-red-500 text-xs block">{errors.firstName.message as string}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Middle Name</label>
                                                <input
                                                    {...register('middleName', {
                                                        validate: (val) => !val || validateName(val, 'Middle name')
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="Michael"
                                                />
                                                {errors.middleName && <span className="text-red-500 text-xs block">{errors.middleName.message as string}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Last Name</label>
                                                <input
                                                    {...register('lastName', {
                                                        required: 'Last name is required',
                                                        validate: (val) => validateName(val, 'Last name')
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="Doe"
                                                />
                                                {errors.lastName && <span className="text-red-500 text-xs block">{errors.lastName.message as string}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email Address</label>
                                            <input type="email" {...register('email', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" placeholder="john@example.com" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Gender</label>
                                                <select {...register('gender', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-700 dark:text-gray-300">
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Date of Birth</label>
                                                <input type="date" {...register('dob', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-700 dark:text-gray-300" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    {...register('phone', {
                                                        required: 'Phone number is required',
                                                        validate: validatePhone
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="+254 712 345 678"
                                                />
                                                {errors.phone && <span className="text-red-500 text-xs block">{errors.phone.message as string}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">ID Number</label>
                                                <input {...register('idNumber', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" placeholder="12345678" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">License Number</label>
                                            <input {...register('licenseNumber', { required: true })} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" placeholder="DL-1234567" />
                                        </div>

                                        {/* Next Button for Step 1 */}
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="w-full py-4 rounded-xl font-bold text-black text-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 shadow-lg bg-gradient-to-r from-[#D4AF37] to-[#FACC15] hover:brightness-110"
                                        >
                                            Next Step: Documents <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {role === 'driver' && driverStep === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <h3 className="text-lg font-bold text-[#FACC15]">Driver Documents & Security</h3>

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

                                        {/* Back Button forStep 2 */}
                                        <button
                                            type="button"
                                            onClick={() => setDriverStep(1)}
                                            className="text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                                        >
                                            ← Back to Personal Details
                                        </button>
                                    </div>
                                )}

                                {(role !== 'driver' || (role === 'driver' && driverStep === 2)) && (
                                    <>
                                        {role !== 'vehicle_owner' && (
                                            <div className="space-y-2 animate-fade-in">
                                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Referral Code (Optional)</label>
                                                <input type="text" {...register('referralCode')} className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600" placeholder="Enter code if you have one" />
                                                {referralValidation?.valid && (
                                                    <p className="text-sm text-green-500 flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" /> Referred by {referralValidation.referrerName}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {role === 'passenger' && 'You can use a referral code from a driver or another passenger'}
                                                    {role === 'driver' && 'You can use a referral code from another driver'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2 animate-fade-in relative">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    {...register('password', {
                                                        required: 'Password is required',
                                                        validate: validatePassword
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && <span className="text-red-500 text-xs block">{errors.password.message as string}</span>}

                                            {/* Real-time Password Security Indicators */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                                                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                    8+ characters
                                                </div>
                                                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                    Uppercase letter
                                                </div>
                                                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasLowercase ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                    Lowercase letter
                                                </div>
                                                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                    Number
                                                </div>
                                                <div className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                                                    Special character (!@#$%^&*...)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 animate-fade-in relative">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...register('confirmPassword', {
                                                        required: true,
                                                        validate: (val: string) => {
                                                            if (watch('password') !== val) {
                                                                return "Your passwords do not match";
                                                            }
                                                            return true;
                                                        }
                                                    })}
                                                    className="w-full bg-slate-50 dark:bg-brand-dark/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-slate-900 dark:hover:text-white"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message as string}</span>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full py-4 rounded-xl font-bold text-black text-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 shadow-lg
                                            ${role === 'vehicle_owner' ? 'bg-brand-yellow hover:bg-yellow-400' : role === 'driver' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FACC15] hover:brightness-110' : 'bg-brand-yellow hover:bg-yellow-400'}
                                            `}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                                                <>
                                                    Create Account <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                                    By joining, you agree to our <Link href="/terms-of-service" className="underline hover:text-slate-900 dark:hover:text-white">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>.
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
