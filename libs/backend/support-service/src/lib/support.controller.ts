import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Get('categories')
    getCategories() {
        return this.supportService.getCategories();
    }

    // Client Endpoints
    @Post('tickets')
    createTicket(@Body() body: any) {
        // In real app, userId comes from request context/JWT
        return this.supportService.createTicket(body.userId, body.userType, body.subject, body.category, body.description);
    }

    @Get('tickets/my')
    getMyTickets(@Query('userId') userId: string) {
        return this.supportService.getMyTickets(userId);
    }

    @Get('tickets/:id')
    getTicket(@Param('id') id: string, @Query('userId') userId: string) {
        return this.supportService.getTicket(userId, id);
    }

    @Post('tickets/:id/reply')
    reply(@Param('id') id: string, @Body() body: any) {
        return this.supportService.replyToTicket(body.userId, id, body.text);
    }

    // Admin Endpoints
    @Get('admin/tickets')
    getAll(@Query('status') status: string) {
        return this.supportService.getAllTickets(status);
    }

    @Post('admin/tickets/:id/reply')
    adminReply(@Param('id') id: string, @Body() body: any) {
        return this.supportService.adminReply(id, body.text, body.cannedKey);
    }

    @Put('admin/tickets/:id/status')
    updateStatus(@Param('id') id: string, @Body() body: any) {
        return this.supportService.updateStatus(id, body.status);
    }

    @Post('admin/tickets/merge')
    mergeTickets(@Body() body: { primaryId: string, secondaryIds: string[] }) {
        return this.supportService.mergeTickets(body.primaryId, body.secondaryIds);
    }

    @Get('admin/canned-responses')
    getCanned() {
        return this.supportService.getCannedResponses();
    }

    @Get('admin/performance')
    getPerformance() {
        return this.supportService.getPerformanceStats();
    }
}
```
