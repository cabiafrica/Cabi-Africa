
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface RegistrationRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    street: string;
    city: string;
    county: string;
    vehicleType: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    licensePlate: string;
    nationalId: string;
    drivingLicense: string;
    password: string;
    recaptchaToken: string;
    referralCode?: string;
    agreeToTerms: boolean;
}

interface RegistrationResponse {
    success: boolean;
    userId?: string;
    paymentIntentId?: string;
    clientSecret?: string;
    message?: string;
    error?: string;
}

// Simulated database of existing emails
const existingEmails = new Set<string>();

// Simulated valid referral codes
const validReferralCodes = new Set(['DRIVER123', 'WELCOME2024', 'REFER100']);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RegistrationResponse>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const data: RegistrationRequest = req.body;

        // Validation: Check required fields
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        // Map frontend data to backend DTO
        const backendPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            dateOfBirth: data.dateOfBirth,
            street: data.street,
            city: data.city,
            county: data.county,
            vehicleType: data.vehicleType.toLowerCase(),
            vehicleMake: data.vehicleMake,
            vehicleModel: data.vehicleModel,
            vehicleYear: data.vehicleYear,
            licensePlate: data.licensePlate,
            nationalId: data.nationalId,
            drivingLicense: data.drivingLicense,
            recaptchaToken: data.recaptchaToken || 'mock_token',
            referralCode: data.referralCode,
            agreeToTerms: data.agreeToTerms
        };

        try {
            const backendUrl =
                process.env.DRIVER_LEAD_SERVICE_URL ||
                (process.env.NODE_ENV === 'production'
                    ? 'https://api.cabi.africa/api'
                    : 'http://localhost:3010/api');
            const response = await fetch(`${backendUrl}/driver-leads/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendPayload),
            });

            if (response.ok) {
                const result = await response.json().catch(() => ({}));
                return res.status(201).json({
                    success: true,
                    userId: result.id,
                    message: 'Registration successful! Your application is pending approval.',
                });
            }

            console.warn(`Driver Lead Service responded with HTTP ${response.status}, triggering Supabase fallback...`);
        } catch (backendError: any) {
            console.warn('Driver Lead Service connection warning, using direct Supabase fallback:', backendError?.message);
        }

        // Resilient Supabase direct registration fallback
        try {
            const hashedPassword = await bcrypt.hash(data.password || 'Cabi2026!', 10);
            const user = await prisma.user.upsert({
                where: { email: data.email },
                update: {
                    phone: data.phone,
                    fullName: `${data.firstName} ${data.lastName}`.trim(),
                    role: 'DRIVER' as any,
                    city: data.city || data.county || 'Nairobi',
                    status: 'PENDING' as any,
                },
                create: {
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword,
                    fullName: `${data.firstName} ${data.lastName}`.trim(),
                    role: 'DRIVER' as any,
                    city: data.city || data.county || 'Nairobi',
                    status: 'PENDING' as any,
                    idNumber: data.nationalId || null,
                },
            });

            await prisma.driverProfile.upsert({
                where: { userId: user.id },
                update: {
                    licenseNumber: data.drivingLicense || `DL-${Date.now()}`,
                },
                create: {
                    userId: user.id,
                    licenseNumber: data.drivingLicense || `DL-${Date.now()}`,
                },
            });

            return res.status(201).json({
                success: true,
                userId: user.id,
                message: 'Registration successful! Your application is pending approval.',
            });
        } catch (dbError: any) {
            console.error('Direct database fallback error:', dbError);
            return res.status(500).json({
                success: false,
                error: 'Registration processing failed. Please check your details and try again.',
            });
        }

    } catch (error) {
        console.error('Registration processing error:', error);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        });
    }
}
