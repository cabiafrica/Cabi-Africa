import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const saveFile = async (file: formidable.File): Promise<string> => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalFilename || '');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const newPath = path.join(uploadDir, filename);

    await fs.promises.copyFile(file.filepath, newPath);
    await fs.promises.unlink(file.filepath); // Remove temp file

    return `/uploads/vehicles/${filename}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const getValue = (key: string): string | undefined => {
            const val = fields[key];
            return Array.isArray(val) ? val[0] : val;
        };

        const make = getValue('make');
        const model = getValue('model');
        const year = getValue('year');
        const color = getValue('color');
        const licensePlate = getValue('licensePlate');
        const logbookNumber = getValue('logbookNumber');
        const insurancePolicyNumber = getValue('insurancePolicyNumber');
        const insuranceExpiry = getValue('insuranceExpiry');
        const vehicleUse = getValue('vehicleUse');
        const insuranceType = getValue('insuranceType');
        const ownerName = getValue('ownerName');
        const ownerPhone = getValue('ownerPhone');
        const capacity = getValue('capacity');

        // Determine Capacity Unit
        let capacityUnit = 'PASSENGERS';
        if (vehicleUse === 'COMMERCIAL') {
            capacityUnit = 'TONS';
        }

        // TODO: Get authenticated user's driverProfileId. 
        // For now, accepting it from body or using a placeholder/failing if not present.
        // In a real flow, you'd decode the token here.
        const driverProfileId = getValue('driverProfileId');

        if (!make || !model || !year || !licensePlate) {
            return res.status(400).json({ message: 'Missing required vehicle fields' });
        }

        // Handle Files
        const getFileUrl = async (key: string) => {
            const uploadedFile = files[key];
            if (uploadedFile) {
                const f = (Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile) as formidable.File;
                return await saveFile(f);
            }
            return null;
        }

        const insuranceCertificateUrl = await getFileUrl('insuranceCertificate');
        const logbookImageUrl = await getFileUrl('logbookImage');
        const inspectionReportUrl = await getFileUrl('inspectionReport');
        const frontPhotoUrl = await getFileUrl('vehiclePhotoFront');
        const backPhotoUrl = await getFileUrl('vehiclePhotoBack');
        const sidePhotoUrl = await getFileUrl('vehiclePhotoSide');

        // Note: Logic to update or create vehicle. 
        // If driverProfileId is not provided, this will fail DB constraint if we try to create.
        // We will return mock success if no driverProfileId to avoid crashing in this preview mode, 
        // but try to create if provided.

        if (driverProfileId) {
            const vehicle = await prisma.vehicle.create({
                data: {
                    driverProfileId,
                    make,
                    model,
                    year: parseInt(year),
                    color,
                    plateNumber: licensePlate,
                    logbookNumber,
                    insurancePolicyNumber,
                    insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
                    usage: vehicleUse,
                    insuranceType: insuranceType,
                    ownerName,
                    ownerPhone,
                    capacity: capacity ? parseFloat(capacity) : null,
                    capacityUnit,
                    insuranceCertificateUrl,
                    logbookImageUrl,
                    inspectionReportUrl,
                    frontPhotoUrl,
                    backPhotoUrl,
                    sidePhotoUrl
                } as any
            });
            return res.status(201).json({ success: true, vehicle });
        } else {
            // Mock response for testing frontend without full auth flow
            console.log('Mock Vehicle Registration (No DriverProfileId):', { make, model, licensePlate, ownerName, capacity, capacityUnit, photos: { frontPhotoUrl } });
            return res.status(201).json({ success: true, message: 'Vehicle data received (Mock Mode)' });
        }

    } catch (error: any) {
        console.error('Vehicle Registration error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
