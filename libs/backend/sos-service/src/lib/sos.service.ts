import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '@cabi/backend/database';

export interface SOSAlert {
    id: string;
    userId: string;
    userType: 'PASSENGER' | 'DRIVER';
    location: { lat: number, lng: number };
    tripId: string;
    timestamp: Date;
    status: 'NEW' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED';
    handledBy?: string;
    resolutionNotes?: string;
    isMisuse?: boolean;
    groupDistressPatron?: {
        id: string;
        name: string;
        phone: string;
        groupName: string;
        channel: 'SMS_AND_INAPP' | 'VOICE_AND_INAPP';
    };
    notifiedCaptainsCount?: number;
    goodSamaritanRewardPoints?: number;
    distressFee?: number;
    distressFeeStatus?: 'NONE' | 'BILLED' | 'PARDON_REQUESTED' | 'PARDONED' | 'SETTLED';
    pardonReason?: string;
    pardonRequestedAt?: Date;
    pardonedAt?: Date;
    pardonedByOfficial?: string;
    pardonNotes?: string;
}

export interface SosPenaltyConfig {
    type: 'SUSPENSION' | 'FEE';
    suspensionDurationDays?: number;
    feeAmount?: number;
    goodSamaritanPoints?: number; // Configurable points awarded by admin
}

export interface NearbyCaptainTarget {
    captainId: string;
    captainUserId: string;
    name: string;
    phone?: string;
    distanceKm: number;
    location: { lat: number; lng: number };
}

@WebSocketGateway({
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [/https:\/\/.*\.cabi-africa\.com$/, /https:\/\/.*\.vercel\.app$/]
            : true,
    },
})
export class SOSGateway {
    @WebSocketServer()
    server: Server;

    sendAlert(alert: SOSAlert) {
        if (this.server) {
            this.server.emit('sos_alert', alert);
        }
    }

    sendPatronDistressAlert(patron: any, alert: SOSAlert, trackingUrl: string) {
        if (this.server) {
            this.server.emit('patron_distress_alert', {
                patron,
                alert,
                trackingUrl,
                priority: 'URGENT',
                audioChime: 'PATRON_DISTRESS_KLAXON',
            });
        }
    }

    sendNearbyCaptainsDistressAlert(captainUserIds: string[], distressPayload: any) {
        if (this.server) {
            this.server.emit('nearby_captains_distress', {
                captainUserIds,
                ...distressPayload,
                priority: 'EMERGENCY_RESCUE',
            });
        }
    }

    sendOrgDistressAlert(userIds: string[], alert: any) {
        if (this.server) {
            this.server.emit('org_distress_alert', { userIds, alert });
        }
    }
}

