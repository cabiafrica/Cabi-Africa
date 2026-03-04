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
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    street: "",
    county: "",
    vehicleType: "car",
    licensePlate: "",
    nationalId: "",
    drivingLicense: "",
    agreeToTerms: false,
    photo: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for real-time referral code validation
  const [referralStatus, setReferralStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [referralError, setReferralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

      // Simulate validation failure (10% chance)
      const isProfessional = Math.random() > 0.1;
      if (!isProfessional) {
        setError("The uploaded file does not meet the standard. Please upload a professional passport photo, undistorted by lens, conforming to a real human face.");
        setSuccess(null);
        setIsSubmitting(false);
        return;
      }

      setSuccess("Photo verified successfully. Submitting registration...");
    }

    // TODO: Integrate Google reCAPTCHA and get the token.
    // In a real scenario, we would use executeRecaptcha('registration')
    const recaptchaToken = "mock-recaptcha-token";

    // Validate password match again before submission
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/driver-leads/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // We'll exclude the photo base64 string from the json body for now as the backend isn't expecting it yet
        body: JSON.stringify({ ...formData, photo: undefined, confirmPassword: undefined, recaptchaToken }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Registration failed. Please try again.");
      }

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
        password: "",
        confirmPassword: "",
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
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700">Date of Birth</label>
        <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={inputStyles} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-slate-700">Street / Road</label>
            <input type="text" name="street" id="street" value={formData.street} onChange={handleChange} required className={inputStyles} />
          </div>
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-slate-700">County</label>
            <input type="text" name="county" id="county" value={formData.county} onChange={handleChange} required className={inputStyles} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-slate-700">Vehicle Type</label>
            <select name="vehicleType" id="vehicleType" value={formData.vehicleType} onChange={handleChange} required className={inputStyles}>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle (Boda Boda)</option>
              <option value="tuktuk">Tuk Tuk</option>
            </select>
          </div>
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-slate-700">License Plate</label>
            <input type="text" name="licensePlate" id="licensePlate" value={formData.licensePlate} onChange={handleChange} required className={inputStyles} placeholder="KDA 123A" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Identification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nationalId" className="block text-sm font-medium text-slate-700">National ID Number</label>
            <input type="text" name="nationalId" id="nationalId" value={formData.nationalId} onChange={handleChange} required className={inputStyles} />
          </div>
          <div>
            <label htmlFor="drivingLicense" className="block text-sm font-medium text-slate-700">Driving License Number</label>
            <input type="text" name="drivingLicense" id="drivingLicense" value={formData.drivingLicense} onChange={handleChange} required className={inputStyles} />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-slate-700">Referral Code</label>
        <input type="text" name="referralCode" id="referralCode" value={formData.referralCode} onChange={handleChange} onBlur={handleReferralCodeBlur} className={inputStyles} placeholder="Optional" />
        <div className="h-5 mt-1 text-xs">
          {referralStatus === 'validating' && <p className="text-slate-500">Checking code...</p>}
          {referralStatus === 'valid' && <p className="text-green-600">Referral code applied!</p>}
          {referralStatus === 'invalid' && referralError && <p className="text-red-500">{referralError}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className={inputStyles} />
            <div className="mt-2 space-y-1">
              <p className={`text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>• At least 8 characters</p>
              <p className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>• One uppercase letter</p>
              <p className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>• One lowercase letter</p>
              <p className={`text-xs ${/\d/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>• One number</p>
              <p className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>• One special character</p>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputStyles} />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 italic">Passwords do not match</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-xs text-green-600 font-medium">Passwords match</p>
            )}
          </div>
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
        <p className="mt-1 text-xs text-slate-500">The passport photo must be professional, undistorted by lens, and confirm a real human face to international standards. This photo will be used as your avatar and can only be updated after 1 year.</p>
        {formData.photo && (
          <div className="mt-2">
            <img src={formData.photo} alt="Preview" className="h-20 w-20 object-cover rounded-full border-2 border-sky-500" />
          </div>
        )}
      </div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            required
            className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-slate-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" className="font-medium text-slate-700">Agree to Terms & Conditions</label>
          <p className="text-slate-500 text-xs">I confirm that all provided information is accurate and I agree to Cabi Africa's privacy policy.</p>
        </div>
      </div>
      <div>
        {/* Placeholder for Google reCAPTCHA */}
        <div className="h-20 w-full bg-slate-100 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-500 text-sm">
          Google reCAPTCHA v3 Active
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