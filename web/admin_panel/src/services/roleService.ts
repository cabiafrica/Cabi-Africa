
import axios from 'axios';

// FIXED: Changed port from 3000 to 3333 to match auth-gateway
const API_URL = import.meta.env.VITE_API_URL || 'https://auth-gateway-746659778850.us-central1.run.app/api';

// Create axios instance with authentication interceptor
const apiClient = axios.create({
    baseURL: API_URL
});

// Add authentication token and MFA step-up token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const mfaToken = sessionStorage.getItem('adminMfaToken');
        if (mfaToken) {
            config.headers['x-admin-mfa-token'] = mfaToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept 403 step-up required responses to automatically trigger the 2FA challenge modal
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const msg = String(error.response?.data?.message || '');
        if (
            error.response?.status === 403 &&
            msg.toLowerCase().includes('step-up 2fa') &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            return new Promise((resolve, reject) => {
                const onMfaSuccess = async (event: any) => {
                    window.removeEventListener('cabi:admin:mfa-verified', onMfaSuccess);
                    const newMfaToken = event.detail?.stepUpToken;
                    if (newMfaToken) {
                        originalRequest.headers['x-admin-mfa-token'] = newMfaToken;
                        try {
                            const retryRes = await apiClient(originalRequest);
                            resolve(retryRes);
                        } catch (retryErr) {
                            reject(retryErr);
                        }
                    } else {
                        reject(error);
                    }
                };

                window.addEventListener('cabi:admin:mfa-verified', onMfaSuccess);
                window.dispatchEvent(new CustomEvent('cabi:admin:require-2fa'));
            });
        }
        return Promise.reject(error);
    }
);

export interface Permission {
    id: string; // The enum key, e.g. "SITE_SETUP_VIEW"
    // Add description mapping on frontend or backend result if needed
}

export interface Role {
    id: string;
    name: string; // System name, e.g. "SUPER_ADMIN"
    displayName: string;
    description: string;
    type: string; // RoleType enum
    platform: string; // Platform enum
    permissions: string[]; // List of permission strings
    isActive: boolean;
    isSystem: boolean;
}

export type RoleFormData = Omit<Role, 'id' | 'isSystem'>;

class RoleService {
    async getAllRoles(): Promise<Role[]> {
        const response = await apiClient.get('/admin/roles');
        return response.data;
    }

    async getRole(id: string): Promise<Role> {
        const response = await apiClient.get(`/admin/roles/${id}`);
        return response.data;
    }

    async createRole(data: RoleFormData): Promise<Role> {
        const response = await apiClient.post('/admin/roles', data);
        return response.data;
    }

    async updateRole(id: string, data: Partial<RoleFormData>): Promise<Role> {
        const response = await apiClient.patch(`/admin/roles/${id}`, data);
        return response.data;
    }

    async deleteRole(id: string): Promise<void> {
        await apiClient.delete(`/admin/roles/${id}`);
    }

    // Helper to get available permissions (could be hardcoded or fetched)
    async getAvailablePermissions(): Promise<string[]> {
        // In a real scenario, fetch from an endpoint that exposes the Permission enum
        // For now, we can hardcode the list or fetch if endpoint exists
        return [
            'SITE_SETUP_VIEW', 'SITE_SETUP_EDIT',
            // ... (This list is huge, better to fetch from backend or shared constants)
        ];
    }
}

export const roleService = new RoleService();
