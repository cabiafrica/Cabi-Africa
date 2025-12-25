import type { NextApiRequest, NextApiResponse } from 'next';

interface DriverEntry {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vehicleType: string;
}

interface GroupRegistrationRequest {
    organizationName: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    organizationType: string;
    referralCode?: string;
    drivers: DriverEntry[];
    recaptchaToken: string;
}

interface GroupRegistrationResponse {
    success: boolean;
    organizationId?: string;
    driverIds?: string[];
    paymentIntentId?: string;
    clientSecret?: string;
    totalAmount?: number;
    discount?: number;
    finalAmount?: number;
    message?: string;
    error?: string;
}

const REGISTRATION_FEE_PER_DRIVER = 2000; // KES
const GROUP_DISCOUNT_THRESHOLD = 10;
const GROUP_DISCOUNT_PERCENTAGE = 15;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GroupRegistrationResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const data: GroupRegistrationRequest = req.body;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Validation: Check required fields
        if (!data.organizationName || !data.contactPerson || !data.contactEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required organization information',
            });
        }

        // Validation: Check drivers array
        if (!data.drivers || data.drivers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one driver is required',
            });
        }

        // Validation: Check each driver
        for (let i = 0; i < data.drivers.length; i++) {
            const driver = data.drivers[i];
            if (!driver.firstName || !driver.lastName || !driver.email || !driver.phone) {
                return res.status(400).json({
                    success: false,
                    error: `Driver ${i + 1}: Missing required information`,
                });
            }
        }

        // Mock reCAPTCHA validation
        if (!data.recaptchaToken || data.recaptchaToken.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reCAPTCHA. Please try again.',
            });
        }

        // Calculate pricing
        const numberOfDrivers = data.drivers.length;
        const subtotal = numberOfDrivers * REGISTRATION_FEE_PER_DRIVER;

        let discount = 0;
        if (numberOfDrivers >= GROUP_DISCOUNT_THRESHOLD) {
            discount = subtotal * (GROUP_DISCOUNT_PERCENTAGE / 100);
        }

        const finalAmount = subtotal - discount;

        // Generate mock IDs
        const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const paymentIntentId = `pi_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;

        const driverIds = data.drivers.map((_, index) =>
            `driver_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
        );

        // Log registration
        console.log('✅ New group registration:', {
            organizationId,
            organizationName: data.organizationName,
            organizationType: data.organizationType,
            contactPerson: data.contactPerson,
            contactEmail: data.contactEmail,
            numberOfDrivers,
            subtotal,
            discount,
            finalAmount,
            referralCode: data.referralCode || 'None',
            timestamp: new Date().toISOString(),
        });

        // Return success with payment details
        return res.status(201).json({
            success: true,
            organizationId,
            driverIds,
            paymentIntentId,
            clientSecret,
            totalAmount: subtotal,
            discount,
            finalAmount,
            message: `Successfully registered ${numberOfDrivers} drivers. Please proceed to payment.`,
        });

    } catch (error) {
        console.error('Group registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        });
    }
}
