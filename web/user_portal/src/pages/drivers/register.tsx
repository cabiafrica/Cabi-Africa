import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaCheckCircle, FaLock, FaCreditCard, FaBuilding } from 'react-icons/fa';

import MainLayout from '@/components/layout/MainLayout';
import { PaymentReceipt } from '@/components/payment/PaymentReceipt';
import VideoEmbed from '@/components/VideoEmbed';

// Import our new step components
import { Step1BasicDetails, BasicDetailsData } from '@/components/drivers/registration/Step1BasicDetails';
import { Step2Documents, DocumentsData } from '@/components/drivers/registration/Step2Documents';
import { Step3Vehicle, VehicleData } from '@/components/drivers/registration/Step3Vehicle';

const REGISTRATION_FEE = 2000; // KES

export default function DriverRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Basic, 2: Docs, 3: Vehicle, 4: Payment, 5: Receipt
  
  // Combined Form Data State
  const [formData, setFormData] = useState<BasicDetailsData & DocumentsData & VehicleData>({
    // Step 1
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', agreeToTerms: false, referralCode: '',
    // Step 2
    nationalIdUrl: '', drivingLicenseUrl: '', psvBadgeUrl: '', passportPhotoUrl: '', aiVerified: false, aiScore: 0,
    // Step 3
    searchQuery: '', isVehicleFound: null, foundVehicleInfo: null,
    vehicleType: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', licensePlate: '', allowCoDriver: false,
    vehiclePhotos: '', logbookUrl: '', insuranceUrl: '', inspectionUrl: '',
    userId: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleUpdates = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear relevant errors
    Object.keys(updates).forEach(key => {
      if (errors[key]) setErrors((prev: any) => ({ ...prev, [key]: undefined }));
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};
    if (step === 1) { // Basic
      if (!formData.firstName) newErrors.firstName = 'Required';
      if (!formData.lastName) newErrors.lastName = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      if (!formData.phone) newErrors.phone = 'Required';
      if (!formData.password) newErrors.password = 'Required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';
    } else if (step === 2) { // Docs
      if (!formData.nationalIdUrl) newErrors.nationalIdUrl = 'Required';
      if (!formData.drivingLicenseUrl) newErrors.drivingLicenseUrl = 'Required';
      if (!formData.passportPhotoUrl) newErrors.passportPhotoUrl = 'Required';
      if (!formData.aiVerified) newErrors.aiVerified = 'Please complete AI Verification';
    } else if (step === 3) { // Vehicle
      if (formData.isVehicleFound === false) {
        if (!formData.vehicleType) newErrors.vehicleType = 'Required';
        if (!formData.vehicleMake) newErrors.vehicleMake = 'Required';
        if (!formData.licensePlate) newErrors.licensePlate = 'Required';
      }
      if (formData.isVehicleFound === null) {
        newErrors.searchQuery = 'Please search for your vehicle plate first';
        alert('Please search for a vehicle plate first.');
        return false;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        setIsSubmitting(true);
        try {
          const response = await fetch('http://localhost:3010/api/v1/driver-leads/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              referralCode: formData.referralCode,
              agreeToTerms: formData.agreeToTerms,
              city: 'Nairobi', // Default for now
              recaptchaToken: 'SKIP_DEV' // Handled in backend mockup
            })
          });
          const result = await response.json();
          if (result.userId) {
            handleUpdates({ userId: result.userId });
            setCurrentStep(2);
          } else {
            alert(result.message || 'Registration failed');
          }
        } catch (err) {
          console.error(err);
          alert('Backend service unreachable. Please ensure driver-lead-service is running on port 3010.');
        } finally {
          setIsSubmitting(false);
        }
      } else if (currentStep === 3) {
        // Proceed to payment simulation
        setCurrentStep(4);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handlePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('completed');
      setReceiptNumber(`CABI-${Date.now().toString().slice(-6)}-SUCCESS`);
      setCurrentStep(5);
    }, 2000);
  };

  const renderIntroStep = () => (
    <div className="space-y-8 animate-fade-in text-center">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to the Future of Driving</h2>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
        Complete our simple 3-step registration. Your documents will be verified securely.
      </p>
      <VideoEmbed videoId="dQw4w9WgXcQ" title="Cabi Driver Introduction" />
      <button onClick={handleNext} className="w-full sm:w-auto mx-auto mt-6 px-8 py-4 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold rounded-xl shadow-lg transition-all hover:translate-y-[-2px]">
        Start 3-Step Registration
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6 max-w-lg mx-auto text-center animate-fade-in">
      <div className="mb-8">
        <div className="w-20 h-20 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
          <FaLock className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Sacco Registration</h2>
        <p className="text-neutral-500 mt-2">A one-time Sacco fee is required to activate your driver account.</p>
      </div>
      <div className="bg-slate-50 dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-left">
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <span className="text-neutral-600 dark:text-neutral-300">Registration Fee</span>
          <span className="font-bold text-slate-900 dark:text-white">KES {REGISTRATION_FEE.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-4 mt-4">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
          <span className="text-2xl font-black text-[#D4AF37]">KES {REGISTRATION_FEE.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={handlePayment} disabled={paymentStatus === 'processing'} className="w-full py-4 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
        {paymentStatus === 'processing' ? 'Processing...' : <><FaCreditCard /> Pay KES {REGISTRATION_FEE.toLocaleString()} via M-Pesa</>}
      </button>
    </div>
  );

  const renderReceiptStep = () => (
    <div className="space-y-6 animate-fade-in text-center">
      <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 animate-bounce-short">
        <FaCheckCircle className="text-3xl" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
      <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mt-2">
        Your registration is complete and pending Admin review. We will notify you once approved.
      </p>
      <PaymentReceipt receiptNumber={receiptNumber} date={new Date().toLocaleDateString()} payerName={`${formData.firstName} ${formData.lastName}`} payerPhone={formData.phone} amount={REGISTRATION_FEE} paymentMethod="M-PESA" status="PAID" />
      <button onClick={() => router.push('/drivers/dashboard?new_applicant=true')} className="text-[#D4AF37] hover:text-[#ffe088] hover:underline font-semibold mt-6 block w-full">
        Continue to Dashboard &rarr;
      </button>
    </div>
  );

  return (
    <MainLayout title="Driver Registration | CABI" description="Join CABI as a driver">
      <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-12 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
              Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">CABI</span> Driver
            </h1>
            {currentStep > 0 && currentStep < 4 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-white/20'}`} />
                <div className={`w-8 h-1 rounded-full ${currentStep >= 2 ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-white/20'}`} />
                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-white/20'}`} />
                <div className={`w-8 h-1 rounded-full ${currentStep >= 3 ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-white/20'}`} />
                <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-[#D4AF37]' : 'bg-slate-300 dark:bg-white/20'}`} />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 rounded-3xl shadow-2xl p-6 sm:p-8">
            {currentStep === 0 && renderIntroStep()}
            {currentStep === 1 && <Step1BasicDetails data={formData} onChange={handleInputChange} errors={errors} />}
            {currentStep === 2 && <Step2Documents data={formData} onChange={handleUpdates} errors={errors} />}
            {currentStep === 3 && <Step3Vehicle data={formData} onChange={handleUpdates} errors={errors} />}
            {currentStep === 4 && renderPaymentStep()}
            {currentStep === 5 && renderReceiptStep()}

            <div className="mt-8 flex justify-between">
              {currentStep > 0 && currentStep < 4 && (
                <button type="button" onClick={handlePrevious} className="px-6 py-3 border border-slate-300 dark:border-white/15 rounded-xl text-neutral-700 dark:text-neutral-300 hover:border-[#D4AF37]/50 font-semibold">
                  Previous
                </button>
              )}
              {currentStep > 0 && currentStep < 3 && (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold rounded-xl disabled:opacity-50 shadow-lg"
                >
                  {isSubmitting ? 'Processing...' : 'Next Step \u2192'}
                </button>
              )}
              {currentStep === 3 && (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-3 bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold rounded-xl disabled:opacity-50 shadow-lg"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment \u2192'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already registered? <Link href="/login" className="text-[#D4AF37] hover:text-[#ffe088] hover:underline font-semibold">Sign in here</Link>
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
              <FaBuilding className="text-[#D4AF37]" /> Want to create an organization? <Link href="/organizations/register" className="text-[#D4AF37] hover:text-[#ffe088] hover:underline font-semibold">Register Organization</Link>
            </p>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}