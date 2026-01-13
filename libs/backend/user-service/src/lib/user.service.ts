import { Injectable } from '@nestjs/common';
import { DriverOrganization, OrganizationAuditLog, OrganizationAnnouncement } from './organization-subgroup.model';

@Injectable()
export class UserService {
    private users = new Map<string, any>();
    private corporateAccounts = new Map<string, any>();

    constructor() {
        // Seed default admin user
        this.users.set('admin_1', {
            id: 'admin_1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@cabi.com',
            password: 'password123', // Mock password
            role: 'admin',
            phoneNumber: '+1234567890',
            profilePictureUrl: null
        });
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = Array.from(this.users.values()).find(u => u.email === email);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // Story 104.9: Web User Profile View
    async getProfile(userId: string) {
        // Return mock data if not found, for demonstration purposes
        const user = this.users.get(userId) || {
            id: userId,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            phoneNumber: '+15550123456',
            profilePictureUrl: null
        };
        return user;
    }

    async updateProfile(userId: string, data: { firstName: string, lastName: string, phoneNumber: string }) {
        const user = await this.getProfile(userId);
        const updatedUser = { ...user, ...data };
        this.users.set(userId, updatedUser);
        return updatedUser;
    }

    async updateProfilePicture(userId: string, file: any) {
        const user = await this.getProfile(userId);
        // Simulate upload and get URL
        const mockUrl = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
        const updatedUser = { ...user, profilePictureUrl: mockUrl };
        this.users.set(userId, updatedUser);
        return { url: mockUrl };
    }

    async removeProfilePicture(userId: string) {
        const user = await this.getProfile(userId);
        const updatedUser = { ...user, profilePictureUrl: null };
        this.users.set(userId, updatedUser);
        return { success: true };
    }

    // Story 104.10: Web User Change Password
    async changePassword(userId: string, data: { current: string, new: string }) {
        if (data.current !== 'password') { // Mock check
            throw new Error('Current password incorrect');
        }
        console.log(`[UserService] Password changed for ${userId}`);
        return { success: true };
    }


    // Story 104.11: Forgot Password
    private resetTokens = new Map<string, string>(); // token -> userId

    async requestPasswordReset(email: string) {
        // Mock lookup
        const user = Array.from(this.users.values()).find(u => u.email === email);
        if (user) {
            const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2)}`;
            this.resetTokens.set(token, user.id);
            // Mock email sending
            console.log(`[NotificationService] 📧 Sending password reset email to ${email} with token: ${token}`);
            return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
        }
        // Return success even if not found to prevent user enumeration
        return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const userId = this.resetTokens.get(token);
        if (!userId) {
            throw new Error('Invalid or expired reset token');
        }

        // Mock password update
        console.log(`[UserService] Password reset for user ${userId} to ${newPassword}`);
        this.resetTokens.delete(token); // Single use

        return { success: true };
    }

    // Story 34.1: Business Profile Management
    async updateBusinessProfile(userId: string, profileData: any) {
        const user = this.users.get(userId) || { id: userId };
        user.businessProfile = {
            workEmail: profileData.workEmail,
            paymentMethodId: profileData.paymentMethodId,
            isVerified: false
        };
        this.users.set(userId, user);
        return user;
    }

    async getBusinessProfile(userId: string) {
        return this.users.get(userId)?.businessProfile;
    }

    // Story 34.3: Admin Management
    async getAllBusinessProfiles() {
        // Return all users with a business profile
        return Array.from(this.users.values()).filter(u => u.businessProfile);
    }

    async linkToCorporateAccount(userId: string, companyId: string) {
        const user = this.users.get(userId);
        if (user && user.businessProfile) {
            user.businessProfile.companyId = companyId;
            this.users.set(userId, user);
        }
        return user;
    }

    // Story 34.4: Corporate Policies
    async getCorporatePolicies(companyId: string) {
        const company = this.corporateAccounts.get(companyId);
        return company?.policies || {
            maxMonthlySpend: 5000,
            allowedVehicleTypes: ['Standard', 'Premium'], // No luxury by default
            timeRestrictions: { start: '06:00', end: '22:00' }
        };
    }

    // Story 34.5: Delegate Permissions
    async getDelegates(companyId: string) {
        // Mock logic
        return [
            { id: 'del_1', name: 'Admin Assistant', permissions: ['BOOK_FOR_OTHERS'] }
        ];
    }

    // Story 27.2: Saved Custom Places
    async savePlace(userId: string, place: { label: string, address: string, lat: number, lng: number }) {
        const user = this.users.get(userId) || { id: userId, savedPlaces: [], recentDestinations: [] };
        if (!user.savedPlaces) user.savedPlaces = [];

        user.savedPlaces.push({ ...place, id: `place_${Date.now()}` });
        this.users.set(userId, user);
        return user.savedPlaces;
    }

    async getSavedPlaces(userId: string) {
        const user = this.users.get(userId);
        return user?.savedPlaces || [];
    }

    async deleteSavedPlace(userId: string, placeId: string) {
        const user = this.users.get(userId);
        if (user && user.savedPlaces) {
            user.savedPlaces = user.savedPlaces.filter((p: any) => p.id !== placeId);
            this.users.set(userId, user);
        }
        return user?.savedPlaces || [];
    }

    // Story 27.3: Recent Destinations
    async addRecentDestination(userId: string, destination: { address: string, lat: number, lng: number }) {
        const user = this.users.get(userId) || { id: userId, savedPlaces: [], recentDestinations: [] };
        if (!user.recentDestinations) user.recentDestinations = [];

        // Remove duplicates and keep top 5 most recent
        user.recentDestinations = [
            destination,
            ...user.recentDestinations.filter((d: any) => d.address !== destination.address)
        ].slice(0, 5);

        this.users.set(userId, user);
        return user.recentDestinations;
    }

    async getRecentDestinations(userId: string) {
        const user = this.users.get(userId);
        return user?.recentDestinations || [];
    }

    // Story 15.1: Track Driving Hours
    async getDrivingHours(userId: string) {
        // Mock logic - would query ride history or shift logs
        return {
            today: 4.5, // 4.5 hours online today
            week: 22.0, // 22 hours this week
            remainingWeekly: 38.0 // 60-22
        };
    }

    // Story 14.1: Document Submission
    async uploadDocument(userId: string, type: string, fileUrl: string) {
        // Mock logic
        console.log(`[UserService] 📄 Document uploaded for ${userId}: ${type}`);
        return { status: 'PENDING_REVIEW', uploadedAt: new Date(), type };
    }

    async getDocuments(userId: string) {
        return [
            { type: 'LICENSE', status: 'APPROVED', expiry: '2026-01-01', rejectReason: null },
            { type: 'INSURANCE', status: 'PENDING_REVIEW', expiry: null, rejectReason: null },
            { type: 'REGISTRATION', status: 'REJECTED', expiry: null, rejectReason: 'Image too blurry' }
        ];
    }

    // Story 6.5: Secure Handoff
    private handoffTokens = new Map<string, string>(); // token -> userId

    async generateHandoffToken(userId: string) {
        const token = `handoff_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        this.handoffTokens.set(token, userId);

        // Expire after 5 mins
        setTimeout(() => this.handoffTokens.delete(token), 300000);

        return token;
    }

