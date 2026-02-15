import { Permission, Role, BlogPost } from './types';

export class SystemService {
    async getPermissions(): Promise<Permission[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'blog.manage', description: 'Can create, edit, and delete blog posts' },
            { id: 'users.approve', description: 'Can approve new driver applications' },
            { id: 'config.edit.referral', description: 'Can edit the main Referral configuration' },
        ];
    }

    async createPermission(permission: Permission): Promise<Permission> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return permission;
    }

    async updatePermission(permissionId: string, permission: Permission): Promise<Permission> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return permission;
    }

    async deletePermission(permissionId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async getRoles(): Promise<Role[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'super-admin', name: 'Super Admin', permissions: ['*'] },
            { id: 'support-l1', name: 'Support Level 1', permissions: ['users.view', 'tickets.respond'] },
            { id: 'content-manager', name: 'Content Manager', permissions: ['blog.manage'] },
        ];
    }

    async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { ...roleData, id: roleData.name.toLowerCase().replace(' ', '-') };
    }

    async updateRole(roleId: string, roleData: Omit<Role, 'id'>): Promise<Role> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { ...roleData, id: roleId };
    }

    async deleteRole(roleId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async globalSearch(query: string): Promise<any[]> {
        if (!query) return [];
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 'u-1', name: 'John Doe', email: 'john@example.com', type: 'PASSENGER', status: 'ACTIVE' },
            { id: 'd-1', name: 'Jane Driver', email: 'jane@driver.com', type: 'DRIVER', status: 'ACTIVE' },
            { id: 'd-5', name: 'Dave Suspended', email: 'dave@driver.com', type: 'DRIVER', status: 'SUSPENDED' },
        ].filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
    }

    async getServices(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'srv-1', name: 'Economy', baseFare: 200, perKm: 30 },
            { id: 'srv-2', name: 'Comfort', baseFare: 350, perKm: 50 },
            { id: 'srv-3', name: 'XL', baseFare: 500, perKm: 70 },
        ];
    }

    async createService(service: any): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async getSupportTickets(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 't-1', subject: 'Login Issue', user: 'John Doe', status: 'OPEN', priority: 'HIGH', date: new Date().toISOString() },
            { id: 't-2', subject: 'Fare Dispute', user: 'Jane Smith', status: 'RESOLVED', priority: 'MEDIUM', date: new Date().toISOString() },
        ];
    }

    async getZones(type: 'SURGE' | 'AIRPORT'): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'z-1', name: 'CBD High Demand', type, geometry: 'POLYGON(...)', multiplier: 1.5 },
        ];
    }

    async getVehicleCategories(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'v-1', name: 'Standard', baseFare: 200, perKm: 30 },
            { id: 'v-2', name: 'XL', baseFare: 350, perKm: 45 },
        ];
    }

    async getPromoCodes(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { code: 'WELCOME20', type: 'PERCENTAGE', value: 20, uses: 150, status: 'ACTIVE' },
        ];
    }

    async getScheduledRides(): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 'sch-1', passenger: 'Alice W.', pickupTime: new Date(Date.now() + 86400000).toISOString(), pickup: 'Airport', dropoff: 'Hotel', status: 'SCHEDULED' },
        ];
    }

    async sendBulkMessage(segment: string, subject: string, body: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async getAdminPosts(): Promise<BlogPost[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            { id: 'post-1', title: 'CABI Launches!', content: '<h1>Welcome</h1>', summary: 'CABI Nairobi', imageUrl: '#', authorName: 'CABI Team', status: 'PUBLISHED', publishedDate: '2024-05-20T10:00:00Z' },
            { id: 'post-2', title: 'Guide', content: '<h1>Guide</h1>', summary: 'Referral Program Guide', imageUrl: '#', authorName: 'CABI Team', status: 'DRAFT' },
        ];
    }

    async createPost(postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...postData, id: `post-${Math.random()}`, publishedDate: postData.status === 'PUBLISHED' ? new Date().toISOString() : undefined };
    }

    async updatePost(postId: string, postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { ...postData, id: postId, publishedDate: postData.status === 'PUBLISHED' ? new Date().toISOString() : undefined };
    }

    async deletePost(postId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async getCMSContent(type: 'FAQ' | 'PAGE'): Promise<any[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return type === 'FAQ' ? [
            { id: 'faq-1', question: 'How to pay?', answer: 'M-Pesa...' }
        ] : [
            { id: 'pg-1', title: 'About Us', slug: 'about-us' }
        ];
    }
}
