import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum NotificationEvent {
  driverOnline('driver_online', 'Driver Goes Live', 'Chime when turning online'),
  driverOffline('driver_offline', 'Driver Goes Offline', 'Chime when turning offline'),
  passengerReady('passenger_ready', 'Passenger Ready to Request', 'Passenger initiating search'),
  driverMatched('driver_matched', 'Driver Matched', 'Driver assigned to passenger trip'),
  driverRequestIncoming('driver_request_incoming', 'New Ride Request', 'Radar pulse when ride offer received'),
  driverAccepted('driver_accepted', 'Driver Accepts Trip', 'Confirmation chime upon accepting'),
  driverRejected('driver_rejected', 'Driver Rejects Trip', 'Alert when offer is declined'),
  tripPassed('trip_passed', 'Trip Passed', 'Notification when trip passed to next driver'),
  driverArrived('driver_arrived', 'Driver Arrived', 'Announcement at pickup pin'),
  tripStarted('trip_started', 'Trip Started', 'Start chime when ride begins'),
  tripEnded('trip_ended', 'Trip Ended', 'Celebratory completion tone'),
  passengerCancelled('passenger_cancelled', 'Passenger Cancelled', 'Alert when passenger cancels');

  final String key;
  final String title;
  final String description;
  const NotificationEvent(this.key, this.title, this.description);
}

class AudioNotificationService {
  static final AudioNotificationService instance = AudioNotificationService._internal();
  AudioNotificationService._internal();

  String _preset = 'modern'; // 'modern', 'bell', 'digital'
  double _volume = 0.8;
  bool _muted = false;
  final Map<String, bool> _enabledEvents = {};

  String get preset => _preset;
  double get volume => _volume;
  bool get muted => _muted;
  Map<String, bool> get enabledEvents => Map.unmodifiable(_enabledEvents);

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _preset = prefs.getString('cabi_audio_preset') ?? 'modern';
      _volume = prefs.getDouble('cabi_audio_volume') ?? 0.8;
      _muted = prefs.getBool('cabi_audio_muted') ?? false;

      for (var ev in NotificationEvent.values) {
        _enabledEvents[ev.key] = prefs.getBool('cabi_audio_ev_${ev.key}') ?? true;
      }
    } catch (e) {
      debugPrint('Error initializing AudioNotificationService: $e');
    }
  }

  bool isEventEnabled(String eventKey) {
    return _enabledEvents[eventKey] ?? true;
  }

  Future<void> setEventEnabled(String eventKey, bool enabled) async {
    _enabledEvents[eventKey] = enabled;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('cabi_audio_ev_$eventKey', enabled);
    } catch (e) {
      debugPrint('Error saving event audio setting: $e');
    }
  }

  Future<void> setPreset(String preset) async {
    _preset = preset;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cabi_audio_preset', preset);
      await play(NotificationEvent.driverAccepted.key); // preview
    } catch (e) {
      debugPrint('Error saving audio preset: $e');
    }
  }

  Future<void> setVolume(double vol) async {
    _volume = vol.clamp(0.0, 1.0);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble('cabi_audio_volume', _volume);
    } catch (e) {
      debugPrint('Error saving audio volume: $e');
    }
  }

  Future<void> setMuted(bool isMuted) async {
    _muted = isMuted;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('cabi_audio_muted', _muted);
    } catch (e) {
      debugPrint('Error saving audio mute: $e');
    }
  }

  Future<void> play(String eventKey) async {
    if (_muted) return;
    if (_enabledEvents[eventKey] == false) return;

    try {
      switch (eventKey) {
        case 'driver_online':
        case 'driver_accepted':
        case 'driver_arrived':
        case 'trip_started':
          await SystemSound.play(SystemSoundType.click);
          await SystemSound.play(SystemSoundType.alert);
          await HapticFeedback.mediumImpact();
          await Future.delayed(const Duration(milliseconds: 140));
          await SystemSound.play(SystemSoundType.click);
          await HapticFeedback.heavyImpact();
          break;

        case 'driver_request_incoming':
          await SystemSound.play(SystemSoundType.click);
          await SystemSound.play(SystemSoundType.alert);
          await HapticFeedback.heavyImpact();
          await Future.delayed(const Duration(milliseconds: 180));
          await SystemSound.play(SystemSoundType.click);
          await Future.delayed(const Duration(milliseconds: 180));
          await SystemSound.play(SystemSoundType.click);
          await HapticFeedback.heavyImpact();
          break;

        case 'trip_ended':
          await SystemSound.play(SystemSoundType.click);
          await SystemSound.play(SystemSoundType.alert);
          await HapticFeedback.selectionClick();
          await Future.delayed(const Duration(milliseconds: 120));
          await SystemSound.play(SystemSoundType.click);
          await Future.delayed(const Duration(milliseconds: 120));
          await SystemSound.play(SystemSoundType.click);
          await HapticFeedback.mediumImpact();
          break;

        case 'driver_offline':
        case 'driver_rejected':
        case 'trip_passed':
        case 'passenger_cancelled':
          await SystemSound.play(SystemSoundType.click);
          await HapticFeedback.lightImpact();
          break;

        default:
          await SystemSound.play(SystemSoundType.click);
          await HapticFeedback.selectionClick();
      }
    } catch (e) {
      debugPrint('Audio notification play error: $e');
    }
  }
}
