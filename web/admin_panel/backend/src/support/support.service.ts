import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';



interface FindAllParams {
  page: number;
  limit: number;
  status?: string;
  category?: string;
}

@Injectable()
export class SupportService {
  private tickets: any[] = [];

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