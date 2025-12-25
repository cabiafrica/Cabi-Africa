'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface HistoryLog {
  id: number;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  changedBy: string;
}

interface ProfileHistoryProps {
  userId: string;
}

const ProfileHistory: React.FC<ProfileHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // In a real app, the API URL would come from an environment variable
        const response = await fetch(`/api/users/${userId}/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (history.length === 0) {
    return <p>No profile changes have been recorded for this user.</p>;
  }

  return (
    <ul className="space-y-4">
      {history.map((log) => (
        <li key={log.id} className="border-l-2 pl-4">
          <p className="text-sm font-semibold">
            {log.field.charAt(0).toUpperCase() + log.field.slice(1)} changed
          </p>
          <p className="text-xs text-muted-foreground">
            From "{log.oldValue}" to "{log.newValue}"
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(log.timestamp), 'PPP p')} by {log.changedBy}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default ProfileHistory;