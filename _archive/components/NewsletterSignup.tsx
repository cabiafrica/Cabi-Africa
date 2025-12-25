import { useState, FormEvent } from 'react';
import { useTranslation } from 'next-i18next';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { t } = useTranslation('common');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe. Please try again.');
      }

      setStatus('success');
      setFeedbackMessage(data.message || "Thanks for subscribing!");
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setFeedbackMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('newsletter_title')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('newsletter_subtitle')}</p>
      {status === 'success' ? (
        <p className="text-green-600 dark:text-green-400">{feedbackMessage}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="email-address" className="sr-only">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-auto rounded-md border-gray-300 px-3.5 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder={t('newsletter_placeholder')}
          />
          <button type="submit" disabled={status === 'loading'} className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400">
            {status === 'loading' ? t('newsletter_subscribing') : t('newsletter_button')}
          </button>
        </form>
      )}
      {status === 'error' && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{feedbackMessage}</p>}
    </div>
  );
}