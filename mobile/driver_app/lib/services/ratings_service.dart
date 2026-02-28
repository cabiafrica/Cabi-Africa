import 'package:flutter/material.dart';

// --- MODELS ---

class CategoryRating {
  final String category;
  final double score;
  final IconData icon;

  const CategoryRating({
    required this.category,
    required this.score,
    required this.icon,
  });
}

class PassengerReview {
  final String id;
  final String passengerName;
  final double rating;
  final String comment;
  final String date;

  const PassengerReview({
    required this.id,
    required this.passengerName,
    required this.rating,
    required this.comment,
    required this.date,
  });

  factory PassengerReview.fromJson(Map<String, dynamic> json) {
    return PassengerReview(
      id: json['id'] as String,
      passengerName: json['passengerName'] as String,
      rating: (json['rating'] as num).toDouble(),
      comment: json['comment'] as String,
      date: json['date'] as String,
    );
  }
}

class RatingsData {
  final double overallRating;
  final int totalRatings;
  final List<CategoryRating> categories;
  final List<PassengerReview> recentReviews;

  const RatingsData({
    required this.overallRating,
    required this.totalRatings,
    required this.categories,
    required this.recentReviews,
  });
}

// --- SERVICE ---

class RatingsService {
  Future<RatingsData> fetchRatings(String driverId) async {
    debugPrint('Fetching ratings for driver $driverId...');
    await Future.delayed(const Duration(milliseconds: 800));

    // Mock API response — replace with real HTTP call when backend endpoint is ready.
    final mockReviews = [
      const PassengerReview(
        id: 'rev-1',
        passengerName: 'Sarah M.',
        rating: 5.0,
        comment: 'Excellent driver! Very punctual and friendly.',
        date: '2026-02-18',
      ),
      const PassengerReview(
        id: 'rev-2',
        passengerName: 'James K.',
        rating: 4.0,
        comment: 'Good ride, clean car. Took a slightly longer route.',
        date: '2026-02-17',
      ),
      const PassengerReview(
        id: 'rev-3',
        passengerName: 'Aisha W.',
        rating: 5.0,
        comment: 'Super polite and drove carefully. Would ride again!',
        date: '2026-02-16',
      ),
      const PassengerReview(
        id: 'rev-4',
        passengerName: 'Brian O.',
        rating: 4.0,
        comment: 'Arrived on time, comfortable ride.',
        date: '2026-02-14',
      ),
      const PassengerReview(
        id: 'rev-5',
        passengerName: 'Grace N.',
        rating: 5.0,
        comment: 'Great experience!',
        date: '2026-02-12',
      ),
    ];

    return RatingsData(
      overallRating: 4.6,
      totalRatings: 248,
      categories: const [
        CategoryRating(
          category: 'Punctuality',
          score: 4.8,
          icon: Icons.schedule,
        ),
        CategoryRating(
          category: 'Cleanliness',
          score: 4.7,
          icon: Icons.cleaning_services,
        ),
        CategoryRating(
          category: 'Friendliness',
          score: 4.9,
          icon: Icons.sentiment_very_satisfied,
        ),
        CategoryRating(
          category: 'Navigation',
          score: 4.4,
          icon: Icons.map,
        ),
      ],
      recentReviews: mockReviews,
    );
  }
}
