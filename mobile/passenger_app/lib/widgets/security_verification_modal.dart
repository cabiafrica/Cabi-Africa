import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

enum VerificationMethod { face, fingerprint, otp }

class SecurityVerificationModal extends ConsumerStatefulWidget {
  final VoidCallback onVerified;

  const SecurityVerificationModal({
    super.key,
    required this.onVerified,
  });

  @override
  ConsumerState<SecurityVerificationModal> createState() => _SecurityVerificationModalState();
}

class _SecurityVerificationModalState extends ConsumerState<SecurityVerificationModal> {
  final LocalAuthentication auth = LocalAuthentication();
  VerificationMethod? _selectedMethod;
  bool _isVerifying = false;
  bool _isSuccess = false;
  String? _otpCode;
  final TextEditingController _otpController = TextEditingController();
  
  // Simulation states
  double _scanningProgress = 0.0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verifyBiometric(VerificationMethod method) async {
    setState(() {
      _isVerifying = true;
      _scanningProgress = 0.0;
    });

    try {
      final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await auth.isDeviceSupported();

      if (canAuthenticate) {
        await auth.getAvailableBiometrics();
        
        // Simulation for UI "Wow" effect
        _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
          setState(() {
            _scanningProgress += 0.05;
            if (_scanningProgress >= 1.0) {
              _scanningProgress = 1.0;
              timer.cancel();
            }
          });
        });

        await Future.delayed(const Duration(seconds: 2));

        final bool didAuthenticate = await auth.authenticate(
          localizedReason: 'Please authenticate to proceed with your ride request',
          options: const AuthenticationOptions(
            stickyAuth: true,
            biometricOnly: true,
          ),
        );

        if (didAuthenticate && mounted) {
          _success();
        }
      } else {
        // Fallback for simulation/testing if device doesn't support biometrics
        _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
          setState(() {
            _scanningProgress += 0.05;
            if (_scanningProgress >= 1.0) {
              _scanningProgress = 1.0;
              timer.cancel();
            }
          });
        });
        await Future.delayed(const Duration(seconds: 2));
        _success();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  void _sendOtp() {
    setState(() {
      _isVerifying = true;
    });
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _otpCode = "123456"; // Mock OTP
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification code sent to your phone: 123456')),
        );
      }
    });
  }

  void _verifyOtp() {
    if (_otpController.text == "123456") {
      _success();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid code. Try 123456')),
      );
    }
  }

  void _success() async {
    setState(() {
      _isSuccess = true;
      _isVerifying = false;
    });
    
    // Wait for the user to see the success checkmark
    await Future.delayed(const Duration(milliseconds: 1500));
    
    if (mounted) {
      Navigator.pop(context);
      widget.onVerified();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: const BoxDecoration(
        color: AppTheme.darkBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Identity Verification',
            style: GoogleFonts.outfit(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Secure your ride with a quick check',
            style: GoogleFonts.outfit(
              fontSize: 16,
              color: Colors.white.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 32),
          
          if (_isSuccess)
            _buildSuccessState()
          else if (_selectedMethod == null) 
            _buildMethodSelection()
          else if (_selectedMethod == VerificationMethod.otp)
            _buildOtpVerification()
          else
            _buildBiometricVerification(),
            
          const SizedBox(height: 24),
          if (_selectedMethod != null && !_isVerifying && !_isSuccess)
            TextButton(
              onPressed: () => setState(() => _selectedMethod = null),
              child: Text(
                'Try another method',
                style: GoogleFonts.outfit(color: AppTheme.primaryColor),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMethodSelection() {
    return Column(
      children: [
        _buildMethodCard(
          method: VerificationMethod.face,
          icon: Icons.face_retouching_natural,
          title: 'Face Recognition',
          subtitle: 'Use your front camera',
        ),
        const SizedBox(height: 16),
        _buildMethodCard(
          method: VerificationMethod.fingerprint,
          icon: Icons.fingerprint,
          title: 'Fingerprint Scan',
          subtitle: 'Use your touch ID',
        ),
        const SizedBox(height: 16),
        _buildMethodCard(
          method: VerificationMethod.otp,
          icon: Icons.sms_outlined,
          title: 'OTP Verification',
          subtitle: 'Code sent via SMS',
        ),
      ],
    );
  }

  Widget _buildSuccessState() {
    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle,
            color: Colors.green,
            size: 64,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Verification Successful',
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildMethodCard({
    required VerificationMethod method,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return GestureDetector(
      onTap: () {
        setState(() => _selectedMethod = method);
        if (method != VerificationMethod.otp) {
          _verifyBiometric(method);
        } else {
          _sendOtp();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppTheme.primaryColor, size: 28),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.white.withValues(alpha: 0.3)),
          ],
        ),
      ),
    );
  }

  Widget _buildBiometricVerification() {
    final isFace = _selectedMethod == VerificationMethod.face;
    
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 120,
              height: 120,
              child: CircularProgressIndicator(
                value: _scanningProgress,
                strokeWidth: 4,
                backgroundColor: Colors.white.withValues(alpha: 0.05),
                color: AppTheme.primaryColor,
              ),
            ),
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isFace ? Icons.face_unlock_outlined : Icons.fingerprint,
                color: AppTheme.primaryColor,
                size: 50,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        Text(
          _scanningProgress < 1.0 ? 'Scanning...' : 'Authenticating...',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildOtpVerification() {
    if (_otpCode == null && _isVerifying) {
      return const CircularProgressIndicator(color: AppTheme.primaryColor);
    }
    
    return Column(
      children: [
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          textAlign: TextAlign.center,
          maxLength: 6,
          style: GoogleFonts.outfit(
            fontSize: 32,
            letterSpacing: 10,
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
          decoration: InputDecoration(
            hintText: '000000',
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.1)),
            counterText: '',
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
            ),
            focusedBorder: const UnderlineInputBorder(
              borderSide: BorderSide(color: AppTheme.primaryColor),
            ),
          ),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _verifyOtp,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryColor,
            foregroundColor: Colors.black,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: Text(
            'Verify & Request Ride',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ),
      ],
    );
  }
}
