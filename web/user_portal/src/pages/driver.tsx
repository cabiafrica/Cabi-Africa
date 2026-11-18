import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function DriverRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/drivers');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to CABI Drivers...</title>
        <meta name="description" content="Drive with CABI Africa — East Africa's premier mobility network." />
        <meta property="og:title" content="Drive with CABI Africa" />
        <meta httpEquiv="refresh" content="0;url=/drivers" />
      </Head>
      <div className="min-h-screen bg-slate-50 dark:bg-surface-dark flex items-center justify-center p-4">
        <p className="text-sm font-bold text-slate-600 dark:text-gray-300">
          Redirecting to Driver Portal...
        </p>
      </div>
    </>
  );
}
