import 'package:driver_app/services/user_service.dart';
import 'package:driver_app/services/biometric_service.dart';
import 'package:flutter/material.dart';

class BiometricCheckWrapper extends StatefulWidget {
  final Widget child;
  const BiometricCheckWrapper({super.key, required this.child});

  @override
  State<BiometricCheckWrapper> createState() => _BiometricCheckWrapperState();
}

class _BiometricCheckWrapperState extends State<BiometricCheckWrapper> {
  bool _isVerificationRequired = false;
  int _failedAttempts = 0;
  final UserService _userService = UserService();
  final BiometricService _biometricService = BiometricService();

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
      print("Failed to check user profile: $e");
    }
  }

  Future<void> _promptForVerification() async {
    if (!mounted) return;

    final bool didAuthenticate = await _biometricService.authenticate();

    if (didAuthenticate) {
      await _userService.postBiometricSuccess();
      setState(() {
        _isVerificationRequired = false;
        _failedAttempts = 0;
      });
    } else {
      setState(() {
        _failedAttempts++;
      });

      if (_failedAttempts >= 3) {
        await _userService.postBiometricFailure();
        // In a real app, this would trigger a global logout via an AuthProvider
        print("LOGGING OUT USER DUE TO 3 FAILED ATTEMPTS");
      } else {
        // Re-prompt after a short delay
        await Future.delayed(const Duration(seconds: 1));
        _promptForVerification();
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
            color: Colors.black.withValues(alpha: 0.8),
            child: const Center(
              child: Card(
                margin: EdgeInsets.all(20),
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Identity Verification Required',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 16),
                      Text(
                          'For your security, please verify your identity to continue.',
                          textAlign: TextAlign.center),
                      SizedBox(height: 24),
                      CircularProgressIndicator(),
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
