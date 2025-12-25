import { Controller, Get, Param, Logger, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  // Mocking constructor injection
  private readonly userService: UserService = new UserService();

  @Get(':id')
  getUserDetails(@Param('id') userId: string) {
    this.logger.log(`Fetching details for user ${userId}`);
    return this.userService.getUserDetails(userId);
  }

  @Put(':id/status')
  updateUserStatus(
    @Param('id') userId: string,
    @Body() body: { status: 'Suspended' | 'Deactivated' | 'Active'; reason: string },
  ) {
    this.logger.log(`Received request to update status for user ${userId} to ${body.status}`);
    return this.userService.updateUserStatus(userId, body.status, body.reason);
  }
}