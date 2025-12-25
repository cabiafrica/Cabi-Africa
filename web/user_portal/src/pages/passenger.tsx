import Head from 'next/head';
import Link from 'next/link';

export default function PassengerAppDownloadPage() {
  // In a real application, these would be environment variables
  const appStoreUrl = 'https://apps.apple.com/us/app/your-app-name/idYOUR_APP_ID';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yourapp.package';

  return (
    <>
      <Head>
        <title>Download the CABI App</title>
        <meta name="description" content="Download the CABI passenger app to start riding." />
      </Head>
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Download the CABI App</h1>
        <p className="text-lg mb-8">Your safe and reliable ride is just a tap away.</p>
        <div className="flex justify-center gap-4">
          <Link href={appStoreUrl} className="bg-black text-white font-bold py-3 px-6 rounded-lg">
            Download on the App Store
          </Link>
          <Link href={playStoreUrl} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg">
            Get it on Google Play
          </Link>
        </div>
      </main>
    </>
  );
}