    async exchangeHandoffToken(token: string) {
        const userId = this.handoffTokens.get(token);
        if (!userId) throw new Error('Invalid or expired token');

        this.handoffTokens.delete(token); // Single use
        return { success: true, userId, authToken: `jwt_mock_for_${userId}` };
    }

    // Story 56.1 & 56.2: User Preferences
    async updatePreferences(userId: string, prefs: any) { // e.g. { darkMode: true, navApp: 'WAZE' }
        const user = this.users.get(userId) || { id: userId };
        user.preferences = { ...user.preferences, ...prefs };
        this.users.set(userId, user);
        return user.preferences;
    }

    // Story 48.3: Mentorship
    async requestMentor(userId: string) {
        console.log(`[UserService] 🧑‍🏫 User ${userId} requested a mentor.`);
        return { status: 'MATCHING' };
    }

    async assignMentor(menteeId: string, mentorId: string) {
        console.log(`[UserService] 🤝 Assigned mentor ${mentorId} to ${menteeId}`);
        // In real app: create chat channel via SupportService, notify users
        return { success: true, channelId: `chat_${menteeId}_${mentorId}` };
    }

    // Story 101.3: Create User Prospect
    async createProspect(data: { firstName: string, lastName: string, email: string, phone: string, city: string, referralCode?: string, referrerId?: string }) {
        const userId = `u_prospect_${Date.now()}`;
        console.log(`[UserService] Creating PROSPECT user: ${data.email} (${userId})`);

        const user = {
            id: userId,
            ...data,
            role: 'DRIVER',
            status: 'PROSPECT',
            onboardingStep: 'REGISTRATION_FEE_PENDING',
            createdAt: new Date(),
            businessProfile: null,
            savedPlaces: [],
            recentDestinations: []
        };

        this.users.set(userId, user);
        return { userId, status: 'PROSPECT' };
    }
    // Story 103.2: Get Downline
    async getDownline(referrerId: string) {
        // In a real DB, this would be a recursive CTE or recursive graph lookup.
        // For our Map-based mock, we'll scan values (inefficient but fine for mock).
        const result: any[] = [];
        const directReferrals = Array.from(this.users.values()).filter(u => u.referrerId === referrerId);

        for (const user of directReferrals) {
            // Level 1
            const node: any = {
                id: user.id,
                name: `${user.firstName} ${user.lastName.charAt(0)}.`, // Partial anonymization
                status: user.status,
                level: 1,
                joinedAt: user.createdAt,
                children: []
            };

            // Recursive step (Level 2 only for now to keep it simple, or make it recursive fn)
            const level2Users = Array.from(this.users.values()).filter(u => u.referrerId === user.id);
            for (const l2User of level2Users) {
                node.children.push({
                    id: l2User.id,
                    name: `${l2User.firstName} ${l2User.lastName.charAt(0)}.`,
                    status: l2User.status,
                    level: 2,
                    joinedAt: l2User.createdAt,
                    children: []
                });
            }

            result.push(node);
        }

        // Return empty mock if no data found (to allow frontend testing)
        if (result.length === 0) {
            return [
                {
                    id: 'd_mock_1', name: 'John D.', status: 'ACTIVE', level: 1, joinedAt: new Date(), children: [
                        { id: 'd_mock_2', name: 'Sarah M.', status: 'PROSPECT', level: 2, joinedAt: new Date(), children: [] }
                    ]
                },
                { id: 'd_mock_3', name: 'Mike R.', status: 'ACTIVE', level: 1, joinedAt: new Date(), children: [] }
            ];
        }

        return result;
    }

