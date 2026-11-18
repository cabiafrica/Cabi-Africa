"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear success message on new input
    if (success) {
      setSuccess(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const recaptchaToken = (typeof window !== 'undefined' && (window as any).grecaptcha?.getResponse?.()) || '';

    try {
      const response = await fetch("/api/v1/driver-leads/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, recaptchaToken }),
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
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

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