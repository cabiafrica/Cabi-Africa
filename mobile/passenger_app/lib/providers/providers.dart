import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/ride_service.dart';
import '../services/payment_service.dart';
import '../services/notification_service.dart';
import '../services/support_service.dart';
import '../services/emergency_contact_service.dart';
import '../services/user_service.dart';
import '../services/food_order_service.dart';

/// Provider for the NotificationService singleton.
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

/// Provider for the RideService.
final rideServiceProvider = Provider<RideService>((ref) {
  return RideService();
});

/// A stream provider that exposes the stream of incoming ride requests.
final rideRequestStreamProvider =
    StreamProvider.autoDispose<Map<String, dynamic>>((ref) {
  return ref.watch(notificationServiceProvider).rideRequestStream;
});

final paymentServiceProvider = Provider<PaymentService>((ref) {
  return PaymentService();
});

final supportServiceProvider = Provider<SupportService>((ref) {
  return SupportService();
});

final emergencyContactServiceProvider =
    Provider<EmergencyContactService>((ref) {
  return EmergencyContactService();
});

final userServiceProvider = Provider<UserService>((ref) {
  return UserService();
});

final foodOrderServiceProvider = Provider<FoodOrderService>((ref) {
  return FoodOrderService();
});
