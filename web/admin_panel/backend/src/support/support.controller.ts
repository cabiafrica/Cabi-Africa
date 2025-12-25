import { Controller, Get, Param, Post, Body, Put, Query } from '@nestjs/common';
import { SupportService } from './support.service';

// DTOs for request bodies - in a real app, these would have validation
class ReplyDto {
  message: string;
  agentId: string; // In a real app, this would come from auth
}

class InternalNoteDto {
  message: string;
  agentId: string; // In a real app, this would come from auth
}

class UpdateStatusDto {
  status: string;
}

@Controller('admin/tickets') // Using an admin-specific route
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query.name('category') category?: string
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.supportService.findAll({ page: pageNumber, limit: limitNumber, status, category });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.supportService.findById(id);
  }

  @Post(':id/reply')
  addReply(@Param('id') id: string, @Body() replyDto: ReplyDto) {
    // In a real app, agentId would be from the authenticated user
    return this.supportService.addReply(id, replyDto.message, replyDto.agentId || 'Support Agent');
  }

  @Post(':id/notes')
  addInternalNote(@Param('id') id: string, @Body() noteDto: InternalNoteDto) {
    // In a real app, agentId would be from the authenticated user
    return this.supportService.addInternalNote(id, noteDto.message, noteDto.agentId || 'Support Agent');
  }

  @Put(':id/status')
  updateStatus(@Param('id') id:string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.supportService.updateStatus(id, updateStatusDto.status);
  }
}