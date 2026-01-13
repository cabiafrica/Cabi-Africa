import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DocumentType, DocumentStatus } from '@prisma/client';

@Injectable()
export class DocumentService {
    constructor(private prisma: PrismaService) { }

    async uploadDocument(userId: string, type: DocumentType, url: string) {
        const driver = await this.prisma.driverProfile.findUnique({
            where: { userId },
        });

        if (!driver) {
            throw new NotFoundException('Driver profile not found for this user');
        }

        return this.prisma.document.create({
            data: {
                driverProfileId: driver.id,
                type,
                url,
                status: DocumentStatus.PENDING,
            },
        });
    }

    async findForUser(userId: string) {
        return this.prisma.document.findMany({
            where: {
                driverProfile: { userId },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findHistoryForUser(userId: string) {
        return this.findForUser(userId);
    }

    // Admin Methods
    async getDriverDocuments(userId: string) {
        // userId here refers to the User ID of the driver
        return this.findForUser(userId);
    }

    async updateStatus(docId: string, status: DocumentStatus, rejectionReason?: string) {
        return this.prisma.document.update({
            where: { id: docId },
            data: {
                status,
                rejectionReason: rejectionReason || null,
            }
        });
    }
}
