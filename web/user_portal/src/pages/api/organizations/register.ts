import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface OrgMember {
    name: string;
    contact: string;
    position: string;
}

interface OrgRegistrationRequest {
    orgName: string;
    email: string;
    bio: string;
    regNumber: string;
    website?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    primaryColor?: string;
    members: OrgMember[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const data: OrgRegistrationRequest = req.body;

        // Basic Organization Validation
        if (!data.orgName?.trim() || !data.email?.trim() || !data.regNumber?.trim()) {
            return res.status(400).json({ success: false, error: 'Missing required organization fields: orgName, email, or regNumber' });
        }

        // Members Validation
        if (!data.members || !Array.isArray(data.members) || data.members.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one organization member (founder/admin) is required' });
        }

        // Check if all members have required fields
        const invalidMembers = data.members.filter(m => !m.name?.trim() || !m.contact?.trim() || !m.position?.trim());
        if (invalidMembers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'All members must have a name, contact, and position',
                count: invalidMembers.length
            });
        }

        // Email format simple check
        if (!data.email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Check duplicates for unique constraints
        const existingOrg = await prisma.organizations.findFirst({
            where: {
                OR: [
                    { email: data.email.toLowerCase() },
                    { registrationNumber: data.regNumber }
                ]
            }
        });

        if (existingOrg) {
            const field = existingOrg.email === data.email.toLowerCase() ? 'Email' : 'Registration Number';
            return res.status(400).json({ success: false, error: `${field} already exists in our records.` });
        }

        // Create Organization and Members within a transaction to ensure atomicity
        const organization = await prisma.organizations.create({
            data: {
                id: crypto.randomUUID(),
                name: data.orgName,
                email: data.email.toLowerCase(),
                bio: data.bio || '',
                registrationNumber: data.regNumber,
                primaryColor: data.primaryColor || '#000000',
                website: data.website || null,
                twitter: data.twitter || null,
                facebook: data.facebook || null,
                instagram: data.instagram || null,
                linkedin: data.linkedin || null,
                status: 'UNVERIFIED', 
                updatedAt: new Date(),
                organization_members: {
                    create: data.members.map((m: OrgMember) => ({
                        id: crypto.randomUUID(),
                        name: m.name,
                        contact: m.contact,
                        position: m.position
                    }))
                }
            }
        });

        console.log(`✅ [LAUNCH READY] New Organization Registered: ${organization.name} (${organization.id})`);

        return res.status(201).json({
            success: true,
            orgId: organization.id,
            message: 'Organization registered successfully. Pending verification.'
        });

    } catch (error: any) {
        console.error('CRITICAL: Org Registration Failure:', error);
        
        // Handle Prisma primary key clashes or other db specific errors
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: 'A record with these details already exists.' });
        }

        return res.status(500).json({
            success: false,
            error: 'An internal server error occurred while processing your registration. Please try again later.'
        });
    }
}
