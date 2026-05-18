import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { OrganizationStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

/**
 * Represents the structure of the TripPaid event.
 */
export class TripPaidEvent {
    tripId: string;
    driverId: string;
    finalFare: number;
}

export class CreateSaccoDto {
    name: string;
    email: string;
    registrationNumber: string;
    founderName: string;
    certificateUrl?: string;
    isExternal?: boolean;
    apiBaseUrl?: string;
    webhookUrl?: string;
    driverId?: string;
    features?: string[];
}

export class UpdateSaccoDto {
    name?: string;
    email?: string;
    bio?: string;
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    website?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    registrationNumber?: string;
    certificateUrl?: string;
    founderName?: string;
    driverId?: string;
    features?: string[];
}

@Injectable()
export class SaccoService {
    private readonly logger = new Logger(SaccoService.name);

    constructor(private readonly prisma: PrismaService) { }

    async processDeduction(event: TripPaidEvent): Promise<any> {
        this.logger.log(`Processing SACCO deduction for trip: ${event.tripId}`);

        try {
            // 1. Fetch all required configuration (Simulated or from DB settings)
            // Ideally fetch from Settings table if available, else usage defaults
            const saccoConfig = { savingsRate: 0.05 }; // 5%
            const commissionConfig = { totalCommission: 0.2 }; // 20%

            this.logger.log(`Fetched SACCO config: ${JSON.stringify(saccoConfig)}`);

            // 2. Check if savings rate is zero
            if (saccoConfig.savingsRate <= 0) {
                this.logger.log('SACCO savings rate is zero. No deduction will be made.');
                return { status: 'skipped', reason: 'zero_savings_rate' };
            }

            // 3. Calculate the deduction amount
            const totalCommission = Number(event.finalFare) * commissionConfig.totalCommission;
            const savingsAmount = totalCommission * saccoConfig.savingsRate;

            if (savingsAmount <= 0) {
                this.logger.log('Calculated savings amount is zero. No deduction will be made.');
                return { status: 'skipped', reason: 'zero_amount' };
            }

            // 4. Persist the transaction to DB
            this.logger.log(`Persisting SACCO transaction for driver: ${event.driverId}, amount: ${savingsAmount}`);

            const transaction = await this.prisma.saccoLedger.create({
                data: {
                    driverId: event.driverId,
                    amount: savingsAmount,
                    type: 'SACCO_SAVING',
                    relatedTripId: event.tripId,
                }
            });

            this.logger.log(`Successfully processed SACCO deduction of ${savingsAmount} for driver: ${event.driverId}. Ledger ID: ${transaction.id}`);

            return {
                status: 'success',
                transaction
            };

        } catch (error) {
            this.logger.error('Failed to process SACCO deduction', error);
            // Don't crash the consumer, just log error? depending on requirements.
            // Throwing allows retry strategies if configured.
            throw error;
        }
    }

    async getHealth() {
        return { status: 'OK', service: 'sacco-service', timestamp: new Date() };
    }

    async getSavingsBalance(driverId: string) {
        // Sum up all transactions for the driver
        // Assuming withdrawals or loans would be negative amounts or handled via type
        // For simplicity: All 'SACCO_SAVING' are positive. Withdrawals should be subtracted.
        // We can group by type or just sum amount if we store negatives for withdrawals.

        // Let's assume for now we just sum everything.
        // Prisma aggregate
        const result = await this.prisma.saccoLedger.aggregate({
            _sum: {
                amount: true
            },
            where: {
                driverId: driverId
            }
        });

        // If no transactions, sum is null
        const totalSavings = result._sum.amount ? Number(result._sum.amount) : 0;

        // Available might be less if there are loans locked, etc.
        // For now: available = total
        return {
            totalSavings,
            availableWithdrawal: totalSavings
        };
    }

    async getTransactions(driverId: string) {
        return this.prisma.saccoLedger.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            take: 50 // limit to recent 50
        });
    }

    async createSacco(dto: CreateSaccoDto): Promise<any> {
        this.logger.log(`Registering new SACCO: ${dto.name}`);
        
        // Check if registration number already exists
        const existing = await this.prisma.organizations.findFirst({
            where: { registrationNumber: dto.registrationNumber }
        });

        if (existing) {
            throw new Error('SACCO with this registration number already exists');
        }

        // Create SACCO
        // If no certificate provided, status is UNVERIFIED (invalid)
        const status = dto.certificateUrl ? OrganizationStatus.PENDING : OrganizationStatus.UNVERIFIED;

        const newOrg = await this.prisma.organizations.create({
            data: {
                id: randomUUID(),
                name: dto.name,
                email: dto.email,
                registrationNumber: dto.registrationNumber,
                founderName: dto.founderName,
                registrationCertificateUrl: dto.certificateUrl,
                status: status,
                features: dto.features || [],
                updatedAt: new Date(),
            }
        });

        // Automatically associate the creating driver with the new SACCO
        if (dto.driverId) {
            const profile = await this.prisma.driverProfile.findUnique({
                where: { userId: dto.driverId }
            });
            if (profile) {
                await this.prisma.driverProfile.update({
                    where: { userId: dto.driverId },
                    data: { organizationId: newOrg.id }
                });
            }
        }

        return newOrg;
    }

    async updateSacco(id: string, dto: UpdateSaccoDto): Promise<any> {
        this.logger.log(`Updating SACCO: ${id}`);

        const org = await this.prisma.organizations.findUnique({
            where: { id }
        });

        if (!org) {
            throw new Error('SACCO not found');
        }

        const updateData: any = {
            ...dto,
            updatedAt: new Date(),
        };

        // If the update payload includes driverId, omit it from prisma update
        delete updateData.driverId;

        // If a critical legal field (registration number or certificate) is modified,
        // revert the verification status back to PENDING.
        let statusChanged = false;
        if (dto.registrationNumber && dto.registrationNumber !== org.registrationNumber) {
            updateData.status = OrganizationStatus.PENDING;
            statusChanged = true;
        }
        if (dto.certificateUrl && dto.certificateUrl !== org.registrationCertificateUrl) {
            updateData.status = OrganizationStatus.PENDING;
            statusChanged = true;
        }

        const updatedOrg = await this.prisma.organizations.update({
            where: { id },
            data: updateData
        });

        this.logger.log(`SACCO ${id} updated successfully. Status reset to PENDING: ${statusChanged}`);
        return updatedOrg;
    }

    async joinSacco(driverId: string, saccoId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} joining SACCO ${saccoId}`);
        
        const org = await this.prisma.organizations.findUnique({
            where: { id: saccoId }
        });

        if (!org || org.status !== OrganizationStatus.VERIFIED) {
            throw new Error('SACCO is not verified or does not exist');
        }

        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { organizationId: saccoId }
        });
    }

    async leaveSacco(driverId: string): Promise<any> {
        this.logger.log(`Driver ${driverId} leaving SACCO`);
        
        return this.prisma.driverProfile.update({
            where: { userId: driverId },
            data: { organizationId: null }
        });
    }

    async getSaccos(search?: string): Promise<any[]> {
        return this.prisma.organizations.findMany({
            where: {
                status: OrganizationStatus.VERIFIED,
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { registrationNumber: { contains: search, mode: 'insensitive' } }
                ] : undefined
            },
            include: {
              _count: {
                select: { driver_profiles: true }
              }
            }
        });
    }

    async getSaccoDetails(id: string): Promise<any> {
        return this.prisma.organizations.findUnique({
            where: { id },
            include: {
                driver_profiles: {
                    include: {
                        user: {
                            select: { fullName: true, phone: true }
                        }
                    }
                }
            }
        });
    }
}
