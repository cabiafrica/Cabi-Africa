
import axios from 'axios';

// FIXED: Changed port from 3000 to 3333 to match auth-gateway
const API_URL = import.meta.env.VITE_API_URL || 'https://api.cabi.africa/api';

// Create axios instance with authentication interceptor
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 6000
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
    icon?: string;
}

export type RoleFormData = Omit<Role, 'id' | 'isSystem'>;

class RoleService {
    private getCachedRoles(): Role[] {
        try {
            const cached = localStorage.getItem('cabi_custom_roles');
            if (cached) return JSON.parse(cached);
        } catch {
            // ignore
        }
        const defaultRoles: Role[] = [
            {
                id: 'role-super-admin',
                name: 'SUPER_ADMIN',
                displayName: 'Super Administrator',
                description: 'Unrestricted governance across all administrative and operational suites.',
                type: 'ADMIN',
                platform: 'ADMIN_PANEL',
                permissions: ['*'],
                isActive: true,
                isSystem: true
            },
            {
                id: 'role-dispatch-lead',
                name: 'DISPATCH_LEAD',
                displayName: 'Dispatch Lead',
                description: 'Full trip dispatching, ride cancellations, manual surge overrides, and driver communication.',
                type: 'DISPATCH',
                platform: 'DISPATCH_PANEL',
                permissions: [
                    'DISPATCH_DASHBOARD_VIEW',
                    'DISPATCH_RIDE_ASSIGN',
                    'DISPATCH_RIDE_MONITOR',
                    'DISPATCH_RIDE_CANCEL',
                    'DISPATCH_REAL_TIME_MAP',
                    'DISPATCH_COMMUNICATE_DRIVER',
                    'DISPATCH_COMMUNICATE_PASSENGER',
                    'DISPATCH_SURGE_OVERRIDE'
                ],
                isActive: true,
                isSystem: false
            },
            {
                id: 'role-safety-officer',
                name: 'SAFETY_OFFICER',
                displayName: 'Safety & Compliance Officer',
                description: 'SOS triage, emergency armed response dispatch, detour tracking, and Occurrence Book audits.',
                type: 'SAFETY',
                platform: 'ADMIN_PANEL',
                permissions: [
                    'SECURITY_DASHBOARD_VIEW',
                    'SECURITY_INCIDENT_REPORT',
                    'SECURITY_INCIDENT_MANAGE',
                    'SECURITY_EMERGENCY_RESPONSE',
                    'OCCURRENCE_VIEW',
                    'OCCURRENCE_RESOLVE'
                ],
                isActive: true,
                isSystem: false
            },
            {
                id: 'role-finance-controller',
                name: 'FINANCE_CONTROLLER',
                displayName: 'Finance & SACCO Controller',
                description: 'Driver payout processing, M-Pesa B2C disbursements, and commission adjustments.',
                type: 'FINANCE',
                platform: 'ADMIN_PANEL',
                permissions: [
                    'PAYMENTS_VIEW',
                    'PAYMENTS_PROCESS',
                    'COMMISSION_VIEW',
                    'COMMISSION_EDIT',
                    'FINANCIAL_REPORTS_VIEW',
                    'DRIVER_PAYOUT_PROCESS'
                ],
                isActive: true,
                isSystem: false
            },
            {
                id: 'role-kyc-verifier',
                name: 'KYC_VERIFIER',
                displayName: 'Driver KYC & Document Verifier',
                description: 'Inspects and approves national IDs, driving licenses, PSV badges, and logbooks.',
                type: 'VERIFICATION',
                platform: 'ADMIN_PANEL',
                permissions: [
                    'DRIVER_APPLICATIONS_VIEW',
                    'DRIVER_APPLICATIONS_APPROVE',
                    'DRIVER_APPLICATIONS_REJECT',
                    'DRIVER_DOCUMENTS_VIEW',
                    'DRIVER_DOCUMENTS_VERIFY'
                ],
                isActive: true,
                isSystem: false
            }
        ];
        localStorage.setItem('cabi_custom_roles', JSON.stringify(defaultRoles));
        return defaultRoles;
    }

    private saveCachedRoles(roles: Role[]): void {
        try {
            localStorage.setItem('cabi_custom_roles', JSON.stringify(roles));
        } catch {
            // ignore
        }
    }

    async getAllRoles(): Promise<Role[]> {
        const cached = this.getCachedRoles();
        const customRoles = cached.filter(r => !r.isSystem);

        try {
            const response = await apiClient.get('/admin/roles');
            if (Array.isArray(response.data) && response.data.length > 0) {
                const remoteRoles: Role[] = response.data;
                const merged = [...remoteRoles];
                customRoles.forEach(customRole => {
                    if (!merged.some(m => m.id === customRole.id || m.name === customRole.name)) {
                        merged.push(customRole);
                    }
                });
                this.saveCachedRoles(merged);
                return merged;
            }
        } catch (err) {
            console.warn('[RoleService] Upstream /admin/roles unavailable, using system role catalog');
        }
        return cached;
    }

    async getRole(id: string): Promise<Role> {
        try {
            const response = await apiClient.get(`/admin/roles/${id}`);
            if (response.data) return response.data;
        } catch {
            // fallback
        }
        const roles = this.getCachedRoles();
        const role = roles.find(r => r.id === id || r.name === id);
        if (role) return role;
        throw new Error('Role not found');
    }

    async createRole(data: RoleFormData): Promise<Role> {
        let created: Role;
        try {
            const response = await apiClient.post('/admin/roles', data);
            created = response.data;
        } catch {
            console.warn('[RoleService] Upstream role creation failed, persisting locally');
            created = {
                ...data,
                id: 'role-' + data.name.toLowerCase().replace(/_/g, '-'),
                isSystem: false
            };
        }
        const roles = this.getCachedRoles();
        const existingIdx = roles.findIndex(r => r.name === created.name || r.id === created.id);
        if (existingIdx !== -1) {
            roles[existingIdx] = created;
        } else {
            roles.push(created);
        }
        this.saveCachedRoles(roles);
        return created;
    }

    async updateRole(id: string, data: Partial<RoleFormData>): Promise<Role> {
        let updated: Role;
        try {
            const response = await apiClient.patch(`/admin/roles/${id}`, data);
            updated = response.data;
        } catch {
            // fallback
            const roles = this.getCachedRoles();
            const index = roles.findIndex(r => r.id === id || r.name === id);
            if (index !== -1) {
                roles[index] = { ...roles[index], ...data };
                updated = roles[index];
                this.saveCachedRoles(roles);
            } else {
                throw new Error('Role not found');
            }
        }
        return updated;
    }

    async deleteRole(id: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/roles/${id}`);
        } catch {
            // fallback
        }
        const roles = this.getCachedRoles();
        const filtered = roles.filter(r => r.id !== id && r.name !== id);
        this.saveCachedRoles(filtered);
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
