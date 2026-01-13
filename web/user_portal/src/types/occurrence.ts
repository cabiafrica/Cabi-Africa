// Occurrence types for user portal
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
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
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
    occurrenceDate: string;
    occurrenceTime: string;
    occurredAt: string;
    locationPlaceName?: string;
    locationAddress?: string;
    locationCity?: string;
    status: OccurrenceStatus;
    resolvedAt?: string;
    resolutionNotes?: string;
    tags: string[];
    createdAt: string;
    objections?: OccurrenceObjection[];
}

export interface OccurrenceObjection {
    id: string;
    occurrenceId: string;
    objectionText: string;
    status: ObjectionStatus;
    reviewedAt?: string;
    reviewNotes?: string;
    outcome?: string;
    createdAt: string;
}

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

export const SEVERITY_COLORS: Record<OccurrenceSeverity, string> = {
    [OccurrenceSeverity.CRITICAL]: '#DC2626',
    [OccurrenceSeverity.HIGH]: '#EA580C',
    [OccurrenceSeverity.MEDIUM]: '#F59E0B',
    [OccurrenceSeverity.LOW]: '#10B981',
};
