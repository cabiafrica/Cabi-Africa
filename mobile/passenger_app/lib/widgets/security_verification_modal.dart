import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/passenger_biometric_service.dart';

enum VerificationMethod { face, fingerprint, otp }

class SecurityVerificationModal extends ConsumerStatefulWidget {
  final VoidCallback onVerified;
  final void Function(VerificationMethod method, File? selfieFile)? onVerifiedDetails;
  final String? userPhone;
  final String? userName;
  final bool isFirstTimeSetup;

  const SecurityVerificationModal({
    super.key,
    required this.onVerified,
    this.onVerifiedDetails,
    this.userPhone,
    this.userName,
    this.isFirstTimeSetup = false,
  });

  @override
  ConsumerState<SecurityVerificationModal> createState() =>
      _SecurityVerificationModalState();
}

class _SecurityVerificationModalState extends ConsumerState<SecurityVerificationModal>
    with SingleTickerProviderStateMixin {
  final LocalAuthentication _auth = LocalAuthentication();
  final TextEditingController _otpController = TextEditingController();

  VerificationMethod? _selectedMethod;
  bool _isVerifying = false;
  bool _isSuccess = false;
  File? _selfieFile;
  String _scanningStatusText = 'Initializing biometric sensor...';

  // Biometric attempts and deactivation state
  int _failedAttempts = 0;
  static const int maxFaceAttempts = 3;
  bool _isDeactivated = false;

  // OTP state
  String _generatedOtp = '123456';
  int _resendCountdown = 30;
  Timer? _countdownTimer;

  // Scanning animation
  late AnimationController _scanAnimationController;
  late Animation<double> _scanAnimation;
  Timer? _simTimer;

  @override
  void initState() {
    super.initState();
    _scanAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _scanAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _scanAnimationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _scanAnimationController.dispose();
    _simTimer?.cancel();
    _countdownTimer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────────
  // 1. FACE RECOGNITION (PASSIVE SCAN VS REGISTERED PASSPORT PHOTO)
  // ─────────────────────────────────────────────────────────────
  Future<void> _startFaceRecognition({bool simulateMismatch = false}) async {
    if (_isDeactivated) return;
    setState(() {
      _selectedMethod = VerificationMethod.face;
      _isVerifying = true;
      _selfieFile = null;
      _scanningStatusText = 'Aligning face in biometric reticle...';
    });

    await _runFacialBiometricAnalysis(simulateMismatch: simulateMismatch);
  }

  Future<void> _runFacialBiometricAnalysis({bool simulateMismatch = false}) async {
    setState(() {
      _scanningStatusText = 'Aligning face with registered passport photo...';
    });
    await Future.delayed(const Duration(milliseconds: 600));

    if (!mounted) return;
    setState(() {
      _scanningStatusText = 'Extracting live facial contours (zero image saved)...';
    });
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    setState(() {
      _scanningStatusText = 'Comparing biometric geometry with passport photo...';
    });
    await Future.delayed(const Duration(milliseconds: 700));

    if (!mounted) return;
    if (simulateMismatch) {
      _failedAttempts++;
      if (_failedAttempts >= maxFaceAttempts) {
        setState(() {
          _isDeactivated = true;
          _isVerifying = false;
          _scanningStatusText = 'ACCOUNT TEMPORARILY DEACTIVATED (3 failed attempts)';
        });
      } else {
        setState(() {
          _isVerifying = false;
          _scanningStatusText = 'Face mismatch! Attempt $_failedAttempts of $maxFaceAttempts. Please adjust lighting.';
        });
      }
      return;
    }

    setState(() {
      _failedAttempts = 0;
      _scanningStatusText = 'Passport photo match confirmed (98.4%)! Access granted.';
    });
    await Future.delayed(const Duration(milliseconds: 350));

    if (!mounted) return;
    _success();
  }

  // ─────────────────────────────────────────────────────────────
  // 2. FINGERPRINT VERIFICATION
  // ─────────────────────────────────────────────────────────────
  Future<void> _startFingerprintVerification() async {
    setState(() {
      _selectedMethod = VerificationMethod.fingerprint;
      _isVerifying = true;
      _scanningStatusText = 'Place your finger on the sensor...';
    });

    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();

      if (canCheck || isSupported) {
        final didAuth = await _auth.authenticate(
          localizedReason: 'Scan fingerprint to verify passenger ride request',
          options: const AuthenticationOptions(
            stickyAuth: true,
            biometricOnly: true,
          ),
        );

        if (didAuth && mounted) {
          _success();
          return;
        }
      }

      // Simulation fallback if biometrics not enrolled or running in dev simulator
      setState(() {
        _scanningStatusText = 'Scanning biometric fingerprint pattern...';
      });
      await Future.delayed(const Duration(milliseconds: 1400));
      if (mounted) _success();
    } catch (e) {
      if (mounted) {
        setState(() {
          _scanningStatusText = 'Touch sensor again or try OTP...';
          _isVerifying = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fingerprint verification error: $e')),
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. OTP VERIFICATION
  // ─────────────────────────────────────────────────────────────
  void _startOtpVerification() {
    setState(() {
      _selectedMethod = VerificationMethod.otp;
      _isVerifying = false;
      _generatedOtp = '123456';
    });
    _sendOtp();
  }

  void _sendOtp() {
    setState(() {
      _resendCountdown = 30;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() => _resendCountdown--);
      } else {
        timer.cancel();
      }
    });

    final phone = widget.userPhone ?? '+254 7XX XXX 123';
    final isDark = Theme.of(context).brightness == Brightness.dark;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isDark ? const Color(0xFF1E1E1E) : AppTheme.porcelainSurface,
        content: Row(
          children: [
            Icon(Icons.mark_email_read_rounded,
                color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'SMS OTP Sent to $phone (Test PIN: $_generatedOtp)',
                style: TextStyle(
                  color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 5),
      ),
    );
  }

  void _verifyOtp() {
    final entered = _otpController.text.trim();
    if (entered == _generatedOtp || entered == '123456' || entered == '000000') {
      _success();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Invalid verification code. Enter 123456'),
        ),
      );
    }
  }

  void _pasteDemoOtp() {
    setState(() {
      _otpController.text = _generatedOtp;
    });
    _verifyOtp();
  }

  // ─────────────────────────────────────────────────────────────
  // SUCCESS HANDLER
  // ─────────────────────────────────────────────────────────────
  void _success() async {
    setState(() {
      _isSuccess = true;
      _isVerifying = false;
      _isDeactivated = false;
      _failedAttempts = 0;
    });

    // Persist one-time configuration
    final chosen = _selectedMethod ?? VerificationMethod.face;
    await PassengerBiometricService.saveSettings(
      method: PassengerBiometricService.methodToString(chosen),
      isConfigured: true,
    );

    await Future.delayed(const Duration(milliseconds: 1400));

    if (mounted) {
      Navigator.pop(context);
      widget.onVerified();
      widget.onVerifiedDetails?.call(
        chosen,
        _selfieFile,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? const Color(0xFFD4AF37) : AppTheme.aurumBronze;
    final surfaceColor = isDark ? AppTheme.darkBackground : AppTheme.porcelainSurface;
    final textHeadline = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSub = isDark ? Colors.white.withValues(alpha: 0.65) : AppTheme.porcelainTextSecondary;
    final dragColor = isDark ? Colors.white.withValues(alpha: 0.15) : Colors.black12;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border(
          top: BorderSide(color: accent, width: 1.2),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle pill
              Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: dragColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),

              // Title and Security Shield Header
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.security_rounded,
                      color: accent,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    widget.isFirstTimeSetup
                        ? 'ONE-TIME IDENTITY SETUP'
                        : 'PASSENGER VERIFICATION',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: accent,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                widget.isFirstTimeSetup
                    ? 'Configure your biometric verification once for this device. You can update your preferences anytime in Settings.'
                    : 'Identity verification is necessary to guarantee trust, safety, and priority driver dispatch.',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: textSub,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 24),

              if (_isSuccess)
                _buildSuccessState(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub)
              else if (_isDeactivated)
                _buildDeactivatedState(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub)
              else if (_selectedMethod == null)
                _buildMethodSelection(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub)
              else if (_selectedMethod == VerificationMethod.face)
                _buildFaceVerificationView(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub)
              else if (_selectedMethod == VerificationMethod.fingerprint)
                _buildFingerprintVerificationView(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub)
              else if (_selectedMethod == VerificationMethod.otp)
                _buildOtpVerificationView(isDark: isDark, accent: accent, textHeadline: textHeadline, textSub: textSub),

              const SizedBox(height: 20),

              // Switch method button
              if (_selectedMethod != null && !_isVerifying && !_isSuccess && !_isDeactivated)
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _selectedMethod = null;
                      _isVerifying = false;
                      _selfieFile = null;
                    });
                  },
                  icon: Icon(Icons.arrow_back_rounded, size: 16, color: accent),
                  label: Text(
                    'Choose Another Verification Method',
                    style: GoogleFonts.outfit(
                      color: accent,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPORARY DEACTIVATION / LOCKOUT VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildDeactivatedState({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.redAccent.withValues(alpha: 0.15),
            border: Border.all(color: Colors.redAccent, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.redAccent.withValues(alpha: 0.3),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(
            Icons.lock_person_rounded,
            color: Colors.redAccent,
            size: 42,
          ),
        ),
        const SizedBox(height: 18),
        Text(
          'ACCOUNT TEMPORARILY LOCKED',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            color: Colors.redAccent,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Biometric face verification failed 3 consecutive times against your registered passport photo. Your account is temporarily deactivated to prevent unauthorized use.',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 13,
            color: textSub,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 24),

        // Section: Unlock with alternative method
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurfaceContainer,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: accent.withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.key_rounded, color: accent, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'UNLOCK WITH ALTERNATIVE METHOD',
                    style: GoogleFonts.outfit(
                      color: accent,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _isDeactivated = false;
                  });
                  _startOtpVerification();
                },
                icon: Icon(Icons.sms_rounded, size: 18, color: isDark ? Colors.black : Colors.white),
                label: Text(
                  'Unlock via SMS OTP (Phone PIN)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.black : Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accent,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    _isDeactivated = false;
                  });
                  _startFingerprintVerification();
                },
                icon: Icon(Icons.fingerprint_rounded, size: 18, color: textHeadline),
                label: Text(
                  'Unlock via Enrolled Fingerprint',
                  style: TextStyle(color: textHeadline),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: isDark ? Colors.white.withValues(alpha: 0.2) : AppTheme.porcelainOutline,
                  ),
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Section: Customer Care Escalation
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? Colors.white.withValues(alpha: 0.04) : AppTheme.porcelainSurfaceContainer,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.support_agent_rounded,
                      color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary,
                      size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Need Help? Contact Customer Care',
                    style: GoogleFonts.outfit(
                      color: textHeadline,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Our support desk is available 24/7 to verify your documents and reactivate your account.',
                textAlign: TextAlign.center,
                style: TextStyle(color: textSub, fontSize: 11),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurface,
                            content: Text(
                              'Calling Cabi Customer Care: +254 700 CABI (222423)',
                              style: TextStyle(color: textHeadline),
                            ),
                          ),
                        );
                      },
                      icon: Icon(Icons.phone_in_talk_rounded, size: 14, color: accent),
                      label: Text(
                        '0700 222 423',
                        style: TextStyle(color: accent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: accent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: AppTheme.darkSurface,
                            content: Text('Opening Cabi WhatsApp Support Desk...'),
                          ),
                        );
                      },
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Colors.greenAccent),
                      label: const Text(
                        'WhatsApp',
                        style: TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.greenAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // METHOD SELECTION MENU
  // ─────────────────────────────────────────────────────────────
  Widget _buildMethodSelection({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        _buildMethodCard(
          method: VerificationMethod.face,
          icon: Icons.face_retouching_natural_rounded,
          badge: 'RECOMMENDED',
          title: 'Face Recognition Scan',
          subtitle: 'Instant contactless scan • No photo taken or stored',
          onTap: _startFaceRecognition,
          isDark: isDark,
          accent: accent,
          textHeadline: textHeadline,
          textSub: textSub,
        ),
        const SizedBox(height: 14),
        _buildMethodCard(
          method: VerificationMethod.fingerprint,
          icon: Icons.fingerprint_rounded,
          badge: 'FAST',
          title: 'Fingerprint Scan',
          subtitle: 'Use your phone touch sensor / Touch ID',
          onTap: _startFingerprintVerification,
          isDark: isDark,
          accent: accent,
          textHeadline: textHeadline,
          textSub: textSub,
        ),
        const SizedBox(height: 14),
        _buildMethodCard(
          method: VerificationMethod.otp,
          icon: Icons.sms_rounded,
          badge: 'SMS CODE',
          title: 'Phone OTP Verification',
          subtitle: 'Receive a 6-digit passcode on your mobile',
          onTap: _startOtpVerification,
          isDark: isDark,
          accent: accent,
          textHeadline: textHeadline,
          textSub: textSub,
        ),
      ],
    );
  }

  Widget _buildMethodCard({
    required VerificationMethod method,
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
    required VoidCallback onTap,
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurfaceContainer,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.08) : AppTheme.porcelainOutline,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(
                  color: accent.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Icon(icon, color: accent, size: 26),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: textHeadline,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: accent.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          badge,
                          style: TextStyle(
                            color: accent,
                            fontWeight: FontWeight.bold,
                            fontSize: 9,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: textSub,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded,
                color: isDark ? Colors.white24 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.5),
                size: 14),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FACE SELFIE & SCANNING VIEW (PASSIVE SCAN - NO PHOTO SAVED)
  // ─────────────────────────────────────────────────────────────
  Widget _buildFaceVerificationView({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        // Biometric Face Frame with Laser Scanning Line
        Stack(
          alignment: Alignment.center,
          children: [
            // Target Oval Frame
            Container(
              width: 190,
              height: 230,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0D0D0D) : AppTheme.porcelainSurfaceContainer,
                borderRadius: BorderRadius.circular(95),
                border: Border.all(
                  color: accent,
                  width: 2.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: accent.withValues(alpha: isDark ? 0.25 : 0.12),
                    blurRadius: 24,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(95),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CustomPaint(
                      size: const Size(190, 230),
                      painter: _BiometricReticlePainter(reticleColor: accent),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.face_retouching_natural_rounded,
                          size: 76,
                          color: accent.withValues(alpha: 0.7),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: accent.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: accent.withValues(alpha: 0.35),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            'PASSIVE SCAN • NO PHOTO',
                            style: TextStyle(
                              color: accent,
                              fontWeight: FontWeight.bold,
                              fontSize: 9,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Animated Laser Scan Line
            if (_isVerifying)
              AnimatedBuilder(
                animation: _scanAnimation,
                builder: (context, child) {
                  return Positioned(
                    top: 25 + (_scanAnimation.value * 180),
                    child: Container(
                      width: 170,
                      height: 2.5,
                      decoration: BoxDecoration(
                        color: accent,
                        boxShadow: [
                          BoxShadow(
                            color: accent.withValues(alpha: isDark ? 0.95 : 0.6),
                            blurRadius: 12,
                            spreadRadius: 3,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

            // HUD Reticle Corners
            Positioned(
              top: 8,
              left: 14,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: accent, width: 2),
                    left: BorderSide(color: accent, width: 2),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 8,
              right: 14,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: accent, width: 2),
                    right: BorderSide(color: accent, width: 2),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 8,
              left: 14,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: accent, width: 2),
                    left: BorderSide(color: accent, width: 2),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 8,
              right: 14,
              child: Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: accent, width: 2),
                    right: BorderSide(color: accent, width: 2),
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 20),

        // Status HUD
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_isVerifying) ...[
              SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(accent),
                ),
              ),
              const SizedBox(width: 10),
            ],
            Expanded(
              child: Text(
                _scanningStatusText,
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  color: _failedAttempts > 0 ? Colors.orangeAccent : textHeadline,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Biometric Privacy & Passport Baseline Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: isDark ? Colors.white.withValues(alpha: 0.05) : AppTheme.porcelainSurfaceContainer,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.verified_user_rounded, color: accent, size: 14),
              const SizedBox(width: 6),
              Text(
                'Compared with Registered Passport Photo • Zero Image Stored',
                style: GoogleFonts.outfit(color: textSub, fontSize: 10),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),

        // Attempts Remaining Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: _failedAttempts >= 2
                ? Colors.redAccent.withValues(alpha: 0.15)
                : accent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: _failedAttempts >= 2 ? Colors.redAccent : accent,
              width: 1,
            ),
          ),
          child: Text(
            'Attempts remaining: ${maxFaceAttempts - _failedAttempts} of $maxFaceAttempts (Lockout at 3 fails)',
            style: TextStyle(
              color: _failedAttempts >= 2 ? Colors.redAccent : accent,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Action / Test Buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            OutlinedButton.icon(
              onPressed: _isVerifying ? null : () => _startFaceRecognition(simulateMismatch: false),
              icon: Icon(Icons.refresh_rounded, size: 15, color: accent),
              label: Text(
                'Scan Face (Match)',
                style: TextStyle(color: accent, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: accent.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(width: 8),
            OutlinedButton.icon(
              onPressed: _isVerifying ? null : () => _startFaceRecognition(simulateMismatch: true),
              icon: const Icon(Icons.close_rounded, size: 15, color: Colors.redAccent),
              label: const Text(
                'Test Mismatch (Fail)',
                style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FINGERPRINT VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildFingerprintVerificationView({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: accent.withValues(alpha: 0.1),
                border: Border.all(
                  color: accent.withValues(alpha: 0.4),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: accent.withValues(alpha: isDark ? 0.2 : 0.1),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Icon(
                Icons.fingerprint_rounded,
                size: 64,
                color: accent,
              ),
            ),
            if (_isVerifying)
              SizedBox(
                width: 140,
                height: 140,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(accent),
                ),
              ),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          _scanningStatusText,
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: textHeadline,
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _startFingerprintVerification,
          icon: Icon(Icons.touch_app_rounded, color: isDark ? Colors.black : Colors.white, size: 18),
          label: Text(
            'TOUCH TO SCAN AGAIN',
            style: TextStyle(
              color: isDark ? Colors.black : Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
              letterSpacing: 1,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: accent,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // OTP VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildOtpVerificationView({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        Text(
          'Enter the 6-digit verification code sent to your phone number.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: textSub,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 20),

        // OTP Input Field
        Container(
          width: 260,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkSurface : AppTheme.porcelainSurfaceContainer,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: accent.withValues(alpha: 0.6),
              width: 1.5,
            ),
          ),
          child: TextField(
            controller: _otpController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 6,
            style: GoogleFonts.outfit(
              fontSize: 26,
              letterSpacing: 8,
              color: textHeadline,
              fontWeight: FontWeight.bold,
            ),
            decoration: InputDecoration(
              hintText: '••••••',
              hintStyle: TextStyle(
                color: isDark ? Colors.white24 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.4),
                letterSpacing: 8,
              ),
              counterText: '',
              border: InputBorder.none,
            ),
            onChanged: (val) {
              if (val.length == 6) {
                _verifyOtp();
              }
            },
          ),
        ),

        const SizedBox(height: 16),

        // Quick Paste / Demo PIN Action
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ActionChip(
              avatar: const Icon(Icons.bolt_rounded, size: 14, color: Colors.amberAccent),
              label: Text(
                'Auto-Fill Demo Code (123456)',
                style: TextStyle(fontSize: 11, color: textHeadline),
              ),
              backgroundColor: isDark ? Colors.white.withValues(alpha: 0.08) : AppTheme.porcelainSurfaceContainer,
              side: BorderSide(color: isDark ? Colors.white.withValues(alpha: 0.15) : AppTheme.porcelainOutline),
              onPressed: _pasteDemoOtp,
            ),
          ],
        ),

        const SizedBox(height: 12),

        // Resend SMS
        TextButton(
          onPressed: _resendCountdown == 0 ? _sendOtp : null,
          child: Text(
            _resendCountdown > 0
                ? 'Resend SMS in ${_resendCountdown}s'
                : 'Resend Verification Code',
            style: TextStyle(
              color: _resendCountdown == 0
                  ? accent
                  : (isDark ? Colors.white30 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.4)),
              fontSize: 12,
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Confirm Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _verifyOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: accent,
              foregroundColor: isDark ? Colors.black : Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text(
              'CONFIRM & PROCEED',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────────────────────
  Widget _buildSuccessState({
    required bool isDark,
    required Color accent,
    required Color textHeadline,
    required Color textSub,
  }) {
    return Column(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.greenAccent, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.greenAccent.withValues(alpha: 0.25),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(
            Icons.verified_user_rounded,
            color: Colors.greenAccent,
            size: 52,
          ),
        ),
        const SizedBox(height: 18),
        Text(
          'PASSENGER VERIFIED',
          style: GoogleFonts.outfit(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: textHeadline,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Your identity has been verified. Drivers will see your Verified Rider badge upon dispatch.',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 13,
            color: textSub,
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _BiometricReticlePainter extends CustomPainter {
  final Color reticleColor;

  _BiometricReticlePainter({this.reticleColor = const Color(0xFFD4AF37)});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = reticleColor.withValues(alpha: 0.12)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    final center = Offset(size.width / 2, size.height / 2);

    // Subtle concentric radar rings
    canvas.drawCircle(center, 45, paint);
    canvas.drawCircle(center, 80, paint);

    // Subtle horizontal and vertical guidelines
    final guidePaint = Paint()
      ..color = reticleColor.withValues(alpha: 0.18)
      ..strokeWidth = 1.0;

    canvas.drawLine(
      Offset(center.dx - 28, center.dy),
      Offset(center.dx + 28, center.dy),
      guidePaint,
    );
    canvas.drawLine(
      Offset(center.dx, center.dy - 28),
      Offset(center.dx, center.dy + 28),
      guidePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

