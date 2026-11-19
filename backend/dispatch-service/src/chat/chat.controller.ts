import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    let user = null;
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production'
          ? 'dev-only-jwt-secret-do-not-use-in-prod'
          : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }

    if (!user && process.env.NODE_ENV !== 'production') {
      const devUserId = req?.headers?.['x-user-id'] || 'dev-user';
      const devUserRole = (req?.headers?.['x-user-role'] as string) || 'PASSENGER';
      return { id: devUserId, role: devUserRole.toUpperCase(), fullName: 'Dev User' };
    }

    return user;
  }

  @Get('history/:tripId')
  async getTripHistory(@Param('tripId') tripId: string, @Req() req: any) {
    if (!tripId) {
      throw new BadRequestException('tripId is required');
    }

    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Valid authentication credentials required');
    }

    // Verify caller is an authorized participant or dispatcher
    await this.chatService.authorizeUserForTrip(
      user.id || user.sub,
      user.role || 'PASSENGER',
      tripId,
    );

    const history = this.chatService.getTripHistory(tripId);
    return {
      success: true,
      tripId,
      count: history.length,
      history,
    };
  }

  @Post('send')
  async sendMessage(
    @Body() body: { tripId: string; text: string },
    @Req() req: any,
  ) {
    if (!body?.tripId || !body?.text?.trim()) {
      throw new BadRequestException('tripId and text are required');
    }

    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Valid authentication credentials required');
    }

    const auth = await this.chatService.authorizeUserForTrip(
      user.id || user.sub,
      user.role || 'PASSENGER',
      body.tripId,
    );

    const { message, systemWarning } = this.chatService.saveMessage({
      tripId: body.tripId,
      senderId: user.id || user.sub,
      senderRole: auth.role,
      senderName: auth.senderName,
      text: body.text.trim(),
    });

    // Broadcast over WebSocket gateway
    const roomName = `trip_${body.tripId}`;
    if (this.chatGateway?.server) {
      this.chatGateway.server.to(roomName).emit('newMessage', message);
      if (systemWarning) {
        this.chatGateway.server.to(roomName).emit('newMessage', systemWarning);
      }
    }

    return {
      success: true,
      message,
      systemWarning,
    };
  }
}
