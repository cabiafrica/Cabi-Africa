import MainLayout from '../components/layout/MainLayout';

export default function HelpCenter() {
    return (
        <MainLayout title="Help Center - Cabi" description="Get help with your rides, account, and more.">
            <div className="bg-slate-50 dark:bg-surface-dark py-20 px-6 lg:px-8 border-b border-slate-200 dark:border-white/10">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                        Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">Center</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                        Need assistance? Browse our FAQs or contact our support team.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
