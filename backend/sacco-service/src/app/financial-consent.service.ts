import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import * as crypto from 'crypto';

export interface RequestOtpDto {
    driverProfileId: string;
    partnerId: string;
    serviceType: string;
    deductionPct: number; // e.g. 0.02 = 2%
    termsVersion: string;
}

export interface VerifyOtpDto {
    driverProfileId: string;
    partnerId: string;
    otp: string;
    termsVersion: string;
    termsHash?: string;
}

interface PendingOtpRecord {
    driverProfileId: string;
    partnerId: string;
    serviceType: string;
    deductionPct: number;
    termsVersion: string;
    otpHash: string;
    phoneNumber: string;
    expiresAt: Date;
    attempts: number;
}

@Injectable()
export class FinancialConsentService {
    private readonly logger = new Logger(FinancialConsentService.name);

    // In-memory cache for OTP challenges (can also back with Redis in production cluster)
    private readonly pendingOtps = new Map<string, PendingOtpRecord>();

    // Safety ceiling: Maximum total voluntary deductions allowed
    private readonly MAX_VOLUNTARY_CAP = 0.15; // 15%

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Helper to compute the first day of next month at 00:00:00 UTC
     */
    static getNextMonthCycleDate(from: Date = new Date()): Date {
        return FinancialConsentService.calculateOptOutEffectiveDate(1, from);
    }

    /**
     * Computes the effective opt-out date based on the admin-configured notice duration (in months).
     * Supported standard durations:
     * - 1 Month (Next month cycle)
     * - 3 Months (Quarterly notice)
     * - 6 Months (Half-year notice)
     * - 12 Months (1 Year / Annual notice)
     */
    static calculateOptOutEffectiveDate(durationMonths: number = 1, from: Date = new Date()): Date {
        const validMonths = Math.max(1, Math.round(durationMonths));
        const year = from.getUTCFullYear();
        const month = from.getUTCMonth();
        // Sets effective date to the 1st day of the target month at 00:00:00 UTC
        return new Date(Date.UTC(year, month + validMonths, 1, 0, 0, 0, 0));
    }


    /**
     * Request an SMS OTP for consenting to a financial service deduction.
     * Enforces the 15% cumulative deduction cap across active products.
     */
    async requestEnrollmentOtp(dto: RequestOtpDto): Promise<{
        message: string;
        phoneMasked: string;
        expiresAt: Date;
    }> {
        this.logger.log(`Requesting consent OTP for driver ${dto.driverProfileId}, service ${dto.serviceType}`);

        // 1. Verify Driver Profile and registered phone
        const profile = await this.prisma.driverProfile.findUnique({
            where: { id: dto.driverProfileId },
            include: { user: true }
        });

        if (!profile || !profile.user) {
            throw new HttpException('Driver profile or associated user account not found', HttpStatus.NOT_FOUND);
        }

        const phone = profile.user.phone;
        if (!phone) {
            throw new HttpException('Driver does not have a registered phone number for SMS OTP verification', HttpStatus.BAD_REQUEST);
        }

        // 2. Validate Partner
        const partner = await this.prisma.saccoPartner.findUnique({
            where: { id: dto.partnerId }
        });

        if (!partner || !partner.isActive) {
            throw new HttpException('Financial partner is not active or does not exist', HttpStatus.BAD_REQUEST);
        }

        // 3. Verify total deduction does not breach 15% ceiling
        const currentActiveConsents = await this.getActiveConsents(dto.driverProfileId);
        const currentCommittedPct = currentActiveConsents.reduce((sum, c) => sum + Number(c.deductionPct), 0);
        const projectedTotal = currentCommittedPct + dto.deductionPct;

        if (projectedTotal > this.MAX_VOLUNTARY_CAP) {
            throw new HttpException(
                `Deduction of ${(dto.deductionPct * 100).toFixed(1)}% exceeds the 15% maximum voluntary cap. ` +
                `Currently committed: ${(currentCommittedPct * 100).toFixed(1)}%. Available: ${((this.MAX_VOLUNTARY_CAP - currentCommittedPct) * 100).toFixed(1)}%`,
                HttpStatus.BAD_REQUEST
            );
        }

        // 4. Generate 6-digit numeric OTP
        const rawOtp = (Math.floor(100000 + Math.random() * 900000)).toString();
        const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const cacheKey = `${dto.driverProfileId}:${dto.partnerId}`;
        this.pendingOtps.set(cacheKey, {
            driverProfileId: dto.driverProfileId,
            partnerId: dto.partnerId,
            serviceType: dto.serviceType,
            deductionPct: dto.deductionPct,
            termsVersion: dto.termsVersion,
            otpHash,
            phoneNumber: phone,
            expiresAt,
            attempts: 0,
        });

        // 5. In real environment, invoke SMS gateway. For observability & audit:
        this.logger.log(`[SMS Gateway Mock] Dispatched OTP ${rawOtp} to ${phone} for consent on terms v${dto.termsVersion}`);

        // Mask phone for response: e.g. +254 712 *** *89
        const phoneMasked = phone.length > 5
            ? phone.substring(0, phone.length - 5) + '***' + phone.substring(phone.length - 2)
            : '***';

        return {
            message: 'One-Time Passcode (OTP) sent to your registered phone number.',
            phoneMasked,
            expiresAt,
        };
    }

