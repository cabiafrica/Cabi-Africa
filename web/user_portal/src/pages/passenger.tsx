import MainLayout from '@/components/layout/MainLayout';

export default function PassengerAppDownloadPage() {
  return (
    <MainLayout
      title="Download the CABI Passenger App | CABI"
      description="Download the CABI Go passenger app from the footer download menu to start riding."
    >
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">Download the CABI Go App</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8">
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
      </div>
    </MainLayout>
  );
}
