import React from 'react';

export interface BasicDetailsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  referralCode: string;
}

interface Props {
  data: BasicDetailsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Partial<Record<keyof BasicDetailsData, string>>;
}

export const Step1BasicDetails: React.FC<Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-white/10 pb-2">
        1. Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={data.firstName}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={data.lastName}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={data.email}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={data.phone}
            onChange={onChange}
            placeholder="+254722123456"
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={data.password}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={data.confirmPassword}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300`}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="referralCode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Referral Code (Optional)</label>
        <input
          type="text"
          id="referralCode"
          name="referralCode"
          value={data.referralCode}
          onChange={onChange}
          className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow/50 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-300"
        />
      </div>

      <div className="flex items-start bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-4 rounded-xl mt-6">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={data.agreeToTerms}
          onChange={onChange}
          className="mt-1 h-4 w-4 text-[#D4AF37] accent-[#D4AF37] focus:ring-[#D4AF37] border-slate-300 rounded"
        />
        <label htmlFor="agreeToTerms" className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">
          I agree to the Terms of Service and Privacy Policy. By continuing, I consent to the validation of my identification documents and background checks.
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-sm text-red-500 mt-1">{errors.agreeToTerms}</p>}
    </div>
  );
};