    // Story 18.2: Trusted Contacts
    async getTrustedContacts(userId: string) {
        const user = this.users.get(userId);
        return user?.trustedContacts || [];
    }

    async addTrustedContact(userId: string, contact: { name: string, phone: string }) {
        const user = this.users.get(userId) || { id: userId, trustedContacts: [] };
        if (!user.trustedContacts) user.trustedContacts = [];

        const newContact = { ...contact, id: `tc_${Date.now()}` };
        user.trustedContacts.push(newContact);
        this.users.set(userId, user);
        return newContact;
    }

    async removeTrustedContact(userId: string, contactId: string) {
        const user = this.users.get(userId);
        if (user && user.trustedContacts) {
            user.trustedContacts = user.trustedContacts.filter((c: any) => c.id !== contactId);
            this.users.set(userId, user);
        }
        return { success: true };
    }

    // Story 120.1: Driver Organizations
    private organizations = new Map<string, DriverOrganization>();

    async createOrganization(founderId: string, name: string, certificateUrl: string): Promise<DriverOrganization> {
        const orgId = `org_${Date.now()}`;
        const org: DriverOrganization = {
            id: orgId,
            name,
            status: 'Pending Verification',
            founderId,
            leadershipTeam: [founderId],
            memberIds: [founderId],
            certificateUrl,
            subgroups: [],
            announcements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.organizations.set(orgId, org);

        // Update founder's user profile
        const user = await this.getProfile(founderId);
        this.users.set(founderId, { ...user, organizationId: orgId, organizationRole: 'FOUNDER' });

        return org;
    }

    async getOrganization(orgId: string) {
        return this.organizations.get(orgId);
    }

    async getAllOrganizations() {
        return Array.from(this.organizations.values());
    }

    async approveOrganization(orgId: string) {
        const org = this.organizations.get(orgId);
        if (org) {
            org.status = 'Active';
            this.organizations.set(orgId, org);
        }
        return org;
    }

    // Story 120.3: Driver Activity RSVP
    // Map of activityId -> Set of userIds
    private activityRSVPs = new Map<string, Set<string>>();

    async rsvpToActivity(userId: string, activityId: string) {
        if (!this.activityRSVPs.has(activityId)) {
            this.activityRSVPs.set(activityId, new Set());
        }
        this.activityRSVPs.get(activityId)?.add(userId);
        return { success: true, status: 'JOINED' };
    }

    async getActivityRSVPs(activityId: string) {
        const userIds = Array.from(this.activityRSVPs.get(activityId) || []);
        // Enrich with basic user info
        const participants = userIds.map(id => {
            const user = this.users.get(id);
            return {
                id,
                name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                email: user?.email
            };
        });
        return participants;
    }

    // Story 120.4: Driver Join Organization
    // Map of orgId -> Set of userIds (pending requests)
    private pendingJoinRequests = new Map<string, Set<string>>();

    async requestToJoinOrganization(userId: string, orgId: string) {
        // Check if user is already in an org
        const user = this.users.get(userId);
        if (user?.organizationId) {
            throw new Error('User is already in an organization');
        }

        if (!this.pendingJoinRequests.has(orgId)) {
            this.pendingJoinRequests.set(orgId, new Set());
        }
        this.pendingJoinRequests.get(orgId)?.add(userId);

        // Mock notification
        console.log(`User ${userId} requested to join Org ${orgId}`);

        return { success: true, status: 'PENDING' };
    }

    async getJoinRequests(orgId: string) {
        const userIds = Array.from(this.pendingJoinRequests.get(orgId) || []);
        const requesters = userIds.map(id => {
            const user = this.users.get(id);
            return {
                id,
                name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                email: user?.email,
                requestedAt: new Date().toISOString() // Mock date
            };
        });
        return requesters;
    }

    async respondToJoinRequest(orgId: string, userId: string, action: 'APPROVE' | 'REJECT') {
        const requests = this.pendingJoinRequests.get(orgId);
        if (!requests || !requests.has(userId)) {
            throw new Error('Request not found');
        }

        requests.delete(userId);

        if (action === 'APPROVE') {
            const user = this.users.get(userId);
            if (user) {
                user.organizationId = orgId;
                user.organizationRole = 'MEMBER';
                this.users.set(userId, user);

                // Update Org member list
                const org = this.organizations.get(orgId);
                if (org) {
                    org.memberIds.push(userId);
                    this.organizations.set(orgId, org);
                }
            }
        }

        return { success: true };
    }

    // Story 120.9: Certificate Expiration Handling
    async checkExpiringCertificates(thresholdDays: number = 30) {
        const now = new Date();
        const thresholdDate = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);

        const expiringOrgs: Array<{ org: DriverOrganization; daysUntilExpiry: number }> = [];

        for (const org of this.organizations.values()) {
            if (org.certificateExpirationDate && org.status === 'Active') {
                const expiryDate = new Date(org.certificateExpirationDate);
                const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

                if (daysUntilExpiry <= thresholdDays && daysUntilExpiry >= 0) {
                    expiringOrgs.push({ org, daysUntilExpiry });
                }
            }
        }

        return expiringOrgs;
    }

