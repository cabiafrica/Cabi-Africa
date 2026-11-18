export interface Organization {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    ownerId?: string;
    memberCount: number;
    status: 'ACTIVE' | 'VERIFIED' | 'UNVERIFIED' | 'HOLD' | 'TEMP_HOLD' | 'PENDING';
    type?: 'UNION' | 'ASSOCIATION' | 'GROUP' | 'FLEET';
    founderName?: string;
    createdAt?: string;
    features?: string[];
    subgroups?: Subgroup[];
    distressResponders?: OrgMember[];
}

export interface Subgroup {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    parentId: string | null;
    orgId?: string;
    features: string[];
    status: string;
    memberCount?: number;
    createdAt?: string;
}

export interface OrgMember {
    id: string;
    name: string;
    contact: string;
    position: string;
    isDistressResponder: boolean;
    userId?: string;
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
    signup?: {
        totalFee: number;
        allocations: {
            sacco: number;
            directReferrer: number;
            indirectReferrer: number;
        }
    };
    driverProgram: {
        enabled: boolean;
        l1Percentage: number;
        l2Percentage: number;
        maxL1Drivers: number;
        maxL2Drivers: number;
    };
    passengerProgram: {
        enabled: boolean;
        l1Percentage: number;
        l2Percentage: number;
        paxReferDriverFirstWeekPercent: number;
        firstWeekDurationDays: number;
        startDate?: string;
        endDate?: string;
    };
    qualifiers: {
        requiredBadgeCode: string;
        grandfatherExisting: boolean;
        disqualifyingFareThreshold: number;
        maxPlatformFeeDeductionPercent: number;
        escrowHoldingHours: number;
    };
    fraudDetection: {
        deviceFingerprintBlock: boolean;
        maxReferrerTripDensity: number;
        minTripsForDensityCheck: number;
        immediateSuspension: boolean;
    };
    saccoMatchingPool: {
        enabled: boolean;
        defaultSavingsPercent: number;
    };
    driverPromo?: {
        enabled: boolean;
        rules: { recipient: string; percentage: number }[];
    };
    passengerPromo?: {
        enabled: boolean;
        rules: { recipient: string; percentage: number }[];
    };
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
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED';
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
    obNumber?: string;
    title?: string;
    description?: string;
    category: string;
    severity: string;
    driver: { 
        id: string; 
        name: string; 
        phone?: string; 
        photoUrl?: string;
        rating?: number;
        badges?: { name: string; icon?: string; tier: string; }[];
        organization?: {
            id: string;
            name: string;
            leader?: { name: string; phone: string; position: string; };
        };
    };
    passenger: { 
        id: string; 
        name: string; 
        phone?: string; 
        photoUrl?: string;
        rating?: number;
        badges?: { name: string; icon?: string; tier: string; }[];
    };
    upline1?: { id: string; name: string; phone?: string; };
    upline2?: { id: string; name: string; phone?: string; };
    liveLocation?: { lat: number; lng: number; };
    status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISPUTED' | string;
    responsibleParty?: string;
    logs: SOSIncidentLogEntry[];
    /** Enriched audit log with actor identity */
    annotatedLogs?: AnnotatedLogEntry[];
    /** Party statements (from OccurrenceObjection) */
    statements?: IncidentStatement[];
}

export interface SOSIncidentLogEntry {
    timestamp: string;
    notes: string;
}

export interface AnnotatedLogEntry {
    id: string;
    timestamp: string;
    action: string;
    notes: string;
    actorId: string | null;
    actorName: string;
    actorPhoto: string | null;
    actorRole: 'Driver' | 'Passenger' | 'Admin' | 'Unknown';
}

export interface IncidentStatement {
    id: string;
    role: 'Driver' | 'Passenger' | 'Admin' | 'Unknown';
    objectorId: string;
    objectorName: string;
    objectorPhoto: string | null;
    objectorRating: number | null;
    text: string;
    supportingEvidence: any | null;
    status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
    reviewedAt: string | null;
    reviewedBy: { id: string; name: string } | null;
    reviewNotes: string | null;
    submittedAt: string;
}

export interface OccurrenceSummary {
    id: string;
    obNumber: string | null;
    category: string;
    severity: string;
    title: string | null;
    status: string;
    createdAt: string;
    driverName?: string;
    passengerName?: string;
}

export interface SosPenaltyConfig {
    type: 'FEE' | 'REVOKE_BADGE';
    feeAmount?: number;
    badgeId?: string;
}

export interface DriverGroup {
    id: string;
    name: string;
    description?: string;
    parentGroupId?: string | null;
    createdAt: string;
    updatedAt: string;
    parentGroup?: {
        id: string;
        name: string;
    };
    subgroups?: DriverGroup[];
    _count?: {
        drivers: number;
        subgroups: number;
    };
}

export interface PlatformUser {
    id: string;
    name: string;
    email: string;
    type: 'DRIVER' | 'PASSENGER';
    isDistressResponder?: boolean;
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

export interface CategoryPricingConfig {
    category: string;
    displayName: string;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minimumFare: number;
    roundingStep: number;
    description?: string;
    isActive: boolean;
}

