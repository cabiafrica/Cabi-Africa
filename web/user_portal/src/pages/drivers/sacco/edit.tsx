/**
 * edit.tsx — Redirects to /drivers/sacco/manage
 *
 * Internal Sacco editing is no longer available to drivers.
 * Sacco partner configuration is done by the Super Admin
 * via the admin panel Sacco Integration Hub.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SaccoEditRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/drivers/sacco/manage');
  }, [router]);

  return null;
}
