'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Schema should match the backend for consistency, minus the server-side only fields.
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  city: z.string().min(2, 'City is required.'),
  referralCode: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function RegistrationForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);

    if (!executeRecaptcha) {
      setApiError('reCAPTCHA not ready. Please try again in a moment.');
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('registration');
      const payload = { ...data, recaptchaToken };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred.');
      }

      setIsSuccess(true);

    } catch (error: any) {
      setApiError(error.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-md">
        <h2 className="text-2xl font-bold text-green-800">Registration Successful!</h2>
        <p className="mt-2 text-gray-600">Thank you for your interest. We will be in touch with the next steps shortly.</p>
      </div>
    );
  }

  const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  const errorStyles = "mt-1 text-sm text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
        <input id="firstName" {...register('firstName')} className={inputStyles} />
        {errors.firstName && <p className={errorStyles}>{errors.firstName.message}</p>}
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input id="lastName" {...register('lastName')} className={inputStyles} />
        {errors.lastName && <p className={errorStyles}>{errors.lastName.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input id="email" type="email" {...register('email')} className={inputStyles} />
        {errors.email && <p className={errorStyles}>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input id="phone" type="tel" {...register('phone')} className={inputStyles} />
        {errors.phone && <p className={errorStyles}>{errors.phone.message}</p>}
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
        <input id="city" {...register('city')} className={inputStyles} />
        {errors.city && <p className={errorStyles}>{errors.city.message}</p>}
      </div>
      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral Code (Optional)</label>
        <input id="referralCode" {...register('referralCode')} className={inputStyles} />
      </div>

      {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}

      <div>
        <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Get Started'}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
      </p>
    </form>
  );
}

export function DriverRegistrationForm() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) {
    return <p className="text-red-500 text-center">reCAPTCHA is not configured. Please contact support.</p>;
  }
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <RegistrationForm />
    </GoogleReCaptchaProvider>
  );
}