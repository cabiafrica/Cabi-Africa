import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

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
      passengerName: json['raterName'] as String? ?? 'Anonymous',
      rating: (json['stars'] as num).toDouble(),
      comment: json['comment'] as String? ?? '',
      date: json['createdAt'] != null 
          ? (json['createdAt'] as String).split('T')[0] 
          : 'N/A',
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
    debugPrint('Fetching ratings for driver $driverId from ${AppConfig.authApiUrl}...');
    
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.authApiUrl}/ratings/admin/all?rateeId=$driverId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final reviews = data.map((json) => PassengerReview.fromJson(json)).toList();

        // Calculate aggregate stats if backend doesn't provide them yet
        double overallRating = 0.0;
        if (reviews.isNotEmpty) {
          overallRating = reviews.map((r) => r.rating).reduce((a, b) => a + b) / reviews.length;
        }

        return RatingsData(
          overallRating: overallRating,
          totalRatings: reviews.length,
          categories: _generateDefaultCategories(overallRating),
          recentReviews: reviews,
        );
      } else {
        throw Exception('Failed to load ratings: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error fetching ratings: $e');
      // Fallback to empty data instead of crashing
      return const RatingsData(
        overallRating: 0.0,
        totalRatings: 0,
        categories: [],
        recentReviews: [],
      );
    }
  }

  Future<Map<String, dynamic>> fetchRatingSummary(String driverId) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.authApiUrl}/ratings/summary/$driverId'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        return {
          'average': 0.0,
          'totalRatings': 0,
          'starCounts': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0},
          'tagCounts': {}
        };
      }
    } catch (e) {
      debugPrint('Error fetching rating summary: $e');
      return {
        'average': 0.0,
        'totalRatings': 0,
        'starCounts': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0},
        'tagCounts': {}
      };
    }
  }

  List<CategoryRating> _generateDefaultCategories(double overall) {
    // Backend doesn't have category-specific ratings yet, so we derive them from overall for now
    return [
      CategoryRating(
        category: 'Punctuality',
        score: (overall + 0.2).clamp(0.0, 5.0),
        icon: Icons.schedule,
      ),
      CategoryRating(
        category: 'Cleanliness',
        score: (overall + 0.1).clamp(0.0, 5.0),
        icon: Icons.cleaning_services,
      ),
      CategoryRating(
        category: 'Friendliness',
        score: (overall + 0.3).clamp(0.0, 5.0),
        icon: Icons.sentiment_very_satisfied,
      ),
      CategoryRating(
        category: 'Navigation',
        score: (overall - 0.2).clamp(0.0, 5.0),
        icon: Icons.map,
      ),
    ];
  }
}
