import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { OccurrenceIntegrationService } from '../services/occurrence-integration.service';

@Controller('integrations')
export class IntegrationController {
    constructor(
        private readonly integrationService: OccurrenceIntegrationService,
    ) { }

    /**
     * Webhook endpoint for SOS events
     */
    @Post('sos')
    @HttpCode(HttpStatus.CREATED)
    async handleSOS(@Body() data: any) {
        const occurrence = await this.integrationService.handleSOSEvent({
            tripId: data.tripId,
            rideId: data.rideId,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            location: data.location,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            userId: data.userId || data.passengerId,
        });

        return {
            success: true,
            message: 'SOS occurrence created',
            occurrence: {
                id: occurrence.id,
                obNumber: occurrence.obNumber,
                category: occurrence.category,
                severity: occurrence.severity,
            },
        };
    }

    /**
     * Webhook endpoint for rating events
     */
    @Post('rating')
    @HttpCode(HttpStatus.OK)
    async handleRating(@Body() data: any) {
        const occurrence = await this.integrationService.handleLowRating({
            ratingId: data.ratingId,
            rideId: data.rideId,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            score: data.score,
            comment: data.comment,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });

        if (!occurrence) {
            return {
                success: true,
                message: 'Rating does not meet occurrence criteria',
                occurrenceCreated: false,
            };
        }

        return {
            success: true,
            message: 'Occurrence created from low rating',
            occurrenceCreated: true,
            occurrence: {
                id: occurrence.id,
                obNumber: occurrence.obNumber,
                category: occurrence.category,
                severity: occurrence.severity,
            },
        };
    }

    /**
     * Webhook endpoint for user comments/reports
     */
    @Post('comment')
    @HttpCode(HttpStatus.CREATED)
    async handleComment(@Body() data: any) {
        const occurrence = await this.integrationService.handleUserComment({
            commentId: data.commentId,
            rideId: data.rideId,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            comment: data.comment,
            category: data.category,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            reportedById: data.reportedById,
        });

        return {
            success: true,
            message: 'Occurrence created from user report',
            occurrence: {
                id: occurrence.id,
                obNumber: occurrence.obNumber,
                category: occurrence.category,
                severity: occurrence.severity,
            },
        };
    }
}
