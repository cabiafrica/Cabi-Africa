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
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '@cabi/backend/database';

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

    private verifySocketUser(client: Socket): { userId: string; driverProfileId?: string; role: string } | null {
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
            return {
                userId,
                driverProfileId: decoded?.driverProfileId || decoded?.driverProfile?.id,
                role: String(decoded?.role || 'USER').toUpperCase(),
            };
        } catch {
            return null;
        }
    }

    private isAuthorizedForDriver(client: Socket, driverId: string): boolean {
        const user = client.data?.user;
        if (!user) return false;
        if (['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(user.role)) return true;
        return user.role === 'DRIVER' && (user.userId === driverId || user.driverProfileId === driverId);
    }

    handleConnection(client: Socket, ...args: any[]) {
        const user = this.verifySocketUser(client);
        if (!user) {
            this.logger.warn(`Rejected unauthenticated dispatch socket: ${client.id}`);
            client.disconnect(true);
            return;
        }
        client.data = { ...(client.data || {}), user };
        this.logger.log(`Client authenticated: ${client.id} (${user.userId}, ${user.role})`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinDispatchMonitor')
    handleJoinDispatchMonitor(client: Socket): void {
        const role = client.data?.user?.role;
        if (!['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role)) {
            this.logger.warn(`Blocked unauthorized joinDispatchMonitor from socket ${client.id} (${role || 'ANON'})`);
            return;
        }
        client.join('dispatch-monitors');
        this.logger.log(`Client ${client.id} joined dispatch-monitors room`);
    }

    @SubscribeMessage('joinTrip')
    handleJoinTrip(client: Socket, tripId: string): void {
        if (!client.data?.user || !tripId || typeof tripId !== 'string') return;
        this.logger.log(`Client ${client.id} joining room for trip ${tripId}`);
        client.join(tripId);
    }

    @SubscribeMessage('updateDriverLocation')
    async handleUpdateLocation(
        client: Socket,
        payload: { driverId: string; tripId?: string; lat: number; lng: number }
    ): Promise<void> {
        if (!payload || !payload.driverId) return;
        if (!this.isAuthorizedForDriver(client, payload.driverId)) {
            this.logger.warn(`Blocked unauthorized updateDriverLocation for driver ${payload.driverId} from socket ${client.id}`);
            return;
        }
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
        if (!driverId || typeof driverId !== 'string' || !this.isAuthorizedForDriver(client, driverId)) return;
        await this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { isOnline: true },
        });
        this.server.to('dispatch-monitors').emit('driverStatusUpdate', { driverId, isOnline: true });
        this.logger.log(`Driver ${driverId} is now ONLINE`);
    }

    @SubscribeMessage('driverGoOffline')
    async handleDriverOffline(client: Socket, driverId: string): Promise<void> {
        if (!driverId || typeof driverId !== 'string' || !this.isAuthorizedForDriver(client, driverId)) return;
        await this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { isOnline: false },
        });
        this.server.to('dispatch-monitors').emit('driverStatusUpdate', { driverId, isOnline: false });
        this.logger.log(`Driver ${driverId} is now OFFLINE`);
    }

    @SubscribeMessage('driverJoinRoom')
    handleDriverJoinRoom(client: Socket, driverId: string) {
        if (!driverId || typeof driverId !== 'string' || !this.isAuthorizedForDriver(client, driverId)) return;
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
