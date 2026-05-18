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
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'claims');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalFilename || '');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const newPath = path.join(uploadDir, filename);

    await fs.promises.copyFile(file.filepath, newPath);
    await fs.promises.unlink(file.filepath); // Remove temp file

    return `/uploads/claims/${filename}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id: vehicleId } = req.query;

    if (typeof vehicleId !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    if (req.method === 'GET') {
        try {
            const claims = await prisma.vehicleBenefitClaim.findMany({
                where: { vehicleId },
                include: {
                    benefit: true,
                    driver: {
                        include: {
                            user: {
                                select: { fullName: true, phone: true }
                            }
                        }
                    }
                },
                orderBy: { reportedAt: 'desc' }
            });

            const formattedClaims = claims.map((c: any) => ({
                ...c,
                evidenceFileUrl: c.evidenceUrl || c.evidenceFileUrl
            }));

            return res.status(200).json({ success: true, claims: formattedClaims });
        } catch (error: any) {
            console.error('Error fetching claims:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const form = formidable({});
            const [fields, files] = await form.parse(req);

            const getValue = (key: string): string | undefined => {
                const val = fields[key];
                return Array.isArray(val) ? val[0] : val;
            };

            const benefitId = getValue('benefitId');
            const reportedByDriverId = getValue('reportedByDriverId');
            const notes = getValue('notes');

            if (!benefitId || !reportedByDriverId) {
                return res.status(400).json({ success: false, message: 'Benefit ID and Driver ID are required' });
            }

            let evidenceUrl: string | null = null;
            const uploadedFile = files.evidence;
            if (uploadedFile) {
                const f = (Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile) as formidable.File;
                evidenceUrl = await saveFile(f);
            }

            const newClaim = await prisma.vehicleBenefitClaim.create({
                data: {
                    vehicleId,
                    benefitId,
                    reportedByDriverId,
                    notes,
                    evidenceUrl,
                    status: 'PENDING'
                },
                include: {
                    benefit: true,
                    driver: {
                        include: { user: { select: { fullName: true } } }
                    }
                }
            });

            const formattedClaim = {
                ...newClaim,
                evidenceFileUrl: newClaim.evidenceUrl || (newClaim as any).evidenceFileUrl
            };

            return res.status(201).json({ success: true, message: 'Claim submitted successfully', claim: formattedClaim });

        } catch (error: any) {
            console.error('Error submitting claim:', error);
            return res.status(500).json({ success: false, message: 'Internal server error submitting claim', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