    async updateExpiredOrganizations() {
        const now = new Date();
        const updatedOrgs: string[] = [];

        for (const [orgId, org] of this.organizations.entries()) {
            if (org.certificateExpirationDate && org.status === 'Active') {
                const expiryDate = new Date(org.certificateExpirationDate);

                if (expiryDate < now) {
                    org.status = 'Expired';
                    org.updatedAt = new Date().toISOString();
                    this.organizations.set(orgId, org);
                    updatedOrgs.push(orgId);

                    console.log(`[UserService] Organization ${orgId} (${org.name}) certificate expired. Status updated to 'Expired'.`);
                }
            }
        }

        return { updatedCount: updatedOrgs.length, organizationIds: updatedOrgs };
    }

    async uploadNewCertificate(orgId: string, certificateUrl: string, expirationDate: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        // Update certificate and set status to pending verification
        org.certificateUrl = certificateUrl;
        org.certificateExpirationDate = expirationDate;
        org.status = 'Pending Verification';
        org.updatedAt = new Date().toISOString();

        this.organizations.set(orgId, org);

        console.log(`[UserService] New certificate uploaded for org ${orgId}. Status set to 'Pending Verification'.`);

        return org;
    }

    async getOrganizationsByExpirationStatus(status: 'expiring' | 'expired', thresholdDays: number = 30) {
        const now = new Date();
        const results: DriverOrganization[] = [];

        for (const org of this.organizations.values()) {
            if (status === 'expired' && org.status === 'Expired') {
                results.push(org);
            } else if (status === 'expiring' && org.certificateExpirationDate && org.status === 'Active') {
                const expiryDate = new Date(org.certificateExpirationDate);
                const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

                if (daysUntilExpiry <= thresholdDays && daysUntilExpiry >= 0) {
                    results.push(org);
                }
            }
        }

        return results;
    }

