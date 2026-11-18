import { useState, FormEvent } from 'react';

export default function NewsletterWidget() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubscribed(true);
        setEmail('');
    };

    return (
        <div className="bg-slate-900 dark:bg-card-dark rounded-2xl p-6 shadow-lg text-white mb-8 border border-slate-200 dark:border-[#D4AF37]/30">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
                    Dispatches
                </span>
            </div>
            <h3 className="font-bold text-xl mb-2">Subscribe to CABI Intel</h3>
            <p className="text-neutral-300 text-sm mb-4">
                Get the latest updates, driver stories, and city mobility news delivered to your inbox.
            </p>

            <form className="space-y-3" onSubmit={handleSubmit}>
                <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    aria-label="Your email address"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm hover:bg-[#ffe088] transition-colors shadow-md"
                >
                    Subscribe
                </button>
                {subscribed && (
                    <p className="text-xs font-semibold text-emerald-400">
                        You are subscribed to CABI Intel updates.
                    </p>
                )}
            </form>
        </div>
    );
}
