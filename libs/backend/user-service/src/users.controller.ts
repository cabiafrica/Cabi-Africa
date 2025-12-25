import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, Get, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  async findAll(@Query('limit') limit: number, @Query('token') token: string) {
    return this.usersService.findAll(limit, token);
  }

  @Post('me/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@Body('documentType') documentType: string, @UploadedFile() file: any) {
    // Mock user ID
    const userId = "mock-user-id";
    return this.usersService.uploadDocument(userId, documentType, file);
  }
}