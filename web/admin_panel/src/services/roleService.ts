
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        const response = await axios.get(`${API_URL}/roles`);
        return response.data;
    }

    async getRole(id: string): Promise<Role> {
        const response = await axios.get(`${API_URL}/roles/${id}`);
        return response.data;
    }

    async createRole(data: RoleFormData): Promise<Role> {
        const response = await axios.post(`${API_URL}/roles`, data);
        return response.data;
    }

    async updateRole(id: string, data: Partial<RoleFormData>): Promise<Role> {
        const response = await axios.patch(`${API_URL}/roles/${id}`, data);
        return response.data;
    }

    async deleteRole(id: string): Promise<void> {
        await axios.delete(`${API_URL}/roles/${id}`);
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
