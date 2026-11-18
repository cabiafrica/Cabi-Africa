import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PassengerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/passengers');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to CABI Passengers...</title>
        <meta name="description" content="Ride with CABI Africa — East Africa's premier transport network." />
        <meta property="og:title" content="Ride with CABI Africa" />
        <meta httpEquiv="refresh" content="0;url=/passengers" />
      </Head>
      <div className="min-h-screen bg-slate-50 dark:bg-surface-dark flex items-center justify-center p-4">
        <p className="text-sm font-bold text-slate-600 dark:text-gray-300">
          Redirecting to Passenger Portal...
        </p>
      </div>
    </>
  );
}
