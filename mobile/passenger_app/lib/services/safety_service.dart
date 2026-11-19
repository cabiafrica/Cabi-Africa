import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'sos_service.dart';
import 'emergency_contact_service.dart';

class SafetyService {
  static final SafetyService _instance = SafetyService._internal();
  factory SafetyService() => _instance;
  SafetyService._internal();

  final SOSService _sosService = SOSService();
  final EmergencyContactService _contactService = EmergencyContactService();

  /**
   * Acquires device GPS and triggers real live emergency SOS to Cabi Safety Command Center
   */
  Future<SosActivationResult> triggerRealSOS({
    String? tripId,
    List<EmergencyContact>? contacts,
  }) async {
    Position? position;
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 6),
        );
      }
    } catch (e) {
      debugPrint('[SafetyService] Could not acquire high-accuracy GPS: $e');
    }

    // Fallback coordinates if location services are unavailable
    position ??= Position(
      latitude: -1.2921,
      longitude: 36.8219,
      timestamp: DateTime.now(),
      accuracy: 100.0,
      altitude: 1795.0,
      altitudeAccuracy: 10.0,
      heading: 0.0,
      headingAccuracy: 0.0,
      speed: 0.0,
      speedAccuracy: 0.0,
    );

    // Retrieve contacts if not passed
    final effectiveContacts = contacts ?? await _contactService.getContacts();
    final contactsPayload = effectiveContacts
        .map((c) => {'name': c.name, 'phone': c.phone})
        .toList();

    debugPrint('[SafetyService] 🚨 Disagreeing dummy logs - Dispatching REAL SOS to backend at [${position.latitude}, ${position.longitude}]');

    return _sosService.activateSOS(
      tripId: tripId ?? 'UNASSIGNED',
      position: position,
      emergencyContacts: contactsPayload,
    );
  }

  /**
   * Backward-compatible delegation method
   */
  Future<void> logEmergencyEvent() async {
    await triggerRealSOS();
  }
}
