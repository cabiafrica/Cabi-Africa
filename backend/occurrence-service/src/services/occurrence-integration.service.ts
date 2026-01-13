import { Injectable } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { OccurrenceCategory, OccurrenceSeverity, OccurrenceSource } from '../dto/occurrence.dto';

interface SOSEventData {
    tripId?: string;
    rideId?: string;
    driverId?: string;
    passengerId: string;
    vehicleId?: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
        placeName?: string;
        city?: string;
    };
    timestamp: Date;
    userId: string; // Who triggered the SOS
}

interface RatingEventData {
    ratingId: string;
    rideId: string;
    driverId: string;
    passengerId: string;
    vehicleId?: string;
    score: number;
    comment: string;
    timestamp: Date;
}

interface CommentEventData {
    commentId: string;
    rideId?: string;
    driverId?: string;
    passengerId?: string;
    vehicleId?: string;
    comment: string;
    category?: string;
    timestamp: Date;
    reportedById: string;
}

@Injectable()
export class OccurrenceIntegrationService {
    constructor(private occurrenceService: OccurrenceService) { }

    /**
     * Create occurrence from SOS button press
     */
    async handleSOSEvent(data: SOSEventData) {
        const occurrenceDate = data.timestamp || new Date();
        const timeString = occurrenceDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        return this.occurrenceService.create({
            category: OccurrenceCategory.MEDICAL_EMERGENCY,
            severity: OccurrenceSeverity.CRITICAL,
            title: 'SOS Emergency Alert Triggered',
            description: `Emergency SOS button was pressed by user. Immediate assistance required.${data.tripId ? ` Trip ID: ${data.tripId}` : ''}`,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            rideId: data.rideId,
            occurrenceDate: occurrenceDate.toISOString().split('T')[0],
            occurrenceTime: timeString,
            location: {
                lat: data.location.lat,
                lng: data.location.lng,
                address: data.location.address,
                placeName: data.location.placeName || 'SOS Location',
                city: data.location.city,
            },
            source: OccurrenceSource.SOS,
            sourceReferenceId: data.tripId || data.rideId,
            registeredById: data.userId,
            tags: ['sos', 'emergency', 'critical'],
        });
    }

    /**
     * Create occurrence from low rating with negative comment
     */
    async handleLowRating(data: RatingEventData) {
        // Only create occurrence for ratings <= 2 stars with comments
        if (data.score > 2 || !data.comment || data.comment.trim().length < 10) {
            return null;
        }

        const category = this.categorizeFromComment(data.comment);
        const severity = data.score === 1 ? OccurrenceSeverity.HIGH : OccurrenceSeverity.MEDIUM;

        const occurrenceDate = data.timestamp || new Date();
        const timeString = occurrenceDate.toTimeString().split(' ')[0].substring(0, 5);

        return this.occurrenceService.create({
            category,
            severity,
            title: `Low Rating: ${data.score} star${data.score !== 1 ? 's' : ''}`,
            description: `Passenger gave a ${data.score}-star rating with the following feedback: "${data.comment}"`,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            rideId: data.rideId,
            occurrenceDate: occurrenceDate.toISOString().split('T')[0],
            occurrenceTime: timeString,
            location: {
                // Location would come from ride end location
            },
            source: OccurrenceSource.RATING,
            sourceReferenceId: data.ratingId,
            registeredById: data.passengerId, // System creates on behalf of passenger
            tags: ['rating', 'feedback', `${data.score}-star`],
        });
    }

    /**
     * Create occurrence from user comment/report
     */
    async handleUserComment(data: CommentEventData) {
        const category = data.category
            ? this.mapCategoryString(data.category)
            : this.categorizeFromComment(data.comment);

        const occurrenceDate = data.timestamp || new Date();
        const timeString = occurrenceDate.toTimeString().split(' ')[0].substring(0, 5);

        return this.occurrenceService.create({
            category,
            severity: OccurrenceSeverity.MEDIUM,
            title: 'User Report Submitted',
            description: data.comment,
            driverId: data.driverId,
            passengerId: data.passengerId,
            vehicleId: data.vehicleId,
            rideId: data.rideId,
            occurrenceDate: occurrenceDate.toISOString().split('T')[0],
            occurrenceTime: timeString,
            location: {},
            source: OccurrenceSource.COMMENT,
            sourceReferenceId: data.commentId,
            registeredById: data.reportedById,
            tags: ['user-report', 'comment'],
        });
    }

