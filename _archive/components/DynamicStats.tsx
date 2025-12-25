import { useEffect, useState } from 'react';
import type { AppStats } from '@/backend/services/stats';
import { useTranslation } from 'next-i18next';

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export default function DynamicStats() {
  const { t } = useTranslation('common');
  const [stats, setStats] = useState<AppStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: AppStats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    { name: t('stats_drivers'), value: stats?.activeDrivers },
    { name: t('stats_trips'), value: stats?.completedTrips },
    { name: t('stats_passengers'), value: stats?.happyPassengers },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('stats_title')}
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {t('stats_subtitle')}
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-3">
            {statItems.map((stat) => (
              <div key={stat.name} className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {error && <span className="text-red-500">Error</span>}
                  {!stats && !error && <div className="h-9 w-32 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse mx-auto" />}
                  {stats && stat.value !== undefined && formatNumber(stat.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}