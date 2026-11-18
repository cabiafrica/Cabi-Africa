/**
 * create.tsx — Redirects to /drivers/sacco/manage
 *
 * Drivers no longer create internal Saccos on the platform.
 * The Super Admin configures a single external Sacco partner.
 * Drivers opt in/out from the manage page.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SaccoCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/drivers/sacco/manage');
  }, [router]);

  return null;
}