    /**
     * Categorize occurrence based on comment text
     */
    private categorizeFromComment(comment: string): OccurrenceCategory {
        const lowerComment = comment.toLowerCase();

        // Crime-related keywords
        if (this.containsAny(lowerComment, ['theft', 'steal', 'stolen', 'robbery', 'assault', 'attack', 'weapon', 'threatened'])) {
            return OccurrenceCategory.CRIME;
        }

        // Harassment keywords
        if (this.containsAny(lowerComment, ['harassment', 'harass', 'inappropriate', 'sexual', 'abuse', 'verbal abuse', 'discrimination'])) {
            return OccurrenceCategory.HARASSMENT;
        }

        // Traffic offense keywords
        if (this.containsAny(lowerComment, ['speeding', 'reckless', 'dangerous driving', 'ran red light', 'drunk', 'dui', 'accident'])) {
            return OccurrenceCategory.TRAFFIC_OFFENSE;
        }

        // Safety violation keywords
        if (this.containsAny(lowerComment, ['no seatbelt', 'unsafe', 'overloading', 'safety', 'dangerous'])) {
            return OccurrenceCategory.SAFETY_VIOLATION;
        }

        // Fraud keywords
        if (this.containsAny(lowerComment, ['fraud', 'scam', 'fake', 'overcharge', 'wrong fare', 'cheating'])) {
            return OccurrenceCategory.FRAUD;
        }

        // Property damage keywords
        if (this.containsAny(lowerComment, ['damage', 'broken', 'vandalism', 'destroyed'])) {
            return OccurrenceCategory.PROPERTY_DAMAGE;
        }

        // Vehicle issue keywords
        if (this.containsAny(lowerComment, ['vehicle', 'car problem', 'mechanical', 'breakdown', 'dirty car', 'smelly'])) {
            return OccurrenceCategory.VEHICLE_ISSUE;
        }

        // Dispute keywords
        if (this.containsAny(lowerComment, ['dispute', 'disagreement', 'argument', 'wrong route', 'fare dispute'])) {
            return OccurrenceCategory.DISPUTE;
        }

        // Default to policy violation for general complaints
        return OccurrenceCategory.POLICY_VIOLATION;
    }

    /**
     * Map category string to enum
     */
    private mapCategoryString(category: string): OccurrenceCategory {
        const categoryMap: Record<string, OccurrenceCategory> = {
            'crime': OccurrenceCategory.CRIME,
            'traffic': OccurrenceCategory.TRAFFIC_OFFENSE,
            'safety': OccurrenceCategory.SAFETY_VIOLATION,
            'policy': OccurrenceCategory.POLICY_VIOLATION,
            'harassment': OccurrenceCategory.HARASSMENT,
            'fraud': OccurrenceCategory.FRAUD,
            'damage': OccurrenceCategory.PROPERTY_DAMAGE,
            'medical': OccurrenceCategory.MEDICAL_EMERGENCY,
            'dispute': OccurrenceCategory.DISPUTE,
            'suspicious': OccurrenceCategory.SUSPICIOUS_ACTIVITY,
            'vehicle': OccurrenceCategory.VEHICLE_ISSUE,
            'environmental': OccurrenceCategory.ENVIRONMENTAL,
        };

        return categoryMap[category.toLowerCase()] || OccurrenceCategory.POLICY_VIOLATION;
    }

    /**
     * Helper to check if text contains any of the keywords
     */
    private containsAny(text: string, keywords: string[]): boolean {
        return keywords.some(keyword => text.includes(keyword));
    }
}