    // Story 120.10: Organization Dissolution
    private dissolutionRequests = new Map<string, { requestedAt: string; requestedBy: string; reason?: string }>();

    async requestOrganizationDissolution(orgId: string, founderId: string, reason?: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        if (org.founderId !== founderId) {
            throw new Error('Only the founder can request dissolution');
        }

        if (org.status === 'Dissolved') {
            throw new Error('Organization is already dissolved');
        }

        // Create dissolution request
        this.dissolutionRequests.set(orgId, {
            requestedAt: new Date().toISOString(),
            requestedBy: founderId,
            reason
        });

        // Update organization status to indicate pending dissolution
        org.status = 'Pending Verification'; // Reusing this status for pending dissolution
        org.updatedAt = new Date().toISOString();
        this.organizations.set(orgId, org);

        console.log(`[UserService] Dissolution requested for organization ${orgId} by founder ${founderId}`);

        return { success: true, status: 'PENDING_ADMIN_APPROVAL' };
    }

    async getDissolutionRequests() {
        const requests: Array<{
            organizationId: string;
            organizationName: string;
            founderId: string;
            founderName: string;
            requestedAt: string;
            reason?: string;
            memberCount: number;
        }> = [];

        for (const [orgId, request] of this.dissolutionRequests.entries()) {
            const org = this.organizations.get(orgId);
            if (org) {
                const founder = this.users.get(org.founderId);
                requests.push({
                    organizationId: orgId,
                    organizationName: org.name,
                    founderId: org.founderId,
                    founderName: founder ? `${founder.firstName} ${founder.lastName}` : 'Unknown',
                    requestedAt: request.requestedAt,
                    reason: request.reason,
                    memberCount: org.memberIds.length
                });
            }
        }

        return requests;
    }

    async approveOrganizationDissolution(orgId: string, adminId: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const request = this.dissolutionRequests.get(orgId);
        if (!request) {
            throw new Error('No dissolution request found for this organization');
        }

        // Update organization status to Dissolved
        org.status = 'Dissolved';
        org.updatedAt = new Date().toISOString();
        this.organizations.set(orgId, org);

        // Remove organizationId from all members
        const memberIds = [...org.memberIds];
        for (const memberId of memberIds) {
            const user = this.users.get(memberId);
            if (user && user.organizationId === orgId) {
                user.organizationId = null;
                user.organizationRole = null;
                this.users.set(memberId, user);

                console.log(`[UserService] Removed organization association for user ${memberId}`);
            }
        }

        // Remove the dissolution request
        this.dissolutionRequests.delete(orgId);

        console.log(`[UserService] Organization ${orgId} (${org.name}) dissolved by admin ${adminId}. ${memberIds.length} members transitioned to independent status.`);

        return {
            success: true,
            organizationId: orgId,
            organizationName: org.name,
            membersAffected: memberIds.length,
            dissolvedAt: org.updatedAt
        };
    }

    async rejectOrganizationDissolution(orgId: string, adminId: string, rejectionReason?: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const request = this.dissolutionRequests.get(orgId);
        if (!request) {
            throw new Error('No dissolution request found for this organization');
        }

        // Restore organization to Active status
        org.status = 'Active';
        org.updatedAt = new Date().toISOString();
        this.organizations.set(orgId, org);

        // Remove the dissolution request
        this.dissolutionRequests.delete(orgId);

        console.log(`[UserService] Dissolution request for organization ${orgId} rejected by admin ${adminId}. Reason: ${rejectionReason || 'Not provided'}`);

        return { success: true, status: 'REJECTED', reason: rejectionReason };
    }

    // Story 120.5: Founder Succession Flow
    private founderTransferRequests = new Map<string, {
        requestedAt: string;
        requestedBy: string;
        nominatedFounderId: string;
        supportingDocumentUrl?: string;
        reason?: string;
    }>();

