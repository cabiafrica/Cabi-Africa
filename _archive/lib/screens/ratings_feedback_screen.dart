import 'package:flutter/material.dart';

// Mock data models. In a real app, these would be generated from JSON.
class DriverRating {
  final double averageRating;
  final List<Review> recentReviews;

  DriverRating({required this.averageRating, required this.recentReviews});
}

class Review {
  final String reviewText;
  final int rating;
  final DateTime date;

  Review({required this.reviewText, required this.rating, required this.date});
}

// Mock service. In a real app, this would make HTTP requests.
class RatingService {
  Future<DriverRating> getMyRatings() async {
    await Future.delayed(const Duration(seconds: 1));
    return DriverRating(
      averageRating: 4.85,
      recentReviews: [
        Review(
          reviewText: 'Great driver, very friendly!',
          rating: 5,
          date: DateTime.now().subtract(const Duration(days: 1)),
        ),
        Review(
          reviewText: 'Clean car and a smooth ride.',
          rating: 5,
          date: DateTime.now().subtract(const Duration(days: 2)),
        ),
        Review(
          reviewText: '',
          rating: 4,
          date: DateTime.now().subtract(const Duration(days: 3)),
        ),
      ],
    );
  }
}

class RatingsFeedbackScreen extends StatefulWidget {
  const RatingsFeedbackScreen({super.key});

  @override
  State<RatingsFeedbackScreen> createState() => _RatingsFeedbackScreenState();
}

class _RatingsFeedbackScreenState extends State<RatingsFeedbackScreen> {
  final RatingService _service = RatingService();
  late Future<DriverRating> _ratingsFuture;

  @override
  void initState() {
    super.initState();
    _ratingsFuture = _service.getMyRatings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Ratings')),
      body: FutureBuilder<DriverRating>(
        future: _ratingsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load ratings.'));
          }
          final ratings = snapshot.data!;
          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Text(
                        ratings.averageRating.toStringAsFixed(2),
                        style: const TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text('Overall Rating'),
                      const SizedBox(height: 24),
                      const Text(
                        'Recent Feedback',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final review = ratings.recentReviews[index];
                  if (review.reviewText.isEmpty) return const SizedBox.shrink();
                  return ListTile(
                    leading: const Icon(Icons.comment),
                    title: Text(review.reviewText),
                    subtitle: Text(
                      review.date.toLocal().toString().split(' ')[0],
                    ),
                  );
                }, childCount: ratings.recentReviews.length),
              ),
            ],
          );
        },
      ),
    );
  }
}
