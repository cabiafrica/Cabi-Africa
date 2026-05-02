import '../services/badge_service.dart' as badge_service;
import '../services/ratings_service.dart';

class ProfileService {
  final RatingsService _ratingsService = RatingsService();
  final badge_service.BadgeService _badgeService = badge_service.BadgeService();

  Future<Map<String, dynamic>> fetchRatingSummary(String userId) {
    return _ratingsService.fetchRatingSummary(userId);
  }

  Future<List<badge_service.Badge>> getUserBadges(String userId) {
    return _badgeService.getUserBadges(userId);
  }
  
  // This is a placeholder for the fetchMyProfile method that the test expects.
  // In a real app, this would aggregate data into a DriverProfile object.
  Future<dynamic> fetchMyProfile() async {
    // For now, return a placeholder that the test can mock.
    return null;
  }
}
