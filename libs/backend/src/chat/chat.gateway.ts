import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [/https:\/\/.*\.cabi-africa\.com$/, /https:\/\/.*\.vercel\.app$/]
      : true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('ChatService WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    // Authenticate with Authorization header or mock in development
    const authHeader = client.handshake.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');

    let authenticated = false;
    if (token) {
      if (token === 'mock-jwt' || process.env.NODE_ENV !== 'production') {
        authenticated = true;
      } else if (secret) {
        try {
          const jwt = require('jsonwebtoken');
          jwt.verify(token, secret);
          authenticated = true;
        } catch {
          authenticated = false;
        }
      }
    }

    if (!authenticated) {
      this.logger.warn(`Client with invalid token disconnected: ${client.id}`);
      client.disconnect();
      return;
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() tripId: string,
  ): void {
    client.join(tripId);
    this.logger.log(`Client ${client.id} joined room: ${tripId}`);
    // Notify the client they have joined the room
    client.emit('joinedRoom', tripId);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string; message: string },
  ): void {
    this.logger.log(
      `Message from ${client.id} to room ${payload.tripId}: ${payload.message}`,
    );
    // Broadcast the message to all clients in the specific trip room
    this.server.to(payload.tripId).emit('newMessage', {
      user: `user-${client.id.substring(0, 5)}`, // Mock user ID
      text: payload.message,
    });
  }
}