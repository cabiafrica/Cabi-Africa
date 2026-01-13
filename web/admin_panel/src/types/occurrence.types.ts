// Occurrence types and enums
export enum OccurrenceCategory {
    CRIME = 'CRIME',
    TRAFFIC_OFFENSE = 'TRAFFIC_OFFENSE',
    SAFETY_VIOLATION = 'SAFETY_VIOLATION',
    POLICY_VIOLATION = 'POLICY_VIOLATION',
    HARASSMENT = 'HARASSMENT',
    FRAUD = 'FRAUD',
    PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
    MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
    DISPUTE = 'DISPUTE',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    VEHICLE_ISSUE = 'VEHICLE_ISSUE',
    ENVIRONMENTAL = 'ENVIRONMENTAL',
}

export enum OccurrenceSeverity {
    CRITICAL = 'CRITICAL', // SEV-1
    HIGH = 'HIGH',         // SEV-2
    MEDIUM = 'MEDIUM',     // SEV-3
    LOW = 'LOW',           // SEV-4
}

export enum OccurrenceStatus {
    OPEN = 'OPEN',
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    RESOLVED = 'RESOLVED',
    DISPUTED = 'DISPUTED',
}

export enum ObjectionStatus {
    PENDING = 'PENDING',
    UNDER_REVIEW = 'UNDER_REVIEW',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export interface Occurrence {
    id: string;
    obNumber: string;
    category: OccurrenceCategory;
    severity: OccurrenceSeverity;
    title: string;
    description: string;

    // Involved parties
    driverId?: string;
    driver?: any;
    passengerId?: string;
    passenger?: any;
    vehicleId?: string;
    vehicle?: any;
    rideId?: string;
    ride?: any;

    // Time, Date, Place
    occurrenceDate: string;
    occurrenceTime: string;
    occurredAt: string;
    locationLat?: number;
    locationLng?: number;
    locationAddress?: string;
    locationPlaceName?: string;
    locationCity?: string;
    locationCountry: string;

    // Source
    source: string;
    sourceReferenceId?: string;

    // Registrar
    registeredById: string;
    registeredBy?: any;
    registeredAt: string;

    // Status
    status: OccurrenceStatus;
    resolvedAt?: string;
    resolvedById?: string;
    resolvedBy?: any;
    resolutionNotes?: string;

    // Metadata
    tags: string[];
    isFlagged: boolean;
    flagReason?: string;

    createdAt: string;
    updatedAt: string;

    // Relations
    media?: OccurrenceMedia[];
    objections?: OccurrenceObjection[];
    auditLog?: OccurrenceAuditLog[];
}

export interface OccurrenceMedia {
    id: string;
    occurrenceId: string;
    mediaType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    fileUrl: string;
    thumbnailUrl?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    uploadedById?: string;
    uploadedBy?: any;
    uploadedAt: string;
    description?: string;
}

export interface OccurrenceObjection {
    id: string;
    occurrenceId: string;
    objectorId: string;
    objector?: any;
    objectionText: string;
    supportingEvidence?: any;
    status: ObjectionStatus;
    reviewedById?: string;
    reviewedBy?: any;
    reviewedAt?: string;
    reviewNotes?: string;
    outcome?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OccurrenceAuditLog {
    id: string;
    occurrenceId: string;
    action: string;
    actorId?: string;
    actor?: any;
    changes?: any;
    notes?: string;
    createdAt: string;
}

export interface OccurrenceStats {
    total: number;
    byStatus: {
        open: number;
        resolved: number;
        disputed: number;
        underInvestigation: number;
    };
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
}

// Category colors
export const CATEGORY_COLORS: Record<OccurrenceCategory, string> = {
    [OccurrenceCategory.CRIME]: '#DC2626',
    [OccurrenceCategory.TRAFFIC_OFFENSE]: '#EA580C',
    [OccurrenceCategory.SAFETY_VIOLATION]: '#D97706',
    [OccurrenceCategory.POLICY_VIOLATION]: '#CA8A04',
    [OccurrenceCategory.HARASSMENT]: '#9333EA',
    [OccurrenceCategory.FRAUD]: '#4F46E5',
    [OccurrenceCategory.PROPERTY_DAMAGE]: '#2563EB',
    [OccurrenceCategory.MEDICAL_EMERGENCY]: '#DB2777',
    [OccurrenceCategory.DISPUTE]: '#0D9488',
    [OccurrenceCategory.SUSPICIOUS_ACTIVITY]: '#475569',
    [OccurrenceCategory.VEHICLE_ISSUE]: '#0891B2',
    [OccurrenceCategory.ENVIRONMENTAL]: '#16A34A',
};

// Category labels
export const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
    [OccurrenceCategory.CRIME]: 'Crime',
    [OccurrenceCategory.TRAFFIC_OFFENSE]: 'Traffic Offense',
    [OccurrenceCategory.SAFETY_VIOLATION]: 'Safety Violation',
    [OccurrenceCategory.POLICY_VIOLATION]: 'Policy Violation',
    [OccurrenceCategory.HARASSMENT]: 'Harassment',
    [OccurrenceCategory.FRAUD]: 'Fraud',
    [OccurrenceCategory.PROPERTY_DAMAGE]: 'Property Damage',
    [OccurrenceCategory.MEDICAL_EMERGENCY]: 'Medical Emergency',
    [OccurrenceCategory.DISPUTE]: 'Dispute',
    [OccurrenceCategory.SUSPICIOUS_ACTIVITY]: 'Suspicious Activity',
    [OccurrenceCategory.VEHICLE_ISSUE]: 'Vehicle Issue',
    [OccurrenceCategory.ENVIRONMENTAL]: 'Environmental',
};

// Severity colors
export const SEVERITY_COLORS: Record<OccurrenceSeverity, string> = {
    [OccurrenceSeverity.CRITICAL]: '#DC2626',
    [OccurrenceSeverity.HIGH]: '#EA580C',
    [OccurrenceSeverity.MEDIUM]: '#F59E0B',
    [OccurrenceSeverity.LOW]: '#10B981',
};
