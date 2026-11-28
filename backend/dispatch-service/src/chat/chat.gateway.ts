import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ChatService, TripChatMessage } from './chat.service';

export interface ChatUserSession {
  userId: string;
  role: string;
  name: string;
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
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<string, ChatUserSession>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('💬 Real-Time In-Trip Chat Gateway initialized on namespace /chat');
  }

  handleConnection(client: Socket) {
    const rawToken =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
      (client.handshake.query?.token as string | undefined);

    const secret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== 'production'
        ? 'dev-only-jwt-secret-do-not-use-in-prod'
        : '');

    let userSession: ChatUserSession | null = null;

    if (rawToken && secret) {
      try {
        const decoded = jwt.verify(rawToken, secret) as any;
        userSession = {
          userId: decoded.id || decoded.sub || decoded.userId,
          role: (decoded.role || 'PASSENGER').toUpperCase(),
          name: decoded.name || decoded.fullName || 'User',
        };
      } catch (err: any) {
        this.logger.warn(`Handshake token validation failed: ${err.message}`);
      }
    }

    // In development or simulation mode, accept dev mock tokens
    if (!userSession && process.env.NODE_ENV !== 'production') {
      const mockRole = (client.handshake.query?.role as string) || 'PASSENGER';
      const mockId = (client.handshake.query?.userId as string) || `user-${client.id.substring(0, 6)}`;
      const mockName = (client.handshake.query?.name as string) || (mockRole === 'DRIVER' ? 'Captain' : 'Passenger');
      userSession = {
        userId: mockId,
        role: mockRole.toUpperCase(),
        name: mockName,
      };
    }

    if (!userSession) {
      this.logger.warn(`Unauthorized chat client connection rejected: ${client.id}`);
      client.emit('chatError', { code: 'UNAUTHORIZED', message: 'Valid JWT authentication required' });
      client.disconnect(true);
      return;
    }

    (client as any).data.user = userSession;
    this.connectedClients.set(client.id, userSession);
    this.logger.log(
      `Chat client connected: ${client.id} (user: ${userSession.userId}, role: ${userSession.role})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string } | string,
  ) {
    const tripId = typeof payload === 'string' ? payload : payload?.tripId;
    if (!tripId) {
      client.emit('chatError', { code: 'BAD_REQUEST', message: 'tripId is required' });
      return;
    }

    const session: ChatUserSession = (client as any).data?.user || this.connectedClients.get(client.id);
    if (!session) {
      client.emit('chatError', { code: 'UNAUTHORIZED', message: 'Client session missing' });
      return;
    }

    try {
      const auth = await this.chatService.authorizeUserForTrip(
        session.userId,
        session.role,
        tripId,
      );

      const roomName = `trip_${auth.rideId}`;
      client.join(roomName);

      // Store active room metadata on socket
      (client as any).data.activeTripId = auth.rideId;
      (client as any).data.activeRole = auth.role;
      (client as any).data.senderName = auth.senderName;

      this.logger.log(
        `Socket ${client.id} joined ${roomName} as ${auth.role} (${auth.senderName})`,
      );

      // Send join acknowledgement
      client.emit('joinedRoom', {
        tripId: auth.rideId,
        role: auth.role,
        senderName: auth.senderName,
      });

      // Synchronize existing transcript history to client
      const history = this.chatService.getTripHistory(auth.rideId);
      client.emit('roomHistory', {
        tripId: auth.rideId,
        history,
      });
    } catch (err: any) {
      this.logger.warn(`Join room forbidden for user ${session.userId} on trip ${tripId}: ${err.message}`);
      client.emit('chatError', {
        code: 'FORBIDDEN',
        message: err.message || 'Access denied for this trip room',
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string; text: string; clientMsgId?: string },
  ) {
    const tripId = payload?.tripId;
    const text = payload?.text?.trim();

    if (!tripId || !text) {
      client.emit('chatError', { code: 'BAD_REQUEST', message: 'tripId and text are required' });
      return;
    }

    const session: ChatUserSession = (client as any).data?.user || this.connectedClients.get(client.id);
    if (!session) {
      client.emit('chatError', { code: 'UNAUTHORIZED', message: 'Client session missing' });
      return;
    }

    const senderRole = (client as any).data?.activeRole || session.role;
    const senderName = (client as any).data?.senderName || session.name;

    const { message, systemWarning } = this.chatService.saveMessage({
      tripId,
      senderId: session.userId,
      senderRole: senderRole as any,
      senderName,
      text,
    });

    const roomName = `trip_${tripId}`;

    // Broadcast the sanitized message to both participants in the trip room
    this.server.to(roomName).emit('newMessage', message);

    // If PII was intercepted, broadcast safety notification to keep transactions on-platform
    if (systemWarning) {
      this.server.to(roomName).emit('newMessage', systemWarning);
      this.server.to(roomName).emit('safetyNotice', {
        tripId,
        warning: systemWarning.text,
      });
    }

    return { status: 'ok', messageId: message.id, wasRedacted: message.wasRedacted };
  }

  @SubscribeMessage('callSignal')
  handleCallSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    const tripId = payload?.tripId;
    const type = payload?.type;
    if (tripId && type) {
      this.logger.log(`[VoIP Signal] Relaying ${type} for trip ${tripId} from socket ${client.id}`);
      client.to(`trip_${tripId}`).emit('callSignal', payload);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string; isTyping: boolean },
  ) {
    if (!payload?.tripId) return;
    const session = (client as any).data?.user || this.connectedClients.get(client.id);
    const roomName = `trip_${payload.tripId}`;
    client.to(roomName).emit('userTyping', {
      tripId: payload.tripId,
      userId: session?.userId,
      role: (client as any).data?.activeRole || session?.role,
      isTyping: !!payload.isTyping,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string },
  ) {
    if (payload?.tripId) {
      client.leave(`trip_${payload.tripId}`);
    }
  }
}
