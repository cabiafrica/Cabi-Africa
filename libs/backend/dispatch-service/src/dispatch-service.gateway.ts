import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'trip-tracking',
})
@Injectable()
export class DispatchGateway {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('updateDriverLocation')
    handleDriverLocationUpdate(@MessageBody() data: { driverId: string; lat: number; lng: number }) {
        console.log(`Received location update from ${data.driverId}: ${data.lat}, ${data.lng}`);
        // Broadcast to dispatch panels
        this.server.emit('globalDriverUpdate', data);
    }
}
