import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface CreatePartnerDto {
    name: string;
    contactEmail: string;
    serviceCategory: 'SACCO' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INSURANCE_LIFE' | 'INVESTMENT_MMF' | 'PENSION' | 'CUSTOM';
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    optOutNoticeMonths?: number; // 1, 3, 6, 12 months
    testMode?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}

export interface UpdatePartnerDto {
    name?: string;
    contactEmail?: string;
    serviceCategory?: 'SACCO' | 'INSURANCE_HEALTH' | 'INSURANCE_VEHICLE' | 'INSURANCE_LIFE' | 'INVESTMENT_MMF' | 'PENSION' | 'CUSTOM';
    apiBaseUrl?: string;
    apiKey?: string;
    connectorType?: 'REST_API' | 'WEBHOOK' | 'LEDGER_EXPORT';
    optOutNoticeMonths?: number; // 1, 3, 6, 12 months
    testMode?: boolean;
    isActive?: boolean;
    logoUrl?: string;
    description?: string;
    website?: string;
}


@Injectable()
export class FinancialPartnerService {
    private readonly logger = new Logger(FinancialPartnerService.name);

    constructor(private readonly prisma: PrismaService) {}

    async listPartners(category?: string): Promise<any[]> {
        return this.prisma.saccoPartner.findMany({
            where: {
                ...(category ? { serviceCategory: category as any } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { enrolledDrivers: true }
                }
            }
        });
    }

    async getPartnerById(id: string): Promise<any> {
        const partner = await this.prisma.saccoPartner.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrolledDrivers: true }
                }
            }
        });

        if (!partner) {
            throw new HttpException(`Financial partner with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }

        return partner;
    }

    async createPartner(dto: CreatePartnerDto): Promise<any> {
        this.logger.log(`Registering new financial partner: ${dto.name} (${dto.serviceCategory})`);

        return this.prisma.saccoPartner.create({
            data: {
                name: dto.name,
                contactEmail: dto.contactEmail,
                serviceCategory: (dto.serviceCategory as any) ?? 'SACCO',
                apiBaseUrl: dto.apiBaseUrl ?? null,
                apiKey: dto.apiKey ?? null,
                connectorType: dto.connectorType ?? 'REST_API',
                optOutNoticeMonths: dto.optOutNoticeMonths ?? 1,
                testMode: dto.testMode ?? true,
                isActive: false, // Admin must explicitly verify and activate
                logoUrl: dto.logoUrl ?? null,
                description: dto.description ?? null,
                website: dto.website ?? null,
                updatedAt: new Date(),
            }
        });
    }


    async updatePartner(id: string, dto: UpdatePartnerDto): Promise<any> {
        this.logger.log(`Updating financial partner: ${id}`);
        await this.getPartnerById(id);

        return this.prisma.saccoPartner.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.serviceCategory ? { serviceCategory: dto.serviceCategory as any } : {}),
                updatedAt: new Date(),
            }
        });
    }

    async deletePartner(id: string): Promise<{ success: boolean; message: string }> {
        this.logger.log(`Deleting financial partner: ${id}`);
        await this.getPartnerById(id);

        await this.prisma.saccoPartner.delete({
            where: { id }
        });

        return { success: true, message: `Partner ${id} removed successfully` };
    }
}
