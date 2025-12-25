import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {

    @SubscribeMessage('joinRoom')
    handleJoin(@MessageBody() rideId: string, @ConnectedSocket() client: Socket) {
        client.join(rideId);
        return { event: 'joined', rideId };
    }

    @SubscribeMessage('sendMessage')
    handleMessage(@MessageBody() payload: { rideId: string, message: string }, @ConnectedSocket() client: Socket) {
        // Broadcast to room
        client.to(payload.rideId).emit('newMessage', payload.message);
        console.log(`[Chat] Message in ${payload.rideId}: ${payload.message}`);
        return { status: 'sent' };
    }
}
