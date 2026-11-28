import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { id } = req.query;
    const { status, rejectionReason } = req.body;

    if (typeof id !== 'string' || !status || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid claim ID or review status' });
    }

    try {
        const claim = await prisma.vehicleBenefitClaim.findUnique({
            where: { id },
            include: { vehicle: true, benefit: true }
        });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (claim.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Claim has already been ${claim.status.toLowerCase()}` });
        }

        const reviewedClaim = await prisma.vehicleBenefitClaim.update({
            where: { id },
            data: {
                status,
                reviewedAt: new Date(),
                reviewedByAdminId: admin.sub,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null
            },
            include: {
                benefit: true,
                driver: { include: { user: { select: { fullName: true } } } }
            }
        });

        // If approved, check for newly unlocked qualifications
        let unlockedQualifications: any[] = [];
        if (status === 'APPROVED') {
            const allApprovedClaims = await prisma.vehicleBenefitClaim.findMany({
                where: { vehicleId: claim.vehicleId, status: 'APPROVED' },
                select: { benefitId: true }
            });
            const approvedBenefitIds = new Set(allApprovedClaims.map((c: { benefitId: string }) => c.benefitId));

            const allQualifications = await prisma.vehicleQualification.findMany({
                where: { isActive: true },
                include: { requirements: true }
            });

            unlockedQualifications = allQualifications.filter((q: { requirements: any[] }) => {
                if (!q.requirements || q.requirements.length === 0) return false;
                return q.requirements.every((req: { benefitId: string }) => approvedBenefitIds.has(req.benefitId));
            });
        }

        const formattedClaim = {
            ...reviewedClaim,
            evidenceFileUrl: reviewedClaim.evidenceUrl || (reviewedClaim as any).evidenceFileUrl
        };

        return res.status(200).json({
            success: true,
            message: `Claim ${status.toLowerCase()} successfully`,
            claim: formattedClaim,
            unlockedQualifications
        });

    } catch (error: any) {
        console.error('Error reviewing claim:', error);
        return res.status(500).json({ success: false, message: 'Internal server error reviewing claim' });
    }
}
