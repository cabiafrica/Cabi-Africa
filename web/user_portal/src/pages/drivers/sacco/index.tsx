/**
 * index.tsx — Entry point for /drivers/sacco
 * Redirects to /drivers/sacco/manage for driver financial & sacco configurations.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SaccoIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/drivers/sacco/manage');
  }, [router]);

  return null;
}
