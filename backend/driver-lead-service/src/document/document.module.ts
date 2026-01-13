import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DriverDocumentController } from './driver-document.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [DriverDocumentController],
    providers: [DocumentService, PrismaService],
    exports: [DocumentService],
})
export class DocumentModule { }
