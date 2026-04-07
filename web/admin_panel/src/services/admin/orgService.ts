import {
    Organization,
    Subgroup,
    OrganizationLogEntry,
    PlatformUser
} from './types';

export class OrgService {
    async getOrganizations(): Promise<Organization[]> {
        try {
            const res = await fetch('/api/v1/organizations');
            if (!res.ok) throw new Error('Failed to fetch orgs');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async updateOrganizationStatus(orgId: string, status: 'ACTIVE' | 'HOLD' | 'TEMP_HOLD'): Promise<void> {
        await fetch(`/api/v1/organizations/${orgId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    }

    async getDriverUnions(): Promise<Organization[]> {
        return this.getOrganizations();
    }

    async getSubgroupDetails(orgId: string, subgroupId: string): Promise<Subgroup | null> {
        const subgroups = await this.getSubgroups(orgId);
        return subgroups.find(sg => sg.id === subgroupId) || null;
    }

    async getSubgroups(orgId: string): Promise<Subgroup[]> {
        try {
            const res = await fetch(`/api/v1/organizations/${orgId}/subgroups`);
            if (!res.ok) throw new Error('Failed to fetch subgroups');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createSubgroup(orgId: string, name: string, parentId?: string): Promise<void> {
        await fetch(`/api/v1/organizations/${orgId}/subgroups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
    }

    async updateSubgroup(subgroupId: string, updates: Partial<Subgroup>): Promise<void> {
        await fetch(`/api/v1/organizations/subgroups/${subgroupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
    }

    async deleteSubgroup(subgroupId: string): Promise<void> {
        await fetch(`/api/v1/organizations/subgroups/${subgroupId}`, {
            method: 'DELETE'
        });
    }

    async getSubgroupMembers(subgroupId: string): Promise<PlatformUser[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'u101', name: 'Driver X', email: 'driver.x@cabi.com', type: 'DRIVER', registrationDate: '2024-05-01', status: 'ACTIVE' },
        ];
    }

    async addMemberToSubgroup(subgroupId: string, userId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async removeMemberFromSubgroup(subgroupId: string, userId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async getOrganizationAuditLog(orgId: string): Promise<OrganizationLogEntry[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 'log-1', action: 'CREATE_SUBGROUP', actorName: 'John Doe', target: 'Team Alpha', timestamp: new Date(Date.now() - 86400000).toISOString() },
        ];
    }
}
