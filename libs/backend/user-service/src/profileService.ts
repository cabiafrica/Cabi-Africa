import apiClient from '@/shared/utils/apiClient';
import { AuthUser } from '@/admin-panel/src/AuthContext';

export const updateUserProfile = async (
  userId: string,
  profileData: { fullName: string; profilePicture?: File | null }
): Promise<AuthUser> => {
  const formData = new FormData();
  formData.append('fullName', profileData.fullName);
  if (profileData.profilePicture) {
    formData.append('profilePicture', profileData.profilePicture);
  }

  const { data } = await apiClient.patch<AuthUser>(`/users/${userId}/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const changePassword = async (
  userId: string,
  passwords: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(`/users/${userId}/change-password`, passwords);
  return data;
};

export const enableTwoFactorAuth = async (
  userId: string
): Promise<{ qrCodeUrl: string; secret: string }> => {
  const { data } = await apiClient.post<{ qrCodeUrl: string; secret: string }>(`/users/${userId}/2fa/enable`);
  return data;
};

export const verifyTwoFactorAuth = async (
  userId: string,
  token: string
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(`/users/${userId}/2fa/verify`, { token });
  return data;
};

export const disableTwoFactorAuth = async (userId: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>(`/users/${userId}/2fa/disable`);
  return data;
};

export const deleteAccount = async (
  userId: string,
  password: string
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean }>(`/users/${userId}`, {
    data: { password }, // Pass password in the body of the DELETE request
  });
  return data;
};