import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

// In a real app, this would be a proper JWT/Role-based guard
class UserGuard {
  canActivate() {
    return true;
  }
}

@Controller('documents')
@UseGuards(new UserGuard())
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload/:documentType')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('documentType') documentType: string,
  ) {
    const mockDriverId = 'driver-123'; // This would come from the authenticated user (req.user)
    return this.documentService.handleDocumentUpload(mockDriverId, documentType, file);
  }
}