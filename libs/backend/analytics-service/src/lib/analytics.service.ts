import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {

    // Story 25.4: Admin Dashboard Metrics
    async getDashboardMetrics() {
        return {
            activeDrivers: 154,
            activePassengers: 1205,
            ongoingTrips: 45,
            completedTripsToday: 320,
            revenueToday: 154000,
            totalRevenue7Days: 980000,
            recentActivity: [
                { id: 1, type: 'TRIP_COMPLETED', description: 'Trip #1234 finished', time: '2 mins ago' },
                { id: 2, type: 'DRIVER_ONLINE', description: 'Driver John Doe came online', time: '5 mins ago' },
            ]
        };
    }

    // Story 25.5: Driver Performance Report
    async getDriverPerformance(driverId: string, startDate: Date, endDate: Date) {
        // Mock implementation
        return {
            driverId,
            period: { startDate, endDate },
            totalTrips: 45,
            totalEarnings: 1250.50,
            averageRating: 4.8,
            acceptanceRate: 0.92,
            cancellationRate: 0.03,
            onlineHours: 120,
        };
    }

    async getPassengerActivityReport(passengerId: string, startDate: Date, endDate: Date) {
        // Mock implementation
        return {
            passengerId,
            period: { startDate, endDate },
            totalTrips: 28,
            totalSpent: 450.75,
            averageRating: 4.9,
            mostFrequentPickup: '123 Main St, New York',
            mostFrequentDropoff: '456 Park Ave, New York',
            promoCodesUsed: [
                { code: 'SAVE10', discount: 15.00, usedAt: new Date() },
                { code: 'FIRSTRIDE', discount: 5.00, usedAt: new Date() }
            ],
            favoriteDrivers: ['driver_bob', 'driver_alice'],
            paymentMethods: {
                card: 20,
                wallet: 5,
                cash: 3
            },
            tripsByTimeOfDay: {
                morning: 8,
                afternoon: 12,
                evening: 6,
                night: 2
            }
        };
    }

    // Story 25.10: Network Health (Driver Metrics)
    async getNetworkHealth(range: any) {
        return {
            averageAcceptanceRate: 0.88,
            averageCancellationRate: 0.05,
            trend: [
                { date: '2024-01-01', acceptance: 0.85, cancellation: 0.06 },
                { date: '2024-01-02', acceptance: 0.87, cancellation: 0.05 },
                { date: '2024-01-03', acceptance: 0.89, cancellation: 0.04 },
            ]
        };
    }

    // Story 25.11: Support Ticket Metrics
    async getSupportMetrics(range: any) {
        return {
            totalTickets: 350,
            avgFirstResponseTimeMinutes: 45,
            avgResolutionTimeHours: 24,
            ticketsByCategory: {
                'Billing': 120,
                'Technical': 80,
                'Safety': 10,
                'Other': 140
            }
        };
    }

    // Story 25.6: Admin Financial Report
    async getFinancialReport(range: any) {
        return {
            period: range,
            grossRevenue: 500000,
            totalCommissions: 100000, // 20%
            totalTips: 25000,
            totalBonuses: 5000, // Incentives
            totalDriverPayouts: 370000, // Revenue - Comm + Tips + Bonus
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
            acquiredUsers: 500,
            costOfPromotion: 50000,
            revenueGenerated: 250000,
            roi: 4.0, // 400%
            ltvCurve: [
                { month: 1, value: 500 },
                { month: 2, value: 1200 },
                { month: 3, value: 1800 },
            ]
        };
    }

    // Story 34.2: Monthly Business Summaries
    async generateMonthlyBusinessSummary(companyId: string, month: string) {
        // Find all trips for this company in this month
        return {
            companyId,
            month,
            totalTrips: 150,
            totalSpend: 75000,
            trips: [
                { date: '2024-05-01', route: 'Airport -> Office', cost: 1200, user: 'User A' },
                { date: '2024-05-02', route: 'Office -> Client', cost: 800, user: 'User B' },
            ],
            // In real app, this would generate a PDF or email payload
            status: 'GENERATED'
        };
    }

    // Story 25.8: Heatmap Data
    async getHeatmapData(startDate: Date, endDate: Date, type: 'PICKUP' | 'DROPOFF') {
        // Mock geospatial data (lat, lng, weight)
        return [
            { lat: 40.75, lng: -73.98, weight: 1.0 }, // Times Square
            { lat: 40.78, lng: -73.96, weight: 0.8 }, // Central Park
            { lat: 40.70, lng: -74.00, weight: 0.5 }, // FiDi
        ];
    }

    // Story 55.1: Download My Data
    async generateUserDataArchive(userId: string) {
        console.log(`[Analytics] 📦 Generating GDPR/CCPA archive for ${userId}...`);

        // Mock data aggregation from multiple services
        const archive = {
            userProfile: { id: userId, name: 'John Doe', email: 'john@example.com' },
            rideHistory: [
                { id: 'ride_1', date: '2024-01-01', fare: 25.50 }
            ],
            paymentMethods: [
                { type: 'VISA', last4: '4242' }
            ],
            generatedAt: new Date()
        };

        // In real app: JSON/CSV generation, upload to S3, email link
        return { status: 'QUEUED', jobId: `data_export_${Date.now()}` };
    }

    // Story 25.9: Admin Audit Log
    private auditLogs: any[] = [
        { id: '1', timestamp: new Date(Date.now() - 10000), eventName: 'AdminLogin', actorId: 'admin_1', payload: { ip: '192.168.1.1' } },
        { id: '2', timestamp: new Date(Date.now() - 50000), eventName: 'UserSuspended', actorId: 'admin_1', payload: { userId: 'user_123', reason: 'Fraud' } },
        { id: '3', timestamp: new Date(Date.now() - 100000), eventName: 'TripCancelled', actorId: 'system', payload: { tripId: 'trip_999' } },
    ];

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
            // Mock random data if missing, for frontend demo
            return {
                recipients: 1250,
                opens: 560,
                clicks: 180,
                segments: {
                    PASSENGER: { recipients: 1000, opens: 450, clicks: 140 },
                    DRIVER: { recipients: 250, opens: 110, clicks: 40 }
                }
            };
        }
        return this.promotionStats.get(contentId);
    }
}
