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
        const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3010'}/api/v1/driver-groups`, {
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

        // Calculate pricing
        const numberOfDrivers = data.drivers.length;
        const registrationFeePerDriver = 2000; // KES
        const subtotal = numberOfDrivers * registrationFeePerDriver;
        
        let discount = 0;
        const groupDiscountThreshold = 10;
        const groupDiscountPercentage = 15;
        if (numberOfDrivers >= groupDiscountThreshold) {
            discount = subtotal * (groupDiscountPercentage / 100);
        }
        
        const finalAmount = subtotal - discount;

        // Generate payment intent
        const paymentResponse = await fetch(`${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3333'}/api/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: finalAmount,
                currency: 'KES',
                description: `Driver Group Registration - ${data.organizationName}`,
                metadata: {
                    organizationId: groupData.id,
                    numberOfDrivers,
                    registrationType: 'DRIVER_GROUP',
                },
            }),
        });

        if (!paymentResponse.ok) {
            return res.status(400).json({
                success: false,
                error: 'Failed to create payment intent',
            });
        }

        const paymentData = await paymentResponse.json();

        // Create drivers with referral relationships
        const driverIds = [];
        let previousDriverId = null;

        for (let i = 0; i < data.drivers.length; i++) {
            const driverData = data.drivers[i];
            
            // Create driver profile
            const driverResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3010'}/api/v1/driver-leads/register`, {
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

        // Trigger MLM commission processing
        if (previousDriverId) {
            await fetch(`${process.env.BACKEND_URL || 'http://localhost:3010'}/api/v1/mlm/process-registration`, {
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
