export interface Feedback {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  isVisible: boolean;
}

export class FeedbackService {
  // Mock database
  private feedbackStore: Feedback[] = [
    { id: '1', userId: 'user_1', content: 'Great driver, very polite!', createdAt: new Date('2024-05-15'), isVisible: true },
    { id: '2', userId: 'user_1', content: 'Car was spotless.', createdAt: new Date('2024-05-20'), isVisible: true },
    { id: '3', userId: 'user_1', content: 'Smooth ride.', createdAt: new Date(), isVisible: false }, // Current month, hidden
  ];

  // Endpoint: GET /users/feedback
  async getVisibleFeedback(userId: string): Promise<Feedback[]> {
    console.log(`[FeedbackService] Fetching visible feedback for user ${userId}`);
    return this.feedbackStore.filter(f => f.userId === userId && f.isVisible);
  }

  // Scheduled Job: Runs monthly
  async runMonthlyVisibilityJob(): Promise<void> {
    console.log('[FeedbackService] Running monthly visibility job...');
    
    const now = new Date();
    // Logic: Find comments created before the start of the current month that are not yet visible
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let updateCount = 0;
    this.feedbackStore.forEach(f => {
      if (!f.isVisible && f.createdAt < startOfCurrentMonth) {
        f.isVisible = true;
        updateCount++;
      }
    });

    console.log(`[FeedbackService] Job complete. Made ${updateCount} comments visible.`);
  }
}