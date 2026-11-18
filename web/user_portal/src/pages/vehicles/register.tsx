import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaCar, FaIdCard, FaShieldAlt, FaArrowRight, FaCamera, FaFileContract, FaTools } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import FileUpload from '@/components/forms/FileUpload';

interface VehicleFormData {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
    logbookNumber: string;
    insurancePolicyNumber: string;
    insuranceExpiry: string;
    vehicleUse: 'TAXI' | 'COMMERCIAL' | 'PRIVATE' | 'INSTITUTIONAL';
    insuranceType: 'PSV' | 'COMMERCIAL' | 'PRIVATE';
    taxiTier: 'STANDARD' | 'COMFORT' | 'PREMIUM' | 'XL' | 'BODA';
    vehicleCategory: string;
    isPsvCab: boolean;
    ownerName: string;
    ownerPhone: string;
    capacity: string;
}

interface VehicleFiles {
    insuranceCertificate: File | null;
    logbookImage: File | null;
    inspectionReport: File | null;
    vehiclePhotoFront: File | null;
    vehiclePhotoBack: File | null;
    vehiclePhotoSide: File | null;
}

export default function VehicleRegistrationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<VehicleFormData>({
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        logbookNumber: '',
        insurancePolicyNumber: '',
        insuranceExpiry: '',
        vehicleUse: 'TAXI',
        insuranceType: 'PSV',
        taxiTier: 'STANDARD',
        vehicleCategory: 'Sedan',
        isPsvCab: true,
        ownerName: '',
        ownerPhone: '',
        capacity: '',
    });

    const [files, setFiles] = useState<VehicleFiles>({
        insuranceCertificate: null,
        logbookImage: null,
        inspectionReport: null,
        vehiclePhotoFront: null,
        vehiclePhotoBack: null,
        vehiclePhotoSide: null,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof VehicleFormData, string>> = {};
        if (!formData.make.trim()) newErrors.make = 'Make is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.year.trim()) newErrors.year = 'Year is required';
        if (!formData.color.trim()) newErrors.color = 'Color is required';
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
        if (!formData.logbookNumber.trim()) newErrors.logbookNumber = 'Logbook number is required';
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone number is required';
        if (!formData.capacity.trim()) newErrors.capacity = 'Vehicle capacity is required';
        if (!formData.insurancePolicyNumber.trim()) newErrors.insurancePolicyNumber = 'Insurance policy number is required';
        if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';

        if (!files.logbookImage) {
            alert("Logbook image is required"); // Simple alert for file, or could add to errors state
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'vehicleUse') {
            let newInsuranceType: 'PSV' | 'COMMERCIAL' | 'PRIVATE' = 'PSV';
            switch (value) {
                case 'TAXI':
                    newInsuranceType = 'PSV';
                    break;
                case 'COMMERCIAL':
                case 'INSTITUTIONAL':
                    newInsuranceType = 'COMMERCIAL';
                    break;
                case 'PRIVATE':
                    newInsuranceType = 'PRIVATE';
                    break;
            }
            setFormData(prev => ({ ...prev, vehicleUse: value as any, insuranceType: newInsuranceType }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name as keyof VehicleFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (fieldName: keyof VehicleFiles, file: File | null) => {
        setFiles(prev => ({ ...prev, [fieldName]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const submitData = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                submitData.append(key, String(value));
            });

            // Append files
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    submitData.append(key, file);
                }
            });

            // Make actual API call
            const response = await fetch('/api/vehicles/register', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }

            alert('Vehicle registered successfully! We will review your documents shortly.');
            router.push('/dashboard?tab=vehicles');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to register vehicle: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [step, setStep] = useState<'lookup' | 'register'>('lookup');
    const [lookupData, setLookupData] = useState({ query: '', type: 'plate' as 'plate' | 'logbook' });
    const [isChecking, setIsChecking] = useState(false);
    const [existingConflict, setExistingConflict] = useState<{ plateNumber: string; make: string; model: string } | null>(null);
    const [transferForm, setTransferForm] = useState({ name: '', phone: '', reason: '' });
    const [transferStatus, setTransferStatus] = useState<string | null>(null);
    const [transferLoading, setTransferLoading] = useState(false);

    const checkVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupData.query.trim()) return;

        setIsChecking(true);
        setExistingConflict(null);
        setTransferStatus(null);
        try {
            const params = new URLSearchParams();
            if (lookupData.type === 'plate') params.append('plateNumber', lookupData.query);
            else params.append('logbookNumber', lookupData.query);

            const res = await fetch(`/api/vehicles/check?${params.toString()}`);
            const data = await res.json();

            if (data.exists) {
                setExistingConflict(data.vehicle);
                return;
            }

            // Vehicle available, proceed to registration
            setFormData(prev => ({
                ...prev,
                licensePlate: lookupData.type === 'plate' ? lookupData.query.toUpperCase() : prev.licensePlate,
                logbookNumber: lookupData.type === 'logbook' ? lookupData.query.toUpperCase() : prev.logbookNumber
            }));
            setStep('register');
        } catch (err) {
            console.error(err);
            alert("Error checking vehicle. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    const handleRequestTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!existingConflict) return;
        setTransferLoading(true);
        setTransferStatus(null);
        try {
            const res = await fetch('/api/vehicles/transfer-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plateNumber: existingConflict.plateNumber,
                    requesterName: transferForm.name,
                    requesterPhone: transferForm.phone,
                    reason: transferForm.reason,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Transfer request failed');
            setTransferStatus(data.message);
        } catch (err: any) {
            setTransferStatus(err.message || 'Could not submit transfer request.');
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <MainLayout
            title="Vehicle Registration | CABI"
            description="Register your vehicle on the CABI platform"
        >
            <div className="min-h-screen bg-brand-black text-white selection:bg-brand-yellow selection:text-black py-12 relative overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white mb-8 inline-flex items-center gap-2 text-sm transition-colors">
                            ← Back to Dashboard
                        </Link>

                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-bold mb-3">Register Your <span className="text-gradient">Vehicle</span></h1>
                            <p className="text-gray-400">
                                {step === 'lookup'
                                    ? "First, let's check if your vehicle is already in our system."
                                    : "Great! Now let's complete the registration details."}
                            </p>
                        </div>

                        {step === 'lookup' && (
                            <div className="glass p-10 rounded-3xl border border-white/5 max-w-xl mx-auto animate-fade-in">
                                <form onSubmit={checkVehicle} className="space-y-6">
                                    <div className="flex gap-4 bg-black/40 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setLookupData({ ...lookupData, type: 'plate' })}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lookupData.type === 'plate' ? 'bg-brand-yellow text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            License Plate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLookupData({ ...lookupData, type: 'logbook' })}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lookupData.type === 'logbook' ? 'bg-brand-yellow text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Logbook Number
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">
                                            Enter {lookupData.type === 'plate' ? 'License Plate Number' : 'Logbook Number'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={lookupData.query}
                                                onChange={(e) => setLookupData({ ...lookupData, query: e.target.value })}
                                                className="w-full bg-brand-dark border border-gray-800 rounded-xl px-6 py-4 text-lg font-mono tracking-wider focus:outline-none focus:border-brand-yellow transition-all text-center uppercase"
                                                placeholder={lookupData.type === 'plate' ? 'KAA 001A' : 'LOG1234567'}
                                                autoFocus
                                            />
                                            {lookupData.type === 'plate' && <FaCar className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />}
                                            {lookupData.type === 'logbook' && <FaFileContract className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isChecking || !lookupData.query.trim()}
                                        className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isChecking ? (
                                            <>Checking System...</>
                                        ) : (
                                            <>Check Availability <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </form>

                                {existingConflict && (
                                    <div className="mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 text-left">
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                                                Number Plate Already Registered
                                            </h3>
                                            <p className="text-xs text-gray-300 mt-1">
                                                <strong>{existingConflict.plateNumber}</strong> ({existingConflict.make} {existingConflict.model}) is currently registered to another account. You can request an ownership/driver transfer below, or ask the current owner to release the vehicle from their dashboard.
                                            </p>
                                        </div>
                                        <form onSubmit={handleRequestTransfer} className="space-y-3">
                                            <input
                                                type="text"
                                                required
                                                value={transferForm.name}
                                                onChange={(e) => setTransferForm({ ...transferForm, name: e.target.value })}
                                                placeholder="Your Full Name *"
                                                className="w-full bg-brand-dark border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white"
                                            />
                                            <input
                                                type="tel"
                                                required
                                                value={transferForm.phone}
                                                onChange={(e) => setTransferForm({ ...transferForm, phone: e.target.value })}
                                                placeholder="Your Phone Number (+254...) *"
                                                className="w-full bg-brand-dark border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white"
                                            />
                                            <input
                                                type="text"
                                                value={transferForm.reason}
                                                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                                                placeholder="Reason for transfer (optional)"
                                                className="w-full bg-brand-dark border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white"
                                            />
                                            <button
                                                type="submit"
                                                disabled={transferLoading}
                                                className="w-full py-3 rounded-xl bg-brand-yellow text-black font-black text-xs uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50"
                                            >
                                                {transferLoading ? 'Sending Transfer Request...' : 'Request Vehicle Transfer'}
                                            </button>
                                            {transferStatus && (
                                                <p className="text-xs text-emerald-400 font-semibold">{transferStatus}</p>
                                            )}
                                        </form>
                                    </div>
                                )}
                                <div className="mt-8 text-center">
                                    <p className="text-xs text-gray-500">
                                        This helps us prevent duplicate registrations and ensures compliance with NTSA regulations.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 'register' && (
                            <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
                                {/* Pre-filled info banner */}
                                <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-yellow text-black flex items-center justify-center text-lg font-bold">✓</div>
                                    <div>
                                        <div className="text-sm text-brand-yellow font-bold uppercase tracking-wider">Vehicle Available</div>
                                        <div className="text-gray-300 text-sm">Proceeding with registration for: <span className="text-white font-mono font-bold">{lookupData.type === 'plate' ? lookupData.query.toUpperCase() : `Logbook ${lookupData.query.toUpperCase()}`}</span></div>
                                    </div>
                                    <button type="button" onClick={() => setStep('lookup')} className="ml-auto text-xs font-bold underline hover:text-white text-gray-400">Change</button>
                                </div>
                                {/* Vehicle Basics */}
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-6 text-brand-yellow">
                                        <FaCar className="text-xl" />
                                        <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Vehicle Specifications</h2>
                                    </div>

                                    {/* PSV Cab Registration Banner & Taxi Tier First */}
                                    <div className="mb-6 p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">PSV Cab Registration</span>
                                            <p className="text-xs text-gray-300 mt-0.5">You are registering this vehicle as a licensed PSV Cab on CABI Africa.</p>
                                        </div>
                                        <label className="inline-flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isPsvCab}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isPsvCab: e.target.checked, vehicleUse: e.target.checked ? 'TAXI' : prev.vehicleUse, insuranceType: e.target.checked ? 'PSV' : prev.insuranceType }))}
                                                className="w-4 h-4 accent-[#D4AF37]"
                                            />
                                            Confirm PSV Cab
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">Taxi Tier (Register First) *</label>
                                            <select
                                                name="taxiTier"
                                                value={formData.taxiTier}
                                                onChange={handleInputChange}
                                                className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all text-white"
                                            >
                                                <option value="STANDARD">Cabi Standard Taxi</option>
                                                <option value="COMFORT">Cabi Comfort Taxi</option>
                                                <option value="PREMIUM">Cabi Executive Taxi</option>
                                                <option value="XL">Cabi XL Taxi (7-Seater)</option>
                                                <option value="BODA">Cabi Boda</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">Vehicle Category *</label>
                                            <select
                                                name="vehicleCategory"
                                                value={formData.vehicleCategory}
                                                onChange={handleInputChange}
                                                className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all text-white"
                                            >
                                                <option value="Sedan">Sedan / Saloon</option>
                                                <option value="Hatchback">Hatchback</option>
                                                <option value="Station Wagon">Station Wagon</option>
                                                <option value="SUV">SUV / Crossover</option>
                                                <option value="Van / MPV">Van / MPV (7+ Seats)</option>
                                                <option value="Motorcycle">Motorcycle (Boda)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 mb-6">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">Vehicle Usage</label>
                                        <select
                                            name="vehicleUse"
                                            value={formData.vehicleUse}
                                            onChange={handleInputChange}
                                            className="w-full bg-brand-dark border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all text-white appearance-none cursor-pointer"
                                        >
                                            <option value="TAXI">Taxi / Ride Hailing Service</option>
                                            <option value="COMMERCIAL">Commercial / Goods Transport</option>
                                            <option value="PRIVATE">Private Use</option>
                                            <option value="INSTITUTIONAL">Institutional / Corporate</option>
                                        </select>
                                        <p className="text-xs text-gray-400 mt-2">
                                            * Selecting <span className="text-brand-yellow font-bold">{formData.vehicleUse}</span> usage requires <span className="text-brand-yellow font-bold">{formData.insuranceType}</span> insurance.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Vehicle Make</label>
                                            <input
                                                name="make"
                                                value={formData.make}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.make ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all`}
                                                placeholder="e.g. Toyota"
                                            />
                                            {errors.make && <p className="text-red-500 text-xs">{errors.make}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Vehicle Model</label>
                                            <input
                                                name="model"
                                                value={formData.model}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.model ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all`}
                                                placeholder="e.g. Fielder"
                                            />
                                            {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Manufacturing Year</label>
                                            <input
                                                name="year"
                                                type="number"
                                                value={formData.year}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.year ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all`}
                                                placeholder="2018"
                                            />
                                            {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Vehicle Color</label>
                                            <input
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.color ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all`}
                                                placeholder="White"
                                            />
                                            {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                                                {formData.vehicleUse === 'COMMERCIAL' ? 'Load Capacity (Tons)' : 'Passenger Capacity (Seats)'}
                                            </label>
                                            <input
                                                name="capacity"
                                                type="number"
                                                step={formData.vehicleUse === 'COMMERCIAL' ? "0.1" : "1"}
                                                value={formData.capacity}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.capacity ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-yellow transition-all`}
                                                placeholder={formData.vehicleUse === 'COMMERCIAL' ? "e.g. 3.5" : "e.g. 4"}
                                            />
                                            {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Details */}
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-6 text-[#FACC15]">
                                        <FaIdCard className="text-xl" />
                                        <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Legal Registration & Ownership</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">License Plate Number</label>
                                            <input
                                                name="licensePlate"
                                                value={formData.licensePlate}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.licensePlate ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all font-mono`}
                                                placeholder="KAA 001A"
                                            />
                                            {errors.licensePlate && <p className="text-red-500 text-xs">{errors.licensePlate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Logbook Number</label>
                                            <input
                                                name="logbookNumber"
                                                value={formData.logbookNumber}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.logbookNumber ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all`}
                                                placeholder="e.g. LOG1234567"
                                            />
                                            {errors.logbookNumber && <p className="text-red-500 text-xs">{errors.logbookNumber}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Car Owner Name</label>
                                            <input
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.ownerName ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all`}
                                                placeholder="Full Name as on Logbook"
                                            />
                                            {errors.ownerName && <p className="text-red-500 text-xs">{errors.ownerName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Owner Phone Number</label>
                                            <input
                                                name="ownerPhone"
                                                type="tel"
                                                value={formData.ownerPhone}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.ownerPhone ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all`}
                                                placeholder="+254 7..."
                                            />
                                            {errors.ownerPhone && <p className="text-red-500 text-xs">{errors.ownerPhone}</p>}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <FileUpload
                                            label="Upload Vehicle Logbook"
                                            name="logbookImage"
                                            accept="image/*,application/pdf"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('logbookImage', file)}
                                            value={files.logbookImage}
                                            helperText="Please ensure the logbook image is clear and details match the registration form."
                                        />
                                    </div>
                                </div>

                                {/* Insurance Details & Documents */}
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-6 text-emerald-400">
                                        <FaShieldAlt className="text-xl" />
                                        <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Insurance & Docs</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Policy Number</label>
                                            <input
                                                name="insurancePolicyNumber"
                                                value={formData.insurancePolicyNumber}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.insurancePolicyNumber ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-400 transition-all`}
                                                placeholder="POL-123456"
                                            />
                                            {errors.insurancePolicyNumber && <p className="text-red-500 text-xs">{errors.insurancePolicyNumber}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Insurance Expiry Date</label>
                                            <input
                                                name="insuranceExpiry"
                                                type="date"
                                                value={formData.insuranceExpiry}
                                                onChange={handleInputChange}
                                                className={`w-full bg-brand-dark border ${errors.insuranceExpiry ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-400 transition-all text-gray-300`}
                                            />
                                            {errors.insuranceExpiry && <p className="text-red-500 text-xs">{errors.insuranceExpiry}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileUpload
                                            label="Insurance Certificate"
                                            name="insuranceCertificate"
                                            accept="application/pdf,image/*"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('insuranceCertificate', file)}
                                            value={files.insuranceCertificate}
                                            helperText="Upload valid insurance certificate"
                                        />
                                        <FileUpload
                                            label="Inspection Report"
                                            name="inspectionReport"
                                            accept="application/pdf,image/*"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('inspectionReport', file)}
                                            value={files.inspectionReport}
                                            helperText="Upload recent vehicle inspection report"
                                        />
                                    </div>
                                </div>

                                {/* Vehicle Photos */}
                                <div className="glass p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-6 text-[#D4AF37]">
                                        <FaCamera className="text-xl" />
                                        <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Vehicle Photos</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FileUpload
                                            label="Front View"
                                            name="vehiclePhotoFront"
                                            accept="image/*"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('vehiclePhotoFront', file)}
                                            value={files.vehiclePhotoFront}
                                        />
                                        <FileUpload
                                            label="Back View"
                                            name="vehiclePhotoBack"
                                            accept="image/*"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('vehiclePhotoBack', file)}
                                            value={files.vehiclePhotoBack}
                                        />
                                        <FileUpload
                                            label="Side View"
                                            name="vehiclePhotoSide"
                                            accept="image/*"
                                            maxSize={5}
                                            required={true}
                                            onChange={(file) => handleFileChange('vehiclePhotoSide', file)}
                                            value={files.vehiclePhotoSide}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-extrabold text-xl rounded-2xl shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all hover:scale-[1.01] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Registering...' : (
                                        <>
                                            Submit Vehicle Registration <FaArrowRight />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
