import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MockTripService } from './mock-trip.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your marketing website's domain
  },
  namespace: '/trip-tracking',
})
export class TripTrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('TripTrackingGateway');
  private clientTripMap = new Map<string, string>();

  constructor(
    private mockTripService: MockTripService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const tripId = this.clientTripMap.get(client.id);
    if (tripId) {
      this.logger.log(`Client ${client.id} for trip ${tripId} disconnected. Stopping simulation.`);
      this.mockTripService.stopTripSimulation(tripId);
      this.clientTripMap.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTripRoom')
  handleJoinRoom(client: Socket, tripId: string): void {
    this.logger.log(`Client ${client.id} joining room for trip ${tripId}`);
    client.join(tripId);
    this.clientTripMap.set(client.id, tripId);
    this.mockTripService.startTripSimulation(tripId);
  }

  // This method is for broadcasting location updates received from other services (e.g., dispatch)
  // For MVP, we can call this from a mock service to simulate updates.
  handleLocationUpdate(tripId: string, location: { lat: number; lng: number; eta: number }) {
    this.server.to(tripId).emit('locationUpdate', location);
    this.logger.log(`Emitted location update to room ${tripId}`);
  }
}