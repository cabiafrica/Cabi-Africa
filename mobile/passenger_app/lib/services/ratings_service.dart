class RatingsService {
  Future<void> submitRating(
      String tripId, double rating, String comment) async {
    await Future.delayed(const Duration(seconds: 1));
  }
}
