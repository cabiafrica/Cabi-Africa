import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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
    members: {
        name: string;
        contact: string;
        position: string;
    }[];
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

        // Validation
        if (!data.orgName || !data.email || !data.regNumber) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Check duplicates
        const existingOrg = await prisma.organization.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { registrationNumber: data.regNumber }
                ]
            }
        });

        if (existingOrg) {
            return res.status(400).json({ success: false, error: 'Organization email or registration number already exists.' });
        }

        // Create Organization and Members
        const newOrg = await prisma.organization.create({
            data: {
                name: data.orgName,
                email: data.email,
                bio: data.bio,
                registrationNumber: data.regNumber,
                primaryColor: data.primaryColor,
                website: data.website,
                twitter: data.twitter,
                facebook: data.facebook,
                instagram: data.instagram,
                linkedin: data.linkedin,
                status: 'UNVERIFIED', // Default status
                members: {
                    create: data.members.map(m => ({
                        name: m.name,
                        contact: m.contact,
                        position: m.position
                    }))
                }
            }
        });

        console.log('✅ New Organization Created:', newOrg.id);

        return res.status(201).json({
            success: true,
            orgId: newOrg.id,
            message: 'Organization registered successfully'
        });

    } catch (error: any) {
        console.error('Org Registration Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Database error occurred'
        });
    }
}
