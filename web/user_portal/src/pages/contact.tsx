import { useState, FormEvent } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again.');
      }

      setStatus('success');
      setFeedbackMessage("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
    } catch (error: any) {
      setStatus('error');
      setFeedbackMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <MainLayout title="Contact Us | CABI" description="Get in touch with the CABI team.">
      <div className="min-h-screen bg-slate-50 dark:bg-surface-dark py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Support &amp; Concierge</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">CABI.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
              Have a question, feedback, or a partnership inquiry? We'd love to hear from you.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-[#D4AF37]/25 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">Email</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">Subject</label>
              <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white" />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2">Message</label>
              <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] dark:text-white"></textarea>
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-3.5 px-6 rounded-xl shadow-lg text-xs font-black uppercase tracking-widest text-black bg-[#D4AF37] hover:bg-[#ffe088] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {feedbackMessage && (
              <div
                className={`text-center p-3 rounded-md ${
                  status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : ''
                } ${
                  status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : ''
                }`}
              >
                {feedbackMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
}