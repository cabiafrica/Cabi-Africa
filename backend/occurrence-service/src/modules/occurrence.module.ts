import { Module } from '@nestjs/common';
import { OccurrenceController } from '../controllers/occurrence.controller';
import { ObjectionController } from '../controllers/objection.controller';
import { IntegrationController } from '../controllers/integration.controller';
import { OccurrenceService } from '../services/occurrence.service';
import { ObjectionService } from '../services/objection.service';
import { OccurrenceAuditService } from '../services/occurrence-audit.service';
import { OccurrenceIntegrationService } from '../services/occurrence-integration.service';

@Module({
    controllers: [OccurrenceController, ObjectionController, IntegrationController],
    providers: [
        OccurrenceService,
        ObjectionService,
        OccurrenceAuditService,
        OccurrenceIntegrationService,
    ],
    exports: [OccurrenceService, ObjectionService, OccurrenceIntegrationService],
})
export class OccurrenceModule { }
