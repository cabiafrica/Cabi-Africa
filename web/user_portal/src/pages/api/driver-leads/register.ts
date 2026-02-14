
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
            const backendUrl = process.env.DRIVER_LEAD_SERVICE_URL || 'http://localhost:3010/api/v1';
            const response = await fetch(`${backendUrl}/driver-leads/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendPayload),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle backend errors
                let errorMessage = 'Registration failed';
                if (result.message) {
                    errorMessage = Array.isArray(result.message) ? result.message.join(', ') : result.message;
                }

                return res.status(response.status).json({
                    success: false,
                    error: errorMessage
                });
            }

            // Return success
            return res.status(201).json({
                success: true,
                userId: result.id,
                message: 'Registration successful! Your application is pending approval.',
            });

        } catch (backendError) {
            console.error('Backend connection error:', backendError);
            return res.status(502).json({
                success: false,
                error: 'Service unavailable. Please try again later.'
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
