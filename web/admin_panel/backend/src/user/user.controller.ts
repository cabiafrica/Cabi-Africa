import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';

// In a real app, this would be a proper JWT/Role-based guard
class UserAuthGuard {
  canActivate() { return true; }
}

@Controller('users')
@UseGuards(UserAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('me/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    ) file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    // In a real app, userId would come from the authenticated request token (e.g., req.user.id)
    const mockUserId = 'driver-123';
    return this.userService.uploadDocument(mockUserId, documentType, file);
  }
}