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

const REGISTRATION_FEE_PER_DRIVER = 0; // KES - Free Onboarding
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

        // Validate reCAPTCHA token
        if (!data.recaptchaToken || data.recaptchaToken.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reCAPTCHA. Please try again.',
            });
        }

        // Call backend API to create driver group and process payment
        const BACKEND_URL =
            process.env.NEXT_PUBLIC_DRIVER_LEAD_SERVICE_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://api.cabi.africa'
                : 'http://localhost:3010');
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/driver-groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
            body: JSON.stringify({
                name: data.organizationName,
                description: `Group registered by ${data.contactPerson} (${data.contactEmail})`,
                organizationType: data.organizationType,
            }),
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            return res.status(400).json({
                success: false,
                error: errorData.message || 'Failed to create driver group',
            });
        }

        const groupData = await backendResponse.json();

        // Calculate pricing - Zero driver registration fees
        const numberOfDrivers = data.drivers.length;
        const registrationFeePerDriver = 0; // KES - Free registration
        const subtotal = 0;
        const discount = 0;
        const finalAmount = 0;

        // Skip payment intent since registration is 100% free
        const paymentData = { id: `free-group-${Date.now()}`, paymentIntentId: `free-group-${Date.now()}`, clientSecret: 'FREE_ONBOARDING' };

        // Create drivers with referral relationships
        const driverIds = [];
        let previousDriverId = null;

        for (let i = 0; i < data.drivers.length; i++) {
            const driverData = data.drivers[i];

            // Create driver profile
            const driverResponse = await fetch(`${BACKEND_URL}/api/v1/driver-leads/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization || '',
                },
                body: JSON.stringify({
                    ...driverData,
                    driverGroupId: groupData.id,
                    referrerId: previousDriverId,
                    agreeToTerms: true,
                }),
            });

            if (!driverResponse.ok) {
                return res.status(400).json({
                    success: false,
                    error: `Failed to register driver ${i + 1}`,
                });
            }

            const driverResult = await driverResponse.json();
            driverIds.push(driverResult.userId);
            previousDriverId = driverResult.userId;
        }

        // Trigger Referral command processing
        if (previousDriverId) {
            const referralUrl =
                process.env.NEXT_PUBLIC_REFERRAL_SERVICE_URL ||
                (process.env.NODE_ENV === 'production'
                    ? 'https://api.cabi.africa'
                    : 'http://localhost:3338');
            await fetch(`${referralUrl}/api/referral/process-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    driverId: previousDriverId,
                    registrationFee: registrationFeePerDriver,
                }),
            });
        }

        console.log('✅ New group registration:', {
            organizationId: groupData.id,
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
            organizationId: groupData.id,
            driverIds,
            paymentIntentId: paymentData.paymentIntentId,
            clientSecret: paymentData.clientSecret,
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

