import apiClient from '@/shared/utils/apiClient';
import { SuspendedAccount } from './types';

export const fetchSuspendedAccounts = async (): Promise<SuspendedAccount[]> => {
  // The apiClient will automatically handle base URL and auth headers.
  const { data } = await apiClient.get<SuspendedAccount[]>('/admin/accounts', {
    params: { status: 'SUSPENDED' },
  });
  return data;
};

export const reactivateAccount = async (userId: string, note?: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(
    `/admin/accounts/${userId}/reactivate`,
    { note }
  );
  return data;
};