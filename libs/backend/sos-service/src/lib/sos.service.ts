import { Injectable } from '@nestjs/common';
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
    status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
    handledBy?: string;
    resolutionNotes?: string;
    isMisuse?: boolean;
}

export interface SosPenaltyConfig {
    type: 'SUSPENSION' | 'FEE';
    suspensionDurationDays?: number;
    feeAmount?: number;
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
        this.server.emit('sos_alert', alert);
    }
    
    sendOrgDistressAlert(userIds: string[], alert: any) {
        // In a real app, this would emit to specific user rooms. 
        // For now, emit a broadcast with intended recipients.
        this.server.emit('org_distress_alert', { userIds, alert });
    }
}

@Injectable()
export class SOSService {
    private alerts: SOSAlert[] = [];
    private penaltyConfig: SosPenaltyConfig = { type: 'FEE', feeAmount: 500 };

    constructor(
        private readonly sosGateway: SOSGateway,
        private readonly prisma?: PrismaService
    ) {
        // Seed data
        this.alerts.push({
            id: 'alert_1',
            userId: 'user_x',
            userType: 'DRIVER',
            location: { lat: 40.7128, lng: -74.0060 },
            tripId: 'trip_123',
            timestamp: new Date(),
            status: 'NEW'
        });
    }

    async createAlert(userId: string, userType: 'PASSENGER' | 'DRIVER', location: { lat: number, lng: number }, tripId: string) {
        const alert: SOSAlert = {
            id: `alert_${Date.now()}`,
            userId,
            userType,
            location,
            tripId,
            timestamp: new Date(),
            status: 'NEW'
        };
        this.alerts.push(alert);
        this.sosGateway.sendAlert(alert);
        console.log(`[SOSService] New Alert Created: ${alert.id} from ${userType} ${userId}`);

        if (this.prisma && userType === 'DRIVER') {
            try {
                // Find driver's organization
                const driver = await this.prisma.driverProfile.findFirst({
                    where: { userId },
                    include: {
                        organizations: {
                            include: {
                                organization_members: true
                            }
                        }
                    }
                });

                if (driver?.organizations) {
                    const org = driver.organizations;
                    const responders = org.organization_members.filter(m => m.isDistressResponder && m.userId);
                    const allMembers = org.organization_members.filter(m => m.userId);

                    if (responders.length > 0) {
                        const responderIds = responders.map(r => r.userId!);
                        console.log(`[SOSService] Notifying Distress Responders for Org ${org.name}:`, responderIds);
                        this.sosGateway.sendOrgDistressAlert(responderIds, { ...alert, priority: 'HIGH', message: 'SOS Triggered by a member of your organization!' });
                    }

                    // Notify others
                    const otherMembers = allMembers.filter(m => !m.isDistressResponder && m.userId !== userId).map(m => m.userId!);
                    if (otherMembers.length > 0) {
                        console.log(`[SOSService] Notifying General Members for Org ${org.name}:`, otherMembers);
                        this.sosGateway.sendOrgDistressAlert(otherMembers, { ...alert, priority: 'LOW', message: 'A distress signal was triggered in your organization.' });
                    }
                }
            } catch (err) {
                console.error('[SOSService] Error processing organization distress routing:', err);
            }

            try {
                const driver = await this.prisma.driverProfile.findFirst({
                    where: { userId }
                });

                await this.prisma.occurrence.create({
                    data: {
                        obNumber: `OB-SOS-${Date.now()}`,
                        category: 'SAFETY_VIOLATION',
                        severity: 'CRITICAL',
                        title: `SOS Alert - ${userType} ${userId}`,
                        description: `Distress signal received from ${userType} at location: ${location.lat}, ${location.lng} for trip ${tripId}`,
                        driverId: userType === 'DRIVER' ? driver?.id : null,
                        passengerId: userType === 'PASSENGER' ? userId : null,
                        rideId: tripId,
                        occurrenceDate: new Date(),
                        occurrenceTime: new Date(),
                        occurredAt: new Date(),
                        locationLat: location.lat,
                        locationLng: location.lng,
                        source: 'SOS_SYSTEM',
                        registeredById: userId, 
                        status: 'OPEN'
                    }
                });
                console.log(`[SOSService] Formal entry in Occurrence Book created for alert ${alert.id}`);
            } catch (err) {
                console.error('[SOSService] Error creating Occurrence entry:', err);
            }
        }

        return alert;
    }

    async getAlerts() {
        return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async acknowledgeAlert(alertId: string, adminId: string) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) throw new Error("Alert not found");
        alert.status = 'ACKNOWLEDGED';
        alert.handledBy = adminId;
        return alert;
    }

    async resolveAlert(alertId: string, notes: string, isMisuse: boolean) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) throw new Error("Alert not found");
        if (!notes.trim()) throw new Error("Resolution notes are required");
        
        alert.status = 'RESOLVED';
        alert.resolutionNotes = notes;
        alert.isMisuse = isMisuse;
        
        console.log(`[SOSService] Alert ${alertId} resolved. Status: ${isMisuse ? 'MISUSE' : 'LEGITIMATE'}`);
        return alert;
    }

    async getPenaltyConfig() {
        return this.penaltyConfig;
    }

    async updatePenaltyConfig(config: SosPenaltyConfig) {
        this.penaltyConfig = config;
        return this.penaltyConfig;
    }
}
