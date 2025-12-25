// This is a mock service to simulate backend API calls for user management.

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
}

// Let's use a single mock user object to simulate a database record.
let mockUser: UserProfile = {
  id: 'user-123',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '555-123-4567',
  profilePictureUrl: '',
};

export const getUserProfile = async (): Promise<UserProfile> => {
  console.log('Mock Service: Fetching user profile...');
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('Mock Service: User profile fetched.');
  return { ...mockUser }; // Return a copy to prevent direct mutation
};

export const updateUserProfile = async (
  updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>
): Promise<UserProfile> => {
  console.log('Mock Service: Updating user profile with:', updates);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Apply updates to our mock user "database"
  mockUser = { ...mockUser, ...updates };
  console.log('Mock Service: User profile updated.');
  return { ...mockUser }; // Return a copy of the new state
};