import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { SupportService, CreateTicketDto, TicketReplyDto } from './support.service';
import { JwtAuthGuard, Public } from '@cabi/backend/rbac';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Public()
  @Get('categories')
  getCategories() {
    return this.supportService.getCategories();
  }

  // --- CLIENT ENDPOINTS ---

  @Public()
  @Post('tickets')
  async createTicket(@Body() body: CreateTicketDto, @Req() req: any) {
    const authenticatedUserId = req.user?.id || req.user?.userId;
    return this.supportService.createTicket(body, authenticatedUserId);
  }

  @Get('tickets/my')
  async getMyTickets(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.supportService.getMyTickets(userId);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string, @Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId;
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);

    if (!userId && !isAdmin) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.supportService.getTicket(userId || '', id, isAdmin);
  }

  @Post('tickets/:id/reply')
  async reply(
    @Param('id') id: string,
    @Body() body: TicketReplyDto & { userId?: string; senderName?: string },
    @Req() req: any
  ) {
    const userId = req.user?.id || req.user?.userId || body.userId;
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);
    const senderRole = isAdmin ? 'AGENT' : 'USER';
    const senderName = req.user?.fullName || req.user?.name || body.senderName || (isAdmin ? 'Support Desk' : 'Client');

    if (!userId && !isAdmin) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.supportService.replyToTicket(id, userId || 'agent', senderRole, senderName, body);
  }

  @Post('tickets/:id/csat')
  async submitCsat(
    @Param('id') id: string,
    @Body() body: { rating: number; feedback?: string },
    @Req() req: any
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.supportService.submitCsat(userId, id, body.rating, body.feedback);
  }

  // --- ADMIN & DISPATCH ENDPOINTS ---

  @Get('admin/tickets')
  async getAllTickets(@Req() req: any, @Query() query: any) {
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);
    if (req.user && !isAdmin) {
      throw new ForbiddenException('Admin privilege required');
    }
    return this.supportService.getAllTickets(query);
  }

  @Post('admin/tickets/:id/reply')
  async adminReply(@Param('id') id: string, @Body() body: TicketReplyDto, @Req() req: any) {
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);
    if (req.user && !isAdmin) {
      throw new ForbiddenException('Admin privilege required');
    }
    const agentName = req.user?.fullName || req.user?.name || 'Support Desk';
    const agentId = req.user?.id || 'agent';

    return this.supportService.replyToTicket(id, agentId, 'AGENT', agentName, body);
  }

  @Put('admin/tickets/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; assignedAgentId?: string }, @Req() req: any) {
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);
    if (req.user && !isAdmin) {
      throw new ForbiddenException('Admin privilege required');
    }
    return this.supportService.updateStatus(id, body.status, body.assignedAgentId);
  }

  @Public()
  @Get('admin/canned-responses')
  getCanned() {
    return this.supportService.getCannedResponses();
  }

  @Get('admin/performance')
  async getPerformance(@Req() req: any) {
    const role = (req.user?.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER', 'SUPPORT_AGENT'].includes(role);
    if (req.user && !isAdmin) {
      throw new ForbiddenException('Admin privilege required');
    }
    return this.supportService.getPerformanceStats();
  }
}
