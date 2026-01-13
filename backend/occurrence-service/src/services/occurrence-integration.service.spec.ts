import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceIntegrationService } from './occurrence-integration.service';
import { OccurrenceService } from './occurrence.service';
import { OccurrenceCategory, OccurrenceSeverity } from '../dto/occurrence.dto';

describe('OccurrenceIntegrationService', () => {
    let service: OccurrenceIntegrationService;
    let occurrenceService: OccurrenceService;

    const mockOccurrenceService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OccurrenceIntegrationService,
                {
                    provide: OccurrenceService,
                    useValue: mockOccurrenceService,
                },
            ],
        }).compile();

        service = module.get<OccurrenceIntegrationService>(OccurrenceIntegrationService);
        occurrenceService = module.get<OccurrenceService>(OccurrenceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleSOSEvent', () => {
        it('should create CRITICAL occurrence from SOS event', async () => {
            const sosData = {
                passengerId: 'passenger-123',
                location: {
                    lat: -1.2634,
                    lng: 36.8047,
                    city: 'Nairobi',
                },
                timestamp: new Date(),
                userId: 'user-123',
            };

            mockOccurrenceService.create.mockResolvedValue({
                id: 'occ-123',
                obNumber: 'OB-2026-000001',
            });

            await service.handleSOSEvent(sosData);

            expect(mockOccurrenceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: OccurrenceCategory.MEDICAL_EMERGENCY,
                    severity: OccurrenceSeverity.CRITICAL,
                    title: 'SOS Emergency Alert Triggered',
                    source: 'SOS',
                    tags: ['sos', 'emergency', 'critical'],
                }),
            );
        });
    });

    describe('handleLowRating', () => {
        it('should create occurrence for 1-star rating with comment', async () => {
            const ratingData = {
                ratingId: 'rating-123',
                rideId: 'ride-123',
                driverId: 'driver-123',
                passengerId: 'passenger-123',
                score: 1,
                comment: 'Driver was speeding dangerously',
                timestamp: new Date(),
            };

            mockOccurrenceService.create.mockResolvedValue({
                id: 'occ-123',
                obNumber: 'OB-2026-000002',
            });

            const result = await service.handleLowRating(ratingData);

            expect(result).toBeDefined();
            expect(mockOccurrenceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    severity: OccurrenceSeverity.HIGH,
                    title: 'Low Rating: 1 star',
                    source: 'RATING',
                }),
            );
        });

        it('should not create occurrence for 3-star rating', async () => {
            const ratingData = {
                ratingId: 'rating-123',
                rideId: 'ride-123',
                driverId: 'driver-123',
                passengerId: 'passenger-123',
                score: 3,
                comment: 'Average ride',
                timestamp: new Date(),
            };

            const result = await service.handleLowRating(ratingData);

            expect(result).toBeNull();
            expect(mockOccurrenceService.create).not.toHaveBeenCalled();
        });

        it('should not create occurrence for rating without comment', async () => {
            const ratingData = {
                ratingId: 'rating-123',
                rideId: 'ride-123',
                driverId: 'driver-123',
                passengerId: 'passenger-123',
                score: 1,
                comment: '',
                timestamp: new Date(),
            };

            const result = await service.handleLowRating(ratingData);

            expect(result).toBeNull();
            expect(mockOccurrenceService.create).not.toHaveBeenCalled();
        });
    });

    describe('categorizeFromComment', () => {
        it('should categorize crime-related comments correctly', async () => {
            const commentData = {
                commentId: 'comment-123',
                comment: 'Driver threatened me with a weapon',
                timestamp: new Date(),
                reportedById: 'user-123',
            };

            mockOccurrenceService.create.mockResolvedValue({
                id: 'occ-123',
                category: OccurrenceCategory.CRIME,
            });

            await service.handleUserComment(commentData);

            expect(mockOccurrenceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: OccurrenceCategory.CRIME,
                }),
            );
        });

        it('should categorize harassment comments correctly', async () => {
            const commentData = {
                commentId: 'comment-123',
                comment: 'Driver made inappropriate sexual comments',
                timestamp: new Date(),
                reportedById: 'user-123',
            };

            mockOccurrenceService.create.mockResolvedValue({
                id: 'occ-123',
                category: OccurrenceCategory.HARASSMENT,
            });

            await service.handleUserComment(commentData);

            expect(mockOccurrenceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: OccurrenceCategory.HARASSMENT,
                }),
            );
        });

        it('should categorize traffic offense comments correctly', async () => {
            const commentData = {
                commentId: 'comment-123',
                comment: 'Driver was speeding and ran a red light',
                timestamp: new Date(),
                reportedById: 'user-123',
            };

            mockOccurrenceService.create.mockResolvedValue({
                id: 'occ-123',
                category: OccurrenceCategory.TRAFFIC_OFFENSE,
            });

            await service.handleUserComment(commentData);

            expect(mockOccurrenceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: OccurrenceCategory.TRAFFIC_OFFENSE,
                }),
            );
        });
    });
});
