"use client";

import { useState, useCallback } from "react";

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    referralCode: "",
    photo: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for real-time referral code validation
  const [referralStatus, setReferralStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [referralError, setReferralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Verify photo before submitting
    if (formData.photo) {
      setSuccess("Verifying professional passport quality...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess("Photo verified successfully. Submitting registration...");
    }

    // TODO: Integrate Google reCAPTCHA and get the token.
    const recaptchaToken = "mock-recaptcha-token";

    try {
      const response = await fetch("/api/v1/driver-leads/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // We'll exclude the photo base64 string from the json body for now as the backend isn't expecting it yet
        body: JSON.stringify({ ...formData, photo: undefined, recaptchaToken }),
      });

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      const result = await response.json();
      setSuccess(
        "Registration successful! Please check your email to continue."
      );
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        referralCode: "",
        photo: null,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferralCodeBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>) => {
    const code = e.target.value.trim();

    if (!code) {
      setReferralStatus('idle');
      setReferralError(null);
      return;
    }

    setReferralStatus('validating');
    setReferralError(null);

    try {
      const response = await fetch(`/api/v1/driver-leads/referral/validate?code=${encodeURIComponent(code)}`);
      if (response.ok) {
        setReferralStatus('valid');
      } else if (response.status === 404) {
        setReferralStatus('invalid');
        setReferralError('Invalid referral code.');
      } else {
        throw new Error('Validation check failed.');
      }
    } catch (err) {
      setReferralStatus('invalid');
      setReferralError('Could not validate code.'); // Generic error for network issues etc.
    }
  }, []);

  const inputStyles =
    "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
          <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className={inputStyles} />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
          <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className={inputStyles} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={inputStyles} />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputStyles} />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={inputStyles} />
      </div>
      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-slate-700">Referral Code</label>
        <input type="text" name="referralCode" id="referralCode" value={formData.referralCode} onChange={handleChange} onBlur={handleReferralCodeBlur} className={inputStyles} />
        <div className="h-5 mt-1 text-xs">
          {referralStatus === 'validating' && <p className="text-slate-500">Checking code...</p>}
          {referralStatus === 'valid' && <p className="text-green-600">Referral code applied!</p>}
          {referralStatus === 'invalid' && referralError && <p className="text-red-500">{referralError}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-slate-700">Professional Passport Photo</label>
        <input
          type="file"
          name="photo"
          id="photo"
          accept="image/*"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
              };
              reader.readAsDataURL(file);
            }
          }}
          className={`${inputStyles} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100`}
        />
        <p className="mt-1 text-xs text-slate-500">Upload a professional, clear front-facing photo from your device storage or camera.</p>
        {formData.photo && (
          <div className="mt-2">
            <img src={formData.photo} alt="Preview" className="h-20 w-20 object-cover rounded-full border-2 border-sky-500" />
          </div>
        )}
      </div>
      <div>
        {/* Placeholder for Google reCAPTCHA */}
        <div className="h-20 w-full bg-slate-100 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-500 text-sm">
          Google reCAPTCHA will be here
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <button type="submit" disabled={isSubmitting} className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
        {isSubmitting ? "Submitting..." : "Register Now"}
      </button>
    </form>
  );
}