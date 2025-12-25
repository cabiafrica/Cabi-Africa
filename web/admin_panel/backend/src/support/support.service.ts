import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

// Mock data - in a real implementation, this would come from a database
const mockTickets = [
  {
    id: 'TKT-001',
    subject: 'Lost Item Report',
    user: { id: 'user-456', name: 'Alice Johnson', email: 'alice@example.com' },
    status: 'New',
    category: 'Lost Item',
    createdAt: '2024-08-11T14:05:00Z',
    history: [
      { sender: 'Alice Johnson', message: 'I left my phone in the car.', timestamp: '2024-08-11T14:05:00Z' },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'My ride fare was incorrect',
    user: { id: 'user-123', name: 'John Doe', email: 'john.doe@example.com' },
    status: 'Open',
    category: 'Payment Dispute',
    createdAt: '2024-08-11T10:00:00Z',
    history: [
      { sender: 'John Doe', message: 'Hi, I think my last ride was overcharged. Can you please look into it?', timestamp: '2024-08-11T10:00:00Z' },
      { sender: 'Support Agent', message: 'Hello John, I am looking into your request now.', isInternalNote: true, timestamp: '2024-08-11T10:05:00Z' },
    ],
  },
  {
    id: 'TKT-003',
    subject: 'Feature Suggestion: Dark Mode',
    user: { id: 'user-789', name: 'Charlie Brown', email: 'charlie@example.com' },
    status: 'Closed',
    category: 'Suggestion',
    createdAt: '2024-08-10T18:30:00Z',
    history: [
      { sender: 'Charlie Brown', message: 'The app needs a dark mode!', timestamp: '2024-08-10T18:30:00Z' },
      { sender: 'Support Agent', message: 'Thanks for the suggestion! We have added it to our product backlog.', timestamp: '2024-08-10T18:35:00Z' },
    ],
  },
  {
    id: 'TKT-004',
    subject: 'Driver was unprofessional',
    user: { id: 'user-101', name: 'Diana Prince', email: 'diana@example.com' },
    status: 'Open',
    category: 'Driver Feedback',
    createdAt: '2024-08-11T13:00:00Z',
    history: [
      { sender: 'Diana Prince', message: 'The driver was rude and took a longer route.', timestamp: '2024-08-11T13:00:00Z' },
    ],
  },
];

interface FindAllParams {
  page: number;
  limit: number;
  status?: string;
  category?: string;
}

@Injectable()
export class SupportService {
  private tickets = [...mockTickets];

  findAll(params: FindAllParams) {
    let filteredTickets = this.tickets;

    if (params.status) {
      filteredTickets = filteredTickets.filter(t => t.status === params.status);
    }
    if (params.category) {
      filteredTickets = filteredTickets.filter(t => t.category === params.category);
    }

    const paginatedTickets = filteredTickets.slice((params.page - 1) * params.limit, params.page * params.limit);

    return {
      data: paginatedTickets,
      total: filteredTickets.length,
      page: params.page,
      limit: params.limit,
    };
  }

  findById(id: string) {
    const ticket = this.tickets.find(t => t.id === id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }
    return ticket;
  }

  addReply(id: string, message: string, agentName: string) {
    const ticket = this.findById(id);
    ticket.history.push({
      sender: agentName,
      message,
      timestamp: new Date().toISOString(),
    });
    ticket.status = 'Open'; // Replying re-opens a ticket if it was new
    return ticket;
  }

  addInternalNote(id: string, message: string, agentName: string) {
    const ticket = this.findById(id);
    ticket.history.push({
      sender: agentName,
      message,
      isInternalNote: true,
      timestamp: new Date().toISOString(),
    });
    return ticket;
  }

  updateStatus(id: string, status: string) {
    const ticket = this.findById(id);

    const suggestionStatuses = ['Under Review', 'Planned', 'Implemented'];
    if (suggestionStatuses.includes(status) && ticket.category !== 'Suggestion') {
      throw new BadRequestException(
        `Status "${status}" can only be applied to tickets with the 'Suggestion' category.`
      );
    }

    ticket.status = status;
    // Add a history item for the status change
    ticket.history.push({
      sender: 'System',
      message: `Status changed to ${status}`,
      isInternalNote: true,
      timestamp: new Date().toISOString(),
    });
    return ticket;
  }
}