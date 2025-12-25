import type { NextApiRequest, NextApiResponse } from 'next';

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
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    licensePlate: string;
    nationalId: string;
    drivingLicense: string;
    password?: string;
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

        // Simulate processing delay (realistic API behavior)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Validation: Check required fields
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        // Validation: Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        // Validation: Check duplicate email
        if (existingEmails.has(data.email.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered. Please use a different email or sign in.',
            });
        }

        // Validation: Check terms acceptance
        if (!data.agreeToTerms) {
            return res.status(400).json({
                success: false,
                error: 'You must agree to the terms and conditions',
            });
        }

        // Mock reCAPTCHA validation
        if (!data.recaptchaToken || data.recaptchaToken.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reCAPTCHA. Please try again.',
            });
        }

        // Validate referral code if provided
        if (data.referralCode) {
            if (!validReferralCodes.has(data.referralCode.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid referral code. Please check and try again.',
                });
            }
        }

        // Generate mock IDs
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;

        // Add email to "database"
        existingEmails.add(data.email.toLowerCase());

        // Log registration (in production, this would go to database)
        console.log('✅ New driver registration:', {
            userId,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            city: data.city,
            vehicleType: data.vehicleType,
            referralCode: data.referralCode || 'None',
            timestamp: new Date().toISOString(),
        });

        // Return success with payment details
        return res.status(201).json({
            success: true,
            userId,
            paymentIntentId,
            clientSecret,
            message: 'Registration successful! Please proceed to payment.',
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        });
    }
}
