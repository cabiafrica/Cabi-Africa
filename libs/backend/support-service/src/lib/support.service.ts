import { Injectable } from '@nestjs/common';

export interface Ticket {
    id: string;
    userId: string;
    userType: 'PASSENGER' | 'DRIVER';
    subject: string;
    category: string;
    description: string;
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    tags: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    slaDueAt: Date;
    assignedAgentId?: string;
    csatRating?: number;
    createdAt: Date;
    updatedAt: Date;
    conversation: TicketMessage[];
}

export interface TicketMessage {
    sender: 'USER' | 'AGENT';
    text: string;
    timestamp: Date;
}

@Injectable()
export class SupportService {
    private tickets: Ticket[] = [];
    private categories: string[] = ['Payment Issue', 'Lost Item', 'Account Issue', 'Ride Feedback', 'Other'];
    private cannedResponses = new Map<string, string>();

    constructor() {
        // Story 62.8: Canned Responses
        this.cannedResponses.set('greeting', 'Hi there! Thanks for reaching out to Cabi Support.');
        this.cannedResponses.set('closing', 'Let us know if you need anything else. Safe rides!');
        this.cannedResponses.set('refund_processed', 'We have processed your refund. It should appear in 3-5 days.');
    }

    // --- CLIENT FACING ---

    async getMyTickets(userId: string) {
        return this.tickets.filter(t => t.userId === userId).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async getTicket(userId: string, ticketId: string) {
        // Basic authorization check
        return this.tickets.find(t => t.id === ticketId && t.userId === userId);
    }

    async createTicket(userId: string, userType: 'PASSENGER' | 'DRIVER', subject: string, category: string, description: string) {
        // Story 62.5: Automated Tagging
        const tags = [];
        if (description.toLowerCase().includes('urgent') || description.toLowerCase().includes('safety')) tags.push('safety');
        if (category === 'Payment Issue') tags.push('financial');

        // Story 62.7: SLA Tracking (Safety = 1h, Payment = 24h, Default = 48h)
        const now = new Date();
        let slaHours = 48;
        if (tags.includes('safety')) slaHours = 1;
        else if (tags.includes('financial')) slaHours = 24;

        const slaDueAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

        const newTicket: Ticket = {
            id: `ticket_${Date.now()}`,
            userId,
            userType,
            subject,
            category,
            description,
            status: 'NEW',
            tags,
            priority: tags.includes('safety') ? 'CRITICAL' : 'MEDIUM',
            slaDueAt,
            createdAt: now,
            updatedAt: now,
            conversation: [
                { sender: 'USER', text: description, timestamp: now } // Initial message is the description
            ]
        };
        this.tickets.push(newTicket);
        return newTicket;
    }

    async replyToTicket(userId: string, ticketId: string, text: string) {
        const ticket = this.tickets.find(t => t.id === ticketId && t.userId === userId);
        if (!ticket) throw new Error('Ticket not found');

        ticket.conversation.push({ sender: 'USER', text, timestamp: new Date() });
        ticket.updatedAt = new Date();
        // Re-open if resolved?
        if (ticket.status === 'RESOLVED') ticket.status = 'IN_PROGRESS';

        return ticket;
    }

    // Story 62.4: CSAT Survey
    async submitCsat(userId: string, ticketId: string, rating: number) {
        const ticket = this.tickets.find(t => t.id === ticketId && t.userId === userId);
        if (!ticket) throw new Error('Ticket not found');
        if (ticket.status !== 'RESOLVED') throw new Error('Ticket must be resolved to rate');
        ticket.csatRating = rating;
        return { status: 'rated' };
    }

    async getCategories() {
        return this.categories;
    }

    // --- ADMIN FACING ---

    async getAllTickets(status?: string, tag?: string) {
        let result = this.tickets;
        if (status) result = result.filter(t => t.status === status);
        if (tag) result = result.filter(t => t.tags.includes(tag));
        return result.sort((a, b) => a.slaDueAt.getTime() - b.slaDueAt.getTime()); // Sort by SLA urgency
    }

    async adminGetTicket(ticketId: string) {
        return this.tickets.find(t => t.id === ticketId);
    }

    async adminReply(ticketId: string, text: string, cannedKey?: string) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) throw new Error('Ticket not found');

        let replyText = text;
        if (cannedKey && this.cannedResponses.has(cannedKey)) {
            replyText = this.cannedResponses.get(cannedKey) + ' ' + text;
        }

        ticket.conversation.push({ sender: 'AGENT', text: replyText, timestamp: new Date() });
        ticket.updatedAt = new Date();
        return ticket;
    }

    async updateStatus(ticketId: string, status: any) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) throw new Error('Ticket not found');
        ticket.status = status;
        return ticket;
    }

    // Story 62.6: Ticket Merging
    async mergeTickets(primaryTicketId: string, secondaryTicketIds: string[]) {
        const primary = this.tickets.find(t => t.id === primaryTicketId);
        if (!primary) throw new Error("Primary ticket not found");

        secondaryTicketIds.forEach(sid => {
            const secondary = this.tickets.find(t => t.id === sid);
            if (secondary) {
                // Move messages
                primary.conversation.push(...secondary.conversation);
                secondary.status = 'CLOSED';
                secondary.tags.push('merged');
            }
        });
        // Sort convo by time
        primary.conversation.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return primary;
    }

    // Story 62.8: Get Canned Responses
    async getCannedResponses() {
        return Array.from(this.cannedResponses.entries()).map(([key, value]) => ({ key, value }));
    }

    // Story 62.10: Performance Stats
    async getPerformanceStats() {
        // Mock stats
        return {
            avgResponseTimeMinutes: 45,
            ticketsResolvedLast24h: 120,
            avgCsat: 4.8,
            slaBreachCount: 2
        };
    }

    // Story 48.1: Driver Chat
    private chatRooms = new Map<string, any[]>(); // roomId -> messages

    async getChatRooms(location: string) {
        // Real implementation would return nearby rooms based on location
        return [];
    }

    async sendChatMessage(roomId: string, senderId: string, text: string, type: 'TEXT' | 'HELP_REQUEST' = 'TEXT') {
        const messages = this.chatRooms.get(roomId) || [];
        const message = {
            id: `msg_${Date.now()}`,
            senderId,
            text: this.filterProfanity(text),
            type,
            timestamp: new Date()
        };
        messages.push(message);
        this.chatRooms.set(roomId, messages);
        return message;
    }

    async getChatMessages(roomId: string) {
        return this.chatRooms.get(roomId) || [];
    }

    private filterProfanity(text: string) {
        return text.replace(/badword/gi, '****');
    }

    // Story 24.3: Admin Chat
    async sendAdminMessage(ticketId: string, agentId: string, text: string) {
        // Logic to send message as agent
        const ticket = await this.adminReply(ticketId, text);
        // In real app: Notify user via push/socket
        return ticket;
    }

    // Story 24.4: Contextual Info
    async getContextualInfo(userId: string, tripId?: string) {
        // Full implementation will fetch aggregation from UserService and RideService
        return {
            user: null,
            trip: null
        };
    }
}
