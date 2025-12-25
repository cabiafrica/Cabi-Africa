import MainLayout from '../components/layout/MainLayout';

export default function Careers() {
    return (
        <MainLayout title="Careers at Cabi" description="Join our team and help us reimagine urban mobility.">
            <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Careers</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        We are always looking for talented individuals to join our mission. Check back soon for open positions.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
