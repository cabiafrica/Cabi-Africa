export interface DriverApplication {
  id: string;
  fullName: string;
  phone: string;
  applicationDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  email?: string; // Searchable field
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
    url: string; // Link to S3 object
  }[];
}

export interface MlmConfig {
  registrationFee: {
    total: number;
    systemCut: number; // percentage
    upline1Cut: number; // percentage
    upline2Cut: number; // percentage
  };
  fareCommission: {
    totalCommission: number; // percentage of total fare
    systemCut: number; // percentage of commission
    upline1Cut: number; // percentage of commission
    upline2Cut: number; // percentage of commission
  };
  sacco: {
    rate: number; // percentage of driver's commission
  };
  qualification: {
    requiredBadge: string; // ID of the badge
  };
}

export interface PromoConfig {
  isActive: boolean;
  upline1Cut: number; // percentage of total fare
  upline2Cut: number; // percentage of total fare
  // The required badge is shared with the main MLM config for this simulation
  qualification: { requiredBadge: string };
}

export interface BadgeRule {
  metric: 'averageRating' | 'completedTrips' | 'totalEarnings';
  operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ'; // GreaterThan, GreaterThanOrEqual, etc.
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  id: string; // e.g., 'users.approve', 'config.edit.mlm'
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // Array of permission IDs
}

export interface AdminUser {
  id: string;
  email: string;
  roles: string[]; // Array of role IDs
  directGrants: string[]; // Array of permission IDs
  directRevokes: string[]; // Array of permission IDs
  suspensionReason?: string;
  suspensionDate?: string;
}

export interface AuditLog {
  id: string;
  adminUserId: string;
  adminUserEmail: string;
  action: string; // e.g., 'UPDATE_MLM_CONFIG'
  details: Record<string, any>; // JSONB field
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

/**
 * Mock service for interacting with the Admin Service backend.
 */
class AdminService {
  async getPendingApplications(): Promise<DriverApplication[]> {
    console.log('Fetching pending driver applications...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'driver-123', fullName: 'John Doe', phone: '0712345678', applicationDate: '2024-05-21T10:00:00Z', status: 'PENDING' },
      { id: 'driver-456', fullName: 'Peter Jones', phone: '0787654321', applicationDate: '2024-05-20T14:00:00Z', status: 'PENDING' },
    ];
  }

