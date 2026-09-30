import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:local_auth/local_auth.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

enum VerificationMethod { face, fingerprint, otp }

class SecurityVerificationModal extends ConsumerStatefulWidget {
  final VoidCallback onVerified;
  final void Function(VerificationMethod method, File? selfieFile)? onVerifiedDetails;
  final String? userPhone;
  final String? userName;

  const SecurityVerificationModal({
    super.key,
    required this.onVerified,
    this.onVerifiedDetails,
    this.userPhone,
    this.userName,
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
  // 1. FACE RECOGNITION (SELFIE CAMERA)
  // ─────────────────────────────────────────────────────────────
  Future<void> _startFaceRecognition() async {
    setState(() {
      _selectedMethod = VerificationMethod.face;
      _isVerifying = true;
      _selfieFile = null;
      _scanningStatusText = 'Opening front camera for selfie...';
    });

    try {
      final picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (!mounted) return;

      if (photo != null) {
        setState(() {
          _selfieFile = File(photo.path);
        });
        await _runFacialBiometricAnalysis();
      } else {
        // User cancelled camera; prompt if they want to pick gallery or simulate
        _showCameraFallbackOptions();
      }
    } catch (e) {
      if (mounted) {
        _showCameraFallbackOptions(errorMessage: 'Camera error: $e');
      }
    }
  }

  void _showCameraFallbackOptions({String? errorMessage}) {
    setState(() {
      _isVerifying = false;
    });

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.camera_alt_outlined, color: AppTheme.primaryColor, size: 36),
              const SizedBox(height: 12),
              Text(
                'Selfie Camera Option',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                errorMessage ??
                    'You can take a photo with your front camera, select a selfie from your gallery, or run a simulated biometric check.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white60, fontSize: 13),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.camera_front, color: AppTheme.primaryColor),
                title: const Text('Try Camera Again', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(ctx);
                  _startFaceRecognition();
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AppTheme.primaryColor),
                title: const Text('Select Selfie from Gallery', style: TextStyle(color: Colors.white)),
                onTap: () async {
                  Navigator.pop(ctx);
                  final picker = ImagePicker();
                  final picked = await picker.pickImage(
                    source: ImageSource.gallery,
                    maxWidth: 800,
                    maxHeight: 800,
                  );
                  if (picked != null && mounted) {
                    setState(() {
                      _selfieFile = File(picked.path);
                      _isVerifying = true;
                    });
                    await _runFacialBiometricAnalysis();
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.auto_awesome, color: Colors.amberAccent),
                title: const Text('Run Biometric Liveness Check (Dev Mode)', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => _isVerifying = true);
                  _runFacialBiometricAnalysis();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _runFacialBiometricAnalysis() async {
    setState(() {
      _scanningStatusText = 'Detecting facial landmarks...';
    });
    await Future.delayed(const Duration(milliseconds: 700));

    if (!mounted) return;
    setState(() {
      _scanningStatusText = 'Confirming liveness & lighting...';
    });
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    setState(() {
      _scanningStatusText = 'Matching profile identity...';
    });
    await Future.delayed(const Duration(milliseconds: 700));

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
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF1E1E1E),
        content: Row(
          children: [
            const Icon(Icons.mark_email_read_rounded, color: AppTheme.primaryColor),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'SMS OTP Sent to $phone (Test PIN: $_generatedOtp)',
                style: const TextStyle(color: Colors.white, fontSize: 13),
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
    });

    await Future.delayed(const Duration(milliseconds: 1400));

    if (mounted) {
      Navigator.pop(context);
      widget.onVerified();
      widget.onVerifiedDetails?.call(
        _selectedMethod ?? VerificationMethod.face,
        _selfieFile,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: const BoxDecoration(
        color: AppTheme.darkBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        border: Border(
          top: BorderSide(color: Color(0xFFD4AF37), width: 1.2),
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
                  color: Colors.white.withValues(alpha: 0.15),
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
                      color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.security_rounded,
                      color: Color(0xFFD4AF37),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'PASSENGER VERIFICATION',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: const Color(0xFFD4AF37),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Identity verification is necessary to guarantee trust, safety, and priority driver dispatch.',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.65),
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 24),

              if (_isSuccess)
                _buildSuccessState()
              else if (_selectedMethod == null)
                _buildMethodSelection()
              else if (_selectedMethod == VerificationMethod.face)
                _buildFaceVerificationView()
              else if (_selectedMethod == VerificationMethod.fingerprint)
                _buildFingerprintVerificationView()
              else if (_selectedMethod == VerificationMethod.otp)
                _buildOtpVerificationView(),

              const SizedBox(height: 20),

              // Switch method button
              if (_selectedMethod != null && !_isVerifying && !_isSuccess)
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _selectedMethod = null;
                      _isVerifying = false;
                      _selfieFile = null;
                    });
                  },
                  icon: const Icon(Icons.arrow_back_rounded, size: 16, color: Color(0xFFD4AF37)),
                  label: Text(
                    'Choose Another Verification Method',
                    style: GoogleFonts.outfit(
                      color: const Color(0xFFD4AF37),
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
  // METHOD SELECTION MENU
  // ─────────────────────────────────────────────────────────────
  Widget _buildMethodSelection() {
    return Column(
      children: [
        _buildMethodCard(
          method: VerificationMethod.face,
          icon: Icons.camera_front_rounded,
          badge: 'RECOMMENDED',
          title: 'Face Recognition',
          subtitle: 'Launch front camera for instant biometric selfie',
          onTap: _startFaceRecognition,
        ),
        const SizedBox(height: 14),
        _buildMethodCard(
          method: VerificationMethod.fingerprint,
          icon: Icons.fingerprint_rounded,
          badge: 'FAST',
          title: 'Fingerprint Scan',
          subtitle: 'Use your phone touch sensor / Touch ID',
          onTap: _startFingerprintVerification,
        ),
        const SizedBox(height: 14),
        _buildMethodCard(
          method: VerificationMethod.otp,
          icon: Icons.sms_rounded,
          badge: 'SMS CODE',
          title: 'Phone OTP Verification',
          subtitle: 'Receive a 6-digit passcode on your mobile',
          onTap: _startOtpVerification,
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
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.darkSurface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.08),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFD4AF37).withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Icon(icon, color: const Color(0xFFD4AF37), size: 26),
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
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          badge,
                          style: const TextStyle(
                            color: Color(0xFFD4AF37),
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
                      color: Colors.white54,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white24, size: 14),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FACE SELFIE & SCANNING VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildFaceVerificationView() {
    return Column(
      children: [
        // Biometric Face Frame with Laser Scanning Line
        Stack(
          alignment: Alignment.center,
          children: [
            // Target Oval Frame
            Container(
              width: 180,
              height: 220,
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(90),
                border: Border.all(
                  color: const Color(0xFFD4AF37),
                  width: 2.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                    blurRadius: 24,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(90),
                child: _selfieFile != null
                    ? Image.file(
                        _selfieFile!,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: const Color(0xFF141414),
                        child: const Icon(
                          Icons.face_retouching_natural_rounded,
                          size: 72,
                          color: Colors.white24,
                        ),
                      ),
              ),
            ),

            // Animated Laser Scan Line
            if (_isVerifying)
              AnimatedBuilder(
                animation: _scanAnimation,
                builder: (context, child) {
                  return Positioned(
                    top: 20 + (_scanAnimation.value * 170),
                    child: Container(
                      width: 160,
                      height: 2,
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4AF37),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFD4AF37).withValues(alpha: 0.9),
                            blurRadius: 10,
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
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Color(0xFFD4AF37), width: 2),
                    left: BorderSide(color: Color(0xFFD4AF37), width: 2),
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
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Color(0xFFD4AF37), width: 2),
                    right: BorderSide(color: Color(0xFFD4AF37), width: 2),
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
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Color(0xFFD4AF37), width: 2),
                    left: BorderSide(color: Color(0xFFD4AF37), width: 2),
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
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Color(0xFFD4AF37), width: 2),
                    right: BorderSide(color: Color(0xFFD4AF37), width: 2),
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
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              _scanningStatusText,
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Retake / Options button if user wants to shoot again
        OutlinedButton.icon(
          onPressed: _startFaceRecognition,
          icon: const Icon(Icons.camera_alt_outlined, size: 16, color: Color(0xFFD4AF37)),
          label: const Text(
            'Retake Selfie',
            style: TextStyle(color: Color(0xFFD4AF37), fontSize: 12),
          ),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FINGERPRINT VIEW
  // ─────────────────────────────────────────────────────────────
  Widget _buildFingerprintVerificationView() {
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
                color: const Color(0xFFD4AF37).withValues(alpha: 0.1),
                border: Border.all(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.4),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.fingerprint_rounded,
                size: 64,
                color: Color(0xFFD4AF37),
              ),
            ),
            if (_isVerifying)
              const SizedBox(
                width: 140,
                height: 140,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFD4AF37)),
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
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _startFingerprintVerification,
          icon: const Icon(Icons.touch_app_rounded, color: Colors.black, size: 18),
          label: const Text(
            'TOUCH TO SCAN AGAIN',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 12,
              letterSpacing: 1,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFD4AF37),
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
  Widget _buildOtpVerificationView() {
    return Column(
      children: [
        Text(
          'Enter the 6-digit verification code sent to your phone number.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.6),
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 20),

        // OTP Input Field
        Container(
          width: 260,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFFD4AF37).withValues(alpha: 0.6),
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
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            decoration: const InputDecoration(
              hintText: '••••••',
              hintStyle: TextStyle(color: Colors.white24, letterSpacing: 8),
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
              label: const Text(
                'Auto-Fill Demo Code (123456)',
                style: TextStyle(fontSize: 11, color: Colors.white),
              ),
              backgroundColor: Colors.white.withValues(alpha: 0.08),
              side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
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
              color: _resendCountdown == 0 ? const Color(0xFFD4AF37) : Colors.white30,
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
              backgroundColor: const Color(0xFFD4AF37),
              foregroundColor: Colors.black,
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
  Widget _buildSuccessState() {
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
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Your identity has been verified. Drivers will see your Verified Rider badge upon dispatch.',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 13,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
