import apiClient from '../apiClient';
import {
    Organization,
    Subgroup,
    OrganizationLogEntry,
    PlatformUser
} from './types';

export class OrgService {
    async getOrganizations(): Promise<Organization[]> {
        const res = await apiClient.get('/v1/organizations');
        return res.data;
    }

    async updateOrganizationStatus(orgId: string, status: 'ACTIVE' | 'HOLD' | 'TEMP_HOLD'): Promise<void> {
        await apiClient.patch(`/v1/organizations/${orgId}/status`, { status });
    }

    async getDriverUnions(): Promise<Organization[]> {
        const res = await apiClient.get('/v1/organizations/unions');
        return res.data;
    }

    async getSubgroupDetails(orgId: string, subgroupId: string): Promise<Subgroup | null> {
        const res = await apiClient.get(`/v1/organizations/${orgId}/subgroups/${subgroupId}`);
        return res.data;
    }

    async getSubgroups(orgId: string): Promise<Subgroup[]> {
        const res = await apiClient.get(`/v1/organizations/${orgId}/subgroups`);
        return res.data;
    }

    async createSubgroup(orgId: string, name: string, parentId?: string): Promise<void> {
        await apiClient.post(`/v1/organizations/${orgId}/subgroups`, { name, parentId });
    }

    async updateSubgroup(subgroupId: string, updates: Partial<Subgroup>): Promise<void> {
        await apiClient.patch(`/v1/organizations/subgroups/${subgroupId}`, updates);
    }

    async deleteSubgroup(subgroupId: string): Promise<void> {
        await apiClient.delete(`/v1/organizations/subgroups/${subgroupId}`);
    }

    async getSubgroupMembers(subgroupId: string): Promise<PlatformUser[]> {
        const res = await apiClient.get(`/v1/organizations/subgroups/${subgroupId}/members`);
        return res.data;
    }

    async addMemberToSubgroup(subgroupId: string, userId: string): Promise<void> {
        await apiClient.post(`/v1/organizations/subgroups/${subgroupId}/members`, { userId });
    }

    async removeMemberFromSubgroup(subgroupId: string, userId: string): Promise<void> {
        await apiClient.delete(`/v1/organizations/subgroups/${subgroupId}/members/${userId}`);
    }

    async getOrganizationAuditLog(orgId: string): Promise<OrganizationLogEntry[]> {
        const res = await apiClient.get(`/v1/organizations/${orgId}/audit-log`);
        return res.data;
    }
}

