/**
 * browse.tsx — Redirects to /drivers/sacco/manage
 *
 * Previously listed internal SACCOs. Now that Cabi Africa integrates with
 * a single external Sacco partner (configured by Super Admin), drivers
 * should go directly to the manage/opt-in page.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SaccoBrowseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/drivers/sacco/manage');
  }, [router]);

  return null;
}
