import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:driver_app/services/user_service.dart';
import 'package:driver_app/services/biometric_service.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/screens/login_screen.dart';

class BiometricCheckWrapper extends ConsumerStatefulWidget {
  final Widget child;
  const BiometricCheckWrapper({super.key, required this.child});

  @override
  ConsumerState<BiometricCheckWrapper> createState() => _BiometricCheckWrapperState();
}

class _BiometricCheckWrapperState extends ConsumerState<BiometricCheckWrapper> {
  bool _isVerificationRequired = false;
  int _failedAttempts = 0;
  final UserService _userService = UserService();
  final BiometricService _biometricService = BiometricService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _checkBiometricFlag();
  }

  Future<void> _checkBiometricFlag() async {
    try {
      final profile = await _userService.getUserProfile();
      if (profile['requiresBiometricCheck'] == true) {
        setState(() {
          _isVerificationRequired = true;
        });
        _promptForVerification();
      }
    } catch (e) {
      debugPrint("Failed to check user profile: $e");
    }
  }

  Future<void> _handleSecurityLockout() async {
    if (!mounted) return;

    try {
      // 1. Notify backend of biometric failure
      await _userService.postBiometricFailure();
    } catch (e) {
      debugPrint("Error reporting biometric failure to backend: $e");
    }

    try {
      // 2. Wipe cached authentication token from secure storage
      await _storage.delete(key: 'authToken');
    } catch (_) {}

    if (!mounted) return;

    // 3. Trigger global auth state logout via Riverpod
    try {
      ref.read(authProvider.notifier).logout();
    } catch (e) {
      debugPrint("AuthNotifier logout error: $e");
    }

    // 4. Show security lockout notification and navigate to LoginScreen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Security Lockout: 3 failed biometric verification attempts. Session revoked. Please log in again.',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.redAccent,
        duration: Duration(seconds: 5),
      ),
    );

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> _promptForVerification() async {
    if (!mounted) return;

    final bool didAuthenticate = await _biometricService.authenticate();

    if (didAuthenticate) {
      await _userService.postBiometricSuccess();
      if (mounted) {
        setState(() {
          _isVerificationRequired = false;
          _failedAttempts = 0;
        });
      }
    } else {
      if (!mounted) return;
      setState(() {
        _failedAttempts++;
      });

      if (_failedAttempts >= 3) {
        debugPrint("CRITICAL SECURITY TRIGGER: 3 FAILED BIOMETRIC ATTEMPTS -> ENFORCING LOGOUT");
        await _handleSecurityLockout();
      } else {
        // Warn the driver about remaining attempts
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Biometric verification failed. ${_failedAttempts}/3 attempts used.',
            ),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 2),
          ),
        );
        // Re-prompt after a brief pause
        await Future.delayed(const Duration(seconds: 1));
        if (mounted && _isVerificationRequired) {
          _promptForVerification();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (_isVerificationRequired)
          Container(
            color: Colors.black.withValues(alpha: 0.85),
            child: Center(
              child: Card(
                margin: const EdgeInsets.all(24),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.fingerprint, size: 56, color: Colors.blueAccent),
                      const SizedBox(height: 16),
                      const Text(
                        'Driver Identity Verification',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'For road safety and passenger security, please authenticate with your fingerprint or face scan.\nAttempt ${_failedAttempts + 1} of 3.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: _promptForVerification,
                        icon: const Icon(Icons.security),
                        label: const Text('Authenticate Now'),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size.fromHeight(44),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
