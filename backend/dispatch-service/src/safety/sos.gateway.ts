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

@WebSocketGateway({
  cors: {
    origin: '*',
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

  handleConnection(client: Socket) {
    this.logger.log(`Safety socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedSockets.delete(client.id);
    this.logger.log(`Safety socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('registerClient')
  handleRegister(client: Socket, payload: { userId: string; role?: string }) {
    if (payload?.userId) {
      this.connectedSockets.set(client.id, payload.userId);
      client.join(`user_${payload.userId}`);
      if (['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(payload.role?.toUpperCase() || '')) {
        client.join('dispatch_ops_room');
      }
      this.logger.log(`Safety socket registered user ${payload.userId} (${payload.role || 'GUEST'})`);
    }
  }

  /**
   * Dispatches real-time distress alert to operations room and public safety stream
   */
  sendAlert(alert: SOSBroadcastAlert) {
    if (this.server) {
      this.server.to('dispatch_ops_room').emit('sos_alert', alert);
      this.server.emit('sos_alert', alert); // Global emergency alert stream for map pins
      this.logger.log(`[SOSGateway] Broadcasted sos_alert for incident #${alert.obNumber}`);
    }
  }

  /**
   * Dispatches hybrid distress signal to assigned Sacco Distress Patron
   */
  sendPatronDistressAlert(patron: any, alert: SOSBroadcastAlert, trackingUrl: string) {
    if (this.server) {
      this.server.emit('patron_distress_alert', {
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
