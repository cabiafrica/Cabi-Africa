import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledRideService } from './scheduled_ride.service';
import { RideService } from './ride.service';
import { NotificationService } from '@cabi/backend/notification-service';
import { DriverService } from '@cabi/backend/driver-service';
import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

// Mock services
const mockRideService = {
  findBestDriverForRide: jest.fn(),
};

const mockNotificationService = {
  sendNotification: jest.fn(),
};

const mockDriverService = {
  applyCancellationPenalty: jest.fn(),
};

describe('ScheduledRideService', () => {
  let service: ScheduledRideService;
  let rideService: RideService;
  let notificationService: NotificationService;
  let driverService: DriverService;

  // Suppress logger output during tests
  Logger.prototype.log = jest.fn();
  Logger.prototype.warn = jest.fn();
  Logger.prototype.error = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledRideService,
        { provide: RideService, useValue: mockRideService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DriverService, useValue: mockDriverService },
      ],
    }).compile();

    service = module.get<ScheduledRideService>(ScheduledRideService);
    rideService = module.get<RideService>(RideService);
    notificationService = module.get<NotificationService>(NotificationService);
    driverService = module.get<DriverService>(DriverService);
  });

  describe('createScheduledRide', () => {
    const passengerId = 'passenger-123';

    it('should create a scheduled ride successfully for a valid future time', async () => {
      const twoHoursFromNow = new Date(Date.now() + 2 * 3600 * 1000);
      const dto: CreateScheduledRideDto = {
        pickupLocation: { lat: 1, lon: 1 },
        destination: { lat: 2, lon: 2 },
        pickupTime: twoHoursFromNow,
      };

      const result = await service.createScheduledRide(passengerId, dto);

      expect(result).toBeDefined();
      expect(result.id).toEqual('mock-id');
      expect(result.passengerId).toEqual(passengerId);
      expect(result.status).toEqual('pending');
      expect(new Date(result.pickupTime)).toEqual(twoHoursFromNow);
    });

    it('should throw BadRequestException if pickup time is less than 60 minutes away', async () => {
      const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
      const dto: CreateScheduledRideDto = {
        pickupLocation: { lat: 1, lon: 1 },
        destination: { lat: 2, lon: 2 },
        pickupTime: thirtyMinutesFromNow,
      };

      await expect(
        service.createScheduledRide(passengerId, dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createScheduledRide(passengerId, dto),
      ).rejects.toThrow(
        'Ride must be scheduled at least 60 minutes in advance.',
      );
    });

    it('should throw BadRequestException if pickup time is more than 30 days away', async () => {
      const thirtyOneDaysFromNow = new Date(
        Date.now() + 31 * 24 * 3600 * 1000,
      );
      const dto: CreateScheduledRideDto = {
        pickupLocation: { lat: 1, lon: 1 },
        destination: { lat: 2, lon: 2 },
        pickupTime: thirtyOneDaysFromNow,
      };

      await expect(
        service.createScheduledRide(passengerId, dto),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createScheduledRide(passengerId, dto),
      ).rejects.toThrow('Ride cannot be scheduled more than 30 days in advance.');
    });
  });

  describe('dispatchDueRides', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
      // Use fake timers to control `new Date()`
      jest.useFakeTimers();
    });

    afterEach(() => {
      // Restore real timers
      jest.useRealTimers();
    });

    it('should find a driver and send notifications for a due ride', async () => {
      // Arrange
      const mockDriver = { id: 'driver-1', name: 'Test Driver' };
      const now = new Date('2024-08-20T10:00:00Z');
      const pickupTime = new Date('2024-08-20T10:15:00Z'); // 15 mins from now

      jest.setSystemTime(now);

      const dueRide = {
        id: 'ride-due',
        passengerId: 'passenger-due',
        pickupTime: pickupTime,
        destination: 'Test Destination',
        status: 'pending',
      };

      // @ts-expect-error - Accessing private property for test setup
      service.scheduledRides = [dueRide];

      mockRideService.findBestDriverForRide.mockResolvedValue(mockDriver);

      // Act
      await service.dispatchDueRides();

      // Assert
      expect(rideService.findBestDriverForRide).toHaveBeenCalledWith(dueRide.id);
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ userId: dueRide.passengerId }),
      );
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockDriver.id }),
      );

      // @ts-expect-error - bypass testing mock
      const updatedRide = service.findRideById(dueRide.id);
      expect(updatedRide.status).toBe('confirmed');
      expect(updatedRide.driverId).toBe(mockDriver.id);
    });

    it('should do nothing if no driver is found', async () => {
      // Arrange
      const now = new Date('2024-08-20T10:00:00Z');
      const pickupTime = new Date('2024-08-20T10:20:00Z');
      jest.setSystemTime(now);

      const dueRide = { id: 'ride-due-no-driver', passengerId: 'passenger-x', pickupTime, destination: 'Nowhere', status: 'pending' };
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [dueRide];

      mockRideService.findBestDriverForRide.mockResolvedValue(null); // No driver found

      // Act
      await service.dispatchDueRides();

      // Assert
      expect(rideService.findBestDriverForRide).toHaveBeenCalledWith(dueRide.id);
      expect(notificationService.sendNotification).not.toHaveBeenCalled();

      // @ts-expect-error - bypass testing mock
      const ride = service.findRideById(dueRide.id);
      expect(ride.status).toBe('pending'); // Status should not change
      expect(ride.driverId).toBeUndefined();
    });

    it('should mark ride as failed after max attempts and notify passenger', async () => {
      // Arrange
      const now = new Date('2024-08-20T10:00:00Z');
      const pickupTime = new Date('2024-08-20T10:25:00Z'); // 25 mins from now
      jest.setSystemTime(now);

      const rideToFail = {
        id: 'ride-to-fail',
        passengerId: 'passenger-fail',
        pickupTime,
        destination: 'Failure Point',
        status: 'pending',
        dispatchAttempts: 2, // One attempt away from max (MAX_DISPATCH_ATTEMPTS is 3)
      };

      // @ts-expect-error - Accessing private property for test setup
      service.scheduledRides = [rideToFail];

      mockRideService.findBestDriverForRide.mockResolvedValue(null); // Consistently fail to find a driver

      // Act
      await service.dispatchDueRides();

      // Assert
      expect(rideService.findBestDriverForRide).toHaveBeenCalledWith(rideToFail.id);

      // @ts-expect-error - bypass testing mock
      const updatedRide = service.findRideById(rideToFail.id);
      expect(updatedRide.dispatchAttempts).toBe(3);
      expect(updatedRide.status).toBe('failed');

      // Check that only one notification (the failure one) was sent
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: rideToFail.passengerId,
        title: 'Unable to Find a Driver',
        body: `We're sorry, but we were unable to find a driver for your scheduled ride to ${rideToFail.destination}.`,
      });
    });
  });

  describe('sendReminderNotifications', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should send a reminder for a ride that is ~60 minutes away', async () => {
      // Arrange
      const now = new Date('2024-09-01T09:00:00Z');
      // This pickup time is exactly 60 minutes from 'now'
      const pickupTime = new Date('2024-09-01T10:00:00Z');
      jest.setSystemTime(now);

      const rideToRemind = {
        id: 'ride-remind-1',
        passengerId: 'passenger-remind',
        pickupTime,
        destination: 'The Venue',
        status: 'pending',
        reminderSent: false,
      };
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [rideToRemind];

      // Act
      await service.sendReminderNotifications();

      // Assert
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: rideToRemind.passengerId,
        title: 'Upcoming Scheduled Ride',
        body: `Your ride to ${rideToRemind.destination} is scheduled in about an hour.`,
      });

      // @ts-expect-error - bypass testing mock
      const updatedRide = service.findRideById(rideToRemind.id);
      expect(updatedRide.reminderSent).toBe(true);
    });

    it('should not send a reminder if one has already been sent', async () => {
      // Arrange
      const now = new Date('2024-09-01T09:00:00Z');
      const pickupTime = new Date('2024-09-01T10:00:00Z');
      jest.setSystemTime(now);

      const rideAlreadyReminded = {
        id: 'ride-remind-2', passengerId: 'passenger-reminded', pickupTime, destination: 'The Place', status: 'pending', reminderSent: true,
      };
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [rideAlreadyReminded];

      // Act
      await service.sendReminderNotifications();

      // Assert
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('cancelRideByDriver', () => {
    const driverId = 'driver-assigned';
    const rideId = 'ride-to-cancel';

    const confirmedRide = {
      id: rideId,
      passengerId: 'passenger-1',
      pickupTime: new Date(),
      destination: 'Someplace',
      status: 'confirmed',
      driverId: driverId,
      vehicleId: 'vehicle-1',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow an assigned driver to cancel a ride, apply penalty, and notify passenger', async () => {
      // Arrange
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [JSON.parse(JSON.stringify(confirmedRide))]; // Deep copy

      // Act
      const result = await service.cancelRideByDriver(rideId, driverId);

      // Assert
      expect(result.status).toBe('pending');
      expect(result.driverId).toBeNull();
      expect(result.vehicleId).toBeNull();

      expect(driverService.applyCancellationPenalty).toHaveBeenCalledWith(driverId);
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(1);
      expect(notificationService.sendNotification).toHaveBeenCalledWith({
        userId: confirmedRide.passengerId,
        title: 'Your Driver Cancelled',
        body: 'Your driver has cancelled. We are already searching for a new driver for your scheduled ride.',
      });
    });

    it('should throw UnauthorizedException if a different driver tries to cancel', async () => {
      // Arrange
      const otherDriverId = 'driver-imposter';
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [confirmedRide];

      // Act & Assert
      await expect(
        service.cancelRideByDriver(rideId, otherDriverId),
      ).rejects.toThrow(UnauthorizedException);
      expect(driverService.applyCancellationPenalty).not.toHaveBeenCalled();
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if the ride does not exist', async () => {
      // Arrange
      // @ts-expect-error - bypass testing mock
      service.scheduledRides = [];

      // Act & Assert
      await expect(
        service.cancelRideByDriver('non-existent-ride', driverId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
