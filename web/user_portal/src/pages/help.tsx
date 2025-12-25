import MainLayout from '../components/layout/MainLayout';

export default function HelpCenter() {
    return (
        <MainLayout title="Help Center - Cabi" description="Get help with your rides, account, and more.">
            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Help Center</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Need assistance? Browse our FAQs or contact our support team.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
