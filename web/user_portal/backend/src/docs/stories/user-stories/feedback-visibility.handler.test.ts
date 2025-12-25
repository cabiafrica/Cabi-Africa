import { FeedbackRepository } from './feedback.repository';
import { handleFeedbackVisibility } from './feedback-visibility.handler';

// Mock the dependency
jest.mock('./feedback.repository');

describe('handleFeedbackVisibility', () => {
  let mockFeedbackRepo: jest.Mocked<FeedbackRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFeedbackRepo = new FeedbackRepository() as jest.Mocked<FeedbackRepository>;
    (FeedbackRepository as jest.Mock).mockImplementation(() => mockFeedbackRepo);
  });

  it('should call the repository to make comments visible', async () => {
    // Arrange
    mockFeedbackRepo.makePreviousMonthsCommentsVisible.mockResolvedValue(5);

    // Act
    await handleFeedbackVisibility();

    // Assert
    expect(mockFeedbackRepo.makePreviousMonthsCommentsVisible).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if the repository fails', async () => {
    // Arrange
    const testError = new Error('DB connection failed');
    mockFeedbackRepo.makePreviousMonthsCommentsVisible.mockRejectedValue(testError);

    // Act & Assert
    await expect(handleFeedbackVisibility()).rejects.toThrow(testError);
  });
});