import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function DriverAppDownloadPage() {
  // In a real application, these would be environment variables
  const appStoreUrl = 'https://apps.apple.com/us/app/your-app-name/idYOUR_APP_ID';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yourapp.package';

  return (
    <MainLayout
      title="Download the CABI Driver App | CABI"
      description="Download the CABI driver app to start earning on your own terms."
    >
      <div className="bg-white dark:bg-slate-900 min-h-screen">
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Download the CABI Driver App</h1>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">Get started on your journey to earn on your own terms.</p>
          <div className="flex justify-center gap-4">
            <Link href={appStoreUrl} className="bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
              Download on the App Store
            </Link>
            <Link href={playStoreUrl} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Get it on Google Play
            </Link>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}