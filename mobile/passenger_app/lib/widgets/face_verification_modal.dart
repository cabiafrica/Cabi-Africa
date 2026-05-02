import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class FaceVerificationModal extends StatefulWidget {
  final VoidCallback onVerified;

  const FaceVerificationModal({super.key, required this.onVerified});

  @override
  State<FaceVerificationModal> createState() => _FaceVerificationModalState();
}

class _FaceVerificationModalState extends State<FaceVerificationModal> {
  bool _isScanning = false;
  bool _isSuccess = false;
  double _progress = 0.0;
  String _statusText = 'Align your face within the frame';

  // No longer hardcoded - using AppTheme

  void _startScan() async {
    setState(() {
      _isScanning = true;
      _statusText = 'Verifying identity...';
    });

    // Simulate scanning progress
    for (int i = 0; i <= 100; i += 5) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 100));
      setState(() {
        _progress = i / 100;
        if (i == 40) _statusText = 'Analyzing liveness...';
        if (i == 80) _statusText = 'Authenticating account...';
      });
    }

    setState(() {
      _isSuccess = true;
      _isScanning = false;
      _statusText = 'Verification Complete';
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
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.1), width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Identity Verification',
            style: GoogleFonts.outfit(
              color: AppTheme.primaryColor,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'To prevent fraudulent bookings, please complete a quick face scan before requesting your trip.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 40),
          
          // Scanning UI
          Stack(
            alignment: Alignment.center,
            children: [
              // Scanner Frame
              Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: _isSuccess 
                        ? Colors.green 
                        : (_isScanning ? AppTheme.primaryColor : Colors.white10),
                    width: 4,
                  ),
                ),
                child: ClipOval(
                  child: _isSuccess 
                      ? const Icon(Icons.check_circle, color: Colors.green, size: 80)
                      : (_isScanning 
                          ? Stack(
                              children: [
                                const Center(child: Icon(Icons.face, size: 90, color: Colors.white24)),
                                CircularProgressIndicator(
                                  value: _progress,
                                  strokeWidth: 4,
                                  color: AppTheme.primaryColor,
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
                  duration: const Duration(milliseconds: 1500),
                  onEnd: () {},
                  builder: (context, value, child) {
                    return Container(
                      width: 180 + (value * 20),
                      height: 180 + (value * 20),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppTheme.primaryColor.withValues(alpha: 1.0 - value),
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
              color: _isSuccess ? Colors.green : Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 40),
          
          if (!_isScanning && !_isSuccess)
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _startScan,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: const Text('Confirm Identity', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          const SizedBox(height: 12),
          if (!_isScanning && !_isSuccess)
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel Request', style: TextStyle(color: Colors.grey)),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

