import MainLayout from '@/components/layout/MainLayout';
import { APP_LINKS } from '@/config/appLinks';

export default function DriverAppDownloadPage() {
  return (
    <MainLayout
      title="Download the CABI Driver App | CABI"
      description="Download the CABI driver app to start earning on your own terms."
    >
      <div className="bg-slate-50 dark:bg-surface-dark min-h-screen">
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 dark:text-white">Download the CABI Driver App</h1>
          <p className="text-base sm:text-lg mb-8 text-gray-600 dark:text-gray-300">Get started on your journey to earn on your own terms.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={APP_LINKS.driver.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white font-bold py-3 px-6 rounded-xl border border-white/15 hover:border-executive-gold/60 transition-all"
            >
              Download on the App Store
            </a>
            <a
              href={APP_LINKS.driver.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-container text-black font-bold py-3 px-6 rounded-xl hover:bg-primary-highlight transition-all"
            >
              Get it on Google Play
            </a>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}