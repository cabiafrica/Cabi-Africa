import MainLayout from '../components/layout/MainLayout';
import Link from 'next/link';

export default function WhyDrive() {
  return (
    <MainLayout title="Why Drive with Cabi? - Fairer, Safer, Better" description="Discover the benefits of driving with Cabi. Reusable commission for Cabi Legacy, safer rides, and genuine dignity.">
      <div className="bg-slate-50 dark:bg-surface-dark py-20 px-6 lg:px-8 border-b border-slate-200 dark:border-white/10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Why Drive with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe088] via-[#FACC15] to-[#D4AF37]">CABI?</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
            We're building a ride-hailing service that puts drivers first. From our reusable commission model designed for Cabi Legacy programs to better safety features, here's why you should join us.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register" className="rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-extrabold text-black shadow-lg hover:bg-[#ffe088] transition-colors">
              Get started
            </Link>
            <Link href="/about" className="text-sm font-bold leading-6 text-[#D4AF37] hover:text-[#ffe088] transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
