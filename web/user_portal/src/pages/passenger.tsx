import MainLayout from '@/components/layout/MainLayout';
import { APP_LINKS } from '@/config/appLinks';

export default function PassengerAppDownloadPage() {
  return (
    <MainLayout
      title="Download the CABI Passenger App | CABI"
      description="Download the CABI Go passenger app for Android (APK) or install on iPhone (iOS) to start riding."
    >
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">Download the CABI Go App</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8">Your safe and reliable ride is just a tap away.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={APP_LINKS.passenger.playStore}
            download
            className="bg-primary-container text-black font-bold py-3.5 px-6 rounded-xl hover:bg-primary-highlight transition-all"
          >
            ⬇️ Download Android APK (CABI Go)
          </a>
          <a
            href={APP_LINKS.passenger.appStore}
            className="bg-black text-white font-bold py-3.5 px-6 rounded-xl border border-white/15 hover:border-executive-gold/60 transition-all"
          >
            🍎 Launch & Install on iPhone / iOS
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
