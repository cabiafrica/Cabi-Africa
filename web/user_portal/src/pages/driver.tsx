import MainLayout from '@/components/layout/MainLayout';

export default function DriverAppDownloadPage() {
  return (
    <MainLayout
      title="Download the CABI Driver App | CABI"
      description="Download the CABI driver app from the footer download menu to start earning on your own terms."
    >
      <div className="bg-slate-50 dark:bg-surface-dark min-h-screen">
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 dark:text-white">Download the CABI Driver App</h1>
          <p className="text-base sm:text-lg mb-8 text-gray-600 dark:text-gray-300">
            All official Android &amp; iOS downloads are available in the footer download menu below.
          </p>
          <div className="flex justify-center">
            <a
              href="#footer-download-menu"
              className="bg-primary-container text-black font-bold py-3.5 px-6 rounded-xl hover:bg-primary-highlight transition-all"
            >
              Go to Footer Download Menu ↓
            </a>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