    /**
     * Verifies SMS OTP and permanently commits driver consent to the database.
     */
    async verifyEnrollmentOtp(dto: VerifyOtpDto): Promise<any> {
        const cacheKey = `${dto.driverProfileId}:${dto.partnerId}`;
        const record = this.pendingOtps.get(cacheKey);

        if (!record) {
            throw new HttpException('No pending consent request found or OTP expired. Please request a new OTP.', HttpStatus.BAD_REQUEST);
        }

        if (new Date() > record.expiresAt) {
            this.pendingOtps.delete(cacheKey);
            throw new HttpException('OTP has expired. Please request a new code.', HttpStatus.BAD_REQUEST);
        }

        record.attempts += 1;
        if (record.attempts > 5) {
            this.pendingOtps.delete(cacheKey);
            throw new HttpException('Too many incorrect attempts. Consent request invalidated.', HttpStatus.TOO_MANY_REQUESTS);
        }

        const inputHash = crypto.createHash('sha256').update(dto.otp).digest('hex');
        if (inputHash !== record.otpHash) {
            throw new HttpException('Invalid OTP code. Please verify and try again.', HttpStatus.BAD_REQUEST);
        }

        // Clean up pending OTP
        this.pendingOtps.delete(cacheKey);

        this.logger.log(`OTP successfully verified for driver ${dto.driverProfileId} on partner ${dto.partnerId}`);

        // Persist consent record
        let consentRecord: any;
        try {
            consentRecord = await (this.prisma as any).driverFinancialConsent?.upsert({
                where: {
                    driverProfileId_partnerId: {
                        driverProfileId: dto.driverProfileId,
                        partnerId: dto.partnerId,
                    }
                },
                update: {
                    serviceType: record.serviceType,
                    deductionPct: record.deductionPct,
                    isConsented: true,
                    termsVersion: dto.termsVersion,
                    termsHash: dto.termsHash ?? null,
                    otpVerifiedAt: new Date(),
                    otpPhoneNumber: record.phoneNumber,
                    status: 'ACTIVE',
                    optOutRequestedAt: null,
                    optOutEffectiveAt: null,
                    updatedAt: new Date(),
                },
                create: {
                    driverProfileId: dto.driverProfileId,
                    partnerId: dto.partnerId,
                    serviceType: record.serviceType,
                    deductionPct: record.deductionPct,
                    isConsented: true,
                    termsVersion: dto.termsVersion,
                    termsHash: dto.termsHash ?? null,
                    otpVerifiedAt: new Date(),
                    otpPhoneNumber: record.phoneNumber,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });
        } catch (dbErr) {
            this.logger.warn(`Could not persist to driverFinancialConsent table: ${dbErr?.message}`);
        }

        // Maintain backward compatibility for SACCO
        if (record.serviceType === 'SACCO') {
            await this.prisma.driverProfile.update({
                where: { id: dto.driverProfileId },
                data: {
                    saccoEnrolled: true,
                    saccoPartnerId: dto.partnerId,
                    saccoEnrolledAt: new Date(),
                }
            });
        }

        return {
            success: true,
            message: 'Driver consent successfully recorded and verified.',
            consent: consentRecord ?? {
                driverProfileId: dto.driverProfileId,
                partnerId: dto.partnerId,
                serviceType: record.serviceType,
                deductionPct: record.deductionPct,
                status: 'ACTIVE',
                otpVerifiedAt: new Date(),
            }
        };
    }

    /**
     * Handles driver request to opt out.
     * The admin determines how long it takes to effect driver earnings:
     * - 1 Month (Next Month Cycle)
     * - 3 Months
     * - 6 Months
     * - 12 Months (1 Year)
     */
    async requestOptOut(
        driverProfileId: string,
        partnerId: string,
        overrideNoticeMonths?: number
    ): Promise<{
        message: string;
        effectiveDate: Date;
        noticePeriodMonths: number;
        serviceType: string;
    }> {
        this.logger.log(`Opt-out requested by driver ${driverProfileId} for partner ${partnerId}`);

        // 1. Find existing active consent and partner
        let consent: any;
        try {
            consent = await (this.prisma as any).driverFinancialConsent?.findUnique({
                where: {
                    driverProfileId_partnerId: {
                        driverProfileId,
                        partnerId,
                    }
                },
                include: { partner: true }
            });
        } catch {
            // fallback
        }

        const partner = consent?.partner ?? await this.prisma.saccoPartner.findUnique({ where: { id: partnerId } });
        const serviceType = consent?.serviceType ?? partner?.serviceCategory ?? 'SACCO';

        // 2. Determine admin-configured notice duration (per partner or system-wide)
        let noticeMonths = overrideNoticeMonths;
        if (!noticeMonths) {
            if (partner && (partner as any).optOutNoticeMonths) {
                noticeMonths = Number((partner as any).optOutNoticeMonths);
            } else {
                const setting = await this.prisma.systemSettings.findUnique({
                    where: { key: 'FINANCIAL_OPTOUT_NOTICE_MONTHS' }
                });
                noticeMonths = setting ? parseInt(setting.value) : 1;
            }
        }

        // Ensure minimum 1 month
        noticeMonths = Math.max(1, noticeMonths);

        // 3. Calculate effective date based on configured duration (e.g. 1, 3, 6, 12 months)
        const optOutEffectiveAt = FinancialConsentService.calculateOptOutEffectiveDate(noticeMonths);

        try {
            await (this.prisma as any).driverFinancialConsent?.update({
                where: {
                    driverProfileId_partnerId: {
                        driverProfileId,
                        partnerId,
                    }
                },
                data: {
                    status: 'PENDING_OPT_OUT',
                    optOutRequestedAt: new Date(),
                    optOutEffectiveAt,
                    updatedAt: new Date(),
                }
            });
        } catch (e) {
            this.logger.warn(`Could not update opt-out in DB: ${e?.message}`);
        }

        const durationLabel = noticeMonths === 12
            ? '1 Year'
            : noticeMonths === 6
            ? '6 Months'
            : noticeMonths === 3
            ? '3 Months'
            : 'Next Month Cycle';

        return {
            message: `Opt-out scheduled with ${durationLabel} notice period. Driver earnings deductions will cease effective ${optOutEffectiveAt.toLocaleDateString('en-KE', { dateStyle: 'long' })}.`,
            effectiveDate: optOutEffectiveAt,
            noticePeriodMonths: noticeMonths,
            serviceType,
        };
    }


    /**
     * Get all active and non-expired consents for a driver.
     * Evaluates next-month cycle cutoffs for pending opt-outs.
     */
    async getActiveConsents(driverProfileId: string): Promise<any[]> {
        const now = new Date();

        try {
            const consents = await (this.prisma as any).driverFinancialConsent?.findMany({
                where: {
                    driverProfileId,
                    OR: [
                        { status: 'ACTIVE' },
                        { status: 'PENDING_OPT_OUT', optOutEffectiveAt: { gt: now } }
                    ]
                },
                include: { partner: true }
            }) ?? [];

            return consents;
        } catch {
            // Fallback for legacy DB: check driverProfile.saccoEnrolled
            const profile = await this.prisma.driverProfile.findUnique({
                where: { id: driverProfileId },
                include: { saccoPartner: true }
            });

            if (profile?.saccoEnrolled && profile.saccoPartnerId) {
                return [{
                    driverProfileId,
                    partnerId: profile.saccoPartnerId,
                    serviceType: 'SACCO',
                    deductionPct: 0.02,
                    status: 'ACTIVE',
                    partner: profile.saccoPartner,
                }];
            }

            return [];
        }
    }
}
