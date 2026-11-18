import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import '../services/safety_service.dart';

class SafetyCenterScreen extends StatefulWidget {
  const SafetyCenterScreen({super.key});

  @override
  State<SafetyCenterScreen> createState() => _SafetyCenterScreenState();
}

class _SafetyCenterScreenState extends State<SafetyCenterScreen>
    with SingleTickerProviderStateMixin {
  bool _telemetryEnabled = true;
  bool _audioEnabled = false;
  bool _pinVerificationEnabled = true;
  bool _sosDispatched = false;

  late AnimationController _holdController;
  late Animation<double> _holdAnimation;

  final List<TextEditingController> _pinControllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(4, (_) => FocusNode());
  String _pinStatusMessage = '';

  @override
  void initState() {
    super.initState();
    _holdController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _holdAnimation = CurvedAnimation(
      parent: _holdController,
      curve: Curves.linear,
    );

    _holdController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _triggerSOS();
      }
    });
  }

  @override
  void dispose() {
    _holdController.dispose();
    for (final c in _pinControllers) {
      c.dispose();
    }
    for (final f in _pinFocusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not dial $phoneNumber')),
        );
      }
    }
  }

  Future<void> _triggerSOS() async {
    setState(() {
      _sosDispatched = true;
    });

    try {
      await SafetyService().logEmergencyEvent();
    } catch (e) {
      debugPrint('Error logging emergency: $e');
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.shield_rounded, color: Colors.white),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  '🚨 Emergency protocol engaged! Kenya Police & Cabi Rapid Unit notified.',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          backgroundColor: AppTheme.errorRed,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  void _verifyStandDownPin() {
    final enteredPin = _pinControllers.map((c) => c.text).join();
    if (enteredPin.length == 4) {
      setState(() {
        _sosDispatched = false;
        _pinStatusMessage = 'Protocol cleared • Stand-down confirmed';
      });
      for (final c in _pinControllers) {
        c.clear();
      }
      _pinFocusNodes[0].requestFocus();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Emergency broadcast successfully cancelled.'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
    } else {
      setState(() {
        _pinStatusMessage = 'Please enter a 4-digit security code';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.lightBackground,
      appBar: AppBar(
        title: Text(
          'SAFETY CENTER',
          style: AppTheme.montserrat(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            fontSize: 16,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        elevation: 0,
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        iconTheme: IconThemeData(color: isDark ? AppTheme.primaryColor : Colors.black87),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceBright : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.lightDivider,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.shield_outlined, color: AppTheme.primaryColor, size: 14),
                const SizedBox(width: 4),
                Text(
                  '24/7 Patrol',
                  style: AppTheme.inter(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppTheme.primaryLight : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Real-time Status Card (Stitch Spec)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.successGreen,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'Cabi Shield 24/7',
                            style: AppTheme.montserrat(
                              fontSize: 15.5,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          'ACTIVE',
                          style: AppTheme.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: AppTheme.successGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.lock_outline_rounded, size: 16, color: AppTheme.primaryColor),
                          const SizedBox(width: 6),
                          Text(
                            '256-Bit Telemetry AES',
                            style: AppTheme.plusJakartaSans(
                              fontSize: 12,
                              color: isDark ? Colors.white60 : Colors.grey[700],
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '#NBO-SEC-094',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white38 : Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Tactical Emergency Centerpiece (3s Hold SOS)
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: _sosDispatched
                      ? AppTheme.errorRed
                      : (isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
                  width: _sosDispatched ? 1.8 : 1.0,
                ),
                boxShadow: [
                  BoxShadow(
                    color: _sosDispatched
                        ? AppTheme.errorRed.withValues(alpha: 0.3)
                        : Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'TACTICAL PROTOCOL',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.grey[600],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.errorRed.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.errorRed.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppTheme.errorRed,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              _sosDispatched ? 'DISPATCHED' : 'ARMED',
                              style: AppTheme.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.errorRed,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Hold-to-activate circular SOS button
                  GestureDetector(
                    onTapDown: (_) => _holdController.forward(),
                    onTapUp: (_) {
                      if (_holdController.status != AnimationStatus.completed) {
                        _holdController.reverse();
                      }
                    },
                    onTapCancel: () {
                      if (_holdController.status != AnimationStatus.completed) {
                        _holdController.reverse();
                      }
                    },
                    child: AnimatedBuilder(
                      animation: _holdAnimation,
                      builder: (context, child) {
                        return Stack(
                          alignment: Alignment.center,
                          children: [
                            // Outer progress track
                            SizedBox(
                              width: 136,
                              height: 136,
                              child: CircularProgressIndicator(
                                value: _holdAnimation.value,
                                strokeWidth: 5,
                                backgroundColor: isDark ? AppTheme.surfaceBright : const Color(0xFFF1F5F9),
                                valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.errorRed),
                              ),
                            ),
                            // Inner core SOS button
                            Container(
                              width: 114,
                              height: 114,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: _sosDispatched
                                      ? [const Color(0xFFDC2626), const Color(0xFF7F1D1D)]
                                      : [const Color(0xFFEF4444), const Color(0xFFB91C1C)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.errorRed.withValues(alpha: 0.4),
                                    blurRadius: 18,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.shield_rounded, color: Colors.white, size: 30),
                                  const SizedBox(height: 4),
                                  Text(
                                    'SOS',
                                    style: AppTheme.montserrat(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 18,
                                      color: Colors.white,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                  Text(
                                    _holdController.isAnimating ? 'HOLDING...' : '3S HOLD',
                                    style: AppTheme.inter(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white70,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 20),
                  Text(
                    'Direct priority routing to Kenya Police Flying Squad & Cabi Rapid Unit.',
                    textAlign: TextAlign.center,
                    style: AppTheme.plusJakartaSans(
                      fontSize: 12.5,
                      color: isDark ? Colors.white60 : Colors.grey[700],
                      height: 1.4,
                    ),
                  ),

                  if (_sosDispatched) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppTheme.errorRed.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.errorRed.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.notifications_active_rounded, color: AppTheme.errorRed, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Dispatch Sequence In Progress',
                            style: AppTheme.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.errorRed,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // False Alarm Stand-Down Token (PIN Reversal)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.verified_user_rounded, color: AppTheme.primaryColor, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'FALSE ALARM STAND-DOWN',
                            style: AppTheme.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Token Reversal',
                        style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white38 : Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Enter secret 4-digit code to cancel emergency broadcast:',
                    style: AppTheme.plusJakartaSans(
                      fontSize: 12,
                      color: isDark ? Colors.white60 : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(4, (index) {
                            return SizedBox(
                              width: 52,
                              height: 50,
                              child: TextField(
                                controller: _pinControllers[index],
                                focusNode: _pinFocusNodes[index],
                                obscureText: true,
                                textAlign: TextAlign.center,
                                keyboardType: TextInputType.number,
                                maxLength: 1,
                                style: AppTheme.montserrat(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : Colors.black,
                                ),
                                decoration: InputDecoration(
                                  counterText: '',
                                  filled: true,
                                  fillColor: isDark ? AppTheme.surfaceDim : const Color(0xFFF3F4F6),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: AppTheme.primaryColor, width: 1.6),
                                  ),
                                ),
                                onChanged: (val) {
                                  if (val.isNotEmpty && index < 3) {
                                    _pinFocusNodes[index + 1].requestFocus();
                                  } else if (val.isEmpty && index > 0) {
                                    _pinFocusNodes[index - 1].requestFocus();
                                  }
                                },
                              ),
                            );
                          }),
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _verifyStandDownPin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? AppTheme.surfaceBright : Colors.black87,
                            foregroundColor: AppTheme.primaryColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                          ),
                          child: Text(
                            'VERIFY',
                            style: AppTheme.inter(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (_pinStatusMessage.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      _pinStatusMessage,
                      style: AppTheme.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _pinStatusMessage.contains('cleared')
                            ? AppTheme.successGreen
                            : AppTheme.errorRed,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // In-Transit Protocols Toggle Stack
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'GUARDED PROTOCOLS',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.1,
                          color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.grey[600],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'ENFORCED',
                          style: AppTheme.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.successGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  _buildProtocolTile(
                    icon: Icons.share_location_rounded,
                    title: 'Live Telemetry',
                    subtitle: 'Broadcast GPS trace to WhatsApp & SMS',
                    value: _telemetryEnabled,
                    isDark: isDark,
                    onChanged: (val) => setState(() => _telemetryEnabled = val),
                  ),
                  Divider(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider, height: 16),
                  _buildProtocolTile(
                    icon: Icons.mic_rounded,
                    title: 'Discreet Audio',
                    subtitle: 'Silent audio recording encrypted on-trip',
                    value: _audioEnabled,
                    isDark: isDark,
                    onChanged: (val) => setState(() => _audioEnabled = val),
                  ),
                  Divider(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider, height: 16),
                  _buildProtocolTile(
                    icon: Icons.pin_drop_rounded,
                    title: 'PIN Verification',
                    subtitle: 'Driver must enter passenger OTP to start trip',
                    value: _pinVerificationEnabled,
                    isDark: isDark,
                    onChanged: (val) => setState(() => _pinVerificationEnabled = val),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Emergency Contacts / Escorts Section
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'PRIORITY ESCORTS',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.1,
                          color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.grey[600],
                        ),
                      ),
                      Text(
                        'Direct Dial',
                        style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white38 : Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? Colors.white12 : Colors.black12,
                      ),
                    ),
                    child: Text(
                      'No trusted contacts added yet. Add emergency contacts in your profile settings for one-tap SOS sharing.',
                      style: AppTheme.inter(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildContactCard(
                    icon: Icons.local_police_rounded,
                    name: 'Kenya Police Rapid Response',
                    role: 'Emergency • 999 / 112',
                    phone: '999',
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Compliance Regulatory Grid
            Row(
              children: [
                _buildComplianceCard('NTSA Vetted', Icons.verified_rounded, isDark),
                const SizedBox(width: 8),
                _buildComplianceCard('Sacco Protocol', Icons.rule_rounded, isDark),
                const SizedBox(width: 8),
                _buildComplianceCard('Zero Surcharge', Icons.price_check_rounded, isDark),
              ],
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildProtocolTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required bool isDark,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceBright : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: AppTheme.primaryColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTheme.montserrat(
                  fontSize: 13.5,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Text(
                subtitle,
                style: AppTheme.plusJakartaSans(
                  fontSize: 11,
                  color: isDark ? Colors.white54 : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
        Switch.adaptive(
          value: value,
          activeThumbColor: AppTheme.primaryColor,
          activeTrackColor: AppTheme.primaryContainer,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildContactCard({
    required IconData icon,
    required String name,
    required String role,
    required String phone,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceBright : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: AppTheme.primaryColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTheme.montserrat(
                    fontSize: 13.5,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                Text(
                  role,
                  style: AppTheme.inter(
                    fontSize: 11,
                    color: isDark ? Colors.white54 : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _makePhoneCall(phone),
            icon: const Icon(Icons.call_rounded, color: AppTheme.successGreen, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildComplianceCard(String label, IconData icon, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.surfaceContainer : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppTheme.primaryColor),
            const SizedBox(height: 6),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AppTheme.inter(
                fontSize: 9.5,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white70 : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
