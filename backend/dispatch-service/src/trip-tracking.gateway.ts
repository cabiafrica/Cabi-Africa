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
import { PrismaService } from '@cabi/backend/database';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/trip-tracking',
})
export class TripTrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('TripTrackingGateway');

  constructor(private prisma: PrismaService) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTrip')
  handleJoinTrip(client: Socket, tripId: string): void {
    this.logger.log(`Client ${client.id} joining room for trip ${tripId}`);
    client.join(tripId);
  }

  @SubscribeMessage('updateDriverLocation')
  async handleUpdateLocation(
    client: Socket,
    payload: { driverId: string; tripId?: string; lat: number; lng: number }
  ): Promise<void> {
    const { driverId, tripId, lat, lng } = payload;

    try {
      await this.prisma.driverProfile.update({
        where: { id: driverId },
        data: { currentLocation: { lat, lng } as any },
      });
    } catch (e) {
      this.logger.error(`Failed to update driver location: ${e.message}`);
    }

    if (tripId) {
      this.server.to(tripId).emit('locationUpdate', { lat, lng });
    }
    // Broadcast globally for dispatch map
    this.server.emit('globalDriverUpdate', { driverId, lat, lng });
  }

  @SubscribeMessage('driverGoOnline')
  async handleDriverOnline(client: Socket, driverId: string): Promise<void> {
    await this.prisma.driverProfile.update({
      where: { id: driverId },
      data: { isOnline: true },
    });
    this.logger.log(`Driver ${driverId} is now ONLINE`);
  }

  @SubscribeMessage('driverGoOffline')
  async handleDriverOffline(client: Socket, driverId: string): Promise<void> {
    await this.prisma.driverProfile.update({
      where: { id: driverId },
      data: { isOnline: false },
    });
    this.logger.log(`Driver ${driverId} is now OFFLINE`);
  }

  /**
   * Broadcast a ride request to a specific driver
   */
  broadcastRideRequest(driverId: string, ride: any) {
    this.logger.log(`Broadcasting ride ${ride.id} to driver ${driverId}`);
    // Emit to specific driver room (assuming they join room 'driver_DRIVER_ID')
    // Or we can emit to all and filter on client, but better to be targeted.
    // Ideally duplicate socket connection logic to join driver room on connect.
    // For now, we'll try to emit to a room name convention
    this.server.to(`driver:${driverId}`).emit('newRideRequest', ride);

    // Fallback: emit global event for testing if room join isn't perfect yet
    this.server.emit(`driver:${driverId}:rideRequest`, ride);
  }

  @SubscribeMessage('driverJoinRoom')
  handleDriverJoinRoom(client: Socket, driverId: string) {
    client.join(`driver:${driverId}`);
    this.logger.log(`Driver ${driverId} joined personal room`);
  }
}