    async requestFounderTransfer(orgId: string, requesterId: string, nominatedFounderId: string, supportingDocumentUrl?: string, reason?: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        // Verify requester is a leadership team member
        if (!org.leadershipTeam.includes(requesterId)) {
            throw new Error('Only leadership team members can request founder transfer');
        }

        // Verify nominee is a leadership team member
        if (!org.leadershipTeam.includes(nominatedFounderId)) {
            throw new Error('Nominated founder must be a leadership team member');
        }

        // Verify nominee is not already the founder
        if (org.founderId === nominatedFounderId) {
            throw new Error('Nominated user is already the founder');
        }

        // Create transfer request
        this.founderTransferRequests.set(orgId, {
            requestedAt: new Date().toISOString(),
            requestedBy: requesterId,
            nominatedFounderId,
            supportingDocumentUrl,
            reason
        });

        console.log(`[UserService] Founder transfer requested for organization ${orgId}. Nominee: ${nominatedFounderId}`);

        return { success: true, status: 'PENDING_ADMIN_APPROVAL' };
    }

    async getFounderTransferRequests() {
        const requests: Array<{
            organizationId: string;
            organizationName: string;
            currentFounderId: string;
            currentFounderName: string;
            nominatedFounderId: string;
            nominatedFounderName: string;
            requestedBy: string;
            requesterName: string;
            requestedAt: string;
            supportingDocumentUrl?: string;
            reason?: string;
        }> = [];

        for (const [orgId, request] of this.founderTransferRequests.entries()) {
            const org = this.organizations.get(orgId);
            if (org) {
                const currentFounder = this.users.get(org.founderId);
                const nominatedFounder = this.users.get(request.nominatedFounderId);
                const requester = this.users.get(request.requestedBy);

                requests.push({
                    organizationId: orgId,
                    organizationName: org.name,
                    currentFounderId: org.founderId,
                    currentFounderName: currentFounder ? `${currentFounder.firstName} ${currentFounder.lastName}` : 'Unknown',
                    nominatedFounderId: request.nominatedFounderId,
                    nominatedFounderName: nominatedFounder ? `${nominatedFounder.firstName} ${nominatedFounder.lastName}` : 'Unknown',
                    requestedBy: request.requestedBy,
                    requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown',
                    requestedAt: request.requestedAt,
                    supportingDocumentUrl: request.supportingDocumentUrl,
                    reason: request.reason
                });
            }
        }

        return requests;
    }

    async approveFounderTransfer(orgId: string, adminId: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const request = this.founderTransferRequests.get(orgId);
        if (!request) {
            throw new Error('No founder transfer request found for this organization');
        }

        const oldFounderId = org.founderId;
        const newFounderId = request.nominatedFounderId;

        // Update organization founder
        org.founderId = newFounderId;
        org.updatedAt = new Date().toISOString();
        this.organizations.set(orgId, org);

        // Update old founder's role
        const oldFounder = this.users.get(oldFounderId);
        if (oldFounder) {
            oldFounder.organizationRole = 'LEADER'; // Demote to regular leader
            this.users.set(oldFounderId, oldFounder);
        }

        // Update new founder's role
        const newFounder = this.users.get(newFounderId);
        if (newFounder) {
            newFounder.organizationRole = 'FOUNDER';
            this.users.set(newFounderId, newFounder);
        }

        // Remove the transfer request
        this.founderTransferRequests.delete(orgId);

        console.log(`[UserService] Founder transfer approved for organization ${orgId} by admin ${adminId}. New founder: ${newFounderId}, Previous founder: ${oldFounderId}`);

        return {
            success: true,
            organizationId: orgId,
            organizationName: org.name,
            oldFounderId,
            newFounderId,
            transferredAt: org.updatedAt
        };
    }

    async rejectFounderTransfer(orgId: string, adminId: string, rejectionReason?: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const request = this.founderTransferRequests.get(orgId);
        if (!request) {
            throw new Error('No founder transfer request found for this organization');
        }

        // Remove the transfer request
        this.founderTransferRequests.delete(orgId);

        console.log(`[UserService] Founder transfer request for organization ${orgId} rejected by admin ${adminId}. Reason: ${rejectionReason || 'Not provided'}`);

        return { success: true, status: 'REJECTED', reason: rejectionReason };
    }

