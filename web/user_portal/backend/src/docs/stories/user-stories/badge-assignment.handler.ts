import { AdminServiceClient, BadgeRule } from './admin.service.client';
import { PaymentServiceClient } from './payment.service.client';
import { RideServiceClient } from './ride.service.client';
import { UserRepository, User } from './user.repository';

/**
 * This is the main handler for the Lambda function that processes
 * the automatic assignment of badges.
 * It's triggered by a scheduled event (e.g., daily via EventBridge).
 */
export async function handleBadgeAssignment(): Promise<void> {
  console.log('Starting badge assignment process...');

  const adminClient = new AdminServiceClient();
  const rideClient = new RideServiceClient();
  const paymentClient = new PaymentServiceClient();
  const userRepo = new UserRepository();

  try {
    // 1. Fetch all badge rules and all users in parallel
    const [badgeRules, users] = await Promise.all([
      adminClient.getBadgeDefinitions(),
      userRepo.getAllUsers(),
    ]);

    if (!badgeRules.length || !users.length) {
      console.log('No badge rules or users found. Terminating process.');
      return;
    }

    // 2. Iterate through each user to evaluate them
    for (const user of users) {
      const currentBadges = new Set(user.badges || []);
      const newBadges = new Set(user.badges || []);

      // Fetch performance data for the current user
      const [completedTrips, totalEarnings] = await Promise.all([
        rideClient.getCompletedTripsForUser(user.userId),
        paymentClient.getTotalEarningsForUser(user.userId),
      ]);

      // 3. Evaluate each badge rule for the user
      for (const rule of badgeRules) {
        const hasBadge = currentBadges.has(rule.badgeId);
        const meetsCriteria = checkUserQualifies(user, rule, completedTrips, totalEarnings);

        if (meetsCriteria && !hasBadge) {
          console.log(`User ${user.userId} qualifies for badge: ${rule.badgeId}`);
          newBadges.add(rule.badgeId);
        } else if (!meetsCriteria && hasBadge) {
          console.log(`User ${user.userId} no longer qualifies for badge: ${rule.badgeId}`);
          newBadges.delete(rule.badgeId);
        }
      }

      // 4. If the badge set has changed, update the user record
      if (currentBadges.size !== newBadges.size) {
        await userRepo.updateUserBadges(user.userId, Array.from(newBadges));
      }
    }

    console.log('Badge assignment process completed successfully.');
  } catch (error) {
    console.error('An error occurred during the badge assignment process:', { error });
    throw error;
  }
}

function checkUserQualifies(user: User, rule: BadgeRule, completedTrips: number, totalEarnings: number): boolean {
  const { minRating, minCompletedTrips, minTotalEarnings } = rule.criteria;

  if (minRating != null && (user.rating || 0) < minRating) return false;
  if (minCompletedTrips && completedTrips < minCompletedTrips) return false;
  if (minTotalEarnings && totalEarnings < minTotalEarnings) return false;

  return true;
}