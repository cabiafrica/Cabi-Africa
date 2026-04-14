import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {

    // Story 25.4: Admin Dashboard Metrics
    async getDashboardMetrics() {
        return {
            activeDrivers: 0,
            activePassengers: 0,
            ongoingTrips: 0,
            completedTripsToday: 0,
            revenueToday: 0,
            totalRevenue7Days: 0,
            recentActivity: []
        };
    }

    // Story 25.5: Driver Performance Report
    async getDriverPerformance(driverId: string, startDate: Date, endDate: Date) {
        return {
            driverId,
            period: { startDate, endDate },
            totalTrips: 0,
            totalEarnings: 0,
            averageRating: 0,
            acceptanceRate: 0,
            cancellationRate: 0,
            onlineHours: 0,
        };
    }

    async getPassengerActivityReport(passengerId: string, startDate: Date, endDate: Date) {
        return {
            passengerId,
            period: { startDate, endDate },
            totalTrips: 0,
            totalSpent: 0,
            averageRating: 0,
            mostFrequentPickup: 'N/A',
            mostFrequentDropoff: 'N/A',
            promoCodesUsed: [],
            favoriteDrivers: [],
            paymentMethods: {
                card: 0,
                wallet: 0,
                cash: 0
            },
            tripsByTimeOfDay: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            }
        };
    }

    // Story 25.10: Network Health (Driver Metrics)
    async getNetworkHealth(range: any) {
        return {
            averageAcceptanceRate: 0,
            averageCancellationRate: 0,
            trend: []
        };
    }

    // Story 25.11: Support Ticket Metrics
    async getSupportMetrics(range: any) {
        return {
            totalTickets: 0,
            avgFirstResponseTimeMinutes: 0,
            avgResolutionTimeHours: 0,
            ticketsByCategory: {}
        };
    }

    // Story 25.6: Admin Financial Report
    async getFinancialReport(range: any) {
        return {
            period: range,
            grossRevenue: 0,
            totalCommissions: 0,
            totalTips: 0,
            totalBonuses: 0,
            totalDriverPayouts: 0,
            currency: 'KES'
        };
    }

    // --- App Analytics (Stories 25.1 - 25.4) ---

    // Mock 'Mixpanel' tracker
    private trackEvent(eventName: string, payload: any) {
        console.log(`[Analytics] Sending to Mixpanel: ${eventName}`, payload);
    }

    // Event Handlers (effectively replacing listeners for this mock)

    // Story 25.1: User Logged In
    handleUserLoggedIn(userId: string, userType: string) {
        this.trackEvent('User Logged In', { userId, userType });
    }

    // Story 25.2: Ride Events
    handleRideRequested(rideId: string, passengerId: string, location: string) {
        this.trackEvent('Ride Requested', { rideId, passengerId, location });
    }

    handleRideCompleted(rideId: string, finalFare: number, duration: number) {
        this.trackEvent('Ride Completed', { rideId, finalFare, duration });
    }

    // Story 25.3: Onboarding Funnel
    handleDocumentSubmitted(driverId: string, docType: string) {
        this.trackEvent('Document Submitted', { driverId, docType });
    }

    handleDocumentApproved(driverId: string, docType: string) {
        this.trackEvent('Document Approved', { driverId, docType });
    }

    handleAccountActivated(driverId: string) {
        this.trackEvent('Account Activated', { driverId });
    }

    // Story 25.4: Promo Code
    handlePromoCodeApplied(userId: string, code: string, valid: boolean) {
        this.trackEvent('Promo Code Applied', { userId, code, valid });
    }

    // Story 25.12: Promo Code LTV
    async getPromoCohortAnalysis(promoCode: string) {
        return {
            promoCode,
            acquiredUsers: 0,
            costOfPromotion: 0,
            revenueGenerated: 0,
            roi: 0,
            ltvCurve: []
        };
    }

    // Story 34.2: Monthly Business Summaries
    async generateMonthlyBusinessSummary(companyId: string, month: string) {
        return {
            companyId,
            month,
            totalTrips: 0,
            totalSpend: 0,
            trips: [],
            status: 'PENDING'
        };
    }

    // Story 25.8: Heatmap Data
    async getHeatmapData(startDate: Date, endDate: Date, type: 'PICKUP' | 'DROPOFF') {
        return [];
    }

    // Story 55.1: Download My Data
    async generateUserDataArchive(userId: string) {
        return { status: 'QUEUED', jobId: `data_export_${Date.now()}` };
    }

    // Story 25.9: Admin Audit Log
    private auditLogs: any[] = [];

    async logSystemEvent(eventName: string, actorId: string, payload: any) {
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            eventName,
            actorId,
            payload
        };
        this.auditLogs.unshift(entry); // Newest first
        console.log(`[Audit Log] 🛡️ ${eventName} by ${actorId}`, payload);
    }

    async getAuditLogs(page: number = 1, limit: number = 20) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: this.auditLogs.slice(start, end),
            total: this.auditLogs.length,
            page,
            limit
        };
    }

    // Story 130.4: Blog Promotion Analytics
    private promotionStats = new Map<string, any>(); // contentId -> { recipients: 0, opens: 0, clicks: 0, segments: {} }

    async trackPromotionInteraction(contentId: string, eventType: 'SENT' | 'OPEN' | 'CLICK', userId: string, userType: 'PASSENGER' | 'DRIVER' | string) {
        if (!this.promotionStats.has(contentId)) {
            this.promotionStats.set(contentId, {
                recipients: 0,
                opens: 0,
                clicks: 0,
                segments: {
                    PASSENGER: { recipients: 0, opens: 0, clicks: 0 },
                    DRIVER: { recipients: 0, opens: 0, clicks: 0 }
                }
            });
        }
        const stats = this.promotionStats.get(contentId);

        if (eventType === 'SENT') {
            stats.recipients++;
            if (stats.segments[userType]) stats.segments[userType].recipients++;
        } else if (eventType === 'OPEN') {
            stats.opens++;
            if (stats.segments[userType]) stats.segments[userType].opens++;
        } else if (eventType === 'CLICK') {
            stats.clicks++;
            if (stats.segments[userType]) stats.segments[userType].clicks++;
        }

        this.trackEvent(`Promotion ${eventType}`, { contentId, userId, userType });
    }

    async getPromotionAnalytics(contentId: string) {
        if (!this.promotionStats.has(contentId)) {
            return {
                recipients: 0,
                opens: 0,
                clicks: 0,
                segments: {
                    PASSENGER: { recipients: 0, opens: 0, clicks: 0 },
                    DRIVER: { recipients: 0, opens: 0, clicks: 0 }
                }
            };
        }
        return this.promotionStats.get(contentId);
    }
}
