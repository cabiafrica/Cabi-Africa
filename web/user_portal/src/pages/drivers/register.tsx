import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaYoutube, FaLock, FaCreditCard, FaCheckCircle, FaUserPlus, FaBuilding } from 'react-icons/fa';
import MainLayout from '@/components/layout/MainLayout';
import { PaymentReceipt } from '@/components/payment/PaymentReceipt';
import VideoEmbed from '@/components/VideoEmbed';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  vehicleType: 'car' | 'motorcycle' | 'tuktuk' | '';
  nationalId: string;
  licenseExpiry: string;
  agreeToTerms: boolean;
  referralCode?: string;
}

const REGISTRATION_FEE = 2000; // KES

export default function DriverRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // Start at Step 0 (Intro)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    vehicleType: '',
    nationalId: '',
    licenseExpiry: '',
    agreeToTerms: false,
    referralCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [referralValidation, setReferralValidation] = useState<{ valid: boolean; referrerName?: string } | null>(null);

  const totalSteps = 3; // Intro (0) -> Info (1) -> Payment (2) -> Receipt (3)

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!formData.nationalId.trim()) newErrors.nationalId = 'National ID/Passport is required';
      if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License Expiry date is required';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Skip validation check logic for payment step for now, just move next
        setCurrentStep(prev => prev + 1);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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
      const response = await fetch('/api/driver-leads/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Redirect to dashboard with query param to simulate new applicant state
      // Pass the userId if needed, or stick to the session/token flow
      router.push('/drivers/dashboard?new_applicant=true');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    // Simulate API call
    setTimeout(() => {
      setPaymentStatus('completed');
      setReceiptNumber(`CABI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`);
      setCurrentStep(3);
    }, 2000);
  };

  const renderIntroStep = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to the Future of Driving
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Watch this short video to learn how Cabi helps you earn more, drive safely, and build your own fleet.
        </p>
      </div>

      <VideoEmbed
        videoId="dQw4w9WgXcQ"
        title="Cabi Driver Introduction"
        showChannelLink={true}
        channelUrl="https://youtube.com/@cabi_education"
      />

      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 text-center">Ready to get started?</h3>
        <p className="text-indigo-700 dark:text-indigo-300 text-center mb-6 text-sm">
          Complete the registration form to join our elite driver community.
        </p>
        <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto mx-auto block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:translate-y-[-2px]"
        >
          Start Registration
        </button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle Type *</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
            >
              <option value="">Select Type</option>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="tuktuk">Tuk Tuk</option>
            </select>
            {errors.vehicleType && <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">National ID / Passport *</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.nationalId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
              placeholder="ID-12345678"
            />
            {errors.nationalId && <p className="mt-1 text-sm text-red-500">{errors.nationalId}</p>}
          </div>
          <div>
            <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Driver License Expiry *</label>
            <input
              type="date"
              id="licenseExpiry"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.licenseExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.licenseExpiry && <p className="mt-1 text-sm text-red-500">{errors.licenseExpiry}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            placeholder="Enter referral code if you have one"
          />
          {referralValidation?.valid && (
            <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
              <FaCheckCircle /> Referred by {referralValidation.referrerName}
            </p>
          )}
        </div>

        <div className="flex items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
            I agree to the <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
          </label>
        </div>
        {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
      </div>
    </div>

  );

  const renderPaymentStep = () => (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <FaLock className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Registration Payment</h2>
        <p className="text-gray-500 mt-2">A one-time registration fee is required to activate your driver account.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <span className="text-gray-600">Registration Fee</span>
          <span className="font-bold text-gray-900">KES {REGISTRATION_FEE.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tax</span>
          <span className="font-bold text-gray-900">KES 0</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-indigo-600">KES {REGISTRATION_FEE.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={paymentStatus === 'processing'}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {paymentStatus === 'processing' ? (
          <>Processing Payment...</>
        ) : (
          <>
            <FaCreditCard /> Pay KES {REGISTRATION_FEE.toLocaleString()} Now
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 mt-4">
        Your payment is securely processed. Funds are held in a verified suspense account until your application is fully approved.
      </p>
    </div>
  );

  const renderReceiptStep = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce-short">
          <FaCheckCircle className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h2>
        <p className="text-gray-600 max-w-md mx-auto mt-2">
          Your registration fee has been received. Please download your receipt below.
        </p>
      </div>

      <PaymentReceipt
        receiptNumber={receiptNumber}
        date={new Date().toLocaleDateString()}
        payerName={`${formData.firstName} ${formData.lastName}`}
        payerPhone={formData.phone}
        amount={REGISTRATION_FEE}
        paymentMethod="M-PESA"
        status="HELD"
      />

      <div className="text-center mt-8">
        <button
          type="button"
          onClick={() => router.push('/drivers/dashboard?new_applicant=true')}
          className="text-indigo-600 hover:underline font-medium"
        >
          Continue to Dashboard &rarr;
        </button>
      </div>
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
            <form onSubmit={handleSubmit}>
              {currentStep === 0 && renderIntroStep()}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderPaymentStep()}
              {currentStep === 3 && renderReceiptStep()}

              <div className="mt-8 flex justify-between">
                {currentStep > 0 && currentStep < 2 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                )}

                {/* Steps with specific next actions */}
                {currentStep > 0 && currentStep < 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : null}

                {/* Show Create Account (Proceed to Payment) button on Step 1 */}
                {currentStep === 1 && (
                  <button
                    type="button" // Changed to button to prevent form submit default, handled by logic
                    onClick={() => {
                      if (validateStep(1)) setCurrentStep(2);
                    }}
                    className="ml-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center"
                  >
                    Proceed to Payment &rarr;
                  </button>
                )}

                {/* Payment Step specific buttons are inside renderPaymentStep */}
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Want to create an organization?{' '}
              <Link href="/organizations/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center justify-center gap-2">
                <FaBuilding /> Register Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}