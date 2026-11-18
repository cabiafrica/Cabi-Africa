import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { extractCallerUser } from '@/lib/serverAuth';

interface CompleteApplicationRequest {
    userId?: string;
    email?: string;
    phone?: string;
    // Step 2 Documents
    nationalIdUrl?: string;
    drivingLicenseUrl?: string;
    psvBadgeUrl?: string;
    passportPhotoUrl?: string;
    aiVerified?: boolean;
    aiScore?: number;
    // Step 3 Vehicle
    vehicleType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number | string;
    licensePlate?: string;
    allowCoDriver?: boolean;
    vehiclePhotos?: string;
    logbookUrl?: string;
    insuranceUrl?: string;
    inspectionUrl?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const caller = extractCallerUser(req);
    const data: CompleteApplicationRequest = req.body ?? {};

    const targetUserId = caller ? caller.sub || caller.id : data.userId;
    const targetEmail = caller?.email || data.email;

    if (!targetUserId && !targetEmail) {
        return res.status(400).json({ success: false, message: 'User ID or Email is required to complete driver onboarding.' });
    }

    try {
        // 1. Locate user record
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(targetUserId ? [{ id: targetUserId }] : []),
                    ...(targetEmail ? [{ email: targetEmail.trim().toLowerCase() }] : []),
                ],
            },
            include: {
                driverProfile: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Driver user profile not found. Please complete Step 1 first.' });
        }

        // 2. Locate or create DriverProfile
        let driverProfile = user.driverProfile;
        if (!driverProfile) {
            driverProfile = await prisma.driverProfile.create({
                data: {
                    userId: user.id,
                    licenseNumber: `DL-${Date.now().toString().slice(-6)}`,
                },
            });
        }

        // 3. Upsert Vehicle if plate number provided
        const rawPlate = (data.licensePlate || '').trim().toUpperCase();
        let vehicleRecord = null;
        if (rawPlate) {
            const vehicleTypeMap: Record<string, 'STANDARD' | 'PREMIUM' | 'XL' | 'BODA'> = {
                boda: 'BODA',
                standard: 'STANDARD',
                comfort: 'PREMIUM',
                premium: 'PREMIUM',
                executive: 'PREMIUM',
                xl: 'XL',
            };
            const mappedType = vehicleTypeMap[(data.vehicleType || 'standard').toLowerCase()] || 'STANDARD';
            const yearNum = Number(data.vehicleYear) || 2020;

            vehicleRecord = await prisma.vehicle.upsert({
                where: { plateNumber: rawPlate },
                update: {
                    driverProfileId: driverProfile.id,
                    make: data.vehicleMake || 'Toyota',
                    model: data.vehicleModel || 'Fielder',
                    year: yearNum,
                    type: mappedType as any,
                    logbookImageUrl: data.logbookUrl || null,
                    insuranceCertificateUrl: data.insuranceUrl || null,
                    inspectionReportUrl: data.inspectionUrl || null,
                },
                create: {
                    plateNumber: rawPlate,
                    driverProfileId: driverProfile.id,
                    make: data.vehicleMake || 'Toyota',
                    model: data.vehicleModel || 'Fielder',
                    year: yearNum,
                    type: mappedType as any,
                    logbookImageUrl: data.logbookUrl || null,
                    insuranceCertificateUrl: data.insuranceUrl || null,
                    inspectionReportUrl: data.inspectionUrl || null,
                },
            });
        }

        // 4. Persist document package in settings store for compliance audit
        const referenceNumber = `CABI-DRV-${Date.now().toString().slice(-6)}`;
        const documentPackage = {
            referenceNumber,
            userId: user.id,
            driverProfileId: driverProfile.id,
            email: user.email,
            phone: user.phone,
            nationalIdUrl: data.nationalIdUrl,
            drivingLicenseUrl: data.drivingLicenseUrl,
            psvBadgeUrl: data.psvBadgeUrl,
            passportPhotoUrl: data.passportPhotoUrl,
            aiVerified: Boolean(data.aiVerified),
            aiScore: data.aiScore || 0,
            vehicle: vehicleRecord
                ? {
                      id: vehicleRecord.id,
                      plateNumber: vehicleRecord.plateNumber,
                      make: vehicleRecord.make,
                      model: vehicleRecord.model,
                      year: vehicleRecord.year,
                  }
                : null,
            submittedAt: new Date().toISOString(),
            status: 'PENDING_COMPLIANCE_REVIEW',
        };

        await prisma.setting.upsert({
            where: { key: `driver_application:${driverProfile.id}` },
            update: { value: JSON.stringify(documentPackage) },
            create: { key: `driver_application:${driverProfile.id}`, value: JSON.stringify(documentPackage) },
        });

        // Also update user status to pending
        await prisma.user.update({
            where: { id: user.id },
            data: { status: 'PENDING' as any },
        });

        return res.status(200).json({
            success: true,
            referenceNumber,
            driverProfileId: driverProfile.id,
            message: 'Driver application and vehicle details successfully submitted for compliance review.',
        });
    } catch (error: any) {
        console.error('Error completing driver application:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete application. Please try again.',
        });
    }
}
