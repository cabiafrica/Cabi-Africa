export const PERMISSIONS_LIST = [
    // SITE MANAGEMENT
    'SITE_SETUP_VIEW',
    'SITE_SETUP_EDIT',
    'FEATURES_INTEGRATIONS_VIEW',
    'FEATURES_INTEGRATIONS_EDIT',
    'ORG_STRUCTURE_VIEW',
    'ORG_STRUCTURE_EDIT',

    // USER MANAGEMENT
    'GROUPS_ROLES_VIEW',
    'GROUPS_ROLES_EDIT',
    'LOCATIONS_VIEW',
    'LOCATIONS_EDIT',
    'PEOPLE_VIEW',
    'PEOPLE_EDIT',
    'PEOPLE_CREATE',
    'PEOPLE_DELETE',
    'INVITATIONS_VIEW',
    'INVITATIONS_SEND',

    // CONTENT MANAGEMENT
    'SKILLS_VIEW',
    'SKILLS_EDIT',
    'METRICS_VIEW',
    'METRICS_EDIT',
    'PATHWAYS_VIEW',
    'PATHWAYS_EDIT',
    'LEARNING_BOARDS_VIEW',
    'LEARNING_BOARDS_EDIT',
    'LIBRARY_CONTENT_VIEW',
    'LIBRARY_CONTENT_EDIT',
    'LIBRARY_CONTENT_PUBLISH',

    // ASSESSMENT
    'ASSESSMENT_DEFINITIONS_VIEW',
    'ASSESSMENT_DEFINITIONS_EDIT',
    'THIRD_PARTY_PACKAGES_VIEW',
    'THIRD_PARTY_PACKAGES_MANAGE',

    // TRAINING
    'GROUP_TRAINING_VIEW',
    'GROUP_TRAINING_EDIT',
    'PUBLISHED_CONTENT_VIEW',
    'PUBLISHED_CONTENT_MANAGE',
    'AUTOMATION_TRIGGERS_VIEW',
    'AUTOMATION_TRIGGERS_EDIT',

    // DASHBOARD & NOTIFICATIONS
    'NOTIFICATIONS_VIEW',
    'NOTIFICATIONS_MANAGE',
    'DASHBOARD_PERSONALIZE',
    'TASK_VIEW_ACCESS',
    'LEARNING_VIEW_ACCESS',

    // OPERATIONS & REPORTING
    'REPORT_BUILDER_ACCESS',
    'PATHWAY_ACTIVITY_VIEW',
    'ASSESSMENT_RESULTS_VIEW',
    'SKILLS_COMPETENCIES_VIEW',
    'AUDIT_ACTIVITY_VIEW',
    'REPORT_PUBLISHING_ACCESS',

    // RIDE OPERATIONS (Dispatch Panel)
    'DISPATCH_DASHBOARD_VIEW',
    'DISPATCH_RIDE_ASSIGN',
    'DISPATCH_RIDE_MONITOR',
    'DISPATCH_TRIP_DETAILS_VIEW',
    'DISPATCH_RIDE_CANCEL',
    'DISPATCH_RIDE_REASSIGN',
    'DISPATCH_RIDE_FORCE_COMPLETE',
    'DISPATCH_DRIVER_MANAGE',
    'DISPATCH_REAL_TIME_MAP',
    'DISPATCH_ANALYTICS_VIEW',
    'DISPATCH_COMMUNICATE_DRIVER',
    'DISPATCH_COMMUNICATE_PASSENGER',
    'DISPATCH_SURGE_OVERRIDE',
    'DISPATCH_INCIDENT_ESCALATE',

    // TRIP MANAGEMENT
    'TRIPS_VIEW_ALL',
    'TRIPS_VIEW_DETAILS',
    'TRIPS_EXPORT_DATA',
    'TRIPS_AUDIT_LOG_VIEW',

    // DRIVER MANAGEMENT
    'DRIVER_APPLICATIONS_VIEW',
    'DRIVER_APPLICATIONS_APPROVE',
    'DRIVER_APPLICATIONS_REJECT',
    'DRIVER_DOCUMENTS_VIEW',
    'DRIVER_DOCUMENTS_VERIFY',
    'DRIVER_PROFILE_EDIT',
    'DRIVER_SUSPEND',
    'DRIVER_ACTIVATE',
    'DRIVER_PAYOUT_VIEW',
    'DRIVER_PAYOUT_PROCESS',
    'DRIVER_SACCO_VIEW',
    'DRIVER_SACCO_MANAGE',

    // PASSENGER MANAGEMENT
    'PASSENGER_PROFILES_VIEW',
    'PASSENGER_PROFILES_EDIT',
    'PASSENGER_SUSPEND',
    'PASSENGER_ACTIVATE',
    'PASSENGER_WALLET_VIEW',
    'PASSENGER_WALLET_ADJUST',

    // VEHICLE & SERVICE CATEGORY MANAGEMENT
    'VEHICLES_VIEW',
    'VEHICLES_EDIT',
    'VEHICLES_APPROVE',
    'VEHICLES_SUSPEND',
    'VEHICLE_CATEGORIES_VIEW',
    'VEHICLE_CATEGORIES_MANAGE',



    // SECURITY OPERATIONS
    'SECURITY_DASHBOARD_VIEW',
    'SECURITY_INCIDENT_REPORT',
    'SECURITY_INCIDENT_MANAGE',
    'SECURITY_EMERGENCY_RESPONSE',

    // FINANCIAL
    'PAYMENTS_VIEW',
    'PAYMENTS_PROCESS',
    'FARE_MANAGEMENT_VIEW',
    'FARE_MANAGEMENT_EDIT',
    'COMMISSION_VIEW',
    'COMMISSION_EDIT',
    'FINANCIAL_REPORTS_VIEW',

    // VERIFICATION
    'VERIFICATION_DOCUMENTS_VIEW',
    'VERIFICATION_DOCUMENTS_APPROVE',
    'VERIFICATION_BIOMETRIC_VIEW',
    'VERIFICATION_BIOMETRIC_APPROVE',

    // ORGANIZATION & REFERRAL
    'ORGANIZATION_VIEW',
    'ORGANIZATION_EDIT',
    'ORGANIZATION_APPROVE',
    'REFERRAL_FORMULA_VIEW',
    'REFERRAL_FORMULA_EDIT',
    'REFERRAL_TRACKING_VIEW',

    // MARKETING (User Portal)
    'MARKETING_CONTENT_VIEW',
    'MARKETING_CONTENT_EDIT',
    'MARKETING_ANALYTICS_VIEW',
    'USER_PORTAL_DASHBOARD_VIEW',
    'BLOG_POSTS_VIEW',
    'BLOG_POSTS_EDIT',

    // COMPLIANCE & PRIVACY
    'COMPLIANCE_VIEW',
    'COMPLIANCE_MANAGE',
    'COMPLIANCE_AUDIT',
    'COMPLIANCE_POLICY_EDIT',

    // SYSTEM ADMINISTRATION
    'SYSTEM_SETTINGS_VIEW',
    'SYSTEM_SETTINGS_EDIT',
    'USER_ROLES_ASSIGN',
    'AUDIT_LOGS_VIEW',
    'SYSTEM_HEALTH_MONITOR'
];

