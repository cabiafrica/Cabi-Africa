import 'package:flutter/material.dart';
import '../services/user_service.dart';
import 'package:passenger_app/services/biometric_service.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class BiometricCheckWrapper extends StatefulWidget {
  final Widget child;
  const BiometricCheckWrapper({super.key, required this.child});

  @override
  State<BiometricCheckWrapper> createState() => _BiometricCheckWrapperState();
}

class _BiometricCheckWrapperState extends State<BiometricCheckWrapper>
    with WidgetsBindingObserver {
  final UserService _userService = UserService();
  final BiometricService _biometricService = BiometricService();
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkForBiometricRequest();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkForBiometricRequest();
    }
  }

  Future<void> _checkForBiometricRequest() async {
    if (_isChecking) return;
    setState(() => _isChecking = true);

    try {
      final profile = await _userService.getProfile();
      if (profile['requiresBiometricCheck'] == true && mounted) {
        await _showBiometricPrompt();
      }
    } catch (e) {
      print("Error checking profile for biometric request: $e");
    } finally {
      if (mounted) setState(() => _isChecking = false);
    }
  }

  Future<void> _showBiometricPrompt() async {
    int attempts = 0;
    while (attempts < 3) {
      final didAuthenticate = await _biometricService
          .authenticate('Please verify your identity to continue.');
      if (didAuthenticate) {
        await _userService.verifyBiometric();
        return; // Success, exit the loop
      }
      attempts++;
    }

    // If loop finishes, it means 3 failed attempts
    if (mounted) {
      await _userService.biometricFailed();
      // Force logout
      Provider.of<AuthProvider>(context, listen: false).logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
