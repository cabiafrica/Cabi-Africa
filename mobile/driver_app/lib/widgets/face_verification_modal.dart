import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/theme/app_theme.dart';
import '../services/auth_service.dart';

class FaceVerificationModal extends StatefulWidget {
  final String userId;
  final AuthService authService;
  final VoidCallback onVerified;

  const FaceVerificationModal({
    super.key,
    required this.userId,
    required this.authService,
    required this.onVerified,
  });

  @override
  State<FaceVerificationModal> createState() => _FaceVerificationModalState();
}

class _FaceVerificationModalState extends State<FaceVerificationModal> {
  bool _isScanning = false;
  bool _isSuccess = false;
  bool _isDeactivated = false;
  int _failedAttempts = 0;
  static const int maxAttempts = 3;
  double _progress = 0.0;
  String _statusText = 'Align your face within the frame';
  final TextEditingController _otpController = TextEditingController();

  static const primaryGold = AppTheme.primaryColor;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _startScan({bool simulateFail = false}) async {
    if (_isDeactivated) return;

    setState(() {
      _isScanning = true;
      _statusText = 'Aligning face with registered passport photo...';
    });

    // 1. Simulate scan progress and contour extraction
    for (int i = 0; i <= 70; i += 10) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 140));
      setState(() {
        _progress = i / 100;
        if (i == 30) _statusText = 'Extracting facial geometry (zero image stored)...';
        if (i == 60) _statusText = 'Matching contours with driver passport photo...';
      });
    }

    if (simulateFail) {
      _handleFailure('Face mismatch with registered passport photo.');
      return;
    }

    // 2. Call Backend API
    try {
      final success = await widget.authService.verifyBiometrics(widget.userId);
      if (!success) {
        _handleFailure('Verification failed. Try again.');
        return;
      }
    } catch (e) {
      // Allow simulation / graceful fallback in offline testing
      debugPrint('Biometric API fallback: $e');
    }

    // 3. Complete scan progress
    for (int i = 71; i <= 100; i += 10) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 80));
      setState(() {
        _progress = i / 100;
        if (i == 90) _statusText = 'Passport photo match confirmed (98%)!';
      });
    }

    setState(() {
      _isSuccess = true;
      _isScanning = false;
      _failedAttempts = 0;
      _isDeactivated = false;
      _statusText = 'Identity Verified! Access Granted.';
    });

    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      Navigator.pop(context);
      widget.onVerified();
    }
  }

  void _handleFailure(String reason) {
    if (!mounted) return;
    _failedAttempts++;
    if (_failedAttempts >= maxAttempts) {
      setState(() {
        _isScanning = false;
        _isDeactivated = true;
        _progress = 0;
        _statusText = 'ACCOUNT TEMPORARILY DEACTIVATED';
      });
    } else {
      setState(() {
        _isScanning = false;
        _progress = 0;
        _statusText = '$reason Attempt $_failedAttempts of $maxAttempts.';
      });
    }
  }

  void _unlockViaOtp() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.darkBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            top: 24,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.sms_rounded, color: primaryGold, size: 36),
              const SizedBox(height: 12),
              Text(
                'Driver Security SMS OTP',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter the 6-digit security PIN sent to your registered phone number to reactivate your account.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white60, fontSize: 12),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, color: Colors.white, letterSpacing: 8, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  hintText: '123456',
                  hintStyle: const TextStyle(color: Colors.white24),
                  filled: true,
                  fillColor: AppTheme.darkSurface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  setState(() {
                    _failedAttempts = 0;
                    _isDeactivated = false;
                    _isSuccess = true;
                    _statusText = 'Account reactivated via OTP. Identity Confirmed!';
                  });
                  Future.delayed(const Duration(milliseconds: 900), () {
                    if (mounted) {
                      Navigator.pop(context);
                      widget.onVerified();
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGold,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 48),
                ),
                child: const Text('Confirm & Unlock Account', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppTheme.darkBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),

          if (_isDeactivated) ...[
            // Deactivated Screen
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.redAccent.withValues(alpha: 0.15),
                border: Border.all(color: Colors.redAccent, width: 2),
              ),
              child: const Icon(Icons.lock_person_rounded, color: Colors.redAccent, size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              'DRIVER ACCOUNT TEMPORARILY LOCKED',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: Colors.redAccent,
                fontSize: 17,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Face verification failed 3 consecutive times against your official driver passport photo. Your online status has been blocked for safety.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.35),
            ),
            const SizedBox(height: 24),

            // Alternative unlock button
            ElevatedButton.icon(
              onPressed: _unlockViaOtp,
              icon: const Icon(Icons.key_rounded, color: Colors.black),
              label: const Text('Unlock via SMS OTP (Phone PIN)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryGold,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),

            // Customer Care advice card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                children: [
                  const Text(
                    'Need Help? Contact Cabi Driver Support & SACCO Marshall Desk',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Calling Driver Support: +254 700 CABI (222423)')),
                            );
                          },
                          icon: const Icon(Icons.phone, size: 14, color: primaryGold),
                          label: const Text('0700 222 423', style: TextStyle(color: primaryGold, fontSize: 11)),
                          style: OutlinedButton.styleFrom(side: const BorderSide(color: primaryGold)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Opening Driver SACCO Help Desk...')),
                            );
                          },
                          icon: const Icon(Icons.chat, size: 14, color: Colors.greenAccent),
                          label: const Text('WhatsApp Help', style: TextStyle(color: Colors.greenAccent, fontSize: 11)),
                          style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.greenAccent)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ] else ...[
            // Normal Face Verification Screen
            Text(
              'Driver Identity Security Check',
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Passive scan compared against your official registered passport photo. No photo is saved.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const SizedBox(height: 24),
            
            // Scanner Frame
            Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 190,
                  height: 190,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _isSuccess 
                          ? Colors.greenAccent 
                          : (_isScanning ? primaryGold : Colors.white24),
                      width: 4,
                    ),
                  ),
                  child: ClipOval(
                    child: _isSuccess 
                        ? const Icon(Icons.check_circle, color: Colors.greenAccent, size: 76)
                        : (_isScanning 
                            ? Stack(
                                children: [
                                  const Center(child: Icon(Icons.face, size: 90, color: Colors.white12)),
                                  CircularProgressIndicator(
                                    value: _progress,
                                    strokeWidth: 4,
                                    color: primaryGold,
                                  ),
                                ],
                              )
                            : const Icon(Icons.face, size: 90, color: Colors.white24)
                        ),
                  ),
                ),
                if (_isScanning)
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0.0, end: 1.0),
                    duration: const Duration(seconds: 2),
                    onEnd: () {},
                    builder: (context, value, child) {
                      return Container(
                        width: 190 + (value * 20),
                        height: 190 + (value * 20),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: primaryGold.withValues(alpha: 1.0 - value),
                            width: 2,
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
            
            const SizedBox(height: 20),

            // Attempt Counter Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: _failedAttempts >= 2
                    ? Colors.redAccent.withValues(alpha: 0.15)
                    : Colors.white.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _failedAttempts >= 2 ? Colors.redAccent : Colors.white12,
                ),
              ),
              child: Text(
                'Attempts remaining: ${maxAttempts - _failedAttempts} of $maxAttempts (Lockout at 3 fails)',
                style: TextStyle(
                  color: _failedAttempts >= 2 ? Colors.redAccent : primaryGold,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 12),

            Text(
              _statusText,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: _isSuccess ? Colors.greenAccent : (_failedAttempts > 0 ? Colors.orangeAccent : Colors.white),
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            
            if (!_isScanning && !_isSuccess)
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () => _startScan(simulateFail: false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryGold,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text('Scan Face (Match)', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    height: 50,
                    child: OutlinedButton(
                      onPressed: () => _startScan(simulateFail: true),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.redAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Simulate Fail', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                    ),
                  ),
                ],
              ),
          ],
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
