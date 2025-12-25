import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/ride_service.dart';
import '../services/notification_service.dart';

/// Provides an application-wide instance of [RideService].
final rideServiceProvider = Provider<RideService>((ref) {
  return RideService();
});

/// Provides an application-wide instance of [NotificationService].
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

/// Provides a stream of incoming ride requests.
///
/// This provider listens to the [NotificationService] and exposes its stream.
final rideRequestStreamProvider = StreamProvider<Map<String, dynamic>>((ref) {
  final notificationService = ref.watch(notificationServiceProvider);
  return notificationService.rideRequestStream;
});
