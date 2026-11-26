/**
 * Profile Service API - client-side service for user profile operations
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function updateUserProfile(userId: string, data: Record<string, unknown>): Promise<any> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to change password');
}

export async function enableTwoFactorAuth(userId: string): Promise<{ qrCodeUrl: string; secret: string }> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/2fa/enable`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to enable 2FA');
  return response.json();
}

export async function verifyTwoFactorAuth(userId: string, code: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/2fa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error('Failed to verify 2FA');
}

export async function disableTwoFactorAuth(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/2fa/disable`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to disable 2FA');
}

export async function deleteAccount(userId: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error('Failed to delete account');
}

export async function getWebAuthnChallenge(identifier: string): Promise<{ challenge: string }> {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE}/auth/webauthn/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ identifier }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to obtain WebAuthn challenge');
  }
  return response.json();
}

export async function registerWebAuthnCredential(userId: string, credential: any): Promise<any> {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE}/auth/webauthn/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ userId, credential }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to register WebAuthn credential');
  }
  return response.json();
}
