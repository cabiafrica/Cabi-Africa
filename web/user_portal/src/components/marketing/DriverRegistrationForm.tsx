'use client';

import React, { useState } from 'react';

export function DriverRegistrationForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        referralCode: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const recaptchaToken = (typeof window !== 'undefined' && (window as any).grecaptcha?.getResponse?.()) || '';

        try {
            // Mock API call
            // In Story 101.3 we added the backend endpoint. In 101.2 we mock it or call it.
            // Since I implemented 101.3 logic, I can try to call it if it's running.
            // But for now, mock it as per 101.2 acceptance criteria: "stubbed for now".
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Submitting:', { ...formData, recaptchaToken });

            setStatus('success');
        } catch (err) {
            setErrorMessage('Registration failed. Please try again.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your application has been received. Please download the app to continue.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4 flex gap-4">
                <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">First Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">Last Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">Phone</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">City</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="city" name="city" type="text" required value={formData.city} onChange={handleChange} />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="referralCode">Referral Code (Optional)</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="referralCode" name="referralCode" type="text" value={formData.referralCode} onChange={handleChange} />
            </div>

            <div className="flex items-center justify-between">
                <button className="bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold py-2.5 px-4 rounded-xl focus:outline-none w-full transition-colors"
                    type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Submitting...' : 'Register Now'}
                </button>
            </div>
            {status === 'error' && <p className="text-red-500 text-xs italic mt-4">{errorMessage}</p>}
        </form>
    );
}