    // Story 120.8: Organization Audit Log
    private organizationAuditLogs = new Map<string, OrganizationAuditLog[]>();

    private logOrganizationAction(
        organizationId: string,
        performedBy: string,
        action: OrganizationAuditLog['action'],
        targetId?: string,
        targetName?: string,
        details?: string
    ) {
        const performer = this.users.get(performedBy);
        const performerName = performer ? `${performer.firstName} ${performer.lastName}` : 'Unknown';

        const logEntry: OrganizationAuditLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            organizationId,
            performedBy,
            performedByName: performerName,
            action,
            targetId,
            targetName,
            details,
            timestamp: new Date().toISOString()
        };

        const logs = this.organizationAuditLogs.get(organizationId) || [];
        logs.unshift(logEntry); // Add to beginning for reverse chronological order
        this.organizationAuditLogs.set(organizationId, logs);

        console.log(`[AuditLog] ${organizationId}: ${performerName} performed ${action}${targetName ? ` on ${targetName}` : ''}`);
    }

    async getOrganizationAuditLog(organizationId: string, limit: number = 100) {
        const logs = this.organizationAuditLogs.get(organizationId) || [];
        return logs.slice(0, limit); // Return most recent entries
    }

    // Example: Log when approving join request
    async approveJoinRequestWithAudit(orgId: string, requestId: string, approverId: string) {
        // Existing approval logic would go here
        const targetUser = this.users.get(requestId);
        const targetName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : 'Unknown';

        this.logOrganizationAction(
            orgId,
            approverId,
            'APPROVE_JOIN_REQUEST',
            requestId,
            targetName,
            'Join request approved'
        );

        return { success: true };
    }

    // Example: Log when removing a member
    async removeMemberWithAudit(orgId: string, memberId: string, removedBy: string, reason?: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const member = this.users.get(memberId);
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Unknown';

        // Remove member from organization
        org.memberIds = org.memberIds.filter(id => id !== memberId);
        org.leadershipTeam = org.leadershipTeam.filter(id => id !== memberId);
        this.organizations.set(orgId, org);

        // Update user's organization
        if (member) {
            member.organizationId = null;
            member.organizationRole = null;
            this.users.set(memberId, member);
        }

        // Log the action
        this.logOrganizationAction(
            orgId,
            removedBy,
            'REMOVE_MEMBER',
            memberId,
            memberName,
            reason || 'Member removed from organization'
        );

        return { success: true, removedMember: memberName };
    }

    // Example: Log when posting announcement
    async postAnnouncementWithAudit(orgId: string, authorId: string, title: string, content: string) {
        const org = this.organizations.get(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }

        const announcement: OrganizationAnnouncement = {
            id: `ann_${Date.now()}`,
            organizationId: orgId,
            authorId,
            title,
            content,
            postedAt: new Date().toISOString()
        };

        org.announcements.push(announcement);
        this.organizations.set(orgId, org);

        // Log the action
        this.logOrganizationAction(
            orgId,
            authorId,
            'POST_ANNOUNCEMENT',
            announcement.id,
            title,
            `Posted announcement: "${title}"`
        );

        return { success: true, announcement };
    }

    // Story 120.7: Driver Voluntary Leave
    async leaveOrganization(userId: string) {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.organizationId) {
            throw new Error('User is not a member of any organization');
        }

        const orgId = user.organizationId;
        const org = this.organizations.get(orgId);

        if (org) {
            // Remove user from organization
            org.memberIds = org.memberIds.filter(id => id !== userId);
            org.leadershipTeam = org.leadershipTeam.filter(id => id !== userId);
            org.updatedAt = new Date().toISOString();
            this.organizations.set(orgId, org);

            // Log the action
            this.logOrganizationAction(
                orgId,
                userId,
                'REMOVE_MEMBER',
                userId,
                `${user.firstName} ${user.lastName}`,
                'Member voluntarily left the organization'
            );
        }

        // Update user to independent driver
        user.organizationId = null;
        user.organizationRole = null;
        this.users.set(userId, user);

        console.log(`[UserService] User ${userId} (${user.firstName} ${user.lastName}) left organization ${orgId}`);

        return {
            success: true,
            message: 'Successfully left organization',
            userId,
            previousOrganizationId: orgId
        };
    }
}
