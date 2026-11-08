import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@cabi/backend/database';

@WebSocketGateway({
    cors: {
        origin: '*', // Dynamic CORS handled by Gateway if needed, but for WebSockets we often allow all and rely on Auth
    },
    namespace: '/trip-tracking',
})
@Injectable()
export class DispatchGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('DispatchGateway');

    constructor(private readonly prisma: PrismaService) { }

    afterInit(server: Server) {
        this.logger.log('Dispatch Gateway Initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinDispatchMonitor')
    handleJoinDispatchMonitor(client: Socket): void {
        client.join('dispatch-monitors');
        this.logger.log(`Client ${client.id} joined dispatch-monitors room`);
    }

    @SubscribeMessage('joinTrip')
    handleJoinTrip(client: Socket, tripId: string): void {
        if (!tripId || typeof tripId !== 'string') return;
        this.logger.log(`Client ${client.id} joining room for trip ${tripId}`);
        client.join(tripId);
    }

    @SubscribeMessage('updateDriverLocation')
    async handleUpdateLocation(
        client: Socket,
        payload: { driverId: string; tripId?: string; lat: number; lng: number }
    ): Promise<void> {
        if (!payload || !payload.driverId) return;
        const { driverId, tripId, lat, lng } = payload;
        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
            return;
        }

        try {
            await this.prisma.driverProfile.update({
                where: { id: driverId },
                data: { currentLocation: { lat: Number(lat), lng: Number(lng) } as any },
            });
        } catch (e) {
            this.logger.error(`Failed to update driver location: ${e.message}`);
        }

        if (tripId) {
            this.server.to(tripId).emit('locationUpdate', { lat: Number(lat), lng: Number(lng) });
        }
        // Broadcast only to dispatch monitors room instead of all connected sockets
        this.server.to('dispatch-monitors').emit('globalDriverUpdate', { driverId, lat: Number(lat), lng: Number(lng) });
    }

    @SubscribeMessage('driverGoOnline')
    async handleDriverOnline(client: Socket, driverId: string): Promise<void> {
        if (!driverId || typeof driverId !== 'string') return;
        await this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { isOnline: true },
        });
        this.server.to('dispatch-monitors').emit('driverStatusUpdate', { driverId, isOnline: true });
        this.logger.log(`Driver ${driverId} is now ONLINE`);
    }

    @SubscribeMessage('driverGoOffline')
    async handleDriverOffline(client: Socket, driverId: string): Promise<void> {
        if (!driverId || typeof driverId !== 'string') return;
        await this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { isOnline: false },
        });
        this.server.to('dispatch-monitors').emit('driverStatusUpdate', { driverId, isOnline: false });
        this.logger.log(`Driver ${driverId} is now OFFLINE`);
    }

    @SubscribeMessage('driverJoinRoom')
    handleDriverJoinRoom(client: Socket, driverId: string) {
        if (!driverId || typeof driverId !== 'string') return;
        client.join(`driver:${driverId}`);
        this.logger.log(`Driver ${driverId} joined personal room`);
    }

    /**
     * Broadcast a ride request to a specific driver
     */
    broadcastRideRequest(driverId: string, ride: any) {
        this.logger.log(`Broadcasting ride ${ride.id} to driver ${driverId}`);
        this.server.to(`driver:${driverId}`).emit('newRideRequest', ride);
        this.server.to(`driver:${driverId}`).emit(`driver:${driverId}:rideRequest`, ride);
    }
}
