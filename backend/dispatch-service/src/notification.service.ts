import { Injectable, Logger } from '@nestjs/common';
// TODO: Install @nestjs/microservices and date-fns packages
// import { EventPattern, Payload } from '@nestjs/microservices';
// import { formatDistanceToNow } from 'date-fns';

// In a real app, this would be a more robust interface.
interface ScheduledRideReminderPayload {
  passengerId: string;
  rideId: string;
  scheduledTime: string | Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    // In a real app, you would inject a push notification provider client here.
    // e.g., private readonly fcmService: FcmService
  }

  /**
   * Listens for the 'scheduled_ride_reminder' event from the ride-service.
   * @param data The payload containing the ride and passenger details.
   */
  /* TODO: Uncomment when @nestjs/microservices is installed
  @EventPattern('scheduled_ride_reminder')
  async handleScheduledRideReminder(@Payload() data: ScheduledRideReminderPayload) {
    this.logger.log(`Received scheduled_ride_reminder event for passenger ${data.passengerId}`);

    const timeToRide = formatDistanceToNow(new Date(data.scheduledTime));

    const notification = {
      title: 'Your Ride is Soon!',
      body: `Your scheduled ride is in about ${timeToRide}. We'll start looking for a driver for you shortly.`,
    };

    // In a real app, you would use the passengerId to look up their device token
    // and send the push notification via a service like Firebase Cloud Messaging (FCM).
    this.logger.log(`Simulating sending push notification to passenger ${data.passengerId}:`);
    this.logger.log(`Title: ${notification.title}`);
    this.logger.log(`Body: ${notification.body}`);
  }
  */
}