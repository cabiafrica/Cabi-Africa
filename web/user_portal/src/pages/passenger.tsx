import MainLayout from '@/components/layout/MainLayout';
import { APP_LINKS } from '@/config/appLinks';

export default function PassengerAppDownloadPage() {
  return (
    <MainLayout
      title="Download the CABI App"
      description="Download the CABI passenger app to start riding."
    >
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">Download the CABI App</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8">Your safe and reliable ride is just a tap away.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={APP_LINKS.passenger.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white font-bold py-3 px-6 rounded-xl border border-white/15 hover:border-executive-gold/60 transition-all"
          >
            Download on the App Store
          </a>
          <a
            href={APP_LINKS.passenger.playStore}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-container text-black font-bold py-3 px-6 rounded-xl hover:bg-primary-highlight transition-all"
          >
            Get it on Google Play
          </a>
        </div>
      </div>
    </MainLayout>
  );
}