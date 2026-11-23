import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface CreateTicketDto {
  userId?: string;
  userType?: string;
  subject: string;
  category: string;
  description: string;
  rideId?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface TicketReplyDto {
  text: string;
  attachments?: any[];
  isInternal?: boolean;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private categories: string[] = [
    'Payment Issue',
    'Lost Item',
    'Account Issue',
    'Ride Feedback',
    'Safety & Security',
    'Corporate Billing',
    'SACCO Inquiries',
    'Other'
  ];

  private cannedResponses = new Map<string, string>([
    ['greeting', 'Hello! Thank you for reaching out to Cabi Africa VIP Concierge & Support.'],
    ['closing', 'Please let us know if you require any further assistance. Safe travels!'],
    ['refund_processed', 'Your fare adjustment has been processed and returned to your Cabi Wallet.'],
    ['lost_item_investigating', 'We have alerted the captain and Sacco dispatch patrol regarding your reported item.'],
    ['safety_escalated', 'Your report has been escalated with priority to the Sacco Safety & Compliance team.']
  ]);

  constructor(private readonly prisma: PrismaService) {}

  getCategories(): string[] {
    return this.categories;
  }

  getCannedResponses(): Record<string, string> {
    return Object.fromEntries(this.cannedResponses);
  }

  // --- CLIENT ENDPOINTS ---

  async createTicket(dto: CreateTicketDto, authenticatedUserId?: string) {
    let resolvedUserId = authenticatedUserId || dto.userId;

    // If unauthenticated guest (e.g. from public contact form), look up or link to guest/prospect
    if (!resolvedUserId) {
      if (dto.contactEmail || dto.contactPhone) {
        const existing = await this.prisma.user.findFirst({
          where: {
            OR: [
              ...(dto.contactEmail ? [{ email: dto.contactEmail.toLowerCase().trim() }] : []),
              ...(dto.contactPhone ? [{ phone: dto.contactPhone.trim() }] : [])
            ]
          }
        });
        if (existing) {
          resolvedUserId = existing.id;
        }
      }
    }

    if (!resolvedUserId) {
      // Find or link to system guest user, or require authentication
      const systemGuest = await this.prisma.user.findFirst({
        where: { role: 'PASSENGER' }
      });
      resolvedUserId = systemGuest ? systemGuest.id : 'guest-user';
    }

    const descLower = (dto.description || '').toLowerCase();
    const isSafety = descLower.includes('urgent') || descLower.includes('safety') || dto.category === 'Safety & Security';
    const isFinancial = dto.category === 'Payment Issue' || dto.category === 'Corporate Billing';

    const now = new Date();
    let slaHours = 48;
    let priority = 'MEDIUM';

    if (isSafety) {
      slaHours = 1;
      priority = 'CRITICAL';
    } else if (isFinancial) {
      slaHours = 24;
      priority = 'HIGH';
    }

    const slaDueAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
    const ticketNumber = `TK-${Date.now().toString().slice(-6)}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: resolvedUserId,
        userType: dto.userType || 'PASSENGER',
        subject: dto.subject || 'Support Request',
        category: dto.category || 'Other',
        description: dto.description,
        status: 'NEW',
        priority,
        slaDueAt,
        rideId: dto.rideId,
        messages: {
          create: {
            senderId: resolvedUserId,
            senderRole: 'USER',
            senderName: 'Client',
            message: dto.description,
            isInternal: false
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    this.logger.log(`Created support ticket ${ticket.ticketNumber} for user ${resolvedUserId} [${priority}]`);
    return ticket;
  }

  async getMyTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getTicket(userId: string, ticketId: string, isAdmin = false) {
    const whereClause: any = { id: ticketId };
    if (!isAdmin) {
      whereClause.userId = userId;
    }

    const ticket = await this.prisma.supportTicket.findFirst({
      where: whereClause,
      include: {
        messages: {
          where: isAdmin ? {} : { isInternal: false },
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true
          }
        }
      }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }

    return ticket;
  }

  async replyToTicket(
    ticketId: string,
    senderId: string,
    senderRole: 'USER' | 'AGENT' | 'SYSTEM',
    senderName: string,
    replyDto: TicketReplyDto
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }

    // If client is replying, verify ownership
    if (senderRole === 'USER' && ticket.userId !== senderId) {
      throw new ForbiddenException('You do not have permission to reply to this ticket');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        senderRole,
        senderName: senderName || (senderRole === 'AGENT' ? 'Support Concierge' : 'Client'),
        message: replyDto.text,
        attachments: replyDto.attachments || [],
        isInternal: !!replyDto.isInternal
      }
    });

    // Update ticket status
    let nextStatus = ticket.status;
    if (senderRole === 'USER' && (ticket.status === 'RESOLVED' || ticket.status === 'NEW')) {
      nextStatus = 'IN_PROGRESS';
    } else if (senderRole === 'AGENT' && !replyDto.isInternal && ticket.status === 'NEW') {
      nextStatus = 'IN_PROGRESS';
    }

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: nextStatus,
        updatedAt: new Date()
      }
    });

    return message;
  }

  async submitCsat(userId: string, ticketId: string, rating: number, feedback?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, userId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        csatRating: Math.round(rating),
        csatFeedback: feedback || null
      }
    });
  }

  // --- ADMIN ENDPOINTS ---

  async getAllTickets(params: { status?: string; category?: string; priority?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;
    if (params.priority) where.priority = params.priority;

    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 50;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.supportTicket.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateStatus(ticketId: string, status: string, assignedAgentId?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(assignedAgentId !== undefined ? { assignedAgentId } : {})
      }
    });
  }

  async getPerformanceStats() {
    const now = new Date();
    const [total, resolved, open, breachedSla, avgCsat] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
      this.prisma.supportTicket.count({
        where: {
          status: { in: ['NEW', 'IN_PROGRESS'] },
          slaDueAt: { lt: now }
        }
      }),
      this.prisma.supportTicket.aggregate({
        _avg: { csatRating: true },
        where: { csatRating: { not: null } }
      })
    ]);

    return {
      totalTickets: total,
      resolvedTickets: resolved,
      openTickets: open,
      breachedSlaTickets: breachedSla,
      averageCsat: Number(avgCsat._avg.csatRating?.toFixed(2)) || 5.0,
      slaComplianceRate: total > 0 ? Number((((total - breachedSla) / total) * 100).toFixed(1)) : 100
    };
  }
}
