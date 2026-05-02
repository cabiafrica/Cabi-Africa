import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ratings_service.dart';
import '../providers/auth_provider.dart';
import 'package:driver_app/theme/app_theme.dart';

class RatingsScreen extends ConsumerStatefulWidget {
  final RatingsService? ratingsService;

  const RatingsScreen({super.key, this.ratingsService});

  @override
  ConsumerState<RatingsScreen> createState() => _RatingsScreenState();
}

class _RatingsScreenState extends ConsumerState<RatingsScreen> {
  late final RatingsService _ratingsService;
  Future<RatingsData>? _ratingsFuture;
  String? _lastDriverId;

  @override
  void initState() {
    super.initState();
    _ratingsService = widget.ratingsService ?? RatingsService();
    
    // Defer the initial load to after the first frame to safely use ref
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final authState = ref.read(authProvider);
        if (authState is Authenticated) {
          _loadRatings(authState.userId ?? 'driver-test-id');
        } else {
          _loadRatings('driver-test-id');
        }
      }
    });
  }

  void _loadRatings(String driverId) {
    setState(() {
      _lastDriverId = driverId;
      _ratingsFuture = _ratingsService.fetchRatings(driverId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    // Update if driverId changes (e.g. logout/login without screen dispose)
    if (authState is Authenticated && authState.userId != _lastDriverId) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _loadRatings(authState.userId!);
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Ratings'),
        elevation: 0,
      ),
      body: FutureBuilder<RatingsData>(
        future: _ratingsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 12),
                  Text('Failed to load ratings: ${snapshot.error}',
                      textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => setState(() {
                      _ratingsFuture =
                          _ratingsService.fetchRatings(_lastDriverId!);
                    }),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          if (!snapshot.hasData || snapshot.data!.totalRatings == 0) {
            return RefreshIndicator(
              onRefresh: () async {
                setState(() {
                  _ratingsFuture = _ratingsService.fetchRatings(_lastDriverId!);
                });
                await _ratingsFuture;
              },
              child: Stack(
                children: [
                  ListView(),
                  const Center(child: Text('No ratings data available yet.')),
                ],
              ),
            );
          }

          final data = snapshot.data!;
          return RefreshIndicator(
            onRefresh: () async {
              setState(() {
                _ratingsFuture = _ratingsService.fetchRatings(_lastDriverId!);
              });
              await _ratingsFuture;
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Overall Rating Card
                  _OverallRatingCard(data: data),
                  const SizedBox(height: 20),

                  // Category Breakdown
                  _CategoryBreakdown(categories: data.categories),
                  const SizedBox(height: 20),

                  // Recent Reviews
                  Text(
                    'Recent Reviews',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  ...data.recentReviews
                      .map((review) => _ReviewCard(review: review)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _OverallRatingCard extends StatelessWidget {
  final RatingsData data;
  const _OverallRatingCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const Text('Overall Rating',
              style: TextStyle(color: Colors.white54, fontSize: 13)),
          const SizedBox(height: 8),
          Text(
            data.overallRating.toStringAsFixed(1),
            style: const TextStyle(
              color: AppTheme.primaryColor,
              fontSize: 52,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final filled = index < data.overallRating.floor();
              final partial = !filled && index < data.overallRating;
              return Icon(
                partial ? Icons.star_half : Icons.star,
                color: filled || partial
                    ? AppTheme.primaryColor
                    : Colors.white24,
                size: 22,
              );
            }),
          ),
          const SizedBox(height: 8),
          Text(
            'Based on ${data.totalRatings} ratings',
            style: const TextStyle(color: Colors.white54, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _CategoryBreakdown extends StatelessWidget {
  final List<CategoryRating> categories;
  const _CategoryBreakdown({required this.categories});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Category Breakdown',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...categories.map((cat) => _CategoryRow(category: cat)),
      ],
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final CategoryRating category;
  const _CategoryRow({required this.category});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(category.icon, size: 18, color: Colors.grey.shade600),
          const SizedBox(width: 10),
          SizedBox(
            width: 100,
            child:
                Text(category.category, style: const TextStyle(fontSize: 13)),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: category.score / 5.0,
                backgroundColor: Colors.grey.shade200,
                color: AppTheme.primaryColor,
                minHeight: 8,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            category.score.toStringAsFixed(1),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final PassengerReview review;
  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(review.passengerName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 14)),
                Row(
                  children: List.generate(
                    5,
                    (i) => Icon(
                      Icons.star,
                      size: 14,
                      color: i < review.rating
                          ? AppTheme.primaryColor
                          : Colors.grey.shade300,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            if (review.comment.isNotEmpty)
              Text(review.comment,
                  style: const TextStyle(color: Colors.black87, fontSize: 13)),
            const SizedBox(height: 6),
            Text(review.date,
                style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