/**
 * Calculates surface distance in kilometres between two geographic coordinates using the Haversine formula
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
}

@Injectable()
export class SOSService {
    private readonly logger = new Logger(SOSService.name);
    private alerts: SOSAlert[] = [];
    private penaltyConfig: SosPenaltyConfig = {
        type: 'FEE',
        feeAmount: 500,
        goodSamaritanPoints: 500, // Admin-configured redeemable points
    };

    // Tracking responding Good Samaritan Captains
    private respondingCaptains: Map<string, Array<{ captainId: string; captainName: string; respondedAt: Date; pointsAwarded: number }>> = new Map();

    constructor(
        private readonly sosGateway: SOSGateway,
        private readonly prisma?: PrismaService
    ) {
        // Seed initial alert with Nairobi CBD coordinates
        this.alerts.push({
            id: 'alert_nairobi_demo',
            userId: 'user_samuel_mwangi',
            userType: 'DRIVER',
            location: { lat: -1.286389, lng: 36.817223 },
            tripId: 'TRP-26B-98927',
            timestamp: new Date(),
            status: 'NEW',
            groupDistressPatron: {
                id: 'patron_westlands',
                name: 'Elder Mwaura (Base Commander)',
                phone: '+254722123456',
                groupName: 'Westlands Commercial Stage Hub',
                channel: 'SMS_AND_INAPP',
            },
            notifiedCaptainsCount: 8,
            goodSamaritanRewardPoints: 500,
        });
    }

    /**
     * Dispatches an emergency distress alert via Universal Proximity Mesh & Group Distress Patron routing
     */
    async createAlert(
        userId: string,
        userType: 'PASSENGER' | 'DRIVER',
        location: { lat: number; lng: number },
        tripId: string
    ): Promise<SOSAlert> {
        const alertId = `alert_${Date.now()}`;
        const trackingUrl = `https://cabi.africa/sos/${alertId}`;
        const rewardPoints = this.penaltyConfig.goodSamaritanPoints || 500;

        let groupPatronInfo: any = null;
        let nearbyCaptains: NearbyCaptainTarget[] = [];

        // 1. Group Distress Patron Resolution
        if (this.prisma) {
            try {
                // If caller is a Captain, inspect their driver group and assigned Patron
                if (userType === 'DRIVER') {
                    const captain = await this.prisma.driverProfile.findFirst({
                        where: { userId },
                        include: {
                            driver_groups: true,
                            user: true,
                        },
                    });

                    if (captain?.driver_groups) {
                        const groupName = captain.driver_groups.name || 'Local Stage Squad';
                        // Look for group patron or Sacco welfare officer
                        groupPatronInfo = {
                            id: captain.driver_groups.parentGroupId || 'patron-default',
                            name: `Patron (${groupName})`,
                            phone: '+254722000111',
                            groupName,
                            channel: 'SMS_AND_INAPP',
                        };
                    }
                }

                // 2. Universal Proximity Mesh: Find active online Captains within 2.5 km or at least 10 closest
                const activeDrivers = await this.prisma.driverProfile.findMany({
                    where: {
                        isOnline: true,
                        currentLocationLat: { not: null },
                        currentLocationLng: { not: null },
                        userId: { not: userId }, // Exclude caller
                    },
                    include: {
                        user: { select: { fullName: true, phone: true } },
                    },
                    take: 50,
                });

                const captainsWithDistances: NearbyCaptainTarget[] = activeDrivers.map((d) => ({
                    captainId: d.id,
                    captainUserId: d.userId,
                    name: d.user?.fullName || 'Captain',
                    phone: d.user?.phone,
                    distanceKm: calculateHaversineDistanceKm(
                        location.lat,
                        location.lng,
                        Number(d.currentLocationLat),
                        Number(d.currentLocationLng)
                    ),
                    location: {
                        lat: Number(d.currentLocationLat),
                        lng: Number(d.currentLocationLng),
                    },
                }));

                // Sort by ascending distance (closest first)
                captainsWithDistances.sort((a, b) => a.distanceKm - b.distanceKm);

                // Option B Rule: All online Captains within 2.5 km, OR at least the 10 closest regardless of group
                const within2_5km = captainsWithDistances.filter((c) => c.distanceKm <= 2.5);
                nearbyCaptains = within2_5km.length >= 10
                    ? within2_5km
                    : captainsWithDistances.slice(0, 10);
            } catch (err: any) {
                this.logger.error(`Error resolving proximity mesh and patron: ${err.message}`);
            }
        }

        const isDriver = userType === 'DRIVER';
        const distressFee = isDriver ? 500 : 0;

        const alert: SOSAlert = {
            id: alertId,
            userId,
            userType,
            location,
            tripId,
            timestamp: new Date(),
            status: 'NEW',
            groupDistressPatron: groupPatronInfo || {
                id: 'patron-central-command',
                name: 'Central Sacco Security Patron',
                phone: '+254711000999',
                groupName: 'Cabi Rapid Response Mesh',
                channel: 'SMS_AND_INAPP',
            },
            notifiedCaptainsCount: nearbyCaptains.length,
            goodSamaritanRewardPoints: rewardPoints,
            distressFee,
            distressFeeStatus: isDriver ? 'BILLED' : 'NONE',
        };

        this.alerts.push(alert);

        // 3. Dispatch WebSocket Events to Ops Console
        this.sosGateway.sendAlert(alert);

        // 4. Hybrid Dual-Channel Signal to Group Distress Patron
        if (alert.groupDistressPatron) {
            this.sosGateway.sendPatronDistressAlert(alert.groupDistressPatron, alert, trackingUrl);
            this.logger.warn(
                `[SOSService] 🚨 Hybrid Alert sent to Patron ${alert.groupDistressPatron.name} (${alert.groupDistressPatron.phone}): "EMERGENCY DISTRESS for ${userType} at (${location.lat}, ${location.lng}). Map: ${trackingUrl}"`
            );
        }

        // 5. Broadcast to Universal Proximity Mesh (Nearby Captains)
        if (nearbyCaptains.length > 0) {
            const captainUserIds = nearbyCaptains.map((c) => c.captainUserId);
            const distressBroadcastPayload = {
                alertId: alert.id,
                callerType: userType === 'DRIVER' ? 'CAPTAIN' : 'PASSENGER',
                callerUserId: userId,
                location,
                trackingUrl,
                rewardPoints,
                message: `🚨 DISTRESS ALERT: A fellow ${userType === 'DRIVER' ? 'Captain' : 'Passenger'} needs assistance nearby! Earn ${rewardPoints} Good Samaritan Points by responding.`,
                nearbyCaptainsSummary: nearbyCaptains.map((c) => ({
                    name: c.name,
                    distanceKm: c.distanceKm,
                })),
            };

            this.sosGateway.sendNearbyCaptainsDistressAlert(captainUserIds, distressBroadcastPayload);
            this.logger.log(
                `[SOSService] Dispatched Universal Proximity Mesh alert to ${captainUserIds.length} nearby Captains.`
            );
        }

        // 6. Automatic Occurrence Book Logging & Instant Distress Fee Debit
        if (this.prisma) {
            try {
                let driverProfileId: string | null = null;
                if (userType === 'DRIVER') {
                    const d = await this.prisma.driverProfile.findFirst({ where: { userId } });
                    driverProfileId = d?.id || null;

                    // Option A Approved: Instant Wallet Debit with Negative Balance Allowance
                    if (driverProfileId) {
                        try {
                            await this.prisma.transactionLedger.create({
                                data: {
                                    driverId: driverProfileId,
                                    amount: 500,
                                    balanceBefore: 0,
                                    balanceAfter: -500,
                                    type: 'DEBIT',
                                    transactionType: 'SOS_DISTRESS_FEE',
                                    description: `Emergency SOS distress call fee billed for alert #${alertId}. Captain may request pardon from Senior Cabi Distress Official.`,
                                    referenceId: alertId,
                                    referenceType: 'SOS_INCIDENT',
                                }
                            });
                            this.logger.warn(`[SOSService] ⚠️ Debited KES 500 emergency distress fee from Captain ${userId} for alert #${alertId}.`);
                        } catch (ledgerErr: any) {
                            this.logger.warn(`Could not persist distress fee ledger: ${ledgerErr.message}`);
                        }
                    }
                }

                await this.prisma.occurrence.create({
                    data: {
                        obNumber: `OB-SOS-${Date.now()}`,
                        category: 'SAFETY_VIOLATION',
                        severity: 'CRITICAL',
                        title: `SOS Emergency Signal — ${userType === 'DRIVER' ? 'Captain' : 'Passenger'} (${userId})`,
                        description: `Distress signal received at coordinates [${location.lat}, ${location.lng}] on trip ${tripId}. ${isDriver ? 'KES 500 distress fee billed (pardon request available). ' : ''}Group Distress Patron notified. Universal proximity mesh broadcast to ${nearbyCaptains.length} nearby Captains.`,
                        driverId: driverProfileId,
                        passengerId: userType === 'PASSENGER' ? userId : null,
                        rideId: tripId,
                        occurrenceDate: new Date(),
                        occurrenceTime: new Date(),
                        occurredAt: new Date(),
                        locationLat: location.lat,
                        locationLng: location.lng,
                        source: 'SOS_SYSTEM',
                        registeredById: userId,
                        status: 'OPEN',
                    },
                });
                this.logger.log(`[SOSService] Formal Occurrence Book record created for ${alert.id}`);
            } catch (err: any) {
                this.logger.error(`[SOSService] Error logging to Occurrence Book: ${err.message}`);
            }
        }

        return alert;
    }

    /**
     * Good Samaritan Captain Response: Acknowledges call and awards redeemable reward points
     */
    async respondAsGoodSamaritan(alertId: string, captainUserId: string, captainName: string) {
        const alert = this.alerts.find((a) => a.id === alertId);
        if (!alert) throw new Error('Alert not found');

        alert.status = 'RESPONDING';
        const points = this.penaltyConfig.goodSamaritanPoints || 500;

        const responders = this.respondingCaptains.get(alertId) || [];
        responders.push({
            captainId: captainUserId,
            captainName,
            respondedAt: new Date(),
            pointsAwarded: points,
        });
        this.respondingCaptains.set(alertId, responders);

        // Credit points to Captain's reward wallet ledger if Prisma is active
        if (this.prisma) {
            try {
                const driver = await this.prisma.driverProfile.findFirst({ where: { userId: captainUserId } });
                if (driver) {
                    await this.prisma.transactionLedger.create({
                        data: {
                            driverId: driver.id,
                            amount: points,
                            balanceBefore: 0,
                            balanceAfter: points,
                            type: 'CREDIT',
                            transactionType: 'GOOD_SAMARITAN_POINTS',
                            description: `Good Samaritan Points awarded for responding to emergency distress call #${alertId}`,
                            referenceId: alertId,
                            referenceType: 'SOS_INCIDENT',
                        },
                    });
                }
            } catch (e: any) {
                this.logger.warn(`Could not persist Good Samaritan points ledger: ${e.message}`);
            }
        }

        this.logger.log(`[SOSService] 🌟 Captain ${captainName} (${captainUserId}) responded to alert #${alertId}! Awarded ${points} Good Samaritan Points.`);
        return {
            success: true,
            alertId,
            pointsAwarded: points,
            message: `Thank you Captain! You have been awarded ${points} Good Samaritan Points, redeemable for fuel credits or Sacco share capital.`,
        };
    }

    async getAlerts(): Promise<SOSAlert[]> {
        return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async getRespondingCaptains(alertId: string) {
        return this.respondingCaptains.get(alertId) || [];
    }

    async acknowledgeAlert(alertId: string, adminId: string): Promise<SOSAlert> {
        const alert = this.alerts.find((a) => a.id === alertId);
        if (!alert) throw new Error('Alert not found');
        alert.status = 'ACKNOWLEDGED';
        alert.handledBy = adminId;
        return alert;
    }

    async resolveAlert(alertId: string, notes: string, isMisuse: boolean): Promise<SOSAlert> {
        const alert = this.alerts.find((a) => a.id === alertId);
        if (!alert) throw new Error('Alert not found');
        if (!notes.trim()) throw new Error('Resolution notes are required');

        alert.status = 'RESOLVED';
        alert.resolutionNotes = notes;
        alert.isMisuse = isMisuse;

        this.logger.log(`[SOSService] Alert ${alertId} resolved. Status: ${isMisuse ? 'MISUSE' : 'LEGITIMATE'}`);
        return alert;
    }

    async getPenaltyConfig(): Promise<SosPenaltyConfig> {
        return this.penaltyConfig;
    }

    async updatePenaltyConfig(config: SosPenaltyConfig): Promise<SosPenaltyConfig> {
        this.penaltyConfig = { ...this.penaltyConfig, ...config };
        return this.penaltyConfig;
    }

    /**
     * Distressed driver submits a pardon request for the KES 500 distress fee
     */
    async requestDistressPardon(alertId: string, driverUserId: string, reason: string) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) throw new Error('Alert not found');
        if (alert.userId !== driverUserId) throw new Error('Unauthorized: only distressed driver can request pardon');

        alert.distressFeeStatus = 'PARDON_REQUESTED';
        alert.pardonReason = reason;
        alert.pardonRequestedAt = new Date();

        this.logger.log(`[SOSService] 📝 Driver ${driverUserId} requested pardon for distress fee on alert #${alertId}. Reason: "${reason}"`);

        return {
            success: true,
            alertId,
            distressFeeStatus: 'PARDON_REQUESTED',
            message: 'Pardon request submitted successfully. Queued for Senior Cabi Distress Official review.'
        };
    }

    /**
     * Senior Cabi Distress Official reviews and grants or declines the pardon
     */
    async pardonDistressFee(
        alertId: string,
        options: {
            seniorOfficialId: string;
            seniorOfficialName: string;
            approved: boolean;
            notes: string;
        }
    ) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) throw new Error('Alert not found');

        const { seniorOfficialId, seniorOfficialName, approved, notes } = options;

        if (approved) {
            alert.distressFeeStatus = 'PARDONED';
            alert.pardonedAt = new Date();
            alert.pardonedByOfficial = seniorOfficialName;
            alert.pardonNotes = notes;

            // Option A Approved: Full Waiver + Sacco Buffer Backstop
            // KES 500 is credited back to driver. 500 Good Samaritan responder points absorbed by Sacco Welfare Buffer.
            if (this.prisma) {
                try {
                    const driver = await this.prisma.driverProfile.findFirst({ where: { userId: alert.userId } });
                    if (driver) {
                        await this.prisma.transactionLedger.create({
                            data: {
                                driverId: driver.id,
                                amount: 500,
                                balanceBefore: -500,
                                balanceAfter: 0,
                                type: 'CREDIT',
                                transactionType: 'DISTRESS_FEE_PARDON',
                                description: `Full waiver of KES 500 distress fee granted by Senior Cabi Distress Official ${seniorOfficialName}. Reason: "${notes}". Responder points covered by Sacco Emergency Welfare Buffer.`,
                                referenceId: alertId,
                                referenceType: 'PARDON_WAIVER',
                            }
                        });
                    }
                } catch (e: any) {
                    this.logger.warn(`Could not persist pardon credit ledger: ${e.message}`);
                }
            }

            this.logger.log(`[SOSService] 🛡️ Senior Cabi Distress Official ${seniorOfficialName} APPROVED pardon for alert #${alertId}. KES 500 refunded to Captain.`);

            return {
                success: true,
                alertId,
                distressFeeStatus: 'PARDONED',
                pardonedBy: seniorOfficialName,
                message: `Pardon approved by ${seniorOfficialName}. KES 500 fee 100% credited back to Captain. Sacco Emergency Welfare Buffer activated for responder pool.`
            };
        } else {
            alert.distressFeeStatus = 'SETTLED';
            alert.pardonNotes = `Pardon rejected by ${seniorOfficialName}: ${notes}`;

            this.logger.log(`[SOSService] ❌ Senior Cabi Distress Official ${seniorOfficialName} DECLINED pardon for alert #${alertId}. KES 500 distress fee upheld.`);

            return {
                success: false,
                alertId,
                distressFeeStatus: 'SETTLED',
                message: `Pardon declined by ${seniorOfficialName}. KES 500 distress fee upheld.`
            };
        }
    }
}
