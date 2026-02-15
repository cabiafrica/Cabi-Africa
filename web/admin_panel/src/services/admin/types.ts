export interface Organization {
    id: string;
    name: string;
    ownerId: string;
    memberCount: number;
    status?: 'ACTIVE' | 'HOLD' | 'TEMP_HOLD' | 'PENDING';
    type?: 'UNION' | 'ASSOCIATION' | 'GROUP';
    founder?: string;
}

export interface DriverApplication {
    id: string;
    fullName: string;
    phone: string;
    applicationDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    email?: string;
}

export interface DriverApplicationDetails extends DriverApplication {
    vehicleDetails: {
        make: string;
        model: string;
        year: number;
        licensePlate: string;
    };
    documents: {
        id: string;
        type: 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'VEHICLE_INSPECTION';
        url: string;
    }[];
}

export interface ReferralConfig {
    enabled: boolean;
    registrationFee: {
        total: number;
        systemCut: number;
        upline1Cut: number;
        upline2Cut: number;
    };
    promoConfig?: PromoConfig;
}

export interface PromoConfig {
    isActive: boolean;
    upline1Cut: number;
    upline2Cut: number;
    qualification: { requiredBadge: string };
}

export interface BadgeRule {
    metric: 'averageRating' | 'completedTrips' | 'totalEarnings';
    operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
    value: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    value?: number;
    rules: BadgeRule[];
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    summary: string;
    imageUrl: string;
    authorName: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedDate?: string;
}

export interface Permission {
    id: string;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface AdminUser {
    id: string;
    email: string;
    roles: string[];
    directGrants: string[];
    directRevokes: string[];
    suspensionReason?: string;
    suspensionDate?: string;
}

export interface AuditLog {
    id: string;
    adminUserId: string;
    adminUserEmail: string;
    action: string;
    details: Record<string, any>;
    ipAddress: string;
    timestamp: string;
}

export interface AuditLogFilters {
    userEmail?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
}

export interface SOSIncidentDetails {
    id: string;
    driver: { id: string; name: string; phone: string; };
    passenger: { id: string; name: string; phone: string; };
    upline1: { id: string; name: string; phone: string; };
    upline2: { id: string; name: string; phone: string; };
    liveLocation: { lat: number; lon: number; };
    logs: SOSIncidentLogEntry[];
}

export interface SOSIncidentLogEntry {
    timestamp: string;
    notes: string;
}

export interface SosPenaltyConfig {
    type: 'FEE' | 'REVOKE_BADGE';
    feeAmount?: number;
    badgeId?: string;
}

export interface Subgroup {
    id: string;
    orgId: string;
    name: string;
    parentId: string | null;
    memberCount: number;
}

export interface PlatformUser {
    id: string;
    name: string;
    email: string;
    type: 'DRIVER' | 'PASSENGER';
    registrationDate: string;
    status: 'ACTIVE' | 'SUSPENDED';
}

export interface LedgerAdjustment {
    driverId: string;
    amount: number;
    type: string;
    reason: string;
    description?: string;
}

export interface CommissionLedgerEntry {
    id: string;
    date: string;
    driverId: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    transactionType: string;
}

export interface SimulationParams {
    fareIncreasePercentage: number;
    surgeCapMultiplier: number;
    incentiveBoostPercentage: number;
}

export interface SimulationResult {
    projectedRevenue: number;
    revenueChange: number;
    projectedDriverEarnings: number;
    driverEarningsChange: number;
    projectedRides: number;
    demandChange: number;
}

export interface OrganizationLogEntry {
    id: string;
    action: string;
    actorName: string;
    target: string;
    timestamp: string;
}

export interface UserDocument {
    id: string;
    type: string;
    url: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    expiryDate: string;
}

export interface UserAuditLogEntry {
    id: string;
    timestamp: string;
    adminName: string;
    action: string;
    reason: string;
}

export interface UserRide {
    id: string;
    date: string;
    pickup: string;
    dropoff: string;
    amount: number;
    status: string;
}

export interface UserPayment {
    id: string;
    date: string;
    type: string;
    amount: number;
    status: string;
}

export interface ExpiringDocumentResult {
    driverId: string;
    driverName: string;
    docType: string;
    expiryDate: string;
}