  async getApplicationDetails(driverId: string): Promise<DriverApplicationDetails> {
    console.log(`Fetching details for application ${driverId}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: driverId,
      fullName: 'John Doe',
      phone: '0712345678',
      applicationDate: '2024-05-21T10:00:00Z',
      status: 'PENDING',
      vehicleDetails: { make: 'Toyota', model: 'Vitz', year: 2018, licensePlate: 'KDA 123B' },
      documents: [
        { id: 'doc-1', type: 'DRIVERS_LICENSE', url: '#' },
        { id: 'doc-2', type: 'NATIONAL_ID', url: '#' },
        { id: 'doc-3', type: 'VEHICLE_INSPECTION', url: '#' },
      ],
    };
  }

  async approveApplication(driverId: string): Promise<void> {
    console.log(`Submitting APPROVAL for driver ${driverId}...`);
    // This would call POST /admin/drivers/{id}/approve
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Approval successful.');
  }

  async requestCorrection(driverId: string, reasons: string[]): Promise<void> {
    console.log(`Submitting CORRECTION request for driver ${driverId} with reasons:`, reasons);
    // This would call POST /admin/drivers/{id}/request-correction
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Correction request successful.');
  }

  async getMlmConfig(): Promise<MlmConfig> {
    console.log('Fetching MLM config...');
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      registrationFee: {
        total: 2000,
        systemCut: 0.5,
        upline1Cut: 0.3,
        upline2Cut: 0.2,
      },
      fareCommission: {
        totalCommission: 0.2,
        systemCut: 0.5,
        upline1Cut: 0.3,
        upline2Cut: 0.2,
      },
      sacco: {
        rate: 0.05,
      },
      qualification: {
        requiredBadge: 'EARNING_BADGE',
      },
    };
  }

  async updateMlmConfig(config: MlmConfig): Promise<void> {
    console.log('Updating MLM config:', config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('MLM config updated successfully.');
  }

  async getPromoConfig(): Promise<PromoConfig> {
    console.log('Fetching Promo config...');
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      isActive: true,
      upline1Cut: 0.02,
      upline2Cut: 0.01,
      qualification: {
        requiredBadge: 'EARNING_BADGE',
      },
    };
  }

  async updatePromoConfig(config: PromoConfig): Promise<void> {
    console.log('Updating Promo config:', config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Promo config updated successfully.');
  }

  async getBadges(): Promise<Badge[]> {
    console.log('Fetching badges...');
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 'EARNING_BADGE',
        name: 'Earning Badge',
        description: 'Qualifies user for all commission earnings.',
        icon: 'star',
        rules: [
          { metric: 'averageRating', operator: 'GTE', value: 4.5 },
          { metric: 'completedTrips', operator: 'GTE', value: 10 },
        ],
      },
    ];
  }

  async createBadge(badgeData: Omit<Badge, 'id'>): Promise<Badge> {
    console.log('Creating new badge:', badgeData);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newBadge = { ...badgeData, id: `badge-${Math.random().toString(36).substr(2, 9)}` };
    return newBadge;
  }

  async updateBadge(badgeId: string, badgeData: Omit<Badge, 'id'>): Promise<Badge> {
    console.log(`Updating badge ${badgeId}:`, badgeData);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...badgeData, id: badgeId };
  }

  async deleteBadge(badgeId: string): Promise<void> {
    console.log(`Deleting badge ${badgeId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getAdminPosts(): Promise<BlogPost[]> {
    console.log('Fetching all blog posts for admin...');
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 'post-1',
        title: 'CABI Launches in Nairobi!',
        content: '<h1>Welcome to CABI!</h1><p>Details here.</p>',
        summary: 'We are excited to announce...',
        imageUrl: '#',
        authorName: 'CABI Team',
        status: 'PUBLISHED',
        publishedDate: '2024-05-20T10:00:00Z',
      },
      {
        id: 'post-2',
        title: 'Guide to MLM',
        content: '<h1>MLM Guide</h1><p>Details here.</p>',
        summary: 'Our unique MLM system is designed...',
        imageUrl: '#',
        authorName: 'CABI Team',
        status: 'DRAFT',
      },
    ];
  }

  async createPost(postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
    console.log('Creating new post:', postData);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...postData, id: `post-${Math.random()}`, publishedDate: postData.status === 'PUBLISHED' ? new Date().toISOString() : undefined };
  }

  async updatePost(postId: string, postData: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
    console.log(`Updating post ${postId}:`, postData);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...postData, id: postId, publishedDate: postData.status === 'PUBLISHED' ? new Date().toISOString() : undefined };
  }

