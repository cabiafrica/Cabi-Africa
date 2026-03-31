import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Stack,
  Divider,
} from '@mui/material';
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
        const response = await fetch(`/api/users/${userId}/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile history');
        }
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    );
  }

  if (history.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No profile changes have been recorded for this user.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      {history.map((log, index) => (
        <Box key={log.id}>
          <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {log.field.charAt(0).toUpperCase() + log.field.slice(1)} changed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
              From "{log.oldValue}" to "{log.newValue}"
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
              {format(new Date(log.timestamp), 'PPP p')} by {log.changedBy}
            </Typography>
          </Box>
          {index < history.length - 1 && <Divider sx={{ mt: 2, opacity: 0.5 }} />}
        </Box>
      ))}
    </Stack>
  );
};

export default ProfileHistory;