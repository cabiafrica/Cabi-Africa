import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  Header,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { VoiceService } from './voice.service';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

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

  /**
   * Triggers a masked cellular proxy call bridge between trip participants
   */
  @Post('bridge')
  async initiateMaskedBridge(
    @Body() body: { tripId: string },
    @Req() req: any,
  ) {
    if (!body?.tripId) {
      throw new BadRequestException('tripId is required');
    }

    const user = this.extractUser(req);
    if (!user) {
      throw new UnauthorizedException('Valid authentication credentials required');
    }

    return this.voiceService.initiateMaskedCallBridge(
      body.tripId,
      user.id || user.sub,
    );
  }

  /**
   * Retrieves the virtual proxy phone number for dialing
   */
  @Get('proxy-number/:tripId')
  getProxyNumber(@Param('tripId') tripId: string) {
    return {
      success: true,
      tripId,
      virtualProxyNumber: this.voiceService.getVirtualProxyNumber(),
      description: 'Cabi Africa Masked Dispatch Proxy',
    };
  }

  /**
   * Records a client-side WebRTC call session audit (e.g. normal hangup or ICE timeout)
   */
  @Post('log-audit')
  logCallAudit(
    @Body()
    body: {
      tripId: string;
      callerRole: 'PASSENGER' | 'DRIVER';
      receiverId?: string;
      durationSeconds: number;
      disconnectionReason: 'NORMAL_HANGUP' | 'REJECTED' | 'ICE_TIMEOUT' | 'CELLULAR_FALLBACK';
    },
    @Req() req: any,
  ) {
    const user = this.extractUser(req);
    return this.voiceService.logVoipSession({
      tripId: body.tripId || 'unknown',
      callerId: user?.id || user?.sub || 'anonymous',
      callerRole: body.callerRole || 'PASSENGER',
      receiverId: body.receiverId || 'peer',
      durationSeconds: body.durationSeconds || 0,
      disconnectionReason: body.disconnectionReason || 'NORMAL_HANGUP',
    });
  }

  /**
   * Africa's Talking Inbound Voice Webhook Callback (Returns Voice Action XML)
   */
  @Post('callback')
  @Header('Content-Type', 'application/xml')
  handleVoiceCallback(@Body() body: any, @Res() res: Response) {
    const xml = this.voiceService.handleVoiceCallback(body);
    return res.status(200).send(xml);
  }
}