export const PERMISSION_CATEGORIES = {
    'Dispatch Operations': ['DISPATCH_'],
    'Ride & Fleet Operations': ['DRIVER_', 'PASSENGER_', 'VEHICLES_', 'VEHICLE_CATEGORIES_'],
    'Financial & SACCO': ['PAYMENTS_', 'FARE_', 'COMMISSION_', 'FINANCIAL_', 'SACCO_'],
    'Security & Safety': ['SECURITY_'],
    'Verification & KYC': ['VERIFICATION_'],
    'User Management': ['GROUPS_', 'LOCATIONS_', 'PEOPLE_', 'INVITATIONS_'],
    'Organization & Referral': ['ORGANIZATION_', 'REFERRAL_'],
    'Marketing & Content': ['MARKETING_', 'USER_PORTAL_', 'BLOG_', 'SKILLS_', 'METRICS_', 'PATHWAYS_', 'LEARNING_', 'LIBRARY_'],
    'Compliance & Governance': ['COMPLIANCE_'],
    'Site & Platform Settings': ['SITE_', 'FEATURES_', 'ORG_STRUCTURE', 'SYSTEM_', 'USER_ROLES_', 'AUDIT_'],
    'Assessment & Training': ['ASSESSMENT_', 'THIRD_PARTY_', 'GROUP_TRAINING_', 'PUBLISHED_CONTENT_', 'AUTOMATION_'],
    'Dashboard & Reports': ['NOTIFICATIONS_', 'DASHBOARD_', 'TASK_', 'REPORT_', 'TRIPS_']
};

export const getPermissionCategory = (perm: string): string => {
    for (const [catName, prefixes] of Object.entries(PERMISSION_CATEGORIES)) {
        if (prefixes.some(prefix => perm.startsWith(prefix))) {
            return catName;
        }
    }
    return 'Other';
};

