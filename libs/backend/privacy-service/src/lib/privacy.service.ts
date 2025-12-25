import { Injectable } from '@nestjs/common';

export interface UserPrivacySettings {
    userId: string;
    emailPromotions: boolean;
    pushPromotions: boolean;
    locationSharing: boolean;
    dataProcessingConsent: boolean;
    lastUpdated: Date;
}

export interface DataExportRequest {
    id: string;
    userId: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    requestedAt: Date;
    completedAt?: Date;
    downloadUrl?: string;
    expiresAt?: Date;
}

@Injectable()
export class PrivacyService {
    private privacySettings = new Map<string, UserPrivacySettings>();
    private exportRequests: DataExportRequest[] = [];
    private deletionRequests: any[] = [];

    constructor() {
        // Seed data
        this.privacySettings.set('user_1', {
            userId: 'user_1',
            emailPromotions: true,
            pushPromotions: true,
            locationSharing: true,
            dataProcessingConsent: true,
            lastUpdated: new Date()
        });
    }

    // Privacy Settings Management
    async getPrivacySettings(userId: string) {
        let settings = this.privacySettings.get(userId);
        if (!settings) {
            settings = {
                userId,
                emailPromotions: true,
                pushPromotions: true,
                locationSharing: true,
                dataProcessingConsent: true,
                lastUpdated: new Date()
            };
            this.privacySettings.set(userId, settings);
        }
        return settings;
    }

    async updatePrivacySettings(userId: string, updates: Partial<UserPrivacySettings>) {
        const settings = await this.getPrivacySettings(userId);
        Object.assign(settings, updates, { lastUpdated: new Date() });
        console.log(`[PrivacyService] Updated privacy settings for user ${userId}`);
        return settings;
    }

    // Data Export (Story 55.6)
    async requestDataExport(userId: string) {
        const request: DataExportRequest = {
            id: `export_${Date.now()}`,
            userId,
            status: 'PENDING',
            requestedAt: new Date()
        };

        this.exportRequests.push(request);
        console.log(`[PrivacyService] Data export requested for user ${userId}`);

        // Simulate async processing
        setTimeout(() => {
            this.processDataExport(request.id);
        }, 2000);

        return request;
    }

    private async processDataExport(requestId: string) {
        const request = this.exportRequests.find(r => r.id === requestId);
        if (!request) return;

        request.status = 'PROCESSING';
        console.log(`[PrivacyService] Processing data export ${requestId}...`);

        // Simulate gathering data from multiple services
        // In real app: query user-service, ride-service, payment-service, etc.
        const userData = {
            profile: { name: 'John Doe', email: 'john@example.com' },
            trips: [{ id: 'trip_1', date: '2024-12-01', fare: 25.50 }],
            payments: [{ id: 'pay_1', amount: 25.50, method: 'CARD' }],
            ratings: [{ tripId: 'trip_1', rating: 5, comment: 'Great ride!' }]
        };

        // Generate download URL (in real app: upload to S3, generate signed URL)
        request.status = 'COMPLETED';
        request.completedAt = new Date();
        request.downloadUrl = `https://downloads.example.com/data-export/${requestId}.zip`;
        request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        console.log(`[PrivacyService] ✅ Data export completed: ${request.downloadUrl}`);
        // In real app: EmailService.send(userId, 'Your data is ready', downloadUrl)
    }

    async getDataExportStatus(userId: string) {
        return this.exportRequests
            .filter(r => r.userId === userId)
            .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }

    // Account Deletion (Story 55.7)
    async requestAccountDeletion(userId: string, password: string) {
        // In real app: verify password first

        const request = {
            id: `deletion_${Date.now()}`,
            userId,
            requestedAt: new Date(),
            status: 'PENDING',
            scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30-day grace period
        };

        this.deletionRequests.push(request);
        console.log(`[PrivacyService] ⚠️ Account deletion requested for user ${userId}`);
        console.log(`[PrivacyService] Grace period: 30 days. Scheduled for ${request.scheduledFor}`);

        // In real app: 
        // - Deactivate account immediately
        // - Schedule async job to delete/anonymize data after grace period
        // - Send confirmation email

        return request;
    }

    async cancelAccountDeletion(userId: string) {
        const index = this.deletionRequests.findIndex(r => r.userId === userId && r.status === 'PENDING');
        if (index !== -1) {
            this.deletionRequests.splice(index, 1);
            console.log(`[PrivacyService] Account deletion cancelled for user ${userId}`);
            return { success: true };
        }
        throw new Error('No pending deletion request found');
    }

    async processAccountDeletion(userId: string) {
        console.log(`[PrivacyService] 🗑️ Processing account deletion for user ${userId}`);

        // In real app:
        // 1. Anonymize trip history (replace PII with anonymous IDs)
        // 2. Delete profile data
        // 3. Delete payment methods
        // 4. Retain transaction records for legal compliance (anonymized)
        // 5. Delete from all microservices

        return {
            deleted: ['profile', 'payment_methods', 'preferences'],
            anonymized: ['trip_history', 'transaction_records'],
            retained: ['financial_records_anonymized']
        };
    }

    // Marketing Preferences Check (Story 55.8)
    async canSendMarketingEmail(userId: string): Promise<boolean> {
        const settings = await this.getPrivacySettings(userId);
        return settings.emailPromotions;
    }

    async canSendMarketingPush(userId: string): Promise<boolean> {
        const settings = await this.getPrivacySettings(userId);
        return settings.pushPromotions;
    }
}
