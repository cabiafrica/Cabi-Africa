import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import '../providers/auth_provider.dart';
import '../providers/providers.dart';
import '../services/ride_service.dart';
import '../theme/app_theme.dart';

class RideHistoryScreen extends ConsumerStatefulWidget {
  const RideHistoryScreen({super.key});

  @override
  ConsumerState<RideHistoryScreen> createState() => _RideHistoryScreenState();
}

class _RideHistoryScreenState extends ConsumerState<RideHistoryScreen> {
  late Future<List<RideHistoryItem>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  void _fetchHistory() {
    final rideService = ref.read(rideServiceProvider);
    final riverpodAuth = ref.read(passengerAuthProvider);
    final authProvider =
        legacy_provider.Provider.of<AuthProvider>(context, listen: false);
    final userId = (riverpodAuth is Authenticated ? riverpodAuth.userId : null) ??
        authProvider.userId;
    if (userId == null || userId.isEmpty) {
      _historyFuture = Future.value([]);
      return;
    }
    _historyFuture = rideService.getRideHistory(userId);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.lightBackground,
      appBar: AppBar(
        title: Text(
          'Your Rides',
          style: AppTheme.montserrat(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
            fontSize: 18,
          ),
        ),
        elevation: 0,
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        iconTheme: IconThemeData(color: isDark ? AppTheme.primaryColor : Colors.black87),
      ),
      body: FutureBuilder<List<RideHistoryItem>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error loading ride history',
                style: AppTheme.plusJakartaSans(
                  color: isDark ? Colors.white70 : Colors.black87,
                  fontSize: 14,
                ),
              ),
            );
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history_toggle_off_rounded,
                    size: 56,
                    color: isDark ? Colors.white24 : Colors.grey[400],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'No rides found.',
                    style: AppTheme.plusJakartaSans(
                      color: isDark ? Colors.white60 : Colors.black54,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            );
          }

          final rides = snapshot.data!;
          return RefreshIndicator(
            color: AppTheme.primaryColor,
            onRefresh: () async {
              setState(() {
                _fetchHistory();
              });
            },
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              itemCount: rides.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final ride = rides[index];
                final isCancelled = ride.status.toLowerCase().contains('cancel');
                final isCompleted = ride.status.toLowerCase().contains('complete');

                return Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceContainer : Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => RideDetailsScreen(ride: ride),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              width: 46,
                              height: 46,
                              decoration: BoxDecoration(
                                color: isCancelled
                                    ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                                    : (isCompleted
                                        ? AppTheme.successGreen.withValues(alpha: 0.15)
                                        : AppTheme.electricBlue.withValues(alpha: 0.15)),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isCancelled
                                      ? const Color(0xFFEF4444).withValues(alpha: 0.3)
                                      : (isCompleted
                                          ? AppTheme.successGreen.withValues(alpha: 0.3)
                                          : AppTheme.electricBlue.withValues(alpha: 0.3)),
                                ),
                              ),
                              child: Icon(
                                isCancelled
                                    ? Icons.cancel_outlined
                                    : Icons.directions_car_filled_rounded,
                                color: isCancelled
                                    ? const Color(0xFFEF4444)
                                    : (isCompleted ? AppTheme.successGreen : AppTheme.electricBlue),
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ride.destination,
                                    style: AppTheme.montserrat(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Text(
                                        '${ride.date.day}/${ride.date.month} • ${ride.status}',
                                        style: AppTheme.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: isCancelled
                                              ? const Color(0xFFEF4444)
                                              : (isDark ? Colors.white54 : Colors.grey[600]),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'KES ${ride.price.toStringAsFixed(0)}',
                                  style: AppTheme.montserrat(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15.5,
                                    color: isDark ? AppTheme.primaryColor : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Icon(
                                  Icons.arrow_forward_ios_rounded,
                                  size: 13,
                                  color: isDark ? Colors.white24 : Colors.black26,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class RideDetailsScreen extends StatelessWidget {
  final RideHistoryItem ride;

  const RideDetailsScreen({super.key, required this.ride});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isCancelled = ride.status.toLowerCase().contains('cancel');

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.lightBackground,
      appBar: AppBar(
        title: Text(
          'Ride Details',
          style: AppTheme.montserrat(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
            fontSize: 18,
          ),
        ),
        elevation: 0,
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        iconTheme: IconThemeData(color: isDark ? AppTheme.primaryColor : Colors.black87),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Map Snapshot Card (Stitch Obsidian Gold Cartography)
            Container(
              height: 190,
              width: double.infinity,
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.map_rounded,
                          size: 40,
                          color: isDark ? AppTheme.primaryColor.withValues(alpha: 0.5) : Colors.grey[400],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Map Snapshot Placeholder',
                          style: AppTheme.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                            color: isDark ? Colors.white38 : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.black.withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.route_rounded, color: AppTheme.primaryColor, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'Expressway',
                            style: AppTheme.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.primaryColor),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // Destination and Date Summary
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.location_on_rounded, color: AppTheme.primaryColor, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ride.destination,
                              style: AppTheme.montserrat(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${ride.date.day}/${ride.date.month}/${ride.date.year} at ${ride.date.hour}:${ride.date.minute.toString().padLeft(2, '0')}',
                              style: AppTheme.inter(
                                fontSize: 12.5,
                                color: isDark ? Colors.white54 : Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Driver & Payment Breakdown Bento Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TRIP BREAKDOWN',
                    style: AppTheme.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow('Driver', ride.driverName, isDark: isDark),
                  const SizedBox(height: 14),
                  _buildDetailRow(
                    'Status',
                    ride.status,
                    isDark: isDark,
                    customColor: isCancelled ? const Color(0xFFEF4444) : AppTheme.successGreen,
                  ),
                  const SizedBox(height: 14),
                  Divider(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider, height: 1),
                  const SizedBox(height: 14),
                  _buildDetailRow(
                    'Total Fare',
                    'KES ${ride.price.toStringAsFixed(0)}',
                    isBold: true,
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Re-book CTA Button (Obsidian Gold Gradient)
            Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                gradient: AppTheme.goldGradient,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Re-booking trip to ${ride.destination}...'),
                      backgroundColor: isDark ? AppTheme.surfaceContainerHighest : Colors.black87,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.repeat_rounded, color: Colors.black, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Re-book Ride',
                      style: AppTheme.montserrat(
                        fontWeight: FontWeight.bold,
                        fontSize: 14.5,
                        letterSpacing: 0.5,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool isBold = false,
    bool isDark = true,
    Color? customColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTheme.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white60 : Colors.grey[700],
          ),
        ),
        Text(
          value,
          style: isBold
              ? AppTheme.montserrat(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: isDark ? AppTheme.primaryColor : Colors.black,
                )
              : AppTheme.plusJakartaSans(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w600,
                  color: customColor ?? (isDark ? Colors.white : Colors.black87),
                ),
        ),
      ],
    );
  }
}
