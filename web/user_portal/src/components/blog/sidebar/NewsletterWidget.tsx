export default function NewsletterWidget() {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white mb-8">
            <h3 className="font-bold text-xl mb-2">Subscribe to our Newsletter</h3>
            <p className="text-indigo-100 text-sm mb-4">Get the latest updates, driver tips, and ecosystem news delivered to your inbox.</p>

            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
                >
                    Subscribe
                </button>
            </form>
        </div>
    );
}
