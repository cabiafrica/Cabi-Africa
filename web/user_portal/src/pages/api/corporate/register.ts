import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const {
            companyName,
            businessEmail,
            phone,
            regNumber,
            kraPin,
            industry,
            city,
            country,
            adminName,
            password
        } = req.body;

        if (!companyName?.trim() || !businessEmail?.trim() || !phone?.trim() || !regNumber?.trim() || !adminName?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide companyName, businessEmail, phone, regNumber, and adminName'
            });
        }

        // Check if an account already exists with this email
        const existing = corporateService.getAccount(businessEmail.trim());
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'A corporate account with this business email already exists'
            });
        }

        const { account, wallet, policy, adminMember } = corporateService.createAccount({
            companyName: companyName.trim(),
            businessEmail: businessEmail.trim(),
            phone: phone.trim(),
            regNumber: regNumber.trim(),
            kraPin: kraPin?.trim(),
            industry: industry?.trim(),
            city: city?.trim() || 'Nairobi',
            country: country?.trim() || 'Kenya',
            adminName: adminName.trim()
        });

        // Generate session token
        const token = `cabi-corp-token-${account.id}-${Date.now()}`;

        return res.status(201).json({
            success: true,
            message: 'Corporate account created successfully',
            token,
            account,
            wallet,
            policy,
            admin: adminMember
        });
    } catch (error: any) {
        console.error('Error creating corporate account:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error creating corporate account'
        });
    }
}
