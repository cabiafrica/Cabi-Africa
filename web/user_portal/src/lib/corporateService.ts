import crypto from 'crypto';

export interface CorporateAccount {
    id: string;
    companyName: string;
    businessEmail: string;
    phone: string;
    regNumber: string;
    kraPin?: string;
    industry?: string;
    city: string;
    country: string;
    status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
    createdAt: string;
    updatedAt: string;
}

export interface CorporateWallet {
    id: string;
    corporateAccountId: string;
    currency: string;
    balance: number; // Prepaid balance
    overdraftLimit: number; // Safety Overdraft Buffer Limit (Option B)
    overdraftUsed: number; // Currently utilized overdraft amount
    status: 'ACTIVE' | 'RESTRICTED' | 'OVERDRAWN';
    lastTopUpAt?: string;
}

export interface CorporateRidePolicy {
    id: string;
    corporateAccountId: string;
    maxFarePerTrip: number; // In currency e.g. KES 2500
    dailyLimitPerEmployee: number; // e.g. KES 6000
    monthlyLimitPerEmployee: number; // e.g. KES 45000
    allowedHoursStart: string; // e.g. "06:00"
    allowedHoursEnd: string; // e.g. "21:30"
    allowedDays: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    allowedVehicleTypes: ('STANDARD' | 'PREMIUM' | 'XL' | 'BODA')[];
    graceWithJustification: boolean; // Option C: Allow out-of-policy with mandatory note
    safetyOverdraftBuffer: number; // Option B buffer amount in KES
    requireProjectCode: boolean;
    updatedAt: string;
}

export interface CorporateMember {
    id: string;
    corporateAccountId: string;
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    role: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE';
    department: string;
    employeeNumber?: string;
    spendThisMonth: number;
    tripsThisMonth: number;
    status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
    invitedAt: string;
    joinedAt?: string;
}

export interface CorporateInvite {
    id: string;
    token: string;
    corporateAccountId: string;
    email: string;
    phone?: string;
    role: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE';
    department: string;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
}

export interface CorporateTrip {
    id: string;
    corporateAccountId: string;
    memberId: string;
    memberName: string;
    department: string;
    pickupLocation: string;
    dropoffLocation: string;
    vehicleType: string;
    fare: number;
    date: string;
    isOutOfPolicy: boolean;
    outOfPolicyReason?: string;
    justificationNote?: string;
    reviewStatus: 'APPROVED' | 'PENDING_REVIEW' | 'FLAGGED';
    reviewedBy?: string;
    receiptNumber: string;
}

export interface CorporateTransaction {
    id: string;
    corporateAccountId: string;
    type: 'TOP_UP' | 'RIDE_CHARGE' | 'OVERDRAFT_SETTLEMENT' | 'REFUND';
    amount: number;
    paymentMethod: 'MPESA' | 'CARD' | 'BANK_TRANSFER' | 'CORPORATE_WALLET';
    reference: string;
    balanceAfter: number;
    overdraftUsedAfter: number;
    description: string;
    createdAt: string;
}

// In-memory persistent demo store for immediate responsiveness & mock resilience
class CorporateStore {
    private accounts: Map<string, CorporateAccount> = new Map();
    private wallets: Map<string, CorporateWallet> = new Map();
    private policies: Map<string, CorporateRidePolicy> = new Map();
    private members: Map<string, CorporateMember> = new Map();
    private invites: Map<string, CorporateInvite> = new Map();
    private trips: Map<string, CorporateTrip> = new Map();
    private transactions: Map<string, CorporateTransaction> = new Map();

    constructor() {
        this.seedDemoData();
    }