export const getPermissionLabel = (perm: string): string => {
    const labelMap: Record<string, string> = {
        DISPATCH_DASHBOARD_VIEW: 'View Dispatch Dashboard',
        DISPATCH_RIDE_ASSIGN: 'Assign Rides to Drivers',
        DISPATCH_RIDE_MONITOR: 'Monitor Active Trips',
        DISPATCH_TRIP_DETAILS_VIEW: 'View Trip Telemetry & Details',
        DISPATCH_RIDE_CANCEL: 'Cancel Rides',
        DISPATCH_RIDE_REASSIGN: 'Reassign Trip Drivers',
        DISPATCH_RIDE_FORCE_COMPLETE: 'Force Complete Trips',
        DISPATCH_DRIVER_MANAGE: 'Manage Drivers in Dispatch',
        DISPATCH_REAL_TIME_MAP: 'Access Live Dispatch Map',
        DISPATCH_ANALYTICS_VIEW: 'View Dispatch Analytics',
        DISPATCH_COMMUNICATE_DRIVER: 'Message & Call Drivers',
        DISPATCH_COMMUNICATE_PASSENGER: 'Message & Call Passengers',
        DISPATCH_SURGE_OVERRIDE: 'Manual Surge Overrides',
        DISPATCH_INCIDENT_ESCALATE: 'Escalate Incidents & Detours',
        TRIPS_VIEW_ALL: 'View All Rides & Historical Logs',
        TRIPS_VIEW_DETAILS: 'Inspect Route Coordinates & Audio Telemetry',
        TRIPS_EXPORT_DATA: 'Export Trip Records to CSV/Excel',
        TRIPS_AUDIT_LOG_VIEW: 'View Route Audit Logs & State Transitions',
        DRIVER_APPLICATIONS_VIEW: 'View Driver Applications',
        DRIVER_APPLICATIONS_APPROVE: 'Approve Driver Applications',
        DRIVER_APPLICATIONS_REJECT: 'Reject Driver Applications',
        DRIVER_DOCUMENTS_VIEW: 'View Driver Documents (DL, PSV, Good Conduct)',
        DRIVER_DOCUMENTS_VERIFY: 'Verify Compliance Documents',
        DRIVER_PROFILE_EDIT: 'Edit Driver Profiles',
        DRIVER_SUSPEND: 'Suspend Driver Accounts',
        DRIVER_ACTIVATE: 'Reactivate Driver Accounts',
        DRIVER_PAYOUT_VIEW: 'View Driver Earnings & Payout Requests',
        DRIVER_PAYOUT_PROCESS: 'Process Driver Disbursements (M-Pesa B2C)',
        DRIVER_SACCO_VIEW: 'View SACCO Affiliations & Groups',
        DRIVER_SACCO_MANAGE: 'Manage SACCO Fleets & Marshall Rosters',
        PASSENGER_PROFILES_VIEW: 'View Passenger Profiles',
        PASSENGER_PROFILES_EDIT: 'Edit Passenger Accounts',
        PASSENGER_SUSPEND: 'Suspend Passenger Accounts',
        PASSENGER_ACTIVATE: 'Reactivate Passenger Accounts',
        PASSENGER_WALLET_VIEW: 'View Passenger Balances',
        PASSENGER_WALLET_ADJUST: 'Adjust Passenger Wallet Credit',
        VEHICLES_VIEW: 'View Fleet Vehicles',
        VEHICLES_EDIT: 'Edit Vehicle Details',
        VEHICLES_APPROVE: 'Approve Vehicles for Road Service',
        VEHICLES_SUSPEND: 'Suspend Ground Vehicles',
        VEHICLE_CATEGORIES_VIEW: 'View Service Classes (Comfort, XL, Boda, Exec)',
        VEHICLE_CATEGORIES_MANAGE: 'Manage Service Classes & Base Fares',
        PAYMENTS_VIEW: 'View Financial Transactions & M-Pesa Stk Logs',
        PAYMENTS_PROCESS: 'Process Payouts & Bulk Disbursements',
        FARE_MANAGEMENT_VIEW: 'View Pricing & Tariff Formulas',
        FARE_MANAGEMENT_EDIT: 'Edit Base Rates, Per-Km & Per-Minute Rates',
        COMMISSION_VIEW: 'View Commission Splits & Reusable Pots',
        COMMISSION_EDIT: 'Modify Commission Rates & SACCO Splits',
        FINANCIAL_REPORTS_VIEW: 'View Revenue & Financial Statements',
        SECURITY_DASHBOARD_VIEW: 'Access Security Dashboard',
        SECURITY_INCIDENT_REPORT: 'Report SOS & Safety Occurrences',
        SECURITY_INCIDENT_MANAGE: 'Manage Emergency SOS Incidents',
        SECURITY_EMERGENCY_RESPONSE: 'Dispatch Armed Response & Patrol',
        VERIFICATION_DOCUMENTS_VIEW: 'View Identity & Police Clearance',
        VERIFICATION_DOCUMENTS_APPROVE: 'Approve KYC Documents',
        VERIFICATION_BIOMETRIC_VIEW: 'View Facial & Biometric Checks',
        VERIFICATION_BIOMETRIC_APPROVE: 'Approve Biometric Identity',
        ORGANIZATION_VIEW: 'View Corporate Clients & SACCOs',
        ORGANIZATION_EDIT: 'Edit Organization Accounts',
        ORGANIZATION_APPROVE: 'Approve Business Accounts',
        REFERRAL_FORMULA_VIEW: 'View Multi-Tier Referral Rules',
        REFERRAL_FORMULA_EDIT: 'Configure Referral Yields & Bonuses',
        REFERRAL_TRACKING_VIEW: 'Track Referral Downlines & Trees',
        MARKETING_CONTENT_VIEW: 'View Promotional Assets',
        MARKETING_CONTENT_EDIT: 'Create Promo Codes & Banners',
        MARKETING_ANALYTICS_VIEW: 'View Acquisition & Retention Stats',
        USER_PORTAL_DASHBOARD_VIEW: 'Access User Web Portal Analytics',
        BLOG_POSTS_VIEW: 'View CMS Blog Articles',
        BLOG_POSTS_EDIT: 'Publish & Edit CMS Articles',
        COMPLIANCE_VIEW: 'View NTSA & Regulatory Records',
        COMPLIANCE_MANAGE: 'Manage Compliance Audits',
        COMPLIANCE_AUDIT: 'Export Official Compliance Reports',
        COMPLIANCE_POLICY_EDIT: 'Update Data Protection & Privacy Terms',
        SYSTEM_SETTINGS_VIEW: 'View Platform Configuration',
        SYSTEM_SETTINGS_EDIT: 'Modify Core System Settings',
        USER_ROLES_ASSIGN: 'Provision Roles & Granular Permissions',
        AUDIT_LOGS_VIEW: 'Inspect Administrative Audit Trail',
        SYSTEM_HEALTH_MONITOR: 'Monitor Server Health & WebSockets',
        PEOPLE_VIEW: 'View Administrative Staff',
        PEOPLE_EDIT: 'Edit Administrator Profiles',
        PEOPLE_CREATE: 'Provision New Administrator Accounts',
        PEOPLE_DELETE: 'Decommission Administrator Accounts',
        GROUPS_ROLES_VIEW: 'View Access Roles & Permissions',
        GROUPS_ROLES_EDIT: 'Create and Modify Access Roles',
        INVITATIONS_VIEW: 'View Pending Staff Invitations',
        INVITATIONS_SEND: 'Send Administrator Invitations',
    };

    if (labelMap[perm]) return labelMap[perm];

    return perm
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
};

