import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import MainLayout from '@/src/components/layout/MainLayout';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  // Address
  address: string;
  city: string;
  county: string;

  // Vehicle Information
  vehicleType: 'car' | 'motorcycle' | 'tuktuk' | '';
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;

  // Documents
  nationalId: string;
  drivingLicenseNumber: string;

  // Referral
  referralCode: string;

  // Agreement
  agreeToTerms: boolean;
}

const REGISTRATION_FEE = 2000; // KES

export default function DriverRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    county: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    nationalId: '',
    drivingLicenseNumber: '',
    referralCode: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill referral code from URL query parameter
  useEffect(() => {
    if (router.query.ref) {
      setFormData(prev => ({ ...prev, referralCode: router.query.ref as string }));
    }
  }, [router.query]);

  const totalSteps = 4;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone)) newErrors.phone = 'Invalid Kenyan phone number';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.county.trim()) newErrors.county = 'County is required';
    } else if (step === 3) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!formData.vehicleMake.trim()) newErrors.vehicleMake = 'Vehicle make is required';
      if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
      if (!formData.vehicleYear.trim()) newErrors.vehicleYear = 'Vehicle year is required';
      if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
      if (!formData.nationalId.trim()) newErrors.nationalId = 'National ID is required';
      if (!formData.drivingLicenseNumber.trim()) newErrors.drivingLicenseNumber = 'Driving license number is required';
    } else if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with backend API
      // const response = await fetch('/api/driver-leads/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to payment page
      router.push('/drivers/register/payment');
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
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step <= currentStep
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
              }`}>
              {step < currentStep ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="font-semibold">{step}</span>
              )}
            </div>
            {step < 4 && (
              <div className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className={`text-sm ${currentStep >= 1 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Personal</span>
        <span className={`text-sm ${currentStep >= 2 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Address</span>
        <span className={`text-sm ${currentStep >= 3 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Vehicle</span>
        <span className={`text-sm ${currentStep >= 4 ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>Review</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+254712345678"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Address Information</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              County *
            </label>
            <select
              id="county"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.county ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            >
              <option value="">Select County</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Kiambu">Kiambu</option>
              <option value="Machakos">Machakos</option>
              <option value="Kajiado">Kajiado</option>
            </select>
            {errors.county && <p className="mt-1 text-sm text-red-500">{errors.county}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle & Documents</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Type *
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          >
            <option value="">Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle (Boda Boda)</option>
            <option value="tuktuk">Tuk Tuk</option>
          </select>
          {errors.vehicleType && <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Make *
            </label>
            <input
              type="text"
              id="vehicleMake"
              name="vehicleMake"
              placeholder="e.g., Toyota"
              value={formData.vehicleMake}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleMake ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.vehicleMake && <p className="mt-1 text-sm text-red-500">{errors.vehicleMake}</p>}
          </div>

          <div>
            <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model *
            </label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              placeholder="e.g., Corolla"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleModel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.vehicleModel && <p className="mt-1 text-sm text-red-500">{errors.vehicleModel}</p>}
          </div>

          <div>
            <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year *
            </label>
            <input
              type="text"
              id="vehicleYear"
              name="vehicleYear"
              placeholder="e.g., 2020"
              value={formData.vehicleYear}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.vehicleYear && <p className="mt-1 text-sm text-red-500">{errors.vehicleYear}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Plate Number *
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            placeholder="e.g., KAA 123A"
            value={formData.licensePlate}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
          />
          {errors.licensePlate && <p className="mt-1 text-sm text-red-500">{errors.licensePlate}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              National ID Number *
            </label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.nationalId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.nationalId && <p className="mt-1 text-sm text-red-500">{errors.nationalId}</p>}
          </div>

          <div>
            <label htmlFor="drivingLicenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Driving License Number *
            </label>
            <input
              type="text"
              id="drivingLicenseNumber"
              name="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.drivingLicenseNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white`}
            />
            {errors.drivingLicenseNumber && <p className="mt-1 text-sm text-red-500">{errors.drivingLicenseNumber}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review & Submit</h2>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">Registration Summary</h3>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</p>
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400">Contact</p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.phone}</p>
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400">Vehicle</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel} ({formData.vehicleType})
            </p>
            <p className="font-medium text-gray-900 dark:text-white">{formData.licensePlate}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <span className="inline-flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Referral Code
          </span>
        </h3>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            placeholder="Enter referral code"
            value={formData.referralCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            If you were referred by an existing driver, enter their code to help them earn rewards!
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Registration Fee Required</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              A one-time registration fee of <strong>KES {REGISTRATION_FEE.toLocaleString()}</strong> is required to complete your application.
              You'll be redirected to a secure payment page after submitting this form.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
          I agree to the{' '}
          <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
    </div>
  );

  return (
    <MainLayout
      title="Driver Registration | CABI"
      description="Join CABI as a driver and start earning on your schedule"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Become a CABI Driver
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start your journey to financial freedom
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {renderStepIndicator()}

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already registered?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registering multiple drivers?{' '}
              <Link href="/drivers/group-register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Use Group Registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}