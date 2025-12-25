import MainLayout from '../components/layout/MainLayout';

export default function Safety() {
    return (
        <MainLayout title="Safety at Cabi" description="Your safety is our top priority. Learn about our safety features and guidelines.">
            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Safety First</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        We are committed to making every ride safe for both drivers and passengers.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