export const getPermissionDescription = (perm: string): string => {
    const descMap: Record<string, string> = {
        DISPATCH_DASHBOARD_VIEW: 'Real-time monitoring of active and queued trips across dispatch corridors.',
        DISPATCH_RIDE_ASSIGN: 'Allows manual and automated dispatch assignment of rides to online drivers.',
        DISPATCH_RIDE_CANCEL: 'Allows administrative trip cancellations with optional fee adjustments.',
        DRIVER_DOCUMENTS_VERIFY: 'Review and validate driver national IDs, driving licenses, and PSV badges.',
        COMMISSION_EDIT: 'Permits configuring platform commissions, welfare deductions, and Cabi Legacy equity.',
        USER_ROLES_ASSIGN: 'Provision administrator roles, custom permissions, and access revocation.',
        SECURITY_INCIDENT_MANAGE: 'Triage panic button activations, audio recordings, and route detours.',
        PAYMENTS_PROCESS: 'Authorize bank and M-Pesa disbursements, driver wallet payouts, and fee reversals.',
        FINANCIAL_REPORTS_VIEW: 'Inspect and download official revenue ledgers, tax reports, and audit trails.',
        PEOPLE_CREATE: 'Create and invite new administrative personnel to the CABI Admin Suite.',
        PEOPLE_EDIT: 'Update operational roles and direct permissions for existing administrative staff.',
    };

    if (descMap[perm]) return descMap[perm];
    return `Authorizes operational access for: ${getPermissionLabel(perm)}`;
};
