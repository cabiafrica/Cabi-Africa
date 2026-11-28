import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

export interface SOSBroadcastAlert {
  alertId: string;
  occurrenceId: string;
  obNumber: string;
  userId: string;
  userType: 'PASSENGER' | 'DRIVER';
  location: { lat: number; lng: number };
  tripId: string;
  timestamp: Date;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED';
  notifiedCaptainsCount: number;
  goodSamaritanRewardPoints: number;
  distressFee?: number;
  distressFeeStatus?: string;
  groupDistressPatron?: any;
  trackingUrl: string;
}

const WS_ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ||
  'https://cabi.africa,https://app.cabi.africa,https://admin.cabi.africa,https://dispatch.cabi.africa'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' ? WS_ALLOWED_ORIGINS : [...WS_ALLOWED_ORIGINS, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/sos',
})
export class SOSGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SOSGateway.name);
  private connectedSockets = new Map<string, string>(); // socketId -> userId

  afterInit(server: Server) {
    this.logger.log('🚨 SOS Real-Time Emergency Gateway Initialized on namespace /sos');
  }

  private verifySocketToken(client: Socket): { userId: string; role: string } | null {
    const rawToken =
      client.handshake?.auth?.token ||
      (typeof client.handshake?.headers?.authorization === 'string'
        ? client.handshake.headers.authorization.replace(/^Bearer\s+/i, '').trim()
        : undefined);
    const secret =
      process.env.JWT_SECRET ||
      process.env.SUPABASE_JWT_SECRET ||
      (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
    if (!rawToken || !secret) return null;
    try {
      const decoded = jwt.verify(String(rawToken), secret) as any;
      const userId = String(decoded?.sub || decoded?.id || decoded?.userId || '');
      if (!userId) return null;
      return { userId, role: String(decoded?.role || 'USER').toUpperCase() };
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const verified = this.verifySocketToken(client);
    if (!verified) {
      this.logger.warn(`Rejected unauthenticated safety socket: ${client.id}`);
      client.disconnect(true);
      return;
    }
    client.data = { ...(client.data || {}), user: verified };
    this.connectedSockets.set(client.id, verified.userId);
    client.join(`user_${verified.userId}`);
    if (['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(verified.role)) {
      client.join('dispatch_ops_room');
    }
    this.logger.log(`Safety socket authenticated: ${client.id} (${verified.userId}, ${verified.role})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedSockets.delete(client.id);
    this.logger.log(`Safety socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('registerClient')
  handleRegister(client: Socket, _payload: { userId?: string; role?: string }) {
    const verified = client.data?.user || this.verifySocketToken(client);
    if (!verified) {
      this.logger.warn(`Blocked unauthenticated registerClient from socket ${client.id}`);
      client.disconnect(true);
      return;
    }
    this.connectedSockets.set(client.id, verified.userId);
    client.join(`user_${verified.userId}`);
    if (['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(verified.role)) {
      client.join('dispatch_ops_room');
    }
    this.logger.log(`Safety socket registered verified user ${verified.userId} (${verified.role})`);
  }

  /**
   * Dispatches real-time distress alert to operations room and affected user room
   */
  sendAlert(alert: SOSBroadcastAlert) {
    if (this.server) {
      this.server.to('dispatch_ops_room').emit('sos_alert', alert);
      if (alert?.userId) {
        this.server.to(`user_${alert.userId}`).emit('sos_alert', alert);
      }
      this.logger.log(`[SOSGateway] Broadcasted sos_alert for incident #${alert.obNumber}`);
    }
  }

  /**
   * Dispatches hybrid distress signal to assigned Legacy Program Distress Patron and operations room
   */
  sendPatronDistressAlert(patron: any, alert: SOSBroadcastAlert, trackingUrl: string) {
    if (this.server) {
      this.server.to('dispatch_ops_room').emit('patron_distress_alert', {
        patron,
        alert,
        trackingUrl,
        priority: 'URGENT',
        audioChime: 'PATRON_DISTRESS_KLAXON',
      });
      if (patron?.id) {
        this.server.to(`user_${patron.id}`).emit('patron_distress_alert', {
          patron,
          alert,
          trackingUrl,
          priority: 'URGENT',
        });
      }
    }
  }

  /**
   * Broadcasts proximity distress notification to targeted nearby Captains
   */
  sendNearbyCaptainsDistressAlert(captainUserIds: string[], distressPayload: any) {
    if (this.server) {
      // Send targeted message to each connected captain's room
      captainUserIds.forEach((uid) => {
        this.server.to(`user_${uid}`).emit('nearby_captains_distress', {
          ...distressPayload,
          priority: 'EMERGENCY_RESCUE',
        });
      });

      // Also emit to general proximity rescue channel
      this.server.emit('nearby_captains_distress', {
        captainUserIds,
        ...distressPayload,
        priority: 'EMERGENCY_RESCUE',
      });

      this.logger.log(
        `[SOSGateway] Dispatched nearby_captains_distress to ${captainUserIds.length} captains`
      );
    }
  }

  /**
   * Broadcasts when an alert has been acknowledged by a dispatcher
   */
  sendAcknowledge(occurrenceId: string, obNumber: string, adminId: string) {
    if (this.server) {
      this.server.emit('sos_acknowledged', {
        occurrenceId,
        obNumber,
        handledBy: adminId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Broadcasts when an alert is resolved or closed
   */
  sendResolution(occurrenceId: string, obNumber: string, outcome: string, notes: string) {
    if (this.server) {
      this.server.emit('sos_resolved', {
        occurrenceId,
        obNumber,
        outcome,
        notes,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Broadcasts when a Good Samaritan captain responds
   */
  sendResponderUpdate(occurrenceId: string, captainUserId: string, captainName: string) {
    if (this.server) {
      this.server.emit('sos_responder_update', {
        occurrenceId,
        captainUserId,
        captainName,
        timestamp: new Date(),
      });
    }
  }
}
