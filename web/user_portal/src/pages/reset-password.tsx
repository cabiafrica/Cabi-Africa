import { useRouter } from 'next/router';
import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const tokenParam = typeof router.query.token === 'string' ? router.query.token : '';

  const [mode, setMode] = useState<'request' | 'otp_reset' | 'token_reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (router.isReady && tokenParam) {
      setMode('token_reset');
      setStatus('idle');
      setFeedbackMessage('');
    }
  }, [router.isReady, tokenParam]);

  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setStatus('loading');
    setFeedbackMessage('');
    setDevHint(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to send reset link.');

      setStatus('idle');
      setMode('otp_reset');
      setFeedbackMessage(data.message);
      if (data.devOtp) {
        setDevHint(`Sandbox OTP: ${data.devOtp}`);
      }
    } catch (error: any) {
      setStatus('error');
      setFeedbackMessage(error.message || 'Failed to send reset link.');
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('error');
      setFeedbackMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setFeedbackMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const payload =
        mode === 'token_reset'
          ? { token: tokenParam, password }
          : { identifier: identifier.trim(), otp: otp.trim(), password };

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setStatus('success');
      setFeedbackMessage(data.message);
    } catch (error: any) {
      setStatus('error');
      setFeedbackMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <>
      <Head>
        <title>Reset Your Password | CABI</title>
        <meta name="description" content="Reset your CABI account password securely." />
        <meta property="og:title" content="Reset Your Password | CABI" />
      </Head>
      <div className="min-h-screen bg-slate-50 dark:bg-surface-dark flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <Link href="/" className="inline-flex justify-center">
            <BrandLogo size="md" />
          </Link>
          <h2 className="mt-6 text-center text-2xl font-black leading-9 tracking-tight text-slate-900 dark:text-white">
            {mode === 'request' ? 'Forgot Your Password?' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">
            {mode === 'request'
              ? 'Enter your email or phone number to receive a reset link and OTP.'
              : mode === 'otp_reset'
              ? 'Check your email for the reset link or enter the 6-digit OTP below.'
              : 'Enter and confirm your new account password.'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 rounded-3xl shadow-2xl">
          {status === 'success' ? (
            <div className="text-center space-y-5">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{feedbackMessage}</p>
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-[#ffe088] transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          ) : mode === 'request' ? (
            <form className="space-y-5" onSubmit={handleRequestReset}>
              <div>
                <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                  Email or Phone Number
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or +254 712 345 678"
                  className="mt-2 block w-full rounded-xl border border-slate-300 dark:border-white/10 py-2.5 px-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-surface-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] sm:text-sm"
                />
              </div>

              {status === 'error' && <p className="text-sm text-red-500">{feedbackMessage}</p>}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex w-full justify-center rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-[#ffe088] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link & OTP'}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-xs font-bold text-[#D4AF37] hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetSubmit}>
              {feedbackMessage && status !== 'error' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  {feedbackMessage}
                </p>
              )}
              {devHint && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                  {devHint}
                </p>
              )}

              {mode === 'otp_reset' && (
                <div>
                  <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                    6-Digit OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="mt-2 block w-full rounded-xl border border-slate-300 dark:border-white/10 py-2.5 px-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-surface-dark tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37] sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                  New Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 dark:border-white/10 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white bg-slate-50 dark:bg-surface-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                  Confirm New Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 dark:border-white/10 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white bg-slate-50 dark:bg-surface-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {status === 'error' && <p className="text-sm text-red-500">{feedbackMessage}</p>}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex w-full justify-center rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-[#ffe088] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
