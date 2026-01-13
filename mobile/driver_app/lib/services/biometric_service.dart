import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> authenticate() async {
    try {
      final bool canAuthenticate =
          await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
      if (!canAuthenticate) {
        return false; // Or handle this case appropriately
      }

      return await _auth.authenticate(
        localizedReason: 'Please verify your identity to continue',
        options: const AuthenticationOptions(stickyAuth: true),
      );
    } on PlatformException catch (e) {
      debugPrint("Biometric Error: $e");
      return false;
    }
  }
}
