import { FeedbackRepository } from './feedback.repository';

/**
 * This is the main handler for the Lambda function that makes
 * feedback from the previous month visible.
 * It's triggered by a scheduled event (e.g., first day of the month via EventBridge).
 */
export async function handleFeedbackVisibility(): Promise<void> {
  console.log('Starting monthly feedback visibility process...');

  const feedbackRepo = new FeedbackRepository();

  try {
    // The repository method contains the logic to find and update comments
    // from the previous calendar month.
    const updateCount = await feedbackRepo.makePreviousMonthsCommentsVisible();

    console.log(`Successfully made ${updateCount} feedback comments visible.`);
  } catch (error) {
    console.error('Failed to process monthly feedback visibility:', error);
    throw error;
  }
}