    private seedDemoData() {
        const demoOrgId = 'corp-nexus-tech-01';

        // 1. Demo Corporate Account
        const demoAccount: CorporateAccount = {
            id: demoOrgId,
            companyName: 'Nexus Innovations Africa Ltd',
            businessEmail: 'corporate@nexusafrica.io',
            phone: '+254711000222',
            regNumber: 'CPR/2023/981240',
            kraPin: 'P051982341Z',
            industry: 'Technology & Consulting',
            city: 'Nairobi',
            country: 'Kenya',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.accounts.set(demoOrgId, demoAccount);

        // 2. Demo Corporate Wallet with Safety Overdraft Buffer (Option B)
        const demoWallet: CorporateWallet = {
            id: 'wallet-' + demoOrgId,
            corporateAccountId: demoOrgId,
            currency: 'KES',
            balance: 84500.00,
            overdraftLimit: 25000.00, // Safety Overdraft Buffer
            overdraftUsed: 0.00,
            status: 'ACTIVE',
            lastTopUpAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
        };
        this.wallets.set(demoOrgId, demoWallet);

        // 3. Demo Policy with Grace with Justification (Option C)
        const demoPolicy: CorporateRidePolicy = {
            id: 'policy-' + demoOrgId,
            corporateAccountId: demoOrgId,
            maxFarePerTrip: 2500,
            dailyLimitPerEmployee: 6000,
            monthlyLimitPerEmployee: 45000,
            allowedHoursStart: '06:00',
            allowedHoursEnd: '21:30',
            allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            allowedVehicleTypes: ['STANDARD', 'PREMIUM', 'XL'],
            graceWithJustification: true, // Option C Active
            safetyOverdraftBuffer: 25000, // Option B Buffer
            requireProjectCode: true,
            updatedAt: new Date().toISOString()
        };
        this.policies.set(demoOrgId, demoPolicy);

        // 4. Demo Members
        const demoMembers: CorporateMember[] = [
            {
                id: 'cmem-001',
                corporateAccountId: demoOrgId,
                fullName: 'David Kiprono',
                email: 'david.kiprono@nexusafrica.io',
                phone: '+254722114455',
                role: 'ADMIN',
                department: 'Executive',
                employeeNumber: 'NEX-001',
                spendThisMonth: 12400,
                tripsThisMonth: 8,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
                joinedAt: new Date(Date.now() - 49 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'cmem-002',
                corporateAccountId: demoOrgId,
                fullName: 'Faith Muthoni',
                email: 'faith.muthoni@nexusafrica.io',
                phone: '+254733445566',
                role: 'BILLING_LEAD',
                department: 'Finance',
                employeeNumber: 'NEX-014',
                spendThisMonth: 8600,
                tripsThisMonth: 5,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
                joinedAt: new Date(Date.now() - 39 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'cmem-003',
                corporateAccountId: demoOrgId,
                fullName: 'Kevin Otieno',
                email: 'kevin.otieno@nexusafrica.io',
                phone: '+254711889900',
                role: 'EMPLOYEE',
                department: 'Engineering',
                employeeNumber: 'NEX-032',
                spendThisMonth: 18900,
                tripsThisMonth: 14,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
                joinedAt: new Date(Date.now() - 29 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'cmem-004',
                corporateAccountId: demoOrgId,
                fullName: 'Brenda Achieng',
                email: 'brenda.a@nexusafrica.io',
                phone: '+254799223311',
                role: 'EMPLOYEE',
                department: 'Sales & Field',
                employeeNumber: 'NEX-045',
                spendThisMonth: 24700,
                tripsThisMonth: 19,
                status: 'ACTIVE',
                invitedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
                joinedAt: new Date(Date.now() - 19 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'cmem-005',
                corporateAccountId: demoOrgId,
                fullName: 'Brian Kimani',
                email: 'brian.k@nexusafrica.io',
                phone: '+254700554433',
                role: 'EMPLOYEE',
                department: 'Client Support',
                employeeNumber: 'NEX-051',
                spendThisMonth: 0,
                tripsThisMonth: 0,
                status: 'INVITED',
                invitedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
            }
        ];

        demoMembers.forEach(m => this.members.set(m.id, m));

        // 5. Demo Invites
        const demoInvite: CorporateInvite = {
            id: 'inv-001',
            token: 'inv_' + crypto.randomBytes(8).toString('hex'),
            corporateAccountId: demoOrgId,
            email: 'brian.k@nexusafrica.io',
            phone: '+254700554433',
            role: 'EMPLOYEE',
            department: 'Client Support',
            invitedBy: 'David Kiprono',
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
            status: 'PENDING'
        };
        this.invites.set(demoInvite.token, demoInvite);

        // 6. Demo Trips including Grace Justification Trips (Option C)
        const demoTrips: CorporateTrip[] = [
            {
                id: 'ctrip-101',
                corporateAccountId: demoOrgId,
                memberId: 'cmem-004',
                memberName: 'Brenda Achieng',
                department: 'Sales & Field',
                pickupLocation: 'Westlands Business Hub, Nairobi',
                dropoffLocation: 'Jomo Kenyatta International Airport (JKIA)',
                vehicleType: 'PREMIUM',
                fare: 3100,
                date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
                isOutOfPolicy: true,
                outOfPolicyReason: 'Fare exceeded trip cap of KES 2,500',
                justificationNote: 'Emergency flight to Mombasa for Q3 government tender closing session. Only Premium was nearby.',
                reviewStatus: 'PENDING_REVIEW',
                receiptNumber: 'REC-NEX-8902'
            },
            {
                id: 'ctrip-102',
                corporateAccountId: demoOrgId,
                memberId: 'cmem-003',
                memberName: 'Kevin Otieno',
                department: 'Engineering',
                pickupLocation: 'Kilimani Upper Hill',
                dropoffLocation: 'The Mirage Tower, Westlands',
                vehicleType: 'STANDARD',
                fare: 850,
                date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
                isOutOfPolicy: false,
                reviewStatus: 'APPROVED',
                receiptNumber: 'REC-NEX-8891'
            },
            {
                id: 'ctrip-103',
                corporateAccountId: demoOrgId,
                memberId: 'cmem-001',
                memberName: 'David Kiprono',
                department: 'Executive',
                pickupLocation: 'Sarit Centre, Westlands',
                dropoffLocation: 'CBD Kencom House, Nairobi',
                vehicleType: 'STANDARD',
                fare: 1100,
                date: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
                isOutOfPolicy: false,
                reviewStatus: 'APPROVED',
                receiptNumber: 'REC-NEX-8875'
            },
            {
                id: 'ctrip-104',
                corporateAccountId: demoOrgId,
                memberId: 'cmem-004',
                memberName: 'Brenda Achieng',
                department: 'Sales & Field',
                pickupLocation: 'Two Rivers Mall',
                dropoffLocation: 'Radisson Blu Upper Hill',
                vehicleType: 'STANDARD',
                fare: 2800,
                date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
                isOutOfPolicy: true,
                outOfPolicyReason: 'Ride taken after allowed hours (22:45 PM)',
                justificationNote: 'Dinner meeting with regional telecom partners extended past 10 PM.',
                reviewStatus: 'APPROVED',
                reviewedBy: 'Faith Muthoni',
                receiptNumber: 'REC-NEX-8840'
            }
        ];
        demoTrips.forEach(t => this.trips.set(t.id, t));

        // 7. Demo Transactions
        const demoTxs: CorporateTransaction[] = [
            {
                id: 'tx-01',
                corporateAccountId: demoOrgId,
                type: 'TOP_UP',
                amount: 100000,
                paymentMethod: 'MPESA',
                reference: 'QGK7294821',
                balanceAfter: 100000,
                overdraftUsedAfter: 0,
                description: 'Prepaid corporate wallet top-up via Mobile Money Paybill',
                createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
            },
            {
                id: 'tx-02',
                corporateAccountId: demoOrgId,
                type: 'RIDE_CHARGE',
                amount: 3100,
                paymentMethod: 'CORPORATE_WALLET',
                reference: 'REC-NEX-8902',
                balanceAfter: 84500,
                overdraftUsedAfter: 0,
                description: 'Ride fare for Brenda Achieng (JKIA airport run)',
                createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
            }
        ];
        demoTxs.forEach(tx => this.transactions.set(tx.id, tx));
    }

    // Account methods
    public getAccount(idOrEmail: string): CorporateAccount | undefined {
        for (const acc of this.accounts.values()) {
            if (acc.id === idOrEmail || acc.businessEmail.toLowerCase() === idOrEmail.toLowerCase()) {
                return acc;
            }
        }
        return undefined;
    }

    public updateAccount(id: string, updates: Partial<CorporateAccount>): CorporateAccount | undefined {
        const account = this.accounts.get(id);
        if (!account) return undefined;
        const updated = { ...account, ...updates, updatedAt: new Date().toISOString() };
        this.accounts.set(id, updated);
        return updated;
    }

    public createAccount(data: {
        companyName: string;
        businessEmail: string;
        phone: string;
        regNumber: string;
        kraPin?: string;
        industry?: string;
        city?: string;
        country?: string;
        adminName: string;
    }): { account: CorporateAccount; wallet: CorporateWallet; policy: CorporateRidePolicy; adminMember: CorporateMember } {
        const orgId = 'corp-' + crypto.randomUUID().slice(0, 8);
        const now = new Date().toISOString();

        const account: CorporateAccount = {
            id: orgId,
            companyName: data.companyName,
            businessEmail: data.businessEmail.toLowerCase().trim(),
            phone: data.phone.trim(),
            regNumber: data.regNumber.trim(),
            kraPin: data.kraPin?.trim() || 'N/A',
            industry: data.industry || 'Corporate Enterprise',
            city: data.city || 'Nairobi',
            country: data.country || 'Kenya',
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now
        };
        this.accounts.set(orgId, account);

        // Create Wallet with Safety Overdraft Buffer (Option B)
        const wallet: CorporateWallet = {
            id: 'wallet-' + orgId,
            corporateAccountId: orgId,
            currency: 'KES',
            balance: 10000.00, // Welcome starter credit
            overdraftLimit: 25000.00, // KES 25,000 Safety Buffer
            overdraftUsed: 0.00,
            status: 'ACTIVE',
            lastTopUpAt: now
        };
        this.wallets.set(orgId, wallet);

        // Create Default Ride Policy with Grace Justification (Option C)
        const policy: CorporateRidePolicy = {
            id: 'policy-' + orgId,
            corporateAccountId: orgId,
            maxFarePerTrip: 2500,
            dailyLimitPerEmployee: 6000,
            monthlyLimitPerEmployee: 45000,
            allowedHoursStart: '06:00',
            allowedHoursEnd: '21:30',
            allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            allowedVehicleTypes: ['STANDARD', 'PREMIUM', 'XL'],
            graceWithJustification: true,
            safetyOverdraftBuffer: 25000,
            requireProjectCode: false,
            updatedAt: now
        };
        this.policies.set(orgId, policy);

        // Add creator as Admin Member
        const adminMember: CorporateMember = {
            id: 'cmem-' + crypto.randomUUID().slice(0, 8),
            corporateAccountId: orgId,
            fullName: data.adminName,
            email: data.businessEmail.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: 'ADMIN',
            department: 'Executive / HQ',
            employeeNumber: 'EMP-001',
            spendThisMonth: 0,
            tripsThisMonth: 0,
            status: 'ACTIVE',
            invitedAt: now,
            joinedAt: now
        };
        this.members.set(adminMember.id, adminMember);

        // Initial transaction record for starter credit
        const initialTx: CorporateTransaction = {
            id: 'tx-' + crypto.randomUUID().slice(0, 8),
            corporateAccountId: orgId,
            type: 'TOP_UP',
            amount: 10000,
            paymentMethod: 'CORPORATE_WALLET',
            reference: 'CORP-WELCOME-BONUS',
            balanceAfter: 10000,
            overdraftUsedAfter: 0,
            description: 'Welcome corporate travel credit',
            createdAt: now
        };
        this.transactions.set(initialTx.id, initialTx);

        return { account, wallet, policy, adminMember };
    }

    // Wallet methods
    public getWallet(corporateAccountId: string): CorporateWallet {
        let wallet = this.wallets.get(corporateAccountId);
        if (!wallet) {
            wallet = {
                id: 'wallet-' + corporateAccountId,
                corporateAccountId,
                currency: 'KES',
                balance: 0,
                overdraftLimit: 25000,
                overdraftUsed: 0,
                status: 'ACTIVE'
            };
            this.wallets.set(corporateAccountId, wallet);
        }
        return wallet;
    }

    public topUpWallet(corporateAccountId: string, amount: number, paymentMethod: 'MPESA' | 'CARD' | 'BANK_TRANSFER', reference: string): CorporateWallet {
        const wallet = this.getWallet(corporateAccountId);
        const now = new Date().toISOString();

        // If overdraft was used, settle overdraft first
        let remainingTopUp = amount;
        if (wallet.overdraftUsed > 0) {
            const overdraftPay = Math.min(wallet.overdraftUsed, remainingTopUp);
            wallet.overdraftUsed -= overdraftPay;
            remainingTopUp -= overdraftPay;
        }

        wallet.balance += remainingTopUp;
        wallet.lastTopUpAt = now;
        wallet.status = 'ACTIVE';

        const tx: CorporateTransaction = {
            id: 'tx-' + crypto.randomUUID().slice(0, 8),
            corporateAccountId,
            type: 'TOP_UP',
            amount,
            paymentMethod,
            reference,
            balanceAfter: wallet.balance,
            overdraftUsedAfter: wallet.overdraftUsed,
            description: `Corporate Wallet Top-Up via ${paymentMethod} (${reference})`,
            createdAt: now
        };
        this.transactions.set(tx.id, tx);

        return wallet;
    }

    // Policy methods
    public getPolicy(corporateAccountId: string): CorporateRidePolicy {
        let policy = this.policies.get(corporateAccountId);
        if (!policy) {
            policy = {
                id: 'policy-' + corporateAccountId,
                corporateAccountId,
                maxFarePerTrip: 2500,
                dailyLimitPerEmployee: 6000,
                monthlyLimitPerEmployee: 45000,
                allowedHoursStart: '06:00',
                allowedHoursEnd: '21:30',
                allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                allowedVehicleTypes: ['STANDARD', 'PREMIUM', 'XL'],
                graceWithJustification: true,
                safetyOverdraftBuffer: 25000,
                requireProjectCode: false,
                updatedAt: new Date().toISOString()
            };
            this.policies.set(corporateAccountId, policy);
        }
        return policy;
    }

    public updatePolicy(corporateAccountId: string, updates: Partial<CorporateRidePolicy>): CorporateRidePolicy {
        const policy = this.getPolicy(corporateAccountId);
        const updated = { ...policy, ...updates, updatedAt: new Date().toISOString() };
        this.policies.set(corporateAccountId, updated);

        // Sync safety overdraft buffer to wallet limit if changed
        if (updates.safetyOverdraftBuffer !== undefined) {
            const wallet = this.getWallet(corporateAccountId);
            wallet.overdraftLimit = updates.safetyOverdraftBuffer;
        }

        return updated;
    }

    // Member & Invite methods
    public getMembers(corporateAccountId: string): CorporateMember[] {
        return Array.from(this.members.values()).filter(m => m.corporateAccountId === corporateAccountId);
    }

    public inviteMember(data: {
        corporateAccountId: string;
        fullName: string;
        email: string;
        phone: string;
        role: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE';
        department: string;
        invitedBy: string;
    }): { member: CorporateMember; invite: CorporateInvite } {
        const now = new Date().toISOString();
        const token = ['cabi', 'corp', crypto.randomBytes(16).toString('hex')].join('-');

        const member: CorporateMember = {
            id: 'cmem-' + crypto.randomUUID().slice(0, 8),
            corporateAccountId: data.corporateAccountId,
            fullName: data.fullName,
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role,
            department: data.department || 'General',
            spendThisMonth: 0,
            tripsThisMonth: 0,
            status: 'INVITED',
            invitedAt: now
        };
        this.members.set(member.id, member);

        const invite: CorporateInvite = {
            id: 'inv-' + crypto.randomUUID().slice(0, 8),
            token,
            corporateAccountId: data.corporateAccountId,
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role,
            department: data.department || 'General',
            invitedBy: data.invitedBy,
            createdAt: now,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            status: 'PENDING'
        };
        this.invites.set(token, invite);

        return { member, invite };
    }

    public getInviteByToken(token: string): { invite: CorporateInvite; account: CorporateAccount } | undefined {
        const invite = this.invites.get(token);
        if (!invite || invite.status !== 'PENDING') return undefined;
        const account = this.accounts.get(invite.corporateAccountId);
        if (!account) return undefined;
        return { invite, account };
    }

    public acceptInvite(token: string, userId?: string): CorporateMember | undefined {
        const item = this.getInviteByToken(token);
        if (!item) return undefined;

        item.invite.status = 'ACCEPTED';

        for (const m of this.members.values()) {
            if (m.corporateAccountId === item.invite.corporateAccountId && m.email === item.invite.email) {
                m.status = 'ACTIVE';
                m.joinedAt = new Date().toISOString();
                if (userId) m.userId = userId;
                return m;
            }
        }
        return undefined;
    }

    public updateMember(memberId: string, updates: Partial<CorporateMember>): CorporateMember | undefined {
        const member = this.members.get(memberId);
        if (!member) return undefined;
        const updated = { ...member, ...updates };
        this.members.set(memberId, updated);
        return updated;
    }

    public removeMember(memberId: string): boolean {
        return this.members.delete(memberId);
    }

    public importMembersBulk(data: {
        corporateAccountId: string;
        members: Array<{
            fullName: string;
            email: string;
            phone: string;
            role?: 'ADMIN' | 'BILLING_LEAD' | 'EMPLOYEE';
            department?: string;
            employeeNumber?: string;
        }>;
        invitedBy: string;
    }): { added: CorporateMember[]; skipped: number; errors: string[] } {
        const added: CorporateMember[] = [];
        const errors: string[] = [];
        let skipped = 0;
        const now = new Date().toISOString();

        // Get existing emails for deduping
        const existingEmails = new Set(
            Array.from(this.members.values())
                .filter(m => m.corporateAccountId === data.corporateAccountId)
                .map(m => m.email.toLowerCase().trim())
        );

        for (const item of data.members) {
            const cleanEmail = item.email?.trim().toLowerCase();
            const cleanName = item.fullName?.trim();
            const cleanPhone = item.phone?.trim() || '+254';

            if (!cleanName || !cleanEmail) {
                errors.push(`Skipped row: missing name or email (${cleanName || 'No Name'})`);
                continue;
            }

            if (existingEmails.has(cleanEmail)) {
                skipped++;
                continue;
            }

            const token = ['cabi', 'corp', crypto.randomBytes(16).toString('hex')].join('-');
            const memberId = 'cmem-' + crypto.randomUUID().slice(0, 8);

            const newMember: CorporateMember = {
                id: memberId,
                corporateAccountId: data.corporateAccountId,
                fullName: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                role: item.role || 'EMPLOYEE',
                department: item.department || 'General',
                employeeNumber: item.employeeNumber,
                spendThisMonth: 0,
                tripsThisMonth: 0,
                status: 'INVITED',
                invitedAt: now
            };

            this.members.set(memberId, newMember);
            existingEmails.add(cleanEmail);

            // Register invite token
            const invite: CorporateInvite = {
                id: 'inv-' + crypto.randomUUID().slice(0, 8),
                token,
                corporateAccountId: data.corporateAccountId,
                email: cleanEmail,
                phone: cleanPhone,
                role: item.role || 'EMPLOYEE',
                department: item.department || 'General',
                invitedBy: data.invitedBy,
                createdAt: now,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
                status: 'PENDING'
            };
            this.invites.set(token, invite);

            added.push(newMember);
        }

        return { added, skipped, errors };
    }

    // Trip & Justification methods
    public getTrips(corporateAccountId: string): CorporateTrip[] {
        return Array.from(this.trips.values())
            .filter(t => t.corporateAccountId === corporateAccountId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    public updateTripReview(tripId: string, status: 'APPROVED' | 'FLAGGED', reviewedBy: string): CorporateTrip | undefined {
        const trip = this.trips.get(tripId);
        if (!trip) return undefined;
        trip.reviewStatus = status;
        trip.reviewedBy = reviewedBy;
        return trip;
    }

    // Transactions & Overview
    public getTransactions(corporateAccountId: string): CorporateTransaction[] {
        return Array.from(this.transactions.values())
            .filter(tx => tx.corporateAccountId === corporateAccountId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    public getOverviewStats(corporateAccountId: string) {
        const account = this.accounts.get(corporateAccountId);
        const wallet = this.getWallet(corporateAccountId);
        const policy = this.getPolicy(corporateAccountId);
        const members = this.getMembers(corporateAccountId);
        const trips = this.getTrips(corporateAccountId);

        const totalSpendMonth = members.reduce((sum, m) => sum + m.spendThisMonth, 0);
        const totalTripsMonth = members.reduce((sum, m) => sum + m.tripsThisMonth, 0);
        const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
        const pendingJustifications = trips.filter(t => t.isOutOfPolicy && t.reviewStatus === 'PENDING_REVIEW').length;

        return {
            account,
            wallet,
            policy,
            metrics: {
                totalSpendMonth,
                totalTripsMonth,
                activeMembersCount,
                totalMembersCount: members.length,
                pendingJustifications,
                availableBuffer: wallet.overdraftLimit - wallet.overdraftUsed,
                walletBalance: wallet.balance
            },
            recentTrips: trips.slice(0, 5),
            recentMembers: members.slice(0, 5)
        };
    }
}

// Global Singleton to maintain hot state across Next.js API calls in development
declare global {
    // eslint-disable-next-line no-var
    var corporateStore: CorporateStore | undefined;
}

export const corporateService = global.corporateStore || new CorporateStore();

if (process.env.NODE_ENV !== 'production') {
    global.corporateStore = corporateService;
}
