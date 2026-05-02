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
  double _progress = 0.0;
  String _statusText = 'Align your face within the frame';

  static const primaryGold = AppTheme.primaryColor;

  void _startScan() async {
    setState(() {
      _isScanning = true;
      _statusText = 'Verifying identity...';
    });

    // --- REAL BACKEND VERIFICATION ---
    // 1. Simulate scan progress for UX
    for (int i = 0; i <= 70; i += 10) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 150));
      setState(() {
        _progress = i / 100;
        if (i == 30) _statusText = 'Checking liveness...';
        if (i == 60) _statusText = 'Capturing face metrics...';
      });
    }

    // 2. Call Backend API
    try {
      final success = await widget.authService.verifyBiometrics(widget.userId);
      if (!success) {
        if (mounted) {
          setState(() {
            _isScanning = false;
            _statusText = 'Verification failed. Try again.';
            _progress = 0;
          });
        }
        return;
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isScanning = false;
          _statusText = 'Connection error. Check internet.';
        });
      }
      return;
    }

    // 3. Complete scan progress
    for (int i = 71; i <= 100; i += 10) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 100));
      setState(() {
        _progress = i / 100;
        if (i == 90) _statusText = 'Identity Verified';
      });
    }

    setState(() {
      _isSuccess = true;
      _isScanning = false;
      _statusText = 'Identity Verified';
    });

    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      Navigator.pop(context);
      widget.onVerified();
    }
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
          const SizedBox(height: 32),
          Text(
            'Daily Security Check',
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Please complete a quick face scan to ensure account security and prevent sharing.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white54, fontSize: 13),
          ),
          const SizedBox(height: 40),
          
          // Scanning UI
          Stack(
            alignment: Alignment.center,
            children: [
              // Scanner Frame
              Container(
                width: 200,
                height: 200,
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
                      ? const Icon(Icons.check_circle, color: Colors.greenAccent, size: 80)
                      : (_isScanning 
                          ? Stack(
                              children: [
                                const Center(child: Icon(Icons.face, size: 100, color: Colors.white12)),
                                CircularProgressIndicator(
                                  value: _progress,
                                  strokeWidth: 4,
                                  color: primaryGold,
                                ),
                              ],
                            )
                          : const Icon(Icons.face, size: 100, color: Colors.white24)
                      ),
                ),
              ),
              if (_isScanning)
                // Pulse effect
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(seconds: 2),
                  onEnd: () {},
                  builder: (context, value, child) {
                    return Container(
                      width: 200 + (value * 20),
                      height: 200 + (value * 20),
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
          
          const SizedBox(height: 32),
          Text(
            _statusText,
            style: GoogleFonts.outfit(
              color: _isSuccess ? Colors.greenAccent : Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 40),
          
          if (!_isScanning && !_isSuccess)
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _startScan,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGold,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Start Face Scan', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
