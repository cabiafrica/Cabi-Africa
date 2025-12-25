import MainLayout from '../components/layout/MainLayout';
import Link from 'next/link';

export default function WhyDrive() {
  return (
    <MainLayout title="Why Drive with Cabi? - Fairer, Safer, Better" description="Discover the benefits of driving with Cabi. Lower commissions, safer rides, and a community that cares.">
      <div className="bg-white dark:bg-slate-900 py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">Why Drive with Cabi?</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            We're building a ride-hailing service that puts drivers first. From lower commissions to better safety features, here's why you should join us.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Get started
            </Link>
            <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