  async deletePost(postId: string): Promise<void> {
    console.log(`Deleting post ${postId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getPermissions(): Promise<Permission[]> {
    console.log('Fetching permissions...');
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'blog.manage', description: 'Can create, edit, and delete blog posts' },
      { id: 'users.approve', description: 'Can approve new driver applications' },
      { id: 'config.edit.mlm', description: 'Can edit the main MLM configuration' },
    ];
  }

  async createPermission(permission: Permission): Promise<Permission> {
    console.log('Creating new permission:', permission);
    await new Promise(resolve => setTimeout(resolve, 500));
    return permission;
  }

  async updatePermission(permissionId: string, permission: Permission): Promise<Permission> {
    console.log(`Updating permission ${permissionId}:`, permission);
    await new Promise(resolve => setTimeout(resolve, 500));
    return permission;
  }

  async deletePermission(permissionId: string): Promise<void> {
    console.log(`Deleting permission ${permissionId}...`);
    // In a real app, the backend would check if this permission is in use by any roles.
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getRoles(): Promise<Role[]> {
    console.log('Fetching roles...');
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'super-admin', name: 'Super Admin', permissions: ['*'] },
      { id: 'support-l1', name: 'Support Level 1', permissions: ['users.view', 'tickets.respond'] },
      { id: 'content-manager', name: 'Content Manager', permissions: ['blog.manage'] },
    ];
  }

  async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
    console.log('Creating new role:', roleData);
    await new Promise(resolve => setTimeout(resolve, 600));
    const newRole = { ...roleData, id: roleData.name.toLowerCase().replace(' ', '-') };
    return newRole;
  }

  async updateRole(roleId: string, roleData: Omit<Role, 'id'>): Promise<Role> {
    console.log(`Updating role ${roleId}:`, roleData);
    await new Promise(resolve => setTimeout(resolve, 600));
    return { ...roleData, id: roleId };
  }

  async deleteRole(roleId: string): Promise<void> {
    console.log(`Deleting role ${roleId}...`);
    // In a real app, the backend would check if this role is assigned to any users.
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    console.log('Fetching admin users...');
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: 'user-1', email: 'super@cabi.com', roles: ['super-admin'], directGrants: [], directRevokes: [] },
      { id: 'user-2', email: 'content@cabi.com', roles: ['content-manager'], directGrants: [], directRevokes: [] },
    ];
  }

  async createAdminUser(userData: Omit<AdminUser, 'id'>): Promise<AdminUser> {
    console.log('Creating new admin user:', userData);
    // This would typically invite a user via email and set their initial roles.
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser = { ...userData, id: `user-${Math.random()}` };
    return newUser;
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    console.log(`Updating roles for user ${userId} to:`, roleIds);
    // This calls PUT /admin/users/{userId}/roles
    // The backend would then clear and re-populate the user's roles in the admin_user_roles table.
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  async updateUserDirectPermissions(userId: string, grants: string[], revokes: string[]): Promise<void> {
    console.log(`Updating direct permissions for user ${userId}. Grants: ${grants}, Revokes: ${revokes}`);
    // This calls PUT /admin/users/{userId}/permissions
    // The backend would then update the admin_user_permissions table.
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  async getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]> {
    console.log('Fetching audit logs with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 700));
    // Mock data with story-required events
    return [
      {
        id: 'log-1',
        adminUserId: 'user-1',
        adminUserEmail: 'super@cabi.com',
        action: 'AdminLogin',
        details: { method: 'password', ip: '192.168.1.1' },
        ipAddress: '192.168.1.1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'log-2',
        adminUserId: 'system',
        adminUserEmail: 'system@cabi.internal',
        action: 'UserRegistered',
        details: { userId: 'u-101', type: 'DRIVER' },
        ipAddress: '10.0.0.5',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'log-3',
        adminUserId: 'user-2',
        adminUserEmail: 'content@cabi.com',
        action: 'UPDATE_MLM_CONFIG',
        details: { change: 'sacco.rate from 0.05 to 0.06' },
        ipAddress: '127.0.0.1',
        timestamp: '2024-05-22T10:00:00Z',
      },
      {
        id: 'log-4',
        adminUserId: 'admin-3',
        adminUserEmail: 'support@cabi.com',
        action: 'AccountSuspended',
        details: { userId: 'd-5', reason: 'Fraud detected' },
        ipAddress: '192.168.1.20',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'log-5',
        adminUserId: 'system',
        adminUserEmail: 'system@cabi.internal',
        action: 'PaymentFailed',
        details: { rideId: 'ride-999', amount: 500, reason: 'Insufficient Funds' },
        ipAddress: '10.0.0.5',
        timestamp: new Date(Date.now() - 90000000).toISOString(),
      },
      {
        id: 'log-6',
        adminUserId: 'system',
        adminUserEmail: 'system@cabi.internal',
        action: 'PayoutProcessed',
        details: { driverId: 'd-1', amount: 1500, status: 'SUCCESS' },
        ipAddress: '10.0.0.5',
        timestamp: new Date(Date.now() - 100000000).toISOString(),
      },
    ];
  }

  async getSosIncidentDetails(incidentId: string): Promise<SOSIncidentDetails> {
    console.log(`Fetching details for SOS incident ${incidentId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: incidentId,
      driver: { id: 'driver-1', name: 'John Doe', phone: '0712345678' },
      passenger: { id: 'pass-1', name: 'Jane Smith', phone: '0787654321' },
      upline1: { id: 'upline-1', name: 'Upline One', phone: '0722000001' },
      upline2: { id: 'upline-2', name: 'Upline Two', phone: '0722000002' },
      liveLocation: { lat: -1.28, lon: 36.81 },
      logs: [
        { timestamp: '2024-05-22T12:00:00Z', notes: 'Initial alert received.' },
        { timestamp: '2024-05-22T12:01:15Z', notes: 'Admin user super@cabi.com viewed the incident.' },
      ],
    };
  }

  async logSosIncidentAction(incidentId: string, notes: string): Promise<void> {
    console.log(`Logging action for SOS incident ${incidentId}: ${notes}`);
    // This would call POST /admin/sos-incidents/{id}/logs
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async resolveSosIncident(incidentId: string, outcome: 'LEGITIMATE' | 'MISUSE'): Promise<void> {
    console.log(`Resolving SOS incident ${incidentId} with outcome: ${outcome}`);
    // This would call POST /admin/sos-incidents/{id}/resolve
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getSuspendedUsers(): Promise<AdminUser[]> {
    console.log('Fetching suspended users...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 'user-3',
        email: 'suspended@cabi.com',
        roles: [],
        directGrants: [],
        directRevokes: [],
        suspensionReason: 'BIOMETRIC_FAILURE',
        suspensionDate: '2024-05-22T14:00:00Z',
      },
    ];
  }

  async unsuspendUser(userId: string): Promise<void> {
    console.log(`Reactivating user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async getPlatformUsers(): Promise<PlatformUser[]> {
    console.log('Fetching platform users...');
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'u1', name: 'Alice Driver', email: 'alice@driver.com', type: 'DRIVER', registrationDate: '2024-01-15', status: 'ACTIVE' },
      { id: 'u2', name: 'Bob Rider', email: 'bob@rider.com', type: 'PASSENGER', registrationDate: '2024-02-20', status: 'ACTIVE' },
      { id: 'u3', name: 'Charlie Driver', email: 'charlie@driver.com', type: 'DRIVER', registrationDate: '2024-03-10', status: 'SUSPENDED' },
    ];
  }
  async adjustDriverLedger(adjustment: LedgerAdjustment): Promise<void> {
    console.log('Submitting ledger adjustment:', adjustment);
    // In real app: POST /admin/mlm/adjust-ledger
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async getCommissionLedger(
    filters: {
      page: number;
      limit: number;
      startDate?: string;
      endDate?: string;
      driverId?: string;
    }
  ): Promise<{ total: number; entries: CommissionLedgerEntry[] }> {
    console.log('Fetching commission ledger with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock data
    return {
      total: 100,
      entries: [
        { id: 'tx-1', date: '2024-05-20T10:00:00Z', driverId: 'u1', amount: 50.00, type: 'CREDIT', description: 'Commission from u2', transactionType: 'REGISTRATION_FEE_COMMISSION' },
        { id: 'tx-2', date: '2024-05-21T14:30:00Z', driverId: 'u3', amount: -10.00, type: 'DEBIT', description: 'Correction', transactionType: 'MANUAL_ADJUSTMENT' },
      ]
    };
  }

  async getMlmDashboardStats() {
    console.log('Fetching MLM dashboard stats...');
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      totalCommissions: 12500.50,
      totalReferredDrivers: 142,
      newReferredDriversLast30Days: 12,
      referralConversionRate: 15.5,
      avgReferralsPerDriver: 2.3,
      topReferrers: [
        { driverId: 'u5', name: 'John Doe', referrals: 45 },
        { driverId: 'u9', name: 'Jane Smith', referrals: 32 },
        { driverId: 'u12', name: 'Bob Brown', referrals: 28 },
        { driverId: 'u22', name: 'Alice White', referrals: 15 },
        { driverId: 'u31', name: 'Charlie Green', referrals: 10 },
      ],
      chartData: [
        { date: '2024-01', newReferrals: 12 },
        { date: '2024-02', newReferrals: 19 },
        { date: '2024-03', newReferrals: 15 },
        { date: '2024-04', newReferrals: 22 },
        { date: '2024-05', newReferrals: 18 },
        { date: '2024-06', newReferrals: 25 },
      ]
    };
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    console.log(`Suspending user ${userId} for reason: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async reactivateUser(userId: string): Promise<void> {
    console.log(`Reactivating user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // --- Organization & Subgroup Management (Mock) ---

  async getOrganizations(): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'org-1', name: 'Nairobi West Drivers', ownerId: 'u5', memberCount: 120 },
      { id: 'org-2', name: 'CBD Elite', ownerId: 'u9', memberCount: 85 },
    ];
  }

  async getSubgroupDetails(orgId: string, subgroupId: string): Promise<Subgroup | null> {
    console.log('Fetching subgroup:', orgId, subgroupId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: subgroupId,
      orgId,
      name: 'Team Alpha',
      parentId: null,
      memberCount: 25
    };
  }
  async getSubgroups(orgId: string): Promise<Subgroup[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock hierarchy
    return [
      { id: 'sg-1', orgId, name: 'Team Alpha', parentId: null, memberCount: 30 },
      { id: 'sg-2', orgId, name: 'Team Beta', parentId: null, memberCount: 25 },
      { id: 'sg-3', orgId, name: 'Alpha Squad 1', parentId: 'sg-1', memberCount: 10 },
      { id: 'sg-4', orgId, name: 'Alpha Squad 2', parentId: 'sg-1', memberCount: 8 },
    ];
  }

  async createSubgroup(orgId: string, name: string, parentId?: string): Promise<void> {
    console.log('Creating subgroup:', { orgId, name, parentId });
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async updateSubgroup(subgroupId: string, updates: Partial<Subgroup>): Promise<void> {
    console.log('Updating subgroup:', subgroupId, updates);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async deleteSubgroup(subgroupId: string): Promise<void> {
    console.log('Deleting subgroup:', subgroupId);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async getSubgroupMembers(subgroupId: string): Promise<PlatformUser[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'u101', name: 'Driver X', email: 'driver.x@cabi.com', type: 'DRIVER', registrationDate: '2024-05-01', status: 'ACTIVE' },
      { id: 'u102', name: 'Driver Y', email: 'driver.y@cabi.com', type: 'DRIVER', registrationDate: '2024-05-05', status: 'ACTIVE' },
    ];
  }

  async addMemberToSubgroup(subgroupId: string, userId: string): Promise<void> {
    console.log(`Adding user ${userId} to subgroup ${subgroupId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  async getUserPaymentHistory(userId: string): Promise<any[]> {
    console.log(`Fetching payment history for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'tx-1', date: '2024-05-01T10:00:00Z', type: 'Ride Payment', amount: -450, status: 'COMPLETED' },
      { id: 'tx-2', date: '2024-05-02T14:30:00Z', type: 'Wallet Top-up', amount: 1000, status: 'COMPLETED' },
      { id: 'tx-3', date: '2024-05-05T09:15:00Z', type: 'Ride Payment', amount: -300, status: 'COMPLETED' },
      { id: 'tx-4', date: '2024-05-10T11:20:00Z', type: 'Refund', amount: 300, status: 'PENDING' },
    ];
  }

  // --- Story 79.2: Global Search ---
  async globalSearch(query: string): Promise<any[]> {
    if (!query) return [];
    console.log('Searching for:', query);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock results
    return [
      { id: 'u-1', name: 'John Doe', email: 'john@example.com', type: 'PASSENGER', status: 'ACTIVE' },
      { id: 'd-1', name: 'Jane Driver', email: 'jane@driver.com', type: 'DRIVER', status: 'ACTIVE' },
      { id: 'd-5', name: 'Dave Suspended', email: 'dave@driver.com', type: 'DRIVER', status: 'SUSPENDED' },
    ].filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
  }

  // --- Story 79.20: Bulk Reject ---
  async bulkRejectDrivers(driverIds: string[], reason: string): Promise<void> {
    console.log(`Bulk rejecting ${driverIds.length} drivers for reason: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // --- Story 79.17: Paginated Approvals ---
  async getDriverApplicationsPaginated(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = [
      { id: '1', name: 'John Doe', status: 'PENDING', date: '2023-10-01' },
      { id: '2', name: 'Jane Smith', status: 'PENDING', date: '2023-10-02' },
      { id: '3', name: 'Bob Wilson', status: 'REVIEW_REQUIRED', date: '2023-10-03', notes: ' blurry license' },
      { id: '4', name: 'Alice Brown', status: 'PENDING', date: '2023-10-04' },
      { id: '5', name: 'Charlie Davis', status: 'PENDING', date: '2023-10-05' },
      { id: '6', name: 'Eve White', status: 'PENDING', date: '2023-10-06' },
      { id: '7', name: 'Frank Black', status: 'PENDING', date: '2023-10-07' },
      { id: '8', name: 'Grace Green', status: 'PENDING', date: '2023-10-08' },
      { id: '9', name: 'Henry Hill', status: 'PENDING', date: '2023-10-09' },
      { id: '10', name: 'Ivy Ivy', status: 'PENDING', date: '2023-10-10' },
      { id: '11', name: 'Jack Jack', status: 'PENDING', date: '2023-10-11' },
      { id: '12', name: 'Kelly Kelly', status: 'PENDING', date: '2023-10-12' },
    ];

    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: all.slice(start, end),
      total: all.length
    };
  }

  // --- Story 79.3: Impersonation ---
  async impersonateUser(userId: string): Promise<string> {
    console.log(`Impersonating user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'mock-impersonation-token-12345';
  }

  async getUserDetails(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (userId.startsWith('d')) {
      return { id: userId, name: 'Jane Driver', email: 'jane@driver.com', type: 'DRIVER', phone: '+254700000000', status: 'ACTIVE', rating: 4.8, rides: 120, joined: '2023-01-15', balance: 4500 };
    }
    return { id: userId, name: 'John Doe', email: 'john@example.com', type: 'PASSENGER', phone: '+254711111111', status: 'ACTIVE', rating: 4.5, rides: 45, joined: '2023-02-20', balance: 0 };
  }

  async removeMemberFromSubgroup(subgroupId: string, userId: string): Promise<void> {
    console.log(`Removing user ${userId} from subgroup ${subgroupId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async runSimulation(params: SimulationParams): Promise<SimulationResult> {
    console.log('Running simulation with params:', params);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock logic
    const revenueBase = 50000;
    const earningsBase = 40000;
    const ridesBase = 2500;

    const revenueChange = (params.fareIncreasePercentage * 0.8) - (params.incentiveBoostPercentage * 0.2);
    const earningsChange = (params.fareIncreasePercentage * 0.5) + (params.incentiveBoostPercentage * 0.5);
    const demandChange = -(params.fareIncreasePercentage * 1.2) + (params.surgeCapMultiplier > 2 ? 5 : -5);

    return {
      projectedRevenue: revenueBase * (1 + revenueChange / 100),
      revenueChange: Number(revenueChange.toFixed(1)),
      projectedDriverEarnings: earningsBase * (1 + earningsChange / 100),
      driverEarningsChange: Number(earningsChange.toFixed(1)),
      projectedRides: Math.round(ridesBase * (1 + demandChange / 100)),
      demandChange: Number(demandChange.toFixed(1))
    };
  }

  // --- Edit Driver Profile (Story 79.17) ---
  async updateDriverProfile(driverId: string, updates: { name?: string; phone?: string; email?: string }): Promise<void> {
    console.log(`Updating driver ${driverId} with:`, updates);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // --- Bulk Approve Documents (Story 79.18) ---
  async bulkApproveDocuments(driverIds: string[]): Promise<void> {
    console.log(`Bulk approving documents for drivers:`, driverIds);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // --- Bulk Reject Documents (Story 79.20) ---
  async bulkRejectDocuments(driverIds: string[], reason: string): Promise<void> {
    console.log(`Bulk rejecting documents for drivers:`, driverIds, `Reason: ${reason}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // --- Organization Audit Log (Story 79.18) ---
  async getOrganizationAuditLog(orgId: string): Promise<OrganizationLogEntry[]> {
    console.log('Fetching audit log for organization:', orgId);
    await new Promise(resolve => setTimeout(resolve, 600));
    // Mock log
    return [
      { id: 'log-1', action: 'CREATE_SUBGROUP', actorName: 'John Doe', target: 'Team Alpha', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'log-2', action: 'ADD_MEMBER', actorName: 'John Doe', target: 'Driver X', timestamp: new Date(Date.now() - 43200000).toISOString() },
      { id: 'log-3', action: 'SEND_ANNOUNCEMENT', actorName: 'Jane Smith', target: 'Weekly Meeting', timestamp: new Date().toISOString() },
    ];
  }

  // --- User Detail Views ---
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    console.log('Fetching documents for user:', userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'doc-1', type: 'LICENSE', url: '#', status: 'APPROVED', expiryDate: '2025-01-01' },
      { id: 'doc-2', type: 'INSURANCE', url: '#', status: 'PENDING', expiryDate: '2024-12-20' },
    ];
  }

  async getUserAuditLog(userId: string): Promise<UserAuditLogEntry[]> {
    console.log('Fetching audit log for user:', userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'ual-1', timestamp: new Date().toISOString(), adminName: 'Admin Bob', action: 'SUSPEND_ACCOUNT', reason: ' suspicious activity' },
    ];
  }

  async getUserRideHistory(userId: string): Promise<UserRide[]> {
    console.log('Fetching ride history for user:', userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'ride-1', date: '2024-05-10T10:00:00Z', pickup: 'Nairobi CBD', dropoff: 'Westlands', amount: 450, status: 'COMPLETED' },
    ];
  }



  // --- Story 79.23: Support Tickets ---
  async getSupportTickets(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 't-1', subject: 'Login Issue', user: 'John Doe', status: 'OPEN', priority: 'HIGH', date: new Date().toISOString() },
      { id: 't-2', subject: 'Fare Dispute', user: 'Jane Smith', status: 'RESOLVED', priority: 'MEDIUM', date: new Date().toISOString() },
    ];
  }

  // --- Story 79.6: Document History ---
  async getDocumentHistory(userId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'sub-3', type: 'LICENSE', status: 'APPROVED', date: '2024-05-10T10:00:00Z', notes: 'Clear image' },
      { id: 'sub-2', type: 'LICENSE', status: 'REJECTED', date: '2024-05-08T14:00:00Z', notes: 'Blurred text' },
      { id: 'sub-1', type: 'LICENSE', status: 'REJECTED', date: '2024-05-01T09:00:00Z', notes: 'Expired' },
    ];
  }

  // --- Story 79.9: Driver Downline ---
  async getDriverDownline(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Mock Tree Structure
    return {
      id: userId, name: 'Root Driver', level: 0, status: 'ACTIVE',
      children: [
        { id: 'd-101', name: 'Direct Recruit A', level: 1, status: 'ACTIVE', children: [] },
        {
          id: 'd-102', name: 'Direct Recruit B', level: 1, status: 'Active', children: [
            { id: 'd-201', name: 'Sub Recruit B1', level: 2, status: 'PROSPECT', children: [] }
          ]
        },
      ]
    };
  }

  // --- Story 79.8: MLM Rules ---
  async getMlmRules(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      { id: 'r-1', recipient: 'COMPANY', type: 'PERCENTAGE', value: 20 },
      { id: 'r-2', recipient: 'SPONSOR', type: 'PERCENTAGE', value: 10 },
      { id: 'r-3', recipient: 'UPLINE', level: 2, type: 'PERCENTAGE', value: 5 },
    ];
  }

  async updateMlmRules(rules: any[]): Promise<void> {
    console.log('Updating MLM Rules:', rules);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // --- Story 79.26 & 79.30: Zones (Surge & Airport) ---
  async getZones(type: 'SURGE' | 'AIRPORT'): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'z-1', name: 'CBD High Demand', type, geometry: 'POLYGON(...)', multiplier: 1.5 },
    ];
  }

  // --- Story 79.27: Vehicle Categories ---
  async getVehicleCategories(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'v-1', name: 'Standard', baseFare: 200, perKm: 30 },
      { id: 'v-2', name: 'XL', baseFare: 350, perKm: 45 },
    ];
  }

  // --- Story 79.28: Promo Codes ---
  async getPromoCodes(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { code: 'WELCOME20', type: 'PERCENTAGE', value: 20, uses: 150, status: 'ACTIVE' },
    ];
  }

  // --- Story 79.29: Scheduled Rides ---
  async getScheduledRides(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'sch-1', passenger: 'Alice W.', pickupTime: new Date(Date.now() + 86400000).toISOString(), pickup: 'Airport', dropoff: 'Hotel', status: 'SCHEDULED' },
    ];
  }

  // --- Story 79.32: CMS ---
  async getCMSContent(type: 'FAQ' | 'PAGE'): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return type === 'FAQ' ? [
      { id: 'faq-1', question: 'How to pay?', answer: 'M-Pesa...' }
    ] : [
      { id: 'pg-1', title: 'About Us', slug: 'about-us' }
    ];
  }

  // --- Story 79.33: Bulk Message ---
  async sendBulkMessage(segment: string, subject: string, body: string): Promise<void> {
    console.log(`Sending to ${segment}: ${subject} - ${body.substring(0, 10)}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // --- Story 79.34: Reports ---
  async getDriverPerformanceReport(driverId?: string): Promise<any> {
    console.log('Generating report for driver:', driverId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      totalRides: 145,
      avgRating: 4.8,
      acceptanceRate: 92,
      earnings: 45000
    };
  }

  // --- Story 79.10: City Management ---
  async getCityKPIs(cityId: string): Promise<any> {
    console.log('Fetching KPIs for city:', cityId);
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      activeDrivers: 150,
      totalTrips: 1240,
      avgSurge: 1.2,
      complaints: 5
    };
  }

  // --- Story 79.11: Heat Map ---
  async getHeatMapData(type: 'DEMAND' | 'SUPPLY'): Promise<any[]> {
    console.log('Fetching heat map for:', type);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mocking some points
    return Array.from({ length: 20 }).map((_, i) => ({
      lat: -1.2921 + (Math.random() * 0.05),
      lng: 36.8219 + (Math.random() * 0.05),
      intensity: (i % 2 === 0) ? 0.8 : Math.random() // Using 'i' effectively
    }));
  }

  // --- Story 79.21: Driver Unions ---
  async getDriverUnions(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'u-1', name: 'Nairobi Taxi Association', founder: 'James K.', status: 'ACTIVE', members: 450 },
      { id: 'u-2', name: 'Digital Drivers Ke', founder: 'Sarah M.', status: 'PENDING', members: 120 },
    ];
  }

  // --- Story 79.8: Live Map ---
  async getLiveDrivers(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Array.from({ length: 15 }).map((_, i) => ({
      id: `d-${i}`,
      lat: -1.2921 + (Math.random() * 0.1 - 0.05),
      lng: 36.8219 + (Math.random() * 0.1 - 0.05),
      status: Math.random() > 0.5 ? 'AVAILABLE' : 'ON_TRIP',
      heading: Math.random() * 360
    }));
  }

  // --- Story 79.4: BI Dashboard ---
  async getBIStats(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
      grossBookings: 1500000,
      trips: 4500,
      newUsers: 320,
      activeDrivers: 410,
      avgRating: 4.7
    };
  }

  // --- Story 79.5: Fraud Detection ---
  async getFraudAlerts(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: 'f-1', type: 'GPS_SPOOFING', user: 'Driver X', severity: 'HIGH', timestamp: new Date().toISOString() },
      { id: 'f-2', type: 'COLLUSIVE_TRIP', user: 'Passenger Y', severity: 'MEDIUM', timestamp: new Date().toISOString() },
    ];
  }

  // --- Expiring Documents (Story 79.22) ---
  async getExpiringDocuments(): Promise<ExpiringDocumentResult[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
      { driverId: 'u101', driverName: 'Driver X', docType: 'INSURANCE', expiryDate: '2024-12-20' },
      { driverId: 'u105', driverName: 'Driver Z', docType: 'LICENSE', expiryDate: '2024-12-25' },
    ];
  }
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
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
  status: 'ACTIVE' | 'SUSPENDED'; // Added status
}

export interface LedgerAdjustment {
  driverId: string;
  amount: number;
  type: string;
  reason: string;
  description?: string; // fix lint
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

export const adminService = new AdminService();