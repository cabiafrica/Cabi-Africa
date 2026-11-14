import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { orgId } = req.query;
    const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

    if (req.method === 'GET') {
        try {
            const members = corporateService.getMembers(targetOrgId);
            return res.status(200).json({ success: true, data: members });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to fetch team members' });
        }
    }

    if (req.method === 'POST') {
        try {
            // Check if this is a bulk import request
            if (req.body.bulk === true && Array.isArray(req.body.members)) {
                const { members, invitedBy } = req.body;
                if (!members || members.length === 0) {
                    return res.status(400).json({ success: false, message: 'No employee records provided for import' });
                }

                const result = corporateService.importMembersBulk({
                    corporateAccountId: targetOrgId,
                    members,
                    invitedBy: invitedBy || 'Company Admin'
                });

                return res.status(201).json({
                    success: true,
                    message: `Successfully imported ${result.added.length} team members (${result.skipped} duplicates skipped)`,
                    data: {
                        addedCount: result.added.length,
                        skippedCount: result.skipped,
                        errors: result.errors,
                        members: result.added
                    }
                });
            }

            const { fullName, email, phone, role, department, invitedBy } = req.body;

            if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name, work email, and phone number are required'
                });
            }

            const { member, invite } = corporateService.inviteMember({
                corporateAccountId: targetOrgId,
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role: role || 'EMPLOYEE',
                department: department || 'General',
                invitedBy: invitedBy || 'Company Admin'
            });

            const origin = req.headers.host ? `http://${req.headers.host}` : '';
            const inviteUrl = `${origin}/corporate/join?token=${invite.token}`;

            return res.status(201).json({
                success: true,
                message: `Invitation generated for ${fullName}`,
                data: {
                    member,
                    invite,
                    inviteUrl
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to invite team member' });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { memberId, updates } = req.body;
            if (!memberId) {
                return res.status(400).json({ success: false, message: 'memberId is required' });
            }

            const updated = corporateService.updateMember(memberId, updates);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Member not found' });
            }

            return res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to update member' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { memberId } = req.body;
            if (!memberId) {
                return res.status(400).json({ success: false, message: 'memberId is required' });
            }

            const success = corporateService.removeMember(memberId);
            return res.status(200).json({ success, message: 'Member removed from corporate profile' });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to remove member' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
