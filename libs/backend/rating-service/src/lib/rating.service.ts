import { Injectable } from '@nestjs/common';

export interface Rating {
    id: string;
    rideId: string;
    raterId: string;
    raterName: string; // Added for frontend display
    rateeId: string; // The user being rated
    stars: number;
    comment: string;
    type: 'PASSENGER_TO_DRIVER' | 'DRIVER_TO_PASSENGER';
    status: 'VISIBLE' | 'HIDDEN';
    tags?: string[];
    createdAt: Date;
}

@Injectable()
export class RatingService {
    private ratings: Rating[] = [];

    constructor() {
        // Seed data
        this.ratings.push({
            id: '1',
            rideId: 'ride_123',
            raterId: 'passenger_1',
            raterName: 'Sarah M.',
            rateeId: 'driver_bob',
            stars: 5,
            comment: 'Great ride! Very clean car.',
            type: 'PASSENGER_TO_DRIVER',
            status: 'VISIBLE',
            tags: ['CLEAN_VEHICLE', 'EXCELLENT_SERVICE'],
            createdAt: new Date()
        });
        this.ratings.push({
            id: '2',
            rideId: 'ride_124',
            raterId: 'driver_bob',
            raterName: 'Bob D.',
            rateeId: 'passenger_1',
            stars: 4,
            comment: 'Nice passenger.',
            type: 'DRIVER_TO_PASSENGER',
            status: 'VISIBLE',
            tags: ['POLITE'],
            createdAt: new Date()
        });
    }

    async submitRating(data: Omit<Rating, 'id' | 'status' | 'createdAt'>) {
        const newRating: Rating = {
            ...data,
            id: `rating_${Date.now()}`,
            status: 'VISIBLE',
            createdAt: new Date()
        };
        this.ratings.push(newRating);

        // Trigger Recalculation (Mock)
        this.recalculateAverage(data.rateeId);

        return newRating;
    }

    async getAllRatings(stars?: number, rateeId?: string) {
        let result = this.ratings;
        if (stars) result = result.filter(r => r.stars === stars);
        if (rateeId) result = result.filter(r => r.rateeId === rateeId);
        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async getRatingSummary(rateeId: string) {
        const userRatings = this.ratings.filter(r => r.rateeId === rateeId && r.status === 'VISIBLE');
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const tagCounts: Record<string, number> = {};

        userRatings.forEach(r => {
            starCounts[r.stars as keyof typeof starCounts]++;
            if (r.tags) {
                r.tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            }
        });

        const sum = userRatings.reduce((acc, curr) => acc + curr.stars, 0);
        const average = userRatings.length > 0 ? sum / userRatings.length : 0;

        return {
            average,
            totalRatings: userRatings.length,
            starCounts,
            tagCounts
        };
    }

    async hideRating(ratingId: string) {
        const rating = this.ratings.find(r => r.id === ratingId);
        if (!rating) throw new Error('Rating not found');
        rating.status = 'HIDDEN';

        // Recalculate
        this.recalculateAverage(rating.rateeId);

        return rating;
    }

    private recalculateAverage(userId: string) {
        const userRatings = this.ratings.filter(r => r.rateeId === userId && r.status === 'VISIBLE');
        if (userRatings.length === 0) return;

        const sum = userRatings.reduce((acc, curr) => acc + curr.stars, 0);
        const avg = sum / userRatings.length;
        console.log(`[RatingService] Updated Stats for User ${userId}: Avg=${avg.toFixed(2)}, Count=${userRatings.length}`);
        // In real app: this.userService.updateRating(userId, avg, userRatings.length);
    }
}
