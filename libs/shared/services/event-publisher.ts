import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

/**
 * A generic event publisher for sending messages to the main SNS topic.
 * This class is designed to be used as a singleton or injected via DI in backend services.
 */
export class EventPublisher {
  private readonly sns: SNSClient;
  private readonly topicArn: string;

  constructor() {
    this.sns = new SNSClient({});
    this.topicArn = process.env.EVENT_BUS_TOPIC_ARN;

    if (!this.topicArn) {
      throw new Error('EVENT_BUS_TOPIC_ARN environment variable is not set.');
    }
  }

  /**
   * Publishes an event to the SNS topic.
   * @param eventName A string identifying the event type, e.g., 'DriverRegistered'.
   * @param payload The data associated with the event.
   */
  async publish<T>(eventName: string, payload: T): Promise<void> {
    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(payload),
      MessageAttributes: {
        eventName: { DataType: 'String', StringValue: eventName },
      },
    });

    await this.sns.send(command);
  }
}