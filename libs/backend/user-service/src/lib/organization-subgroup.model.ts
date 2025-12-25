export interface Subgroup {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    memberIds: string[];
    createdAt: string;
}

export interface OrganizationAnnouncement {
    id: string;
    organizationId: string;
    authorId: string;
    title: string;
    content: string;
    postedAt: string;
}

export interface OrganizationAuditLog {
    id: string;
    organizationId: string;
    performedBy: string; // User ID of the leader who performed the action
    performedByName: string; // Name for display
    action: 'APPROVE_JOIN_REQUEST' | 'REJECT_JOIN_REQUEST' | 'REMOVE_MEMBER' |
    'POST_ANNOUNCEMENT' | 'CREATE_ACTIVITY' | 'EDIT_ACTIVITY' |
    'APPOINT_LEADER' | 'REMOVE_LEADER' | 'UPLOAD_CERTIFICATE' |
    'REQUEST_DISSOLUTION' | 'REQUEST_FOUNDER_TRANSFER';
    targetId?: string; // ID of the affected user/resource
    targetName?: string; // Name of the affected user/resource
    details?: string; // Additional context about the action
    timestamp: string;
}

export interface DriverOrganization {
    id: string;
    name: string;
    status: 'Pending Verification' | 'Active' | 'Rejected' | 'Expired' | 'Non-Compliant' | 'Dissolved';
    founderId: string;
    leadershipTeam: string[]; // User IDs (max 5)
    memberIds: string[];
    certificateUrl: string; // Government registration cert
    certificateExpirationDate?: string; // ISO date string
    subgroups: Subgroup[];
    announcements: OrganizationAnnouncement[];
    createdAt: string;
    updatedAt: string;
}
