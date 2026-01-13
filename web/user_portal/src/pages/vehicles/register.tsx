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
}

interface VehicleFiles {
    insuranceCertificate: File | null;
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
    });

    const [files, setFiles] = useState<VehicleFiles>({
        insuranceCertificate: null,
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
        if (!formData.insurancePolicyNumber.trim()) newErrors.insurancePolicyNumber = 'Insurance policy number is required';
        if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                submitData.append(key, value);
            });

            // Append files
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    submitData.append(key, file);
                }
            });

            // Simulate API call using fetch to a placeholder (or real if exists)
            // For now, we'll keep the logic but prepare for real endpoint
            console.log("Submitting Vehicle Data:", Object.fromEntries(submitData.entries()));

            // TODO: Replace with actual API call
            // const response = await fetch('/api/vehicles/register', { method: 'POST', body: submitData });

            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Vehicle registered successfully!');
            router.push('/dashboard');
        } catch (error) {
            alert('Failed to register vehicle. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white mb-8 inline-flex items-center gap-2 text-sm transition-colors">
                            ← Back to Dashboard
                        </Link>

                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-bold mb-3">Register Your <span className="text-gradient">Vehicle</span></h1>
                            <p className="text-gray-400">Complete the form below to add a new vehicle to your profile.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
                            {/* Vehicle Basics */}
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-3 mb-6 text-brand-yellow">
                                    <FaCar className="text-xl" />
                                    <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Vehicle Specifications</h2>
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
                                </div>
                            </div>

                            {/* Registration Details */}
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-3 mb-6 text-brand-accent">
                                    <FaIdCard className="text-xl" />
                                    <h2 className="text-xl font-bold uppercase tracking-widest text-sm">Legal Registration</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">License Plate Number</label>
                                        <input
                                            name="licensePlate"
                                            value={formData.licensePlate}
                                            onChange={handleInputChange}
                                            className={`w-full bg-brand-dark border ${errors.licensePlate ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-accent transition-all font-mono`}
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
                                            className={`w-full bg-brand-dark border ${errors.logbookNumber ? 'border-red-500' : 'border-gray-800'} rounded-lg px-4 py-3 focus:outline-none focus:border-brand-accent transition-all`}
                                            placeholder="e.g. LOG1234567"
                                        />
                                        {errors.logbookNumber && <p className="text-red-500 text-xs">{errors.logbookNumber}</p>}
                                    </div>
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
                                <div className="flex items-center gap-3 mb-6 text-brand-purple">
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
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
