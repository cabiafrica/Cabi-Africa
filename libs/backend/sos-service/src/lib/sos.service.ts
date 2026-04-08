import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
}

@Injectable()
export class SOSService {
    private alerts: SOSAlert[] = [];
    private penaltyConfig: SosPenaltyConfig = { type: 'FEE', feeAmount: 500 };

    constructor(private readonly sosGateway: SOSGateway) {
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
