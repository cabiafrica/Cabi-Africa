import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

interface DriverEntry {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vehicleType: 'car' | 'motorcycle' | 'tuktuk' | '';
}

interface OrganizationData {
    organizationName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    organizationType: 'sacco' | 'fleet' | 'cooperative' | 'other' | '';
    numberOfDrivers: number;
    referralCode: string;
}

const REGISTRATION_FEE_PER_DRIVER = 2000; // KES
const GROUP_DISCOUNT_THRESHOLD = 10;
const GROUP_DISCOUNT_PERCENTAGE = 15; // 15% discount for 10+ drivers

export default function GroupRegistrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [organizationData, setOrganizationData] = useState<OrganizationData>({
        organizationName: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        organizationType: '',
        numberOfDrivers: 0,
        referralCode: '',
    });

    const [drivers, setDrivers] = useState<DriverEntry[]>([
        { id: '1', firstName: '', lastName: '', email: '', phone: '', vehicleType: '' },
    ]);

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 3;

    const calculateTotalCost = () => {
        const baseTotal = drivers.length * REGISTRATION_FEE_PER_DRIVER;
        if (drivers.length >= GROUP_DISCOUNT_THRESHOLD) {
            const discount = baseTotal * (GROUP_DISCOUNT_PERCENTAGE / 100);
            return baseTotal - discount;
        }
        return baseTotal;
    };

    const calculateSavings = () => {
        if (drivers.length >= GROUP_DISCOUNT_THRESHOLD) {
            const baseTotal = drivers.length * REGISTRATION_FEE_PER_DRIVER;
            return baseTotal * (GROUP_DISCOUNT_PERCENTAGE / 100);
        }
        return 0;
    };

    const addDriver = () => {
        const newDriver: DriverEntry = {
            id: Date.now().toString(),
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            vehicleType: '',
        };
        setDrivers([...drivers, newDriver]);
    };

    const removeDriver = (id: string) => {
        if (drivers.length > 1) {
            setDrivers(drivers.filter(d => d.id !== id));
        }
    };

    const updateDriver = (id: string, field: keyof DriverEntry, value: string) => {
        setDrivers(drivers.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const handleOrgInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOrganizationData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (step: number): boolean => {
        const newErrors: any = {};

        if (step === 1) {
            if (!organizationData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
            if (!organizationData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
            if (!organizationData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizationData.contactEmail)) newErrors.contactEmail = 'Invalid email format';
            if (!organizationData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
            if (!organizationData.organizationType) newErrors.organizationType = 'Organization type is required';
        } else if (step === 2) {
            drivers.forEach((driver, index) => {
                if (!driver.firstName.trim()) newErrors[`driver_${index}_firstName`] = 'Required';
                if (!driver.lastName.trim()) newErrors[`driver_${index}_lastName`] = 'Required';
                if (!driver.email.trim()) newErrors[`driver_${index}_email`] = 'Required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) newErrors[`driver_${index}_email`] = 'Invalid email';
                if (!driver.phone.trim()) newErrors[`driver_${index}_phone`] = 'Required';
                if (!driver.vehicleType) newErrors[`driver_${index}_vehicleType`] = 'Required';
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/driver-leads/group-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organization: organizationData, drivers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to register group');
            }

            const result = await response.json();

            // Redirect to payment page with registration data
            router.push({
                pathname: '/drivers/register/payment',
                query: {
                    organizationId: result.organizationId,
                    driverIds: result.driverIds,
                    totalAmount: result.totalAmount,
                    discount: result.discount,
                    finalAmount: result.finalAmount,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex-1 flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${step <= currentStep
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-md'
                            : 'bg-slate-100 dark:bg-surface-dark border-slate-300 dark:border-white/15 text-neutral-400'
                            }`}>
                            {step < currentStep ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span className="font-semibold">{step}</span>
                            )}
                        </div>
                        {step < 3 && (
                            <div className={`flex-1 h-1 mx-2 rounded-full ${step < currentStep ? 'bg-[#D4AF37]' : 'bg-slate-200 dark:bg-white/10'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className={`text-sm ${currentStep >= 1 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>Organization</span>
                <span className={`text-sm ${currentStep >= 2 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>Drivers</span>
                <span className={`text-sm ${currentStep >= 3 ? 'text-[#D4AF37] font-bold' : 'text-neutral-500'}`}>Review</span>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-[#D4AF37] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-[#ffe088] mb-1">Group Registration Benefits</h3>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            Register 10 or more drivers and get <strong className="text-[#D4AF37]">{GROUP_DISCOUNT_PERCENTAGE}% off</strong> the registration fee!
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Information</h2>

            <div className="space-y-6">
                <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Organization Name *
                    </label>
                    <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        value={organizationData.organizationName}
                        onChange={handleOrgInputChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.organizationName ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                            } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white`}
                        placeholder="e.g., Nairobi Drivers SACCO"
                    />
                    {errors.organizationName && <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>}
                </div>

                <div>
                    <label htmlFor="organizationType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Organization Type *
                    </label>
                    <select
                        id="organizationType"
                        name="organizationType"
                        value={organizationData.organizationType}
                        onChange={handleOrgInputChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.organizationType ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                            } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white`}
                    >
                        <option value="">Select Type</option>
                        <option value="sacco">SACCO</option>
                        <option value="fleet">Fleet Operator</option>
                        <option value="cooperative">Cooperative</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.organizationType && <p className="mt-1 text-sm text-red-500">{errors.organizationType}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Contact Person *
                        </label>
                        <input
                            type="text"
                            id="contactPerson"
                            name="contactPerson"
                            value={organizationData.contactPerson}
                            onChange={handleOrgInputChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.contactPerson ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white`}
                        />
                        {errors.contactPerson && <p className="mt-1 text-sm text-red-500">{errors.contactPerson}</p>}
                    </div>

                    <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Contact Email *
                        </label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={organizationData.contactEmail}
                            onChange={handleOrgInputChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.contactEmail ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white`}
                        />
                        {errors.contactEmail && <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>}
                    </div>

                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Contact Phone *
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            placeholder="+254712345678"
                            value={organizationData.contactPhone}
                            onChange={handleOrgInputChange}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.contactPhone ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white`}
                        />
                        {errors.contactPhone && <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>}
                    </div>

                    <div>
                        <label htmlFor="referralCode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Referral Code (Optional)
                        </label>
                        <input
                            type="text"
                            id="referralCode"
                            name="referralCode"
                            placeholder="Enter referral code"
                            value={organizationData.referralCode}
                            onChange={handleOrgInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-slate-50 dark:bg-surface-dark dark:text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Information</h2>
                <button
                    type="button"
                    onClick={addDriver}
                    className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#ffe088] text-black text-sm font-extrabold rounded-xl transition-colors flex items-center shadow-md"
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Driver
                </button>
            </div>

            <div className="space-y-6">
                {drivers.map((driver, index) => (
                    <div key={driver.id} className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Driver {index + 1}</h3>
                            {drivers.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeDriver(driver.id)}
                                    className="text-red-500 hover:text-red-400 text-sm font-semibold"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={driver.firstName}
                                    onChange={(e) => updateDriver(driver.id, 'firstName', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors[`driver_${index}_firstName`] ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white dark:bg-card-dark dark:text-white`}
                                />
                                {errors[`driver_${index}_firstName`] && <p className="mt-1 text-xs text-red-500">{errors[`driver_${index}_firstName`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={driver.lastName}
                                    onChange={(e) => updateDriver(driver.id, 'lastName', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors[`driver_${index}_lastName`] ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white dark:bg-card-dark dark:text-white`}
                                />
                                {errors[`driver_${index}_lastName`] && <p className="mt-1 text-xs text-red-500">{errors[`driver_${index}_lastName`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={driver.email}
                                    onChange={(e) => updateDriver(driver.id, 'email', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors[`driver_${index}_email`] ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white dark:bg-card-dark dark:text-white`}
                                />
                                {errors[`driver_${index}_email`] && <p className="mt-1 text-xs text-red-500">{errors[`driver_${index}_email`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={driver.phone}
                                    onChange={(e) => updateDriver(driver.id, 'phone', e.target.value)}
                                    placeholder="+254712345678"
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors[`driver_${index}_phone`] ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white dark:bg-card-dark dark:text-white`}
                                />
                                {errors[`driver_${index}_phone`] && <p className="mt-1 text-xs text-red-500">{errors[`driver_${index}_phone`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Vehicle Type *
                                </label>
                                <select
                                    value={driver.vehicleType}
                                    onChange={(e) => updateDriver(driver.id, 'vehicleType', e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${errors[`driver_${index}_vehicleType`] ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white dark:bg-card-dark dark:text-white`}
                                >
                                    <option value="">Select Type</option>
                                    <option value="car">Car</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="tuktuk">Tuk Tuk</option>
                                </select>
                                {errors[`driver_${index}_vehicleType`] && <p className="mt-1 text-xs text-red-500">{errors[`driver_${index}_vehicleType`]}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Submit</h2>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#ffe088] mb-4">Organization Summary</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Organization:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{organizationData.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">{organizationData.organizationType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Contact:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{organizationData.contactPerson}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Total Drivers:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{drivers.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cost Breakdown</h3>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Registration Fee per Driver:</span>
                        <span className="font-medium text-slate-900 dark:text-white">KES {REGISTRATION_FEE_PER_DRIVER.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Number of Drivers:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{drivers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            KES {(drivers.length * REGISTRATION_FEE_PER_DRIVER).toLocaleString()}
                        </span>
                    </div>

                    {calculateSavings() > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                            <span className="font-medium">Group Discount ({GROUP_DISCOUNT_PERCENTAGE}%):</span>
                            <span className="font-medium">- KES {calculateSavings().toLocaleString()}</span>
                        </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-white/10 pt-3 mt-3">
                        <div className="flex justify-between">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">Total:</span>
                            <span className="text-lg font-black text-[#D4AF37]">
                                KES {calculateTotalCost().toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {calculateSavings() > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Group Discount Applied!</h4>
                            <p className="text-sm text-emerald-600 dark:text-emerald-200">
                                You're saving <strong>KES {calculateSavings().toLocaleString()}</strong> with group registration!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <MainLayout
            title="Group Driver Registration | CABI"
            description="Register multiple drivers at once and save with group discounts"
        >
            <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 relative overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                                SACCO &amp; Fleet Onboarding
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Group Driver{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">
                                Registration
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
                            Register multiple drivers and save with bulk discounts
                        </p>
                    </div>

                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 rounded-3xl shadow-2xl p-6 sm:p-8">
                        {renderStepIndicator()}

                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}

                            <div className="mt-8 flex justify-between">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        className="px-6 py-3 border border-slate-300 dark:border-white/15 rounded-xl text-neutral-700 dark:text-neutral-300 font-bold hover:border-[#D4AF37]/50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentStep < totalSteps ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="ml-auto px-7 py-3 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold rounded-xl transition-colors shadow-lg"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="ml-auto px-8 py-3 bg-[#D4AF37] hover:bg-[#ffe088] disabled:bg-neutral-500 text-black font-extrabold rounded-xl transition-colors flex items-center shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Proceed to Payment'
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Registering a single driver?{' '}
                            <Link href="/drivers/register" className="text-[#D4AF37] hover:text-[#ffe088] hover:underline font-semibold">
                                Use Individual Registration
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
