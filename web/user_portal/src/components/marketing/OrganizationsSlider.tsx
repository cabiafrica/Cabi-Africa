// removed next/link

const organizations = [
    { name: 'KCB Bank', logo: 'https://via.placeholder.com/150x50?text=KCB+Bank' },
    { name: 'Safaricom', logo: 'https://via.placeholder.com/150x50?text=Safaricom' },
    { name: 'Britam', logo: 'https://via.placeholder.com/150x50?text=Britam' },
    { name: 'Equity', logo: 'https://via.placeholder.com/150x50?text=Equity' },
    { name: 'Total', logo: 'https://via.placeholder.com/150x50?text=Total' },
    { name: 'Shell', logo: 'https://via.placeholder.com/150x50?text=Shell' },
    { name: 'Uber', logo: 'https://via.placeholder.com/150x50?text=Uber' },
    { name: 'Bolt', logo: 'https://via.placeholder.com/150x50?text=Bolt' },
];

export default function OrganizationsSlider() {
    return (
        <section className="py-10 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Trusted Partners</p>
            </div>

            <div className="relative w-full overflow-hidden">
                <div className="flex w-max animate-scroll gap-16">
                    {/* Triple the items to ensure smooth scrolling on wide screens */}
                    {[...organizations, ...organizations, ...organizations].map((org, index) => (
                        <div
                            key={`org-${index}`}
                            className="flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 min-w-[120px] cursor-default"
                        >
                            <span className="text-xl font-serif font-bold text-gray-800 dark:text-gray-200">{org.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); } /* Move by 1/3 since we tripled the content */
                }
            `}</style>
        </section>
    );
}
