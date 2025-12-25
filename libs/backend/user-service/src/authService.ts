import apiClient from '@/shared/utils/apiClient';
import { AuthUser } from '@/admin-panel/src/AuthContext';

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const loginUser = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return data;
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
  return data;